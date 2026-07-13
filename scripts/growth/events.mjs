// Conversion-events collector (growth-impl.md §6.5) — the moat-visibility signal.
//
// Reads the app's EXISTING Vercel custom events (src/lib/analytics.ts): convert_success,
// upload_start, locale_conversion. No new instrumentation.
//
// VERCEL EVENTS API — what it can and can't do (confirmed against the live API):
//   • CAN count a specific event:            filter=`eventName eq 'convert_success'`
//   • CAN group an event by a FIXED dim:     by ∈ {requestPath, country, deviceType, …}
//   • CANNOT group by a CUSTOM property:     `by=format` / `by=locale` are rejected
//
// So we recover the moat dimension (CJK vs Latin) from `requestPath` — the locale is
// in the path (/zh-Hans, /ja, …). The one thing still missing is conversions by TYPE
// (pdf/docx/png), which is a custom property → needs the first-party /api/ev sink to
// break out (growth-impl.md §18 #2). Everything else works today.

import { isMain } from './lib.mjs';
import { vercelConfig, vercelCall } from './vercel.mjs';

const LOCALES = new Set(['it', 'es', 'ja', 'ko', 'zh-Hans', 'zh-Hant', 'id', 'vi', 'hi']);
const CJK = new Set(['ja', 'ko', 'zh-Hans', 'zh-Hant', 'zh']);
const pathToLocale = (p) => { const seg = (p || '/').split('/').filter(Boolean)[0]; return LOCALES.has(seg) ? seg : 'en'; };
const scriptOf = (locale) => (CJK.has(locale) ? 'cjk' : 'latin');
const nameFilter = (name) => `eventName eq '${name}'`;

async function eventCount(name, cfg) {
  const r = await vercelCall('/events/count', { filter: nameFilter(name) }, cfg);
  const row = Array.isArray(r) ? (r[0] ?? {}) : r;
  return { count: row.count ?? 0, visitors: row.visitors ?? 0 };
}

async function eventBy(name, dim, cfg) {
  const rows = await vercelCall('/events/aggregate', { by: dim, filter: nameFilter(name), limit: 100 }, cfg);
  return Array.isArray(rows) ? rows.map((r) => ({ key: r[dim], count: r.count ?? 0, visitors: r.visitors ?? 0 })) : [];
}

export async function collect() {
  const cfg = vercelConfig();

  // Probe (also confirms events are available on this tier).
  let cs;
  try {
    cs = await eventCount('convert_success', cfg);
  } catch (e) {
    throw new Error(`Vercel events API: ${e.message.slice(0, 140)}`);
  }
  const us = await eventCount('upload_start', cfg).catch(() => ({ count: 0, visitors: 0 }));

  // Conversions by page → fold to locale → script (the moat).
  const byPath = await eventBy('convert_success', 'requestPath', cfg);
  const localeTotals = {};
  const scriptTotals = { cjk: 0, latin: 0 };
  for (const r of byPath) {
    const loc = pathToLocale(r.key);
    localeTotals[loc] = (localeTotals[loc] || 0) + r.count;
    scriptTotals[scriptOf(loc)] += r.count;
  }
  const byLocale = Object.entries(localeTotals).map(([key, count]) => ({ key, count })).sort((a, b) => b.count - a.count);
  const byScript = Object.entries(scriptTotals).map(([key, count]) => ({ key, count }));
  const byCountry = (await eventBy('convert_success', 'country', cfg).catch(() => [])).sort((a, b) => b.count - a.count);

  // by-type: per-format events (conv_<format>) — Vercel groups by eventName (not by custom
  // props), so these ARE queryable once src/lib/analytics.ts's conv_<format> event deploys + accrues.
  let byType = [];
  try {
    const rows = await vercelCall('/events/aggregate', { by: 'eventName', limit: 100 }, cfg);
    byType = (Array.isArray(rows) ? rows : [])
      .filter((r) => String(r.eventName || '').startsWith('conv_'))
      .map((r) => ({ key: String(r.eventName).slice(5), count: r.count ?? 0 }))
      .sort((a, b) => b.count - a.count);
  } catch { /* not available until the per-format events deploy */ }

  const funnel = {
    upload_start: us.count,
    convert_success: cs.count,
    abandonment: us.count ? +(1 - cs.count / us.count).toFixed(3) : null,
  };

  return {
    channel: 'events',
    dateRange: { start: cfg.since, end: cfg.until },
    totals: { conversions: cs.count, uploadStarts: us.count, visitors: cs.visitors },
    funnel, byLocale, byScript, byCountry, byType,
    note: 'by-type from conv_<format> events (deploy-gated — empty until analytics.ts ships); by-script from requestPath locale prefix.',
  };
}

export async function runCli() {
  console.log('📊 Conversion events (Vercel custom events)');
  try {
    const { totals, funnel, byScript, byLocale, byCountry, byType } = await collect();
    console.log(`   conversions ${totals.conversions} · upload_start ${funnel.upload_start} · abandonment ${funnel.abandonment ?? 'n/a'}`);
    console.log(`   by script:  ${byScript.map((r) => `${r.key}=${r.count}`).join(' · ') || '(none)'}`);
    console.log(`   by locale:  ${byLocale.slice(0, 8).map((r) => `${r.key}=${r.count}`).join(' · ') || '(none)'}`);
    console.log(`   by country: ${byCountry.slice(0, 8).map((r) => `${r.key}=${r.count}`).join(' · ') || '(none)'}`);
    console.log(`   by type:    ${byType.map((r) => `${r.key}=${r.count}`).join(' · ') || '(none yet — deploys with the conv_<format> events)'}`);
  } catch (e) {
    console.error(`   ❌ ${e.message}`);
    process.exitCode = 1;
  }
}

if (isMain(import.meta.url)) runCli();
