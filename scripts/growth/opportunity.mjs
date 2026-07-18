// Opportunity Engine (growth-impl.md §8.2). Turns graduated signals into a RANKED
// PORTFOLIO (not a naked list): score = impact × effort⁻¹ × confidence × moat × goal,
// bucketed ~40/30/20/10 (quick-win / strategic-bet / maintenance / wildcard), each item
// carrying a `why`. Heuristic scores here are the deterministic first pass; the
// /growth-loop agent refines moat/impact judgment on top.

import { localeOfPath, isCJKLocale, cjkLangOf, isCJKCountry, clamp01, pathOf } from './lib.mjs';
import { goalAlignment, loadGoals } from './goals.mjs';

const EFFORT = { low_ctr: 0.3, striking_distance: 0.35, ai_referral: 0.5, converting_locale: 0.5, audience_page: 0.5, converting_country: 0.55, default: 0.6 };
const AUTO_SAFE_KINDS = new Set(['low_ctr', 'striking_distance']); // mechanical → 🟢

const ACTION = {
  low_ctr: 'Rewrite title/meta to lift CTR',
  striking_distance: 'Nudge on-page (internal links, depth) to break into page 1',
  ai_referral: 'Strengthen AI-answer visibility (llms.txt, structured content)',
  converting_locale: 'Invest in this high-converting locale',
  audience_page: 'Invest in this high-traffic page (conversion, depth, related tools)',
  converting_country: 'Lean into this converting market (locale depth, AI visibility, distribution queue)',
};

// Impact normalization — each source kind's strength is denominated in its own unit
// (search impressions vs vercel pageviews vs conversions), so one shared /800 scale
// systematically dwarfs the audience channels that carry the CJK/CN signal. Impact is
// the best source measured against ITS OWN scale. Corroboration-only kinds
// (converting_locale — a site-wide locale total attached to many signals) don't set impact.
const IMPACT_SCALE = {
  striking_distance: 800,   // search impressions
  low_ctr: 800,             // search impressions
  audience_page: 250,       // vercel pageviews (28d; homepage ≈ top of this range)
  converting_country: 150,  // conversions (CN ≈ 145 in the 2026-07 window)
  ai_referral: 50,          // referral sessions
  autocomplete: 60,         // engines×20 demand heuristic
};
function impactOf(signal) {
  let best = 0;
  for (const s of signal.sources || []) {
    const scale = IMPACT_SCALE[s.kind];
    if (!scale) continue;
    best = Math.max(best, clamp01((s.strength || 0) / scale));
  }
  return best || clamp01((signal.strength || 0) / 800);
}

// A signal is CJK if its page locale, its query text's script, OR its audience country
// says so — path-prefix alone misses Chinese-language queries ("markdown转word" has no
// /zh-Hans/ prefix) and country-keyed market signals.
function cjkOf(signal) {
  return isCJKLocale(localeOfPath(signal.key))
    || !!cjkLangOf(signal.key)
    || isCJKCountry(signal.target?.scope?.country);
}

// Moat multiplier — near-neutral for on-thesis SEO tweaks (all growth-track items are
// on-thesis), boosted for CJK (moat-strengthening). The strong moat PENALTY is reserved
// for future product-track proposals that would expand scope / dilute the product.
function moatAlignment(signal) {
  if (cjkOf(signal)) return 0.95; // strengthens the moat
  if (signal.topic === 'ai-visibility') return 0.9;
  return 0.85; // neutral for on-thesis SEO opportunities
}

function primaryKind(signal) {
  const kinds = (signal.sources || []).map((s) => s.kind);
  if (kinds.includes('low_ctr')) return 'low_ctr';
  if (kinds.includes('striking_distance')) return 'striking_distance';
  if (kinds.includes('converting_country')) return 'converting_country';
  if (kinds.includes('audience_page')) return 'audience_page';
  return kinds[0] || 'default';
}

