// Bing Webmaster Tools collector (growth-impl.md §6.2).
//
// Logic ported verbatim from the original scripts/bing-report.mjs (fetchBing /
// parseMsDate / aggregateBy), refactored into a side-effect-free module so
// snapshot.mjs can import collect(). scripts/bing-report.mjs is now a thin shim.
//
// WHY THIS CHANNEL: China — our #1 on-site audience — reaches the site via Bing /
// cn.bing / Chinese assistants, NOT Google, so Search Console can't see it.
//
// Env: BING_API_KEY (required), BING_SITE_URL (default www.markdown.free).

import { loadEnv, pctNum, sortRows, saveTmpReport, isMain } from './lib.mjs';

const API_BASE = 'https://ssl.bing.com/webmaster/api.svc/json';

async function fetchBing(method, apiKey, siteUrl, extraParams = {}) {
  const url = new URL(`${API_BASE}/${method}`);
  url.searchParams.set('apikey', apiKey);
  url.searchParams.set('siteUrl', siteUrl);
  for (const [k, v] of Object.entries(extraParams)) url.searchParams.set(k, v);

  const res = await fetch(url.toString(), { headers: { Accept: 'application/json' } });
  const text = await res.text();
  if (!res.ok) {
    let msg = text;
    try { const j = JSON.parse(text); msg = j.Message || j.message || text; } catch { /* raw */ }
    throw new Error(`Bing API ${res.status}: ${msg}`);
  }
  let body;
  try { body = JSON.parse(text); } catch { throw new Error(`Bing non-JSON: ${text.slice(0, 200)}`); }
  const d = body && Object.prototype.hasOwnProperty.call(body, 'd') ? body.d : body;
  return Array.isArray(d) ? d : (d?.results ?? d ?? []);
}

// Bing's /Date(1620000000000-0700)/ → YYYY-MM-DD
function parseMsDate(s) {
  if (typeof s !== 'string') return s;
  const m = s.match(/\/Date\((\d+)(?:[+-]\d+)?\)\//);
  return m ? new Date(parseInt(m[1], 10)).toISOString().slice(0, 10) : s;
}

// GetQueryStats/GetPageStats return one row per (item, week). Collapse to per-item
// totals: sum clicks/impressions, impression-weight the position (as GSC does).
// AvgClickPosition is -1 with no clicks, so weight on AvgImpressionPosition.
function aggregateBy(rows, keyField) {
  const map = new Map();
  for (const r of rows) {
    const key = r[keyField];
    if (key == null) continue;
    let e = map.get(key);
    if (!e) { e = { key, clicks: 0, impressions: 0, posWeighted: 0, posImpr: 0 }; map.set(key, e); }
    const imp = r.Impressions ?? 0;
    e.clicks += r.Clicks ?? 0;
    e.impressions += imp;
    const pos = r.AvgImpressionPosition;
    if (typeof pos === 'number' && pos > 0 && imp > 0) { e.posWeighted += pos * imp; e.posImpr += imp; }
  }
  return sortRows([...map.values()].map((e) => ({
    key: e.key,
    clicks: e.clicks,
    impressions: e.impressions,
    ctr: pctNum(e.clicks, e.impressions),
    position: e.posImpr ? +(e.posWeighted / e.posImpr).toFixed(2) : null,
  })));
}

export async function collect() {
  loadEnv();
  const apiKey = process.env.BING_API_KEY;
  const siteUrl = process.env.BING_SITE_URL || 'https://www.markdown.free';
  if (!apiKey) throw new Error('BING_API_KEY not set (Bing Webmaster → Settings → API access)');

  const trafficRaw = await fetchBing('GetRankAndTrafficStats', apiKey, siteUrl);
  const traffic = trafficRaw
    .map((r) => ({ date: parseMsDate(r.Date), clicks: r.Clicks ?? 0, impressions: r.Impressions ?? 0 }))
    .sort((a, b) => String(a.date).localeCompare(String(b.date)));

  const queries = aggregateBy(await fetchBing('GetQueryStats', apiKey, siteUrl), 'Query');

  // GetPageStats carries the URL in the `Query` field (Bing quirk); fall back to Page/Url.
  const pagesRaw = (await fetchBing('GetPageStats', apiKey, siteUrl))
    .map((r) => ({ ...r, Page: r.Query ?? r.Page ?? r.Url }));
  const pages = aggregateBy(pagesRaw, 'Page');

  return { channel: 'bing', siteUrl, dateRange: null, traffic, queries, pages };
}

// ---- CLI mode: node scripts/growth/bing.mjs (or npm run report:bing via shim) ----
const label = (rows, l) => rows.map((r) => ({
  [l]: r.key, Clicks: r.clicks, Impressions: r.impressions,
  CTR: `${r.ctr}%`, Position: r.position ?? '',
}));

export async function runCli() {
  console.log('📊 Bing Webmaster Tools report');
  try {
    const { traffic, queries, pages } = await collect();
    saveTmpReport('bing_traffic', traffic,
      traffic.map((r) => ({ Date: r.date, Clicks: r.clicks, Impressions: r.impressions })),
      ['Date', 'Clicks', 'Impressions']);
    saveTmpReport('bing_queries', queries, label(queries, 'Query'),
      ['Query', 'Clicks', 'Impressions', 'CTR', 'Position']);
    saveTmpReport('bing_pages', pages, label(pages, 'Page'),
      ['Page', 'Clicks', 'Impressions', 'CTR', 'Position']);
    const clk = traffic.reduce((s, r) => s + r.clicks, 0);
    const imp = traffic.reduce((s, r) => s + r.impressions, 0);
    console.log(`   ✅ ${traffic.length} days · ${clk} clk / ${imp} imp · ${queries.length} queries · ${pages.length} pages → tmp/reports/`);
    queries.slice(0, 8).forEach((r) =>
      console.log(`      - ${r.key} — ${r.clicks} clk / ${r.impressions} imp · pos ${r.position}`));
  } catch (e) {
    console.error(`   ❌ ${e.message}`);
    process.exitCode = 1;
  }
}

if (isMain(import.meta.url)) runCli();
