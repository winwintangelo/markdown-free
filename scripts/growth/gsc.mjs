// Google Search Console collector (growth-impl.md §6.3, Appendix A).
//
// Zero-dependency: mints a service-account JWT with node:crypto, exchanges it for
// an access token, and calls searchAnalytics.query directly.
//
// One-time setup (docs/growth-impl.md §13):
//   GSC_SERVICE_ACCOUNT_KEY=/abs/path/key.json   (keep OUT of git)
//   GSC_SITE_URL=sc-domain:markdown.free          (or https://www.markdown.free/)

import fs from 'node:fs';
import crypto from 'node:crypto';
import { loadEnv, ymd, daysAgo, sortRows, saveTmpReport, isMain } from './lib.mjs';

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';

const b64url = (buf) =>
  Buffer.from(buf).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

async function getAccessToken(key) {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = b64url(JSON.stringify({
    iss: key.client_email, scope: SCOPE, aud: TOKEN_URL, iat: now, exp: now + 3600,
  }));
  const input = `${header}.${claim}`;
  const sig = b64url(crypto.sign('RSA-SHA256', Buffer.from(input), key.private_key));
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${input}.${sig}`,
    }),
  });
  if (!res.ok) throw new Error(`GSC token ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return (await res.json()).access_token;
}

// Paginate: keep requesting 25k-row pages until a short page comes back.
async function queryAll(token, siteUrl, dimensions, startDate, endDate) {
  const ROW_LIMIT = 25000;
  const url = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`;
  const out = [];
  for (let startRow = 0; ; startRow += ROW_LIMIT) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startDate, endDate, dimensions, type: 'web', dataState: 'final',
        rowLimit: ROW_LIMIT, startRow,
      }),
    });
    if (!res.ok) throw new Error(`GSC query ${res.status}: ${(await res.text()).slice(0, 300)}`);
    const rows = (await res.json()).rows || [];
    out.push(...rows);
    if (rows.length < ROW_LIMIT) break;
  }
  return out;
}

const normalize = (rows) => sortRows(rows.map((r) => ({
  key: r.keys[0],
  clicks: r.clicks,
  impressions: r.impressions,
  ctr: +((r.ctr ?? 0) * 100).toFixed(2), // GSC ctr is a 0-1 fraction; store as percent
  position: r.position != null ? +r.position.toFixed(2) : null,
})));

export async function collect() {
  loadEnv();
  const keyFile = process.env.GSC_SERVICE_ACCOUNT_KEY || process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const siteUrl = process.env.GSC_SITE_URL || 'sc-domain:markdown.free';
  if (!keyFile) throw new Error('GSC_SERVICE_ACCOUNT_KEY not set (docs/growth-impl.md §13)');
  if (!fs.existsSync(keyFile)) throw new Error(`GSC key file not found: ${keyFile}`);
  const key = JSON.parse(fs.readFileSync(keyFile, 'utf-8'));

  const startDate = process.env.GSC_START_DATE || ymd(daysAgo(31));
  const endDate = process.env.GSC_END_DATE || ymd(daysAgo(3)); // stay inside finalized data

  const token = await getAccessToken(key);
  const queries = normalize(await queryAll(token, siteUrl, ['query'], startDate, endDate));
  const pages = normalize(await queryAll(token, siteUrl, ['page'], startDate, endDate));
  return { channel: 'gsc', siteUrl, dateRange: { start: startDate, end: endDate }, queries, pages };
}

// ---- CLI: node scripts/growth/gsc.mjs (or npm run report:gsc) ----
const label = (rows, l) => rows.map((r) => ({
  [l]: r.key, Clicks: r.clicks, Impressions: r.impressions, CTR: `${r.ctr}%`, Position: r.position ?? '',
}));

export async function runCli() {
  console.log('📊 GSC Search Analytics report');
  try {
    const { siteUrl, dateRange, queries, pages } = await collect();
    console.log(`   ${siteUrl} · ${dateRange.start} → ${dateRange.end}`);
    saveTmpReport('gsc_queries', queries, label(queries, 'Query'), ['Query', 'Clicks', 'Impressions', 'CTR', 'Position']);
    saveTmpReport('gsc_pages', pages, label(pages, 'Page'), ['Page', 'Clicks', 'Impressions', 'CTR', 'Position']);
    console.log(`   ✅ ${queries.length} queries, ${pages.length} pages → tmp/reports/`);
    queries.slice(0, 8).forEach((r) => console.log(`      - ${r.key} — ${r.clicks} clk / ${r.impressions} imp · pos ${r.position}`));
  } catch (e) {
    console.error(`   ❌ ${e.message}`);
    console.error('   Setup: docs/growth-impl.md §13');
    process.exitCode = 1;
  }
}

if (isMain(import.meta.url)) runCli();
