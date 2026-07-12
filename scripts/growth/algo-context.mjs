// Algo-update / seasonality context (growth-impl.md §6.8, §8.2 Risk 2).
//
// NOT a metrics source. Stamps confirmed ranking-update windows + a coarse season
// marker into each snapshot's `context` block, so experiment verdicts can flag
// "shipped during a confirmed update / seasonal swing" — making Risk 2's mitigation
// real instead of aspirational.
//
// Source of truth is a human-appendable file `data/algo-events.json`:
//   { "events": [ { "date": "2026-06-15", "engine": "google", "name": "June 2026 core update", "note": "" } ] }
// (No fragile scraping. Append confirmed updates as they're announced.) A live
// volatility index can be wired later; null for now.

import path from 'node:path';
import { DATA_DIR, readJson, daysBetween, todayStr, isMain } from './lib.mjs';

// Coarse seasonal markers for the CN/EN document-conversion audience. Extend as learned.
const SEASON = {
  1: 'new-year', 2: 'cny-window', 9: 'back-to-school', 12: 'year-end',
};

export function collectContext(date = todayStr(), windowDays = 35) {
  const file = path.join(DATA_DIR(), 'algo-events.json');
  const all = readJson(file, { events: [] }).events || [];
  const algoUpdates = all.filter((e) => e.date && Math.abs(daysBetween(e.date, date)) <= windowDays);
  const month = Number(date.slice(5, 7));
  return { algoUpdates, volatility: null, season: SEASON[month] || null };
}

if (isMain(import.meta.url)) {
  const ctx = collectContext();
  console.log('🗓  context:', JSON.stringify(ctx));
  if (!ctx.algoUpdates.length) console.log('   (no algo events in window — append confirmed updates to data/algo-events.json)');
}
