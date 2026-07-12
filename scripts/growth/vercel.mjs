// Vercel Web Analytics collector (growth-impl.md §6.4).
//
// Vercel shipped an official Web Analytics REST API ~June 2026 — this replaces the
// old manual CSV export AND the dead Umami report. Exports vercelConfig/vercelCall
// so events.mjs (§6.5) reuses the same auth without duplicating it.
//
// One-time setup (docs/growth-impl.md §13):
//   VERCEL_TOKEN=…                 (Vercel → Settings → Tokens; team-scoped if team-owned)
//   VERCEL_PROJECT_ID=markdown-free
//   VERCEL_TEAM_ID=team_…          (only if the project is team-owned)
//
// Plan note: on Hobby the aggregate API reaches back only ~1 month — which is why
// the loop commits each snapshot to git (git history = the real archive).

import { loadEnv, ymd, daysAgo, saveTmpReport, isMain } from './lib.mjs';

const BASE = 'https://api.vercel.com/v1/query/web-analytics';

export function vercelConfig() {
  loadEnv();
  const token = process.env.VERCEL_TOKEN;
  if (!token) throw new Error('VERCEL_TOKEN not set (docs/growth-impl.md §13)');
  return {
    token,
    projectId: process.env.VERCEL_PROJECT_ID || 'markdown-free',
    teamId: process.env.VERCEL_TEAM_ID || null,
    since: process.env.VERCEL_SINCE || ymd(daysAgo(28)),
    until: process.env.VERCEL_UNTIL || ymd(daysAgo(0)),
  };
}

// Shared caller for both visits (here) and events (events.mjs).
export async function vercelCall(pathname, params, cfg) {
  const u = new URL(BASE + pathname);
  u.searchParams.set('projectId', cfg.projectId);
  if (cfg.teamId) u.searchParams.set('teamId', cfg.teamId);
  u.searchParams.set('since', cfg.since);
  u.searchParams.set('until', cfg.until);
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, String(v));
  const res = await fetch(u, { headers: { Authorization: `Bearer ${cfg.token}`, Accept: 'application/json' } });
  const text = await res.text();
  if (!res.ok) throw new Error(`Vercel API ${res.status}: ${text.slice(0, 300)}`);
  const json = JSON.parse(text);
  // Defensive: response envelope may be {data:[…]}, {rows:[…]}, or a bare array.
  return Array.isArray(json) ? json : (json.data ?? json.rows ?? json.results ?? json);
}

// Map an aggregate response to [{key, pageviews, visitors}] regardless of the
// dimension field name Vercel returns.
function mapAgg(rows, dim) {
  if (!Array.isArray(rows)) return [];
  return rows
    .map((r) => ({
      key: r[dim] ?? r.key ?? r.value ?? Object.values(r)[0],
      pageviews: r.pageviews ?? r.total ?? 0,
      visitors: r.visitors ?? 0,
    }))
    .sort((a, b) => b.pageviews - a.pageviews);
}

export async function collect() {
  const cfg = vercelConfig();

  let totals = null;
  try {
    const t = await vercelCall('/visits/count', {}, cfg);
    const row = Array.isArray(t) ? (t[0] ?? {}) : t;
    totals = { pageviews: row.pageviews ?? row.total ?? null, visitors: row.visitors ?? null };
  } catch { /* count is a nicety; keep going if it 4xxs */ }

  const pages = mapAgg(await vercelCall('/visits/aggregate', { by: 'requestPath', limit: 100 }, cfg), 'requestPath');
  const referrers = mapAgg(await vercelCall('/visits/aggregate', { by: 'referrerHostname', limit: 50 }, cfg), 'referrerHostname');
  const countries = mapAgg(await vercelCall('/visits/aggregate', { by: 'country', limit: 50 }, cfg), 'country');

  return { channel: 'vercel', dateRange: { start: cfg.since, end: cfg.until }, totals, pages, referrers, countries };
}

// ---- CLI: node scripts/growth/vercel.mjs (or npm run report:vercel) ----
export async function runCli() {
  console.log('📊 Vercel Web Analytics report');
  try {
    const { dateRange, totals, pages, referrers, countries } = await collect();
    const tot = totals ? ` · ${totals.pageviews} pv / ${totals.visitors} vis` : '';
    console.log(`   ${dateRange.start} → ${dateRange.end}${tot}`);
    saveTmpReport('vercel_pages', pages, pages.map((r) => ({ Path: r.key, Pageviews: r.pageviews, Visitors: r.visitors })), ['Path', 'Pageviews', 'Visitors']);
    saveTmpReport('vercel_referrers', referrers, referrers.map((r) => ({ Referrer: r.key, Pageviews: r.pageviews, Visitors: r.visitors })), ['Referrer', 'Pageviews', 'Visitors']);
    console.log(`   ✅ ${pages.length} pages, ${referrers.length} referrers, ${countries.length} countries → tmp/reports/`);
    referrers.slice(0, 8).forEach((r) => console.log(`      - ${r.key} — ${r.pageviews} pv / ${r.visitors} vis`));
  } catch (e) {
    console.error(`   ❌ ${e.message}`);
    console.error('   Setup: docs/growth-impl.md §13');
    process.exitCode = 1;
  }
}

if (isMain(import.meta.url)) runCli();
