// `analyze` stage (growth-impl.md §6.2 diff + regression watch with thresholds §8.3).
//
// Compares the two most recent snapshots and emits deltas + a bounded set of
// flags for the digest: striking-distance quick wins, high-impression/low-CTR
// title opportunities, and threshold-gated regressions. Read-only. Robust to
// 0/1/2 snapshots (a "baseline cycle" with 1 snapshot still reports opportunities).
//
//   node scripts/growth/analyze.mjs      (or: npm run growth:analyze)

import { SnapshotStore, isMain } from './lib.mjs';

// Thresholds — starting guesses to calibrate once real data flows (impl doc §18 #3).
export const T = {
  IMPRESSIONS_FLOOR: 30,   // ignore anything below this in the trailing window
  STRIKING_MIN: 5,         // "striking distance" = avg position in [5, 15]
  STRIKING_MAX: 15,
  LOW_CTR_MAX: 1.0,        // % — high impressions but CTR under this = title/meta opportunity
  POSITION_DROP_ALERT: 3,  // positions worse WoW to raise a regression flag
  CLICKS_DROP_PCT: 30,     // % clicks lost WoW to raise a regression flag
};

const chanRows = (snap, channel, kind) => snap?.channels?.[channel]?.[kind] ?? [];

// Opportunities from a single (latest) snapshot — no history needed.
function opportunities(snap) {
  const out = { strikingDistance: [], lowCtr: [] };
  for (const channel of Object.keys(snap.channels || {})) {
    for (const kind of ['queries', 'pages']) {
      for (const r of chanRows(snap, channel, kind)) {
        if ((r.impressions || 0) < T.IMPRESSIONS_FLOOR) continue;
        if (r.position != null && r.position >= T.STRIKING_MIN && r.position <= T.STRIKING_MAX) {
          out.strikingDistance.push({ channel, kind, key: r.key, position: r.position, impressions: r.impressions, ctr: r.ctr });
        }
        if ((r.ctr ?? 0) <= T.LOW_CTR_MAX && (r.impressions || 0) >= T.IMPRESSIONS_FLOOR * 3) {
          out.lowCtr.push({ channel, kind, key: r.key, impressions: r.impressions, ctr: r.ctr, position: r.position });
        }
      }
    }
  }
  out.strikingDistance.sort((a, b) => b.impressions - a.impressions);
  out.lowCtr.sort((a, b) => b.impressions - a.impressions);
  return out;
}

// Regressions require two snapshots.
function regressions(cur, prev) {
  const flags = [];
  const index = (snap, channel, kind) => new Map(chanRows(snap, channel, kind).map((r) => [r.key, r]));
  for (const channel of Object.keys(cur.channels || {})) {
    for (const kind of ['queries', 'pages']) {
      const prevIdx = index(prev, channel, kind);
      for (const r of chanRows(cur, channel, kind)) {
        const p = prevIdx.get(r.key);
        if (!p || (r.impressions || 0) < T.IMPRESSIONS_FLOOR) continue;
        if (r.position != null && p.position != null && r.position - p.position >= T.POSITION_DROP_ALERT) {
          flags.push({ type: 'position_drop', channel, kind, key: r.key, from: p.position, to: r.position });
        }
        if (p.clicks > 0 && (p.clicks - r.clicks) / p.clicks * 100 >= T.CLICKS_DROP_PCT) {
          flags.push({ type: 'clicks_drop', channel, kind, key: r.key, from: p.clicks, to: r.clicks });
        }
      }
    }
  }
  return flags;
}

export function runAnalyze() {
  const [cur, prev] = SnapshotStore.recent(2);
  if (!cur) return { ok: false, reason: 'no snapshots yet — run `npm run growth:snapshot` first' };
  const result = {
    ok: true,
    date: cur.date,
    baselineCycle: !prev,
    opportunities: opportunities(cur),
    regressions: prev ? regressions(cur, prev) : [],
    context: cur.context || {},
    health: cur.meta?.health || {},
  };
  return result;
}

function main() {
  console.log('🔎 analyze');
  const a = runAnalyze();
  if (!a.ok) { console.log(`   ${a.reason}`); return; }
  if (a.baselineCycle) console.log('   (baseline cycle — only 1 snapshot; regression deltas need a 2nd. Reporting current opportunities.)');
  const { strikingDistance, lowCtr } = a.opportunities;
  console.log(`   striking-distance (pos ${T.STRIKING_MIN}-${T.STRIKING_MAX}): ${strikingDistance.length}`);
  strikingDistance.slice(0, 6).forEach((r) => console.log(`      - [${r.channel}] ${r.key} — pos ${r.position} · ${r.impressions} imp · ${r.ctr}% ctr`));
  console.log(`   high-impr/low-ctr: ${lowCtr.length}`);
  lowCtr.slice(0, 4).forEach((r) => console.log(`      - [${r.channel}] ${r.key} — ${r.impressions} imp · ${r.ctr}% ctr`));
  console.log(`   regressions: ${a.regressions.length}`);
  a.regressions.slice(0, 8).forEach((f) => console.log(`      ⚠ ${f.type} [${f.channel}] ${f.key} — ${f.from} → ${f.to}`));
}

if (isMain(import.meta.url)) main();
