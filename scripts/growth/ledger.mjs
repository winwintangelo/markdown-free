// ExperimentLedger service (growth-impl.md §7.2, §7.4).
// The ONLY module that reads/writes data/ledger.json. Everything else calls these.

import path from 'node:path';
import { DATA_DIR, readJson, writeJsonAtomic, todayStr, isMain, pathOf } from './lib.mjs';

const FILE = () => path.join(DATA_DIR(), 'ledger.json');
const load = () => readJson(FILE(), { version: 1, experiments: [] });
const save = (data) => writeJsonAtomic(FILE(), data);

export const ExperimentLedger = {
  all() { return load().experiments; },

  byTopic(topic) { return load().experiments.filter((e) => e.topic === topic); },

  // Pages/queries under an IN-FLIGHT experiment (shipped/measuring, not yet resolved) —
  // both target AND control scopes. The Opportunity Engine excludes these so we never
  // propose a change that would contaminate a measurement in progress (a change to a
  // control corrupts the DiD just as much as a change to the treatment). The lock holds
  // until the experiment is measured (won/lost/inconclusive), even if measure_on passed.
  // Returns Map<normalizedKey, { id, measure_on, role }>.
  lockedKeys() {
    const map = new Map();
    for (const e of load().experiments) {
      if (!['shipped', 'measuring'].includes(e.status)) continue;
      for (const [role, sc] of [['target', e.target_scope], ['control', e.control_scope]]) {
        if (!sc) continue;
        for (const p of [...(sc.pages || []), ...(sc.queries || [])]) {
          const k = pathOf(p);
          if (!map.has(k)) map.set(k, { id: e.id, measure_on: e.measure_on, role });
        }
      }
    }
    return map;
  },

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
