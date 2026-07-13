// Strategic Goals (growth-impl.md §9) — the alignment rail. Quarterly, human-set.
// goalAlignment() scores how well a candidate advances the quarter's objectives; the
// Opportunity Engine multiplies by it (goals say WHERE to push; moat says what NOT to dilute).

import path from 'node:path';
import { DATA_DIR, readJson, isCJKLocale, isMain } from './lib.mjs';

const FILE = () => path.join(DATA_DIR(), 'goals.json');
export const loadGoals = () => readJson(FILE(), { period: null, goals: [] });

// candidate: { topic, locale, channel } → a gentle multiplier in [1.0, 1.4]:
// goals TILT the ranking (where to push), they don't dominate it (impact/confidence lead).
export function goalAlignment(cand, goalsDoc = loadGoals()) {
  const goals = goalsDoc.goals || [];
  let best = { score: 1.0, goal: null }; // 1.0 = neutral (advances nothing in particular)
  for (const g of goals) {
    let s = 1.0;
    const topicMatch = g.topics?.includes(cand.topic);
    if (g.locales?.length) {
      // locale-scoped goal (e.g. cn-market): REQUIRES locale membership; topic only refines.
      if (g.locales.includes(cand.locale)) s = topicMatch ? 1.4 : 1.3;
    } else if (topicMatch) {
      s = 1.25;
    }
    // metric-anchored shortcuts
    if (g.id === 'ai-referrals' && (cand.topic === 'ai-visibility' || cand.channel === 'referral')) s = Math.max(s, 1.4);
    if (g.id === 'conversion' && cand.channel === 'events') s = Math.max(s, 1.35);
    if (g.id === 'cn-market' && isCJKLocale(cand.locale)) s = Math.max(s, 1.4);
    if (s > best.score) best = { score: +s.toFixed(2), goal: g.id };
  }
  return best;
}

if (isMain(import.meta.url)) {
  const g = loadGoals();
  console.log(`🎯 Strategic goals — ${g.period}:`);
  (g.goals || []).forEach((x) => console.log(`   [${x.id}] ${x.title} → ${x.metric} ${x.target}${x.topics?.length ? ` · topics: ${x.topics.join(',')}` : ''}${x.locales?.length ? ` · locales: ${x.locales.join(',')}` : ''}`));
}
