// KnowledgeBase service (growth-impl.md §7.3, §7.4) — the compounding asset.
// Validated learning as a topic graph; the ONLY module that touches data/knowledge.json.
// Every new signal consults prior(topic) before graduating; learn() appends verdicts.

import path from 'node:path';
import { DATA_DIR, readJson, writeJsonAtomic, clamp01, isMain } from './lib.mjs';

const FILE = () => path.join(DATA_DIR(), 'knowledge.json');
const load = () => readJson(FILE(), { version: 1, topics: {} });
const save = (d) => writeJsonAtomic(FILE(), d);
const ensure = (d, topic) => (d.topics[topic] ||= { signals: [], experiments: [], learnings: [], confidence_prior: 0.5, related: [] });

export const KnowledgeBase = {
  find(topic) { return load().topics[topic] || null; },
  prior(topic) { return load().topics[topic]?.confidence_prior ?? 0.5; },
  similar(topic) { return load().topics[topic]?.related ?? []; },
  learnings(topic) { return load().topics[topic]?.learnings ?? []; },

  // Search all topics for learnings whose claim matches — makes recommendations explainable.
  evidenceFor(substr) {
    const d = load(), out = [];
    for (const [topic, node] of Object.entries(d.topics)) {
      for (const l of node.learnings || []) {
        if (l.claim.toLowerCase().includes(String(substr).toLowerCase())) out.push({ topic, ...l });
      }
    }
    return out;
  },

  learn(topic, learning) {
    const d = load(); ensure(d, topic);
    d.topics[topic].learnings.push(learning);
    save(d);
    return learning;
  },

  bumpPrior(topic, delta) {
    const d = load(); ensure(d, topic);
    d.topics[topic].confidence_prior = +clamp01(d.topics[topic].confidence_prior + delta).toFixed(3);
    // keep priors in a sane band so one result never dominates
    d.topics[topic].confidence_prior = Math.max(0.2, Math.min(0.9, d.topics[topic].confidence_prior));
    save(d);
    return d.topics[topic].confidence_prior;
  },

  linkExperiment(topic, expId) {
    const d = load(); ensure(d, topic);
    if (!d.topics[topic].experiments.includes(expId)) d.topics[topic].experiments.push(expId);
    save(d);
  },
};

if (isMain(import.meta.url)) {
  const d = load();
  console.log('🧠 Knowledge Base — topics:');
  for (const [t, n] of Object.entries(d.topics)) {
    console.log(`   ${t.padEnd(12)} prior=${n.confidence_prior} · ${n.learnings.length} learnings · ${n.experiments.length} exp · related=[${n.related.join(', ')}]`);
    n.learnings.forEach((l) => console.log(`      • ${l.claim} (conf ${l.confidence}, ev ${(l.evidence || []).join('/')})`));
  }
}
