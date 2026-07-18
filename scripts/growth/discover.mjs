// `discover` stage (growth-impl.md §12 P3) — mine the latest snapshot into the Signal
// Warehouse. The KEY design point: group observations by page/query so the SAME item
// seen on Bing AND Google AND (via its locale) converting becomes ONE multi-source
// signal → the Confidence Engine rewards that corroboration.
//
//   node scripts/growth/discover.mjs   (or: npm run growth:discover)

import { SnapshotStore, topicOf, localeOfPath, pathOf, isMain } from './lib.mjs';
import { SignalWarehouse } from './signals.mjs';
import { T } from './analyze.mjs';

const isPageKey = (key) => /^https?:\/\//.test(key) || String(key).startsWith('/');
const keyScope = (key) => (isPageKey(key) ? { pages: [key] } : { queries: [key] });

// Floors for the audience channels (vercel pageviews / events country conversions).
// Deliberately lower than the search IMPRESSIONS_FLOOR: these channels are the ONLY
// visibility into the referrer-less CJK/CN audience (GSC misses China entirely, Bing
// is partial), so a lower bar is how the loop stops optimizing where the light is.
const AUDIENCE_PV_FLOOR = 10;
const COUNTRY_CONV_FLOOR = 10;

export function runDiscover() {
  const snap = SnapshotStore.latest();
  if (!snap) return { ok: false, reason: 'no snapshot — run growth:snapshot first' };

  // conversions per locale (own-funnel corroboration)
  const localeConv = {};
  for (const r of snap.channels.events?.byLocale || []) localeConv[r.key] = r.count;

  const obs = new Map();
  const add = (key, source) => {
    let o = obs.get(key);
    if (!o) {
      o = { id: `sig:${key}`, key, topic: topicOf(key), sources: [], strength: 0,
            target: { scope: keyScope(key), channel: source.channel, metric: source.metric } };
      obs.set(key, o);
    }
    o.sources.push(source);
    o.strength = Math.max(o.strength, source.strength || 0);
  };

  // Search opportunities from Bing + GSC (striking-distance + high-impr/low-CTR).
  for (const channel of ['bing', 'gsc', 'baidu']) {
    const ch = snap.channels[channel];
    if (!ch) continue;
    for (const kind of ['queries', 'pages']) {
      for (const r of ch[kind] || []) {
        if ((r.impressions || 0) < T.IMPRESSIONS_FLOOR) continue;
        if (r.position != null && r.position >= T.STRIKING_MIN && r.position <= T.STRIKING_MAX) {
          add(r.key, { channel, kind: 'striking_distance', metric: 'position', strength: r.impressions, weight: 0.7, detail: `pos ${r.position} · ${r.impressions} imp` });
        }
        if ((r.ctr ?? 0) <= T.LOW_CTR_MAX && (r.impressions || 0) >= T.IMPRESSIONS_FLOOR * 3) {
          add(r.key, { channel, kind: 'low_ctr', metric: 'ctr', strength: r.impressions, weight: 0.7, detail: `${r.ctr}% ctr · ${r.impressions} imp` });
        }
      }
    }
  }

  // Audience signals from the vercel channel — the ONLY complete view of the
  // referrer-less traffic (AI chats + WeChat/app webviews ≈ 2/3 of the site; the CN
  // audience is invisible to GSC and partial on Bing). A page already seen by a search
  // console gains vercel as a corroborating source (joined via pathOf, since search
  // channels key by full URL and vercel by bare path); a vercel-only page becomes its
  // own audience_page signal.
  const byPath = new Map(); // pathOf(page key) → obs, for cross-channel joining
  for (const o of obs.values()) if (isPageKey(o.key)) byPath.set(pathOf(o.key), o);
  for (const r of snap.channels.vercel?.pages || []) {
    if ((r.pageviews || 0) < AUDIENCE_PV_FLOOR) continue;
    const source = {
      channel: 'vercel', kind: 'audience_page', metric: 'pageviews',
      strength: r.pageviews, weight: 0.6,
      detail: `${r.pageviews} pv · ${r.visitors ?? '?'} visitors (incl. referrer-less)`,
    };
    const existing = byPath.get(pathOf(r.key));
    if (existing) {
      existing.sources.push(source);
      existing.strength = Math.max(existing.strength, source.strength);
    } else {
      add(r.key, source);
      byPath.set(pathOf(r.key), obs.get(r.key));
    }
  }

  // Converting countries from the events channel (site-wide — no per-page country dim
  // on the Vercel events API). CN converting 145× from 22 visitors is a market signal
  // no search console can surface; keyed `country:CN` with the country in target.scope
  // so goal alignment (cjk-market countries) can match it.
  for (const r of snap.channels.events?.byCountry || []) {
    if ((r.count || 0) < COUNTRY_CONV_FLOOR) continue;
    const key = `country:${r.key}`;
    obs.set(key, {
      id: `sig:${key}`, key, topic: 'market', strength: r.count,
      sources: [{ channel: 'events', kind: 'converting_country', metric: 'conversions',
        strength: r.count, weight: 1.0,
        detail: `${r.count} conversions · ${r.visitors ?? '?'} visitors (${r.key})` }],
      target: { scope: { country: r.key }, channel: 'events', metric: 'conversions' },
    });
  }

  // Own-funnel corroboration: attach each signal's locale conversions as a high-weight source.
  for (const o of obs.values()) {
    if (o.target?.scope?.country) continue; // country signals ARE the funnel — don't self-corroborate
    const loc = localeOfPath(o.key);
    const conv = localeConv[loc] || 0;
    if (conv > 0) o.sources.push({ channel: 'events', kind: 'converting_locale', metric: 'conversions', strength: conv, weight: 1.0, detail: `${loc} converts (${conv})` });
  }

  // AI-assistant referral as its own signal.
  const ai = (snap.channels.referral?.groups || []).find((g) => g.group === 'ai');
  if (ai && ai.sessions > 0) {
    obs.set('ai-referral', {
      id: 'sig:ai-referral', key: 'AI-assistant referrals', topic: 'ai-visibility',
      sources: [{ channel: 'referral', kind: 'ai_referral', metric: 'sessions', strength: ai.sessions, weight: 0.6, detail: `${ai.sessions} AI sessions` }],
      strength: ai.sessions, target: { scope: {}, channel: 'referral', metric: 'sessions' },
    });
  }

  for (const o of obs.values()) SignalWarehouse.upsert(o);
  SignalWarehouse.refresh(); // age + confidence + graduation

  const grad = SignalWarehouse.graduated();
  return { ok: true, mined: obs.size, total: SignalWarehouse.all().length, graduated: grad.length, graduatedSignals: grad };
}

function main() {
  console.log('🔭 discover — mining the latest snapshot into the Signal Warehouse');
  const r = runDiscover();
  if (!r.ok) { console.log(`   ${r.reason}`); return; }
  console.log(`   mined ${r.mined} observations → ${r.total} signals · ${r.graduated} graduated (conf ≥ threshold)`);
  r.graduatedSignals.slice(0, 10).forEach((s) =>
    console.log(`   ✓ [${s.topic}] ${s.key} — conf ${s.confidence.score} (q${s.confidence.quantity}/own${s.confidence.ownFunnel}) · ${s.sources.length} src · ${s.stage}`));
}

if (isMain(import.meta.url)) main();
