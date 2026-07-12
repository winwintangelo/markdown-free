// Referral / AI-assistant channel (growth-impl.md §6.6).
//
// Not an API call — a *derivation* from Vercel's referrerHostname data (already
// collected). Rolls known AI-assistant hosts into an "ai" group, because that
// channel behaves nothing like search (no query, no rank) and is a growing share
// for a utility tool. Pure function → snapshot.mjs calls it after vercel collects.

import { SnapshotStore, isMain } from './lib.mjs';

// Substring matchers (cover subdomains).
const GROUPS = {
  ai: ['chatgpt.com', 'chat.openai.com', 'openai.com', 'perplexity.ai', 'claude.ai',
       'gemini.google.com', 'copilot.microsoft.com', 'doubao.com', 'yuanbao.tencent.com', 'poe.com'],
  search: ['google.', 'bing.com', 'baidu.com', 'duckduckgo.com', 'yahoo.', 'yandex.', 'ecosia.', 'sogou.com', 'brave.com', 'startpage.com', 'so.com', 'naver.com'],
  social: ['reddit.com', 'x.com', 't.co', 'twitter.com', 'linkedin.com', 'facebook.com',
           'github.com', 'news.ycombinator.com', 'ycombinator.com', 'weibo.', 'zhihu.com', 'xiaohongshu.com'],
};

export function classifyHost(host) {
  if (!host || host === '(direct)' || host === 'direct' || host.includes('markdown.free')) return 'direct';
  const h = String(host).toLowerCase();
  for (const [group, needles] of Object.entries(GROUPS)) {
    if (needles.some((n) => h.includes(n))) return group;
  }
  return 'other';
}

// vercelChannel = snapshot.channels.vercel  → { referrers: [{key, pageviews, visitors}] }
export function deriveReferral(vercelChannel) {
  const referrers = vercelChannel?.referrers ?? [];
  const groups = {};
  const hosts = [];
  for (const r of referrers) {
    const group = classifyHost(r.key);
    groups[group] = (groups[group] || 0) + (r.visitors || 0);
    hosts.push({ host: r.key, group, sessions: r.visitors || 0, pageviews: r.pageviews || 0 });
  }
  hosts.sort((a, b) => b.sessions - a.sessions);
  return {
    channel: 'referral',
    groups: Object.entries(groups).map(([group, sessions]) => ({ group, sessions })).sort((a, b) => b.sessions - a.sessions),
    hosts,
  };
}

// CLI: derive from the latest committed snapshot's vercel data.
if (isMain(import.meta.url)) {
  const snap = SnapshotStore.latest();
  const v = snap?.channels?.vercel;
  if (!v) { console.log('referral: no vercel data in the latest snapshot yet (wire Vercel in P1).'); }
  else {
    const { groups, hosts } = deriveReferral(v);
    console.log('📊 Referral rollup (from latest snapshot):');
    groups.forEach((g) => console.log(`   ${g.group}: ${g.sessions} sessions`));
    console.log('   top hosts:');
    hosts.slice(0, 10).forEach((h) => console.log(`      - [${h.group}] ${h.host} — ${h.sessions}`));
  }
}