export function buildCandidate(signal, goalsDoc) {
  const loc = localeOfPath(signal.key);
  const kind = primaryKind(signal);
  const impact = impactOf(signal);
  const effort = EFFORT[kind] ?? EFFORT.default;
  const confidence = signal.confidence?.score ?? 0;
  const moat = moatAlignment(signal);
  const g = goalAlignment({
    topic: signal.topic, locale: loc, channel: signal.target?.channel,
    textLang: cjkLangOf(signal.key), country: signal.target?.scope?.country,
  }, goalsDoc);
  const score = +(impact * (1 / effort) * confidence * moat * g.score).toFixed(3);
  const why = [
    `${(signal.sources || []).length} sources`,
    signal.confidence?.ownFunnel ? 'converts in-funnel' : null,
    `impact ${impact.toFixed(2)}`,
    g.goal ? `advances '${g.goal}'` : null,
    cjkOf(signal) ? 'CJK (moat)' : null,
  ].filter(Boolean).join(' · ');
  return {
    id: signal.id, key: signal.key, topic: signal.topic, locale: loc, kind,
    action: ACTION[kind] || 'Investigate',
    impact: +impact.toFixed(2), effort, confidence, moat, goal: g.score, goalId: g.goal,
    score, gate: AUTO_SAFE_KINDS.has(kind) ? 'green' : 'amber', track: 'growth', why, target: signal.target,
  };
}

const bucketOf = (c) =>
  (c.effort <= 0.4 && c.confidence >= 0.6) ? 'quick_win'
    : (c.impact >= 0.6 && c.confidence >= 0.5) ? 'strategic_bet'
      : (c.confidence < 0.55 && c.impact >= 0.5) ? 'wildcard'
        : 'maintenance';

const MIX = { quick_win: 0.4, strategic_bet: 0.3, maintenance: 0.2, wildcard: 0.1 };

// Split candidates the loop should NOT auto-propose out of the actionable set:
//   • locked   — the page/query is under an in-flight experiment (target OR control);
//                shipping a change would contaminate the measurement.
//   • declined — a human ruled this lever out (decline memory).
// Suppressed candidates are returned (for a transparent 🔒 note), not silently dropped.
function partition(candidates, { locks = new Map(), declines = new Map() }) {
  const live = [];
  const suppressed = [];
  for (const c of candidates) {
    const k = pathOf(c.key);
    // Query-keyed proposals (e.g. "readme to pdf") map to editing the page that ranks for
    // them; if that query slugifies exactly to a locked page path, it's the same
    // contamination — suppress it too. Exact match only, so we never over-suppress.
    const lock = locks.get(k) || (!k.startsWith('/') ? locks.get('/' + k.replace(/\s+/g, '-')) : null);
    if (lock) { suppressed.push({ ...c, suppressed: 'experiment', expId: lock.id, measureOn: lock.measure_on, role: lock.role }); continue; }
    const dec = declines.get(k);
    if (dec && (!dec.kinds || dec.kinds.includes(c.kind))) { suppressed.push({ ...c, suppressed: 'declined', reason: dec.reason, ref: dec.ref }); continue; }
    live.push(c);
  }
  return { live, suppressed };
}

export function buildPortfolio(signals, { goalsDoc = loadGoals(), regressions = [], slate = 10, locks = new Map(), declines = new Map() } = {}) {
  const candidates = signals.map((s) => buildCandidate(s, goalsDoc)).sort((a, b) => b.score - a.score);
  const { live, suppressed } = partition(candidates, { locks, declines });
  const buckets = { quick_win: [], strategic_bet: [], maintenance: [], wildcard: [] };
  for (const c of live) buckets[bucketOf(c)].push(c);
  // regressions are maintenance (keep shipped wins healthy)
  for (const r of regressions.slice(0, 5)) {
    buckets.maintenance.unshift({
      key: r.key, kind: 'regression', action: `Fix regression: ${r.type} (${r.from}→${r.to})`,
      gate: 'green', track: 'growth', score: 1, bucket: 'maintenance', why: `regression on ${r.channel}`,
    });
  }
  const slateOut = [];
  for (const [b, frac] of Object.entries(MIX)) {
    slateOut.push(...buckets[b].slice(0, Math.max(0, Math.round(slate * frac))).map((c) => ({ ...c, bucket: b })));
  }
  // Backfill from the highest-scored remaining ACTIONABLE candidates if buckets are lopsided.
  const chosen = new Set(slateOut.map((c) => c.id || c.key));
  for (const c of live) {
    if (slateOut.length >= slate) break;
    const k = c.id || c.key;
    if (!chosen.has(k)) { slateOut.push({ ...c, bucket: bucketOf(c) }); chosen.add(k); }
  }
  return {
    slate: slateOut.sort((a, b) => b.score - a.score), buckets,
    totalCandidates: candidates.length, actionable: live.length, suppressed,
  };
}
