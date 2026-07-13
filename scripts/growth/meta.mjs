// Meta-learning (growth-impl.md §12 P5) — the platform tunes its own scoring from
// measured outcomes. ADVISORY ONLY: it suggests, a human applies. Holds until enough
// experiments have resolved (nothing to learn from before ~2026-08). Per-user on-page
// A/B (the other P5 item) is deferred — it needs an app-side experiment harness +
// traffic volume for significance, and is out of scope for the analytics loop for now.

import { isMain } from './lib.mjs';
import { ExperimentLedger } from './ledger.mjs';
import { THRESHOLD } from './confidence.mjs';

const MIN_HISTORY = 5;

export function metaSuggest() {
  const resolved = ExperimentLedger.all().filter((e) => ['won', 'lost'].includes(e.status));
  if (resolved.length < MIN_HISTORY) {
    return { ok: false, resolved: resolved.length, note: `insufficient history (${resolved.length}/${MIN_HISTORY} resolved) — meta-learning holds` };
  }
  const won = resolved.filter((e) => e.status === 'won').length;
  const hitRate = +(won / resolved.length).toFixed(2);
  const suggestions = [];
  if (hitRate < 0.4) suggestions.push(`hit-rate ${hitRate} low → RAISE confidence threshold above ${THRESHOLD} (graduate fewer, higher-confidence signals) + shrink slate`);
  if (hitRate > 0.75) suggestions.push(`hit-rate ${hitRate} high → LOWER threshold or grow the slate (spare capacity to try more)`);
  // Which topics win most → tilt the portfolio toward them
  const byTopic = {};
  for (const e of resolved) { const t = e.topic || 'other'; (byTopic[t] ||= { w: 0, n: 0 }); byTopic[t].n++; if (e.status === 'won') byTopic[t].w++; }
  const strong = Object.entries(byTopic).filter(([, v]) => v.n >= 2 && v.w / v.n >= 0.7).map(([t]) => t);
  if (strong.length) suggestions.push(`topics winning consistently: ${strong.join(', ')} → tilt the portfolio mix toward them`);
  return { ok: true, resolved: resolved.length, hitRate, suggestions };
}

function main() {
  console.log('🧪 meta-learning (advisory)');
  const m = metaSuggest();
  if (!m.ok) { console.log(`   ${m.note}`); return; }
  console.log(`   ${m.resolved} resolved · hit-rate ${m.hitRate}`);
  if (m.suggestions.length) m.suggestions.forEach((s) => console.log(`   → ${s}`));
  else console.log('   scoring looks calibrated — no change suggested.');
}

if (isMain(import.meta.url)) main();
