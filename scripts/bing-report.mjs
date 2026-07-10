#!/usr/bin/env node

/**
 * Bing Webmaster Tools Report Generator
 *
 * Pulls search traffic, query stats, and page stats from the Bing Webmaster
 * Tools API and saves to JSON/CSV files (same shape as the Umami report + the
 * GSC CSV exports, so the three are directly comparable).
 *
 * WHY THIS EXISTS: China — our #1 on-site audience — reaches the site via Bing /
 * cn.bing / Chinese assistants, NOT Google, so Google Search Console structurally
 * can't see that market. This is the GSC-equivalent for the channel we're winning.
 *
 * Usage:
 *   node scripts/bing-report.mjs        (or: npm run report:bing)
 *
 * Environment variables (in .env or shell):
 *   BING_API_KEY   - required. Bing Webmaster Tools → Settings (gear) → API access
 *                    → "Generate" an API key. (The site must be verified first.)
 *   BING_SITE_URL  - optional. The exact verified site URL as it appears in Bing
 *                    Webmaster Tools. Default: https://www.markdown.free
 *                    If you get an "invalid site" error, try adding/removing the
 *                    trailing slash to match what Bing shows.
 *
 * API docs: https://learn.microsoft.com/en-us/dotnet/api/microsoft.bing.webmaster.api.interfaces
 */

import fs from 'fs';
import path from 'path';

// Load .env file manually (no external dependency needed) — same loader as umami-report.mjs
function loadEnv() {
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    content.split('\n').forEach(line => {
      if (!line || line.startsWith('#')) return;
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        if (!process.env[key.trim()]) {
          process.env[key.trim()] = value;
        }
      }
    });
    console.log('📁 Loaded .env file');
  }
}

loadEnv();

// Configuration
const API_BASE = 'https://ssl.bing.com/webmaster/api.svc/json';
const API_KEY = process.env.BING_API_KEY;
const SITE_URL = process.env.BING_SITE_URL || 'https://www.markdown.free';

if (!API_KEY) {
  console.error('❌ Error: BING_API_KEY environment variable is required');
  console.error('');
  console.error('   How to get one (~2 minutes):');
  console.error('   1. Go to https://www.bing.com/webmasters and sign in');
  console.error('   2. Make sure markdown.free is verified (add + verify the site if not)');
  console.error('   3. Settings (gear, top-right) → "API access" → Generate an API key');
  console.error('   4. Add it to .env:   BING_API_KEY=xxxxxxxxxxxxxxxx');
  console.error('');
  console.error('   Then re-run:  npm run report:bing');
  process.exit(1);
}

console.log('📊 Bing Webmaster Tools Report Generator');
console.log('========================================');
console.log(`🌐 Site: ${SITE_URL}`);
console.log(`🔑 API key: ${API_KEY.slice(0, 6)}…`);
console.log('');

// ---------------------------------------------------------------------------
// API helper — Bing WMT is GET with ?apikey= & ?siteUrl=; responses wrap in { d: ... }
// ---------------------------------------------------------------------------
async function fetchBing(method, extraParams = {}) {
  const url = new URL(`${API_BASE}/${method}`);
  url.searchParams.set('apikey', API_KEY);
  url.searchParams.set('siteUrl', SITE_URL);
  Object.entries(extraParams).forEach(([k, v]) => url.searchParams.set(k, v));

  const response = await fetch(url.toString(), {
    headers: { Accept: 'application/json' },
  });

  const text = await response.text();
  if (!response.ok) {
    // Bing returns JSON errors like {"ErrorCode":..,"Message":".."} — surface the message if present
    let msg = text;
    try { const j = JSON.parse(text); msg = j.Message || j.message || text; } catch { /* keep raw */ }
    throw new Error(`API Error ${response.status}: ${msg}`);
  }

  let body;
  try { body = JSON.parse(text); }
  catch { throw new Error(`Non-JSON response: ${text.slice(0, 200)}`); }

  // JSON endpoints wrap the payload in { d: ... }
  const d = body && Object.prototype.hasOwnProperty.call(body, 'd') ? body.d : body;
  return Array.isArray(d) ? d : (d?.results ?? d ?? []);
}

