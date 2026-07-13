// Social painpoint discovery orchestrator (growth-impl.md W1 D1).
// Runs GitHub + Stack Overflow + HN collectors, dedups into the PainpointStore.
// Separate cadence from the analytics cycle (rate-limited external APIs) — run ad-hoc
// or on its own schedule.
//
//   node scripts/growth/social/collect.mjs   (or: npm run growth:social)

import { isMain } from '../lib.mjs';
import { PainpointStore } from '../painpoints.mjs';
import { relevant } from './lib.mjs';
import { collect as github } from './github.mjs';
import { collect as stackoverflow } from './stackoverflow.mjs';
import { collect as hackernews } from './hackernews.mjs';

export async function runSocial() {
  const results = await Promise.allSettled([github(), stackoverflow(), hackernews()]);
  const items = results.flatMap((r) => (r.status === 'fulfilled' ? r.value : [])).filter((i) => relevant(i.title));
  const bySource = {};
  items.forEach((i) => { bySource[i.source] = (bySource[i.source] || 0) + 1; });
  const added = PainpointStore.add(items);
  return { collected: items.length, added, bySource, total: PainpointStore.all().length };
}

async function main() {
  console.log('👂 social — collecting markdown painpoints (GitHub · Stack Overflow · HN)');
  const r = await runSocial();
  console.log(`   collected ${r.collected} (${Object.entries(r.bySource).map(([k, v]) => `${k} ${v}`).join(' · ') || 'none'}) · ${r.added} new · ${r.total} in corpus`);
  console.log('   next: `npm run growth:consolidate` to group into themes, then `/growth-loop` to triage.');
}

if (isMain(import.meta.url)) main();
