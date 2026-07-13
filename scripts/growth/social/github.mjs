// GitHub Issues collector (growth-impl.md W1 D1). Unauthenticated works (10 req/min
// search limit); set GITHUB_TOKEN for 30/min. Fails soft per-query on rate limits.

import { loadEnv, isMain } from '../lib.mjs';
import { PAINPOINT_QUERIES, getJson, item } from './lib.mjs';

export async function collect() {
  loadEnv();
  const token = process.env.GITHUB_TOKEN;
  const headers = { Accept: 'application/vnd.github+json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  const out = [];
  for (const q of PAINPOINT_QUERIES) {
    try {
      const j = await getJson(`https://api.github.com/search/issues?q=${encodeURIComponent(`${q} is:issue`)}&sort=updated&per_page=15`, headers);
      for (const it of j.items || []) {
        out.push(item({ source: 'github', id: it.id, title: it.title, url: it.html_url, date: it.created_at, engagement: it.comments || 0 }));
      }
    } catch { /* rate-limited or error → skip this query, keep the rest */ }
  }
  return out;
}

if (isMain(import.meta.url)) collect().then((r) => console.log(`github: ${r.length} items`));
