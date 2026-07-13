// Opportunity Engine (growth-impl.md §8.2). Turns graduated signals into a RANKED
// PORTFOLIO (not a naked list): score = impact × effort⁻¹ × confidence × moat × goal,
// bucketed ~40/30/20/10 (quick-win / strategic-bet / maintenance / wildcard), each item
// carrying a `why`. Heuristic scores here are the deterministic first pass; the
// /growth-loop agent refines moat/impact judgment on top.

import { localeOfPath, isCJKLocale, clamp01 } from './lib.mjs';
import { goalAlignment, loadGoals } from './goals.mjs';

const EFFORT = { low_ctr: 0.3, striking_distance: 0.35, ai_referral: 0.5, converting_locale: 0.5, default: 0.6 };
const AUTO_SAFE_KINDS = new Set(['low_ctr', 'striking_distance']); // mechanical → 🟢

const ACTION = {
  low_ctr: 'Rewrite title/meta to lift CTR',
  striking_distance: 'Nudge on-page (internal links, depth) to break into page 1',
  ai_referral: 'Strengthen AI-answer visibility (llms.txt, structured content)',
  converting_locale: 'Invest in this high-converting locale',
};

// Moat multiplier — near-neutral for on-thesis SEO tweaks (all growth-track items are
// on-thesis), boosted for CJK (moat-strengthening). The strong moat PENALTY is reserved
// for future product-track proposals that would expand scope / dilute the product.
function moatAlignment(signal) {
  if (isCJKLocale(localeOfPath(signal.key))) return 0.95; // strengthens the moat
  if (signal.topic === 'ai-visibility') return 0.9;
  return 0.85; // neutral for on-thesis SEO opportunities
}

function primaryKind(signal) {
  const kinds = (signal.sources || []).map((s) => s.kind);
  if (kinds.includes('low_ctr')) return 'low_ctr';
  if (kinds.includes('striking_distance')) return 'striking_distance';
  return kinds[0] || 'default';
}

export function buildCandidate(signal, goalsDoc) {
  const loc = localeOfPath(signal.key);
  const kind = primaryKind(signal);
  const impact = clamp01((signal.strength || 0) / 800);   // impressions/sessions → 0..1
  const effort = EFFORT[kind] ?? EFFORT.default;
  const confidence = signal.confidence?.score ?? 0;
  const moat = moatAlignment(signal);
  const g = goalAlignment({ topic: signal.topic, locale: loc, channel: signal.target?.channel }, goalsDoc);
  const score = +(impact * (1 / effort) * confidence * moat * g.score).toFixed(3);
  const why = [
    `${(signal.sources || []).length} sources`,
    signal.confidence?.ownFunnel ? 'converts in-funnel' : null,
    `impact ${impact.toFixed(2)}`,
    g.goal ? `advances '${g.goal}'` : null,
    isCJKLocale(loc) ? 'CJK (moat)' : null,
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

export function buildPortfolio(signals, { goalsDoc = loadGoals(), regressions = [], slate = 10 } = {}) {
  const candidates = signals.map((s) => buildCandidate(s, goalsDoc)).sort((a, b) => b.score - a.score);
  const buckets = { quick_win: [], strategic_bet: [], maintenance: [], wildcard: [] };
  for (const c of candidates) buckets[bucketOf(c)].push(c);
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
  // Backfill from the highest-scored remaining candidates if buckets are lopsided.
  const chosen = new Set(slateOut.map((c) => c.id || c.key));
  for (const c of candidates) {
    if (slateOut.length >= slate) break;
    const k = c.id || c.key;
    if (!chosen.has(k)) { slateOut.push({ ...c, bucket: bucketOf(c) }); chosen.add(k); }
  }
  return { slate: slateOut.sort((a, b) => b.score - a.score), buckets, totalCandidates: candidates.length };
}
