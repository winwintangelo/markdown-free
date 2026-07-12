// Snapshot orchestrator (growth-impl.md §6.9, §16, §17) — the `snapshot` stage.
//
// Runs every available collector, assembles ONE normalized committed snapshot at
// data/snapshots/<date>.json (+ latest.json), and stamps a health block (§16).
// Per-channel failures are tolerated (§17): a channel without creds is skipped,
// recorded under `errors`, and the rest still snapshot. Committing snapshots turns
// git history into the durable trend archive (also sidesteps Vercel Hobby's window).
//
//   node scripts/growth/snapshot.mjs      (or: npm run growth:snapshot)
//
// P0 wires Bing only. P1 adds gsc / vercel / events / referral to CHANNELS.

import { SnapshotStore, todayStr, isMain } from './lib.mjs';
import { collect as collectBing } from './bing.mjs';

const CHANNELS = [
  ['bing', collectBing],
  // P1a: ['gsc', collectGsc], ['vercel', collectVercel], ['events', collectEvents], ['referral', collectReferral],
  // P1b: ['baidu', collectBaidu],
];

const rowCount = (c) =>
  (c.queries?.length ?? 0) + (c.pages?.length ?? 0) + (c.referrers?.length ?? 0) + (c.byType?.length ?? 0);

export async function runSnapshot() {
  const startedAt = Date.now();
  const snapshot = {
    date: todayStr(),
    generatedAt: new Date().toISOString(),
    context: { algoUpdates: [], volatility: null, season: null }, // filled by algo-context (P1b)
    channels: {},
    errors: {},
    meta: { health: {} }, // §16 platform observability
  };

  for (const [name, fn] of CHANNELS) {
    process.stdout.write(`   • ${name} … `);
    try {
      const data = await fn();
      snapshot.channels[name] = data;
      snapshot.meta.health[name] = { status: 'ok', rows: rowCount(data) };
      console.log(`ok (${rowCount(data)} rows)`);
    } catch (e) {
      snapshot.errors[name] = e.message;
      snapshot.meta.health[name] = { status: 'error', error: e.message };
      console.log(`skipped — ${e.message}`);
    }
  }

  snapshot.meta.health.runMs = Date.now() - startedAt;
  snapshot.meta.health.channelsOk = Object.keys(snapshot.channels).length;
  snapshot.meta.health.channelsSkipped = Object.keys(snapshot.errors).length;

  const file = SnapshotStore.write(snapshot);
  return { snapshot, file };
}

async function main() {
  console.log('📸 Growth snapshot');
  const { snapshot, file } = await runSnapshot();
  const ok = Object.keys(snapshot.channels);
  const skipped = Object.keys(snapshot.errors);
  console.log(`\n📦 ${file}`);
  console.log(`   collected: ${ok.join(', ') || 'none'}${skipped.length ? ` · skipped: ${skipped.join(', ')}` : ''}`);
  console.log(`   ⏱  ${snapshot.meta.health.runMs}ms`);
  if (!ok.length) {
    console.error('   ⚠  no channels collected — check credentials (docs/growth-impl.md §13).');
    process.exitCode = 1;
  } else if (skipped.length) {
    console.log('   (skipped channels need one-time setup — see docs/growth-impl.md §13)');
  }
}

if (isMain(import.meta.url)) main();
