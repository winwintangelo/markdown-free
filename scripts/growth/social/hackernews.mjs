// Hacker News collector (growth-impl.md W1 D1). Algolia HN Search API, free, no auth.

import { isMain } from '../lib.mjs';
import { PAINPOINT_QUERIES, getJson, item } from './lib.mjs';

export async function collect() {
  const out = [];
  for (const q of PAINPOINT_QUERIES) {
    try {
      const j = await getJson(`https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(q)}&tags=story&hitsPerPage=15`);
      for (const h of j.hits || []) {
        out.push(item({
          source: 'hackernews', id: h.objectID, title: h.title,
          url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
          date: h.created_at, engagement: (h.points || 0) + (h.num_comments || 0),
        }));
      }
    } catch { /* skip this query */ }
  }
  return out;
}

if (isMain(import.meta.url)) collect().then((r) => console.log(`hackernews: ${r.length} items`));
