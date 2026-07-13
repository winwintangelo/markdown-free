// `propose` stage (growth-impl.md §12 P3, §8.2). Graduated signals → Opportunity
// Engine → ranked, explained portfolio → digest markdown. Read-only; the /growth-loop
// agent refines these heuristic proposals with judgment before anything is implemented.

import { isMain } from './lib.mjs';
import { SignalWarehouse } from './signals.mjs';
import { buildPortfolio } from './opportunity.mjs';
import { loadGoals } from './goals.mjs';
import { runAnalyze } from './analyze.mjs';
import { KnowledgeBase } from './knowledge.mjs';

const gate = (g) => (g === 'green' ? '🟢' : '🟡');

export function runPropose() {
  const graduated = SignalWarehouse.graduated();
  const analysis = runAnalyze();
  const regressions = analysis.ok ? analysis.regressions : [];
  const portfolio = buildPortfolio(graduated, { goalsDoc: loadGoals(), regressions });
  return { portfolio, graduatedCount: graduated.length };
}

export function proposalMd({ portfolio, graduatedCount }) {
  const lines = [];
  lines.push(`**Opportunity Engine:** ${graduatedCount} graduated signals → ${portfolio.totalCandidates} candidates · top ${portfolio.slate.length} (portfolio-balanced):`);
  if (!portfolio.slate.length) {
    lines.push('- _no graduated signals yet — needs multi-source corroboration (a 2nd cycle for trend, or conversions in-funnel)_');
    return lines.join('\n');
  }
  portfolio.slate.forEach((c, i) => {
    lines.push(`${i + 1}. ${gate(c.gate)} **[${c.bucket}]** ${c.action} — \`${c.key}\``);
    const meta = [c.why, `score ${c.score}`, c.goalId ? `goal:${c.goalId}` : null].filter(Boolean).join(' · ');
    lines.push(`   _${meta}_`);
    const kb = c.topic ? KnowledgeBase.learnings(c.topic).slice(0, 1) : [];
    if (kb.length) lines.push(`   ↳ KB(${c.topic}): ${kb[0].claim}`);
  });
  return lines.join('\n');
}

function main() {
  console.log('💡 propose — ranked opportunity portfolio\n');
  console.log(proposalMd(runPropose()));
}

if (isMain(import.meta.url)) main();
