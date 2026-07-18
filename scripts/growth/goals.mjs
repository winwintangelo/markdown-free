// Strategic Goals (growth-impl.md §9) — the alignment rail. Quarterly, human-set.
// goalAlignment() scores how well a candidate advances the quarter's objectives; the
// Opportunity Engine multiplies by it (goals say WHERE to push; moat says what NOT to dilute).

import path from 'node:path';
import { DATA_DIR, readJson, isMain } from './lib.mjs';

const FILE = () => path.join(DATA_DIR(), 'goals.json');
export const loadGoals = () => readJson(FILE(), { period: null, goals: [] });

// candidate: { topic, locale, channel, textLang?, country? } → a gentle multiplier in
// [1.0, 1.4]: goals TILT the ranking (where to push), they don't dominate it
// (impact/confidence lead). A market-scoped goal (locales and/or countries) matches by
// page locale, by the key text's script (textLang 'zh' matches locales zh-*, so a
// Chinese-language QUERY counts even though its path locale is 'en'), or by audience
// country (goal.countries — a CN market signal has no locale at all).
export function goalAlignment(cand, goalsDoc = loadGoals()) {
  const goals = goalsDoc.goals || [];
  let best = { score: 1.0, goal: null }; // 1.0 = neutral (advances nothing in particular)
  for (const g of goals) {
    let s = 1.0;
    const topicMatch = g.topics?.includes(cand.topic);
    const marketScoped = (g.locales?.length || 0) + (g.countries?.length || 0) > 0;
    if (marketScoped) {
      const localeHit = g.locales?.includes(cand.locale)
        || (cand.textLang && g.locales?.some((l) => l.startsWith(cand.textLang)));
      const countryHit = cand.country && g.countries?.includes(String(cand.country).toUpperCase());
      // A pure market signal (topic 'market', e.g. country:CN) IS its market — full tilt.
      if (localeHit || countryHit) s = (topicMatch || cand.topic === 'market') ? 1.4 : 1.3;
    } else if (topicMatch) {
      s = 1.25;
    }
    // metric-anchored shortcuts
    if (g.id === 'ai-referrals' && (cand.topic === 'ai-visibility' || cand.channel === 'referral')) s = Math.max(s, 1.4);
    if (g.id === 'conversion' && cand.channel === 'events') s = Math.max(s, 1.35);
    if (s > best.score) best = { score: +s.toFixed(2), goal: g.id };
  }
  return best;
}

if (isMain(import.meta.url)) {
  const g = loadGoals();
  console.log(`🎯 Strategic goals — ${g.period}:`);
  (g.goals || []).forEach((x) => console.log(`   [${x.id}] ${x.title} → ${x.metric} ${x.target}${x.topics?.length ? ` · topics: ${x.topics.join(',')}` : ''}${x.locales?.length ? ` · locales: ${x.locales.join(',')}` : ''}`));
}
