// Stack Overflow collector (growth-impl.md W1 D1). Stack Exchange API, free (300/day
// per IP unauthenticated). Node fetch auto-decompresses the gzipped response.

import { isMain } from '../lib.mjs';
import { PAINPOINT_QUERIES, getJson, item } from './lib.mjs';

export async function collect() {
  const out = [];
  for (const q of PAINPOINT_QUERIES) {
    try {
      const j = await getJson(`https://api.stackexchange.com/2.3/search/advanced?order=desc&sort=creation&q=${encodeURIComponent(q)}&site=stackoverflow&pagesize=15`);
      for (const it of j.items || []) {
        out.push(item({ source: 'stackoverflow', id: it.question_id, title: it.title, url: it.link, date: new Date((it.creation_date || 0) * 1000).toISOString(), engagement: (it.score || 0) + (it.answer_count || 0) }));
      }
      if (j.quota_remaining != null && j.quota_remaining < 10) break; // conserve daily quota
    } catch { /* skip this query */ }
  }
  return out;
}

if (isMain(import.meta.url)) collect().then((r) => console.log(`stackoverflow: ${r.length} items`));