// Parse Bing's /Date(1620000000000-0700)/ format → YYYY-MM-DD
function parseMsDate(s) {
  if (typeof s !== 'string') return s;
  const m = s.match(/\/Date\((\d+)(?:[+-]\d+)?\)\//);
  if (!m) return s;
  return new Date(parseInt(m[1], 10)).toISOString().split('T')[0];
}

const pct = (clicks, impr) => (impr ? `${((clicks / impr) * 100).toFixed(2)}%` : '0%');

// GetQueryStats/GetPageStats return one row per (item, week). Collapse to per-item
// totals: sum clicks/impressions, and impression-weight the position (as GSC does).
// AvgImpressionPosition is the GSC-equivalent "Position"; AvgClickPosition is -1 when
// there were no clicks, so we never average on it.
function aggregateBy(rows, keyField, labelColumn) {
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
  return [...map.values()]
    .map(e => ({
      [labelColumn]: e.key,
      Clicks: e.clicks,
      Impressions: e.impressions,
      CTR: pct(e.clicks, e.impressions),
      Position: e.posImpr ? +(e.posWeighted / e.posImpr).toFixed(2) : '',
    }))
    .sort((a, b) => b.Clicks - a.Clicks || b.Impressions - a.Impressions);
}

// ---------------------------------------------------------------------------
// CSV + save helpers (same convention as umami-report.mjs)
// ---------------------------------------------------------------------------
function toCSV(data, columns) {
  if (!data || data.length === 0) return '';
  const cols = columns || Object.keys(data[0]);
  const header = cols.join(',');
  const rows = data.map(row =>
    cols.map(col => {
      const val = row[col];
      if (val === null || val === undefined) return '';
      if (typeof val === 'string' && (val.includes(',') || val.includes('"'))) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    }).join(',')
  );
  return [header, ...rows].join('\n');
}

function saveReport(name, rawData, csvRows, csvColumns) {
  const outputDir = path.join(process.cwd(), 'tmp', 'reports');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const timestamp = new Date().toISOString().split('T')[0];
  const jsonPath = path.join(outputDir, `${name}_${timestamp}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(rawData, null, 2));
  console.log(`   📄 JSON: ${jsonPath}`);

  if (csvRows && csvRows.length > 0) {
    const csvPath = path.join(outputDir, `${name}_${timestamp}.csv`);
    fs.writeFileSync(csvPath, toCSV(csvRows, csvColumns));
    console.log(`   📄 CSV:  ${csvPath}`);
  }
}

// ---------------------------------------------------------------------------
// Reports
// ---------------------------------------------------------------------------
async function getTraffic() {
  console.log('📈 Fetching rank & traffic (daily)...');
  try {
    const rows = await fetchBing('GetRankAndTrafficStats');
    const norm = rows
      .map(r => ({ Date: parseMsDate(r.Date), Clicks: r.Clicks ?? 0, Impressions: r.Impressions ?? 0 }))
      .sort((a, b) => String(a.Date).localeCompare(String(b.Date)));
    saveReport('bing_traffic', rows, norm, ['Date', 'Clicks', 'Impressions']);
    const clicks = norm.reduce((s, r) => s + r.Clicks, 0);
    const impr = norm.reduce((s, r) => s + r.Impressions, 0);
    console.log(`   ✅ ${norm.length} days · ${clicks} clicks / ${impr} impressions · CTR ${pct(clicks, impr)}`);
    return norm;
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return null;
  }
}

async function getQueries() {
  console.log('🔎 Fetching top search queries...');
  try {
    const rows = await fetchBing('GetQueryStats');
    const norm = aggregateBy(rows, 'Query', 'Query');
    saveReport('bing_queries', rows, norm, ['Query', 'Clicks', 'Impressions', 'CTR', 'Position']);
    console.log(`   ✅ ${norm.length} queries (aggregated from ${rows.length} weekly rows). Top by clicks:`);
    norm.slice(0, 8).forEach(q =>
      console.log(`      - ${q.Query} — ${q.Clicks} clk / ${q.Impressions} imp · pos ${q.Position}`));
    return norm;
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return null;
  }
}

// GetPageStats rows carry the page URL in the `Query` field (Bing quirk); fall back to Page/Url.
async function getPages() {
  console.log('📑 Fetching top pages...');
  try {
    const rows = await fetchBing('GetPageStats');
    const keyed = rows.map(r => ({ ...r, Page: r.Query ?? r.Page ?? r.Url }));
    const norm = aggregateBy(keyed, 'Page', 'Page');
    saveReport('bing_pages', rows, norm, ['Page', 'Clicks', 'Impressions', 'CTR', 'Position']);
    console.log(`   ✅ ${norm.length} pages (aggregated from ${rows.length} weekly rows). Top by clicks:`);
    norm.slice(0, 8).forEach(p =>
      console.log(`      - ${p.Page} — ${p.Clicks} clk / ${p.Impressions} imp · pos ${p.Position}`));
    return norm;
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return null;
  }
}

async function main() {
  const startTime = Date.now();
  await getTraffic();
  console.log('');
  await getQueries();
  console.log('');
  await getPages();
  console.log('');
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log('========================================');
  console.log(`✅ Report complete in ${duration}s`);
  console.log('📁 Reports saved to: tmp/reports/  (bing_traffic / bing_queries / bing_pages)');
}

main();
