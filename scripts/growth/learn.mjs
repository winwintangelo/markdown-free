// `learn` — the back-edge that compounds (growth-impl.md §8.4, §12 P4).
// Called by measure when an experiment resolves: distill it into the Knowledge Base,
// adjust the topic's confidence prior, and produce adjacency suggestions —
// WINS BRANCH (try the pattern on related topics), LOSSES PRUNE (avoid it there).
// Idempotent: an experiment already linked in the KB won't be re-learned.

import { isMain } from './lib.mjs';
import { KnowledgeBase } from './knowledge.mjs';
import { ExperimentLedger } from './ledger.mjs';

export function learnFromExperiment(entry) {
  const topic = entry.topic || 'other';
  const node = KnowledgeBase.find(topic);
  if (node && node.experiments.includes(entry.id)) return { topic, action: 'already-learned' };

  KnowledgeBase.linkExperiment(topic, entry.id);
  const related = KnowledgeBase.similar(topic);
  const note = entry.outcome?.note || '';

  if (entry.status === 'won') {
    KnowledgeBase.learn(topic, { claim: `${entry.title} — WORKED (${note})`, evidence: [entry.id], confidence: 0.7 });
    const prior = KnowledgeBase.bumpPrior(topic, +0.05);
    return { topic, action: 'branch', prior, related, suggestions: related.map((t) => `try the same change on '${t}'`) };
  }
  if (entry.status === 'lost') {
    KnowledgeBase.learn(topic, { claim: `${entry.title} — did NOT work (${note})`, evidence: [entry.id], confidence: 0.6 });
    const prior = KnowledgeBase.bumpPrior(topic, -0.05);
    return { topic, action: 'prune', prior, related, suggestions: related.map((t) => `avoid this pattern on '${t}'`) };
  }
  return { topic, action: 'none' };
}

// CLI: apply learning for every already-resolved ledger entry (idempotent backfill).
function main() {
  const resolved = ExperimentLedger.all().filter((e) => ['won', 'lost'].includes(e.status));
  console.log(`🎓 learn — ${resolved.length} resolved experiments`);
  for (const e of resolved) {
    const r = learnFromExperiment(e);
    console.log(`   [${e.status}] ${e.id} → ${r.action}${r.prior ? ` (prior ${r.prior})` : ''}${r.suggestions?.length ? ` · ${r.suggestions.length} adjacent` : ''}`);
  }
  if (!resolved.length) console.log('   nothing resolved yet — learning kicks in as experiments come due (2026-08-01+).');
}

if (isMain(import.meta.url)) main();
