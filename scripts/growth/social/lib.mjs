// Shared helpers for the social painpoint collectors (growth-impl.md W1 D1).
// Free, unauthenticated APIs (GitHub optionally takes a token for higher rate limits).

import { topicOf } from '../lib.mjs';

// Search scope: markdown / document-conversion painpoints. Kept small to respect
// GitHub's unauthenticated search rate limit (10/min).
export const PAINPOINT_QUERIES = [
  'markdown to pdf',
  'markdown to word',
  'markdown table broken',
  'pandoc cjk',
  'markdown to epub',
  'markdown chinese font',
];

// Light markdown-relevance filter — cuts obvious noise (search APIs match the query in
// the body too, so titles are often off-topic). The /growth-loop agent does the real
// semantic filtering; this just drops the clearly-irrelevant before they enter the corpus.
const RELEVANT = /markdown|pandoc|\bmd\b|\.md\b|readme|mdbook|mkdocs/i;
export const relevant = (title) => RELEVANT.test(String(title || ''));

export async function getJson(url, headers = {}) {
  const r = await fetch(url, {
    headers: { 'User-Agent': 'markdown-free-growth', Accept: 'application/json', ...headers },
    signal: AbortSignal.timeout(10000),
  });
  if (!r.ok) throw new Error(`${r.status}`);
  return r.json();
}

// Normalize a raw hit into a painpoint_item. `id` must be unique per source.
export function item({ source, id, title, url, date, engagement }) {
  return {
    id: `${source}:${id}`,
    source,
    title: String(title || '').slice(0, 200),
    url,
    date,                       // ISO string
    engagement: engagement || 0,
    topic: topicOf(title),
    seenAt: new Date().toISOString(),
  };
}
