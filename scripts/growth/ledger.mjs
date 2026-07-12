// ExperimentLedger service (growth-impl.md §7.2, §7.4).
// The ONLY module that reads/writes data/ledger.json. Everything else calls these.

import path from 'node:path';
import { DATA_DIR, readJson, writeJsonAtomic, todayStr, isMain } from './lib.mjs';

const FILE = () => path.join(DATA_DIR(), 'ledger.json');
const load = () => readJson(FILE(), { version: 1, experiments: [] });
const save = (data) => writeJsonAtomic(FILE(), data);

export const ExperimentLedger = {
  all() { return load().experiments; },

  byTopic(topic) { return load().experiments.filter((e) => e.topic === topic); },

  // Entries whose measure_on has arrived and that haven't been scored yet.
  due(asOf) {
    const today = asOf || todayStr();
    return load().experiments.filter(
      (e) => e.measure_on && e.measure_on <= today && ['shipped', 'measuring'].includes(e.status)
    );
  },

  open(entry) {
    const data = load();
    if (data.experiments.some((e) => e.id === entry.id)) {
      throw new Error(`ledger: duplicate id "${entry.id}"`);
    }
    data.experiments.push(entry);
    save(data);
    return entry;
  },

  record(id, outcome, status) {
    const data = load();
    const e = data.experiments.find((x) => x.id === id);
    if (!e) throw new Error(`ledger: no experiment "${id}"`);
    e.outcome = { ...(e.outcome || {}), ...outcome };
    if (status) e.status = status;
    save(data);
    return e;
  },
};

// CLI: quick status view — `node scripts/growth/ledger.mjs`
if (isMain(import.meta.url)) {
  const all = ExperimentLedger.all();
  const due = ExperimentLedger.due();
  console.log(`📒 Experiment ledger — ${all.length} entries, ${due.length} due to measure (as of ${todayStr()})`);
  for (const e of all) {
    console.log(`   [${e.status}] ${e.id} — measure_on ${e.measure_on} · ${e.target_metric} on ${e.channel}`);
  }
}
