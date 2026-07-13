// Autocomplete demand collector (growth-impl.md W2 — growth-side signal expansion).
//
// Fetches Google + Bing autocomplete for seed intents, then cross-references our latest
// snapshot: a suggestion we ALREADY rank for corroborates an existing signal (2 sources →
// higher confidence); a suggestion with NO ranking presence is a "demand gap" — a
// new-page candidate we're blind to. Free, unauthenticated, best-effort (fails soft).
//
//   node scripts/growth/market/autocomplete.mjs   (or: npm run growth:market)

import path from 'node:path';
import { SnapshotStore, topicOf, DATA_DIR, writeJsonAtomic, isMain } from '../lib.mjs';
import { SignalWarehouse } from '../signals.mjs';

const SEEDS = [
  // broad discovery
  'markdown to', 'markdown to pdf', 'markdown to word', 'markdown to image',
  'markdown to epub', 'convert markdown', 'readme to pdf', 'md to word',
  'markdown converter', 'markdown 转', 'markdown 转换',
  // long-tail targets — SME "long-tail first" strategy (docs/issue-best-markdown-to-pdf-converter-2026.md).
  // The loop tracks present-vs-gap for each so we can build focused pages and watch them graduate.
  'markdown pdf css', 'markdown pdf page break', 'markdown pdf mermaid',
  'markdown pdf latex', 'markdown pdf fonts', 'markdown pdf templates',
  'pandoc vs markdown', 'typora pdf export', 'markdown pdf offline', 'markdown pdf privacy',
];

async function suggest(url) {
  try {
    const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(8000) });
    if (!r.ok) return [];
    const j = JSON.parse(await r.text());
    return Array.isArray(j[1]) ? j[1] : [];
  } catch { return []; }
}
const google = (q) => suggest(`https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(q)}`);
const bing = (q) => suggest(`https://api.bing.com/osjson.aspx?query=${encodeURIComponent(q)}`);

function add(map, s, engine) {
  const q = String(s).trim().toLowerCase();
  if (q.length < 4 || q.length > 80) return;
  if (!/markdown|(^|\s)md\s|readme|\.md/.test(q)) return; // keep on-topic
  (map.get(q) || map.set(q, new Set()).get(q)).add(engine);
}

export async function collect() {
  const map = new Map();
  for (const seed of SEEDS) {
    const [g, b] = await Promise.all([google(seed), bing(seed)]);
    g.forEach((s) => add(map, s, 'google'));
    b.forEach((s) => add(map, s, 'bing'));
  }
  const snap = SnapshotStore.latest();
  const known = new Set();
  for (const ch of ['bing', 'gsc', 'baidu']) for (const r of snap?.channels?.[ch]?.queries || []) known.add(String(r.key).toLowerCase());

  const suggestions = [...map.entries()].map(([query, engines]) => ({
    query, engines: [...engines], present: known.has(query), topic: topicOf(query),
  }));
  const gaps = suggestions.filter((s) => !s.present).sort((a, b) => b.engines.length - a.engines.length || a.query.localeCompare(b.query));
  const present = suggestions.filter((s) => s.present);
  return { suggestions, gaps, present, seeds: SEEDS.length };
}

// Feed the warehouse: present suggestions corroborate existing signals; gaps accumulate low-confidence.
export function toSignals(result) {
  for (const s of result.suggestions) {
    const strength = s.engines.length * 20 + (s.present ? 0 : 10);
    SignalWarehouse.upsert({
      id: `sig:${s.query}`, key: s.query, topic: s.topic, strength,
      sources: [{ channel: 'search_intent', kind: 'autocomplete', metric: 'demand', strength, weight: 0.5,
        detail: `autocomplete ${s.engines.join('+')}${s.present ? '' : ' · GAP (no ranking presence)'}` }],
      target: { scope: { queries: [s.query] }, channel: 'search_intent', metric: 'demand' },
    });
  }
}

export async function runMarket() {
  const result = await collect();
  toSignals(result);
  writeJsonAtomic(path.join(DATA_DIR(), 'market.json'), {
    date: SnapshotStore.latest()?.date ?? null, generatedAt: new Date().toISOString(),
    seeds: result.seeds, counts: { suggestions: result.suggestions.length, gaps: result.gaps.length, present: result.present.length },
    gaps: result.gaps, present: result.present.map((p) => p.query),
  });
  return result;
}

async function main() {
  console.log('🛰  market — autocomplete demand scan (Google + Bing)');
  const r = await runMarket();
  console.log(`   ${r.suggestions.length} suggestions from ${r.seeds} seeds · ${r.gaps.length} gaps · ${r.present.length} already-present`);
  console.log('   top demand gaps (new-page candidates we don\'t rank for):');
  r.gaps.slice(0, 15).forEach((g) => console.log(`      - [${g.topic}] ${g.query}  (${g.engines.join('+')})`));
}

if (isMain(import.meta.url)) main();
