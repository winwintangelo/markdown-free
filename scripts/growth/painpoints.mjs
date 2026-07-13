// PainpointStore (growth-impl.md W1) — the demand-discovery corpus. The only module
// that touches data/painpoints.json. Raw `painpoint_item` records from social sources,
// deduped by id, capped at the most-recent 1000.

import path from 'node:path';
import { DATA_DIR, readJson, writeJsonAtomic, daysBetween, todayStr, isMain } from './lib.mjs';

const FILE = () => path.join(DATA_DIR(), 'painpoints.json');
const load = () => readJson(FILE(), { version: 1, items: [] });
const save = (d) => writeJsonAtomic(FILE(), d);

export const PainpointStore = {
  all() { return load().items; },
  recent(days = 60) {
    const t = todayStr();
    return load().items.filter((i) => i.date && Math.abs(daysBetween(String(i.date).slice(0, 10), t)) <= days);
  },
  byTopic(topic) { return load().items.filter((i) => i.topic === topic); },

  // Append new items, dedup by id. Returns count added.
  add(items) {
    const d = load();
    const seen = new Set(d.items.map((i) => i.id));
    let added = 0;
    for (const it of items) if (it.id && !seen.has(it.id)) { d.items.push(it); seen.add(it.id); added++; }
    if (d.items.length > 1000) d.items = d.items.sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 1000);
    save(d);
    return added;
  },
};

if (isMain(import.meta.url)) {
  const all = PainpointStore.all();
  const bySource = {};
  all.forEach((i) => { bySource[i.source] = (bySource[i.source] || 0) + 1; });
  console.log(`👂 Painpoint corpus — ${all.length} items (${Object.entries(bySource).map(([k, v]) => `${k} ${v}`).join(' · ') || 'empty'})`);
}
