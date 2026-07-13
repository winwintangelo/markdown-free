// Consolidate (growth-impl.md W1 D2). Deterministic PRE-grouping of painpoint_items by
// topic into provisional painpoint_themes with a heuristic triage. This is the cheap
// first pass; the /growth-loop AGENT refines it semantically (merge/split/rename, verify
// clusters, moat-score) — that's the one place the loop needs a model. D3: themes become
// product-track opportunities (frequency × recency × moat × goal).
//
//   node scripts/growth/consolidate.mjs   (or: npm run growth:consolidate)

import path from 'node:path';
import { DATA_DIR, writeJsonAtomic, daysBetween, todayStr, clamp01, isMain } from './lib.mjs';
import { PainpointStore } from './painpoints.mjs';
import { loadGoals, goalAlignment } from './goals.mjs';

export function runConsolidate({ windowDays = 60 } = {}) {
  const items = PainpointStore.recent(windowDays);
  const byTopic = {};
  for (const it of items) (byTopic[it.topic] ||= []).push(it);
  const goals = loadGoals();

  const themes = Object.entries(byTopic)
    .filter(([, list]) => list.length >= 2)
    .map(([topic, list]) => {
      list.sort((a, b) => (b.engagement || 0) - (a.engagement || 0));
      const latest = list.map((i) => i.date).sort().at(-1);
      const recencyDays = latest ? Math.abs(daysBetween(String(latest).slice(0, 10), todayStr())) : 999;
      const sources = [...new Set(list.map((i) => i.source))];
      const freq = clamp01(list.length / 10);
      const recency = clamp01(1 - recencyDays / 90);
      const g = goalAlignment({ topic, locale: 'en', channel: 'product' }, goals);
      // multi-source corroboration matters (a painpoint on 3 platforms > 3 on one)
      const corroboration = clamp01(sources.length / 3);
      const score = +((freq * 0.45 + recency * 0.25 + corroboration * 0.3) * g.score).toFixed(2);
      const triage = score >= 0.4 ? 'build' : score >= 0.25 ? 'defer' : 'decline';
      return {
        id: `theme:${topic}`, topic, title: `${topic} conversion painpoints`,
        count: list.length, sources, recencyDays, score, triage, goalId: g.goal,
        representative: list.slice(0, 3).map((i) => ({ title: i.title, url: i.url, source: i.source, engagement: i.engagement })),
        items: list.map((i) => i.id),
      };
    })
    .sort((a, b) => b.score - a.score);

  writeJsonAtomic(path.join(DATA_DIR(), 'themes.json'), {
    version: 1, generatedAt: new Date().toISOString(),
    note: 'Provisional painpoint themes — deterministic topic pre-grouping + heuristic triage. The /growth-loop agent refines these semantically (merge/split/rename/re-triage). build|defer|decline is a suggestion, not a verdict.',
    themes,
  });
  return themes;
}

function main() {
  const themes = runConsolidate();
  console.log(`🧩 consolidate — ${themes.length} provisional painpoint themes (agent refines in /growth-loop):`);
  if (!themes.length) console.log('   none yet — run `npm run growth:social` first to gather painpoints.');
  themes.forEach((t) => console.log(`   [${t.triage}] ${t.topic} — ${t.count} mentions · ${t.sources.join('+')} · score ${t.score}${t.goalId ? ` · goal:${t.goalId}` : ''}`));
}

if (isMain(import.meta.url)) main();
