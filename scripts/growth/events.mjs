// Conversion-events collector (growth-impl.md §6.5) — the moat-visibility signal.
//
// The app ALREADY fires these Vercel custom events (src/lib/analytics.ts), so this
// is a readable sink, not new instrumentation:
//   • convert_success  { format, source }   → conversions by TYPE
//   • locale_conversion { locale, format }   → conversions by locale → SCRIPT (CJK vs Latin)
//   • upload_start     { source }            → funnel top (abandonment vs convert_success)
//
// Reuses vercel.mjs auth. If the Vercel plan tier does NOT expose custom events to
// the query API, this channel throws a clear message → build the first-party /api/ev
// sink instead (docs/growth-impl.md §18 open-question #2). Snapshot tolerates the skip.
//
// NOTE: the exact events-API param names (filter/by) are best-effort from the visits
// API and should be confirmed on the first run with a real token.

import { isMain } from './lib.mjs';
import { vercelConfig, vercelCall } from './vercel.mjs';

// Locales that render CJK (the moat). Everything else → 'latin' (non-CJK).
const CJK_LOCALES = new Set(['ja', 'ko', 'zh-Hans', 'zh-Hant', 'zh']);
const scriptOf = (locale) => (CJK_LOCALES.has(locale) ? 'cjk' : 'latin');

const nameFilter = (name) => `name eq '${name}'`;

async function eventsCount(name, cfg) {
  const r = await vercelCall('/events/count', { filter: nameFilter(name) }, cfg);
  const row = Array.isArray(r) ? (r[0] ?? {}) : r;
  return row.count ?? row.total ?? 0;
}

async function eventsAgg(name, byProp, cfg) {
  const rows = await vercelCall('/events/aggregate', { by: byProp, filter: nameFilter(name), limit: 100 }, cfg);
  if (!Array.isArray(rows)) return [];
  return rows.map((r) => ({
    key: r[byProp] ?? r.key ?? r.value ?? Object.values(r)[0],
    count: r.count ?? r.total ?? 0,
    visitors: r.visitors ?? 0,
  }));
}

export async function collect() {
  const cfg = vercelConfig();

  // Probe first: if the tier doesn't expose events, fail with an actionable message.
  let uploadStarts;
  try {
    uploadStarts = await eventsCount('upload_start', cfg);
  } catch (e) {
    throw new Error(
      `Vercel events API unavailable (${e.message.slice(0, 80)}). ` +
      `If the plan tier lacks custom-event queries, build the first-party /api/ev sink (growth-impl.md §18 #2).`
    );
  }

  const byType = await eventsAgg('convert_success', 'format', cfg);       // conversions by pdf/docx/png/…
  const byLocale = await eventsAgg('locale_conversion', 'locale', cfg);    // conversions by locale

  // Fold locale → script (CJK vs Latin) — makes the moat visible.
  const scriptTotals = { cjk: 0, latin: 0 };
  for (const r of byLocale) scriptTotals[scriptOf(r.key)] += r.count || 0;
  const byScript = Object.entries(scriptTotals).map(([script, count]) => ({ key: script, count }));

  const conversions = byType.reduce((s, r) => s + (r.count || 0), 0);
  const funnel = {
    upload_start: uploadStarts,
    convert_success: conversions,
    abandonment: uploadStarts ? +(1 - conversions / uploadStarts).toFixed(3) : null,
  };

  return { channel: 'events', dateRange: { start: cfg.since, end: cfg.until }, byType, byScript, byLocale, funnel };
}

export async function runCli() {
  console.log('📊 Conversion events (Vercel custom events)');
  try {
    const { byType, byScript, funnel } = await collect();
    console.log(`   conversions: ${funnel.convert_success} · upload_start: ${funnel.upload_start} · abandonment: ${funnel.abandonment ?? 'n/a'}`);
    console.log(`   by type:   ${byType.map((r) => `${r.key}=${r.count}`).join(' · ') || '(none)'}`);
    console.log(`   by script: ${byScript.map((r) => `${r.key}=${r.count}`).join(' · ') || '(none)'}`);
  } catch (e) {
    console.error(`   ❌ ${e.message}`);
    process.exitCode = 1;
  }
}

if (isMain(import.meta.url)) runCli();
