// SignalWarehouse service (growth-impl.md §7.1, §7.4). The only module that touches
// data/signals.json. Stores raw observations, ages them trend-driven, and graduates
// those the Confidence Engine clears. Archived signals are kept as history.

import path from 'node:path';
import { DATA_DIR, readJson, writeJsonAtomic, daysBetween, todayStr, isMain } from './lib.mjs';
import { scoreSignal, graduates } from './confidence.mjs';
import { KnowledgeBase } from './knowledge.mjs';

const FILE = () => path.join(DATA_DIR(), 'signals.json');
const load = () => readJson(FILE(), { version: 1, signals: [] });
const save = (d) => writeJsonAtomic(FILE(), d);

const TREND_CAP = 12;

// Trend-driven lifecycle: New → Growing → Hot → Cooling → Archived.
function nextStage(sig, today) {
  const ageDays = sig.lastSeen ? Math.abs(daysBetween(sig.lastSeen, today)) : 0;
  if (ageDays > 21) return 'Archived'; // not seen in ~3 weekly cycles
  const t = sig.trend || [];
  if (t.length < 2) return 'New';
  const prev = t[t.length - 2].strength || 0;
  const cur = t[t.length - 1].strength || 0;
  const rising = cur > prev * 1.1, falling = cur < prev * 0.9, strong = cur >= 300;
  if (falling) return 'Cooling';
  if (rising && strong) return 'Hot';
  if (rising) return 'Growing';
  if (strong) return 'Hot';
  return sig.stage && sig.stage !== 'New' ? sig.stage : 'Growing';
}

export const SignalWarehouse = {
  all() { return load().signals; },
  get(filter = () => true) { return load().signals.filter(filter); },
  graduated() { return load().signals.filter((s) => s.graduated && s.stage !== 'Archived'); },

  // obs = { id, key, topic, sources:[{channel,kind,metric,strength,weight}], strength, target, seasonal? }
  upsert(obs) {
    const d = load();
    const today = todayStr();
    let s = d.signals.find((x) => x.id === obs.id);
    if (!s) {
      s = {
        id: obs.id, key: obs.key, topic: obs.topic, strength: obs.strength ?? 0,
        sources: [], firstSeen: today, lastSeen: today, stage: 'New',
        trend: [], confidence: null, seasonal: !!obs.seasonal, graduated: false,
        graduatedTo: null, target: obs.target,
      };
      d.signals.push(s);
    }
    // merge sources, deduped by channel+kind (latest wins)
    for (const src of obs.sources || []) {
      const i = s.sources.findIndex((x) => x.channel === src.channel && x.kind === src.kind);
      if (i >= 0) s.sources[i] = src; else s.sources.push(src);
    }
    s.lastSeen = today;
    s.target = obs.target || s.target;
    s.strength = obs.strength ?? s.strength ?? 0;
    s.trend.push({ date: today, strength: obs.strength ?? 0 });
    if (s.trend.length > TREND_CAP) s.trend = s.trend.slice(-TREND_CAP);
    save(d);
    return s;
  },

  update(id, patch) {
    const d = load();
    const s = d.signals.find((x) => x.id === id);
    if (s) { Object.assign(s, patch); save(d); }
    return s;
  },

  // Recompute stage (age) + confidence (with KB prior) + graduation for every signal.
  refresh() {
    const d = load();
    const today = todayStr();
    for (const s of d.signals) {
      s.stage = nextStage(s, today);
      s.confidence = scoreSignal(s, KnowledgeBase.prior(s.topic));
      if (s.stage !== 'Archived') s.graduated = graduates(s.confidence);
    }
    save(d);
    return d.signals;
  },
};

if (isMain(import.meta.url)) {
  const all = SignalWarehouse.all();
  const grad = SignalWarehouse.graduated();
  console.log(`📡 Signal Warehouse — ${all.length} signals · ${grad.length} graduated`);
  const byStage = {};
  all.forEach((s) => { byStage[s.stage] = (byStage[s.stage] || 0) + 1; });
  console.log(`   stages: ${Object.entries(byStage).map(([k, v]) => `${k}=${v}`).join(' · ') || '(none)'}`);
  grad.slice(0, 10).forEach((s) => console.log(`   ✓ [${s.topic}] ${s.key} — conf ${s.confidence?.score} · ${s.sources.length} sources · ${s.stage}`));
}
