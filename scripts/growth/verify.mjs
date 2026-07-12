// Channel health-check / spot-check (growth-impl.md §16 observability).
//
// Validates the latest committed snapshot: every signal channel is present, non-empty,
// well-formed, and internally consistent. Prints a per-channel report and exits non-zero
// if any channel FAILs — so it doubles as a CI/scheduled guard against silent breakage.
//
//   node scripts/growth/verify.mjs      (or: npm run growth:verify)

import { SnapshotStore, isMain } from './lib.mjs';
import { ExperimentLedger } from './ledger.mjs';

const isNum = (v) => typeof v === 'number' && Number.isFinite(v);
const sample = (rows, n = 3) => rows.slice(0, n);

// Validate a normalized SEARCH channel (bing/gsc/baidu).
function checkSearch(ch, { needTraffic = false } = {}) {
  const fail = [], warn = [], info = {};
  for (const kind of ['queries', 'pages']) {
    const rows = ch[kind];
    if (!Array.isArray(rows)) { fail.push(`${kind}: missing/not-array`); continue; }
    info[kind] = rows.length;
    if (rows.length === 0) { warn.push(`${kind}: empty`); continue; }
    let badKey = 0, badCtr = 0, badPos = 0;
    for (const r of rows) {
      if (!r.key || typeof r.key !== 'string') badKey++;
      if (!isNum(r.ctr) || r.ctr < 0 || r.ctr > 100) badCtr++;
      if (r.position != null && (!isNum(r.position) || r.position <= 0)) badPos++;
    }
    if (badKey) fail.push(`${kind}: ${badKey} rows with bad key`);
    if (badCtr) warn.push(`${kind}: ${badCtr} rows with ctr out of [0,100]`);
    if (badPos) warn.push(`${kind}: ${badPos} rows with non-positive position`);
  }
  if (needTraffic) {
    const t = ch.traffic;
    if (!Array.isArray(t) || !t.length) warn.push('traffic: empty');
    else {
      info.trafficDays = t.length;
      const badDate = t.filter((r) => !/^\d{4}-\d{2}-\d{2}$/.test(String(r.date))).length;
      if (badDate) warn.push(`traffic: ${badDate} rows with bad date`);
    }
  }
  return { fail, warn, info };
}

function checkVercel(ch) {
  const fail = [], warn = [], info = {};
  for (const kind of ['pages', 'referrers', 'countries']) {
    const rows = ch[kind];
    if (!Array.isArray(rows)) { fail.push(`${kind}: missing`); continue; }
    info[kind] = rows.length;
    if (!rows.length) warn.push(`${kind}: empty`);
    else {
      // key === '' is valid (empty referrerHostname = direct traffic); only null/undefined is bad.
      const bad = rows.filter((r) => r.key == null || !isNum(r.pageviews) || !isNum(r.visitors)).length;
      if (bad) fail.push(`${kind}: ${bad} malformed rows`);
    }
  }
  if (ch.totals) info.totals = `${ch.totals.pageviews}pv/${ch.totals.visitors}vis`;
  return { fail, warn, info };
}

function checkEvents(ch) {
  const fail = [], warn = [], info = {};
  const conv = ch.totals?.conversions;
  if (!isNum(conv) || conv <= 0) fail.push('totals.conversions missing/zero');
  info.conversions = conv;
  const f = ch.funnel || {};
  info.funnel = `${f.upload_start}→${f.convert_success} (abandon ${f.abandonment})`;
  if (isNum(f.abandonment) && (f.abandonment < 0 || f.abandonment > 1)) fail.push('funnel.abandonment out of [0,1]');
  if (isNum(f.upload_start) && isNum(f.convert_success) && f.convert_success > f.upload_start)
    warn.push('convert_success > upload_start (some conversions had no tracked upload_start)');
  // byScript should cover most conversions (path-derived; some paths may fall outside)
  const scriptSum = (ch.byScript || []).reduce((s, r) => s + (r.count || 0), 0);
  info.byScript = (ch.byScript || []).map((r) => `${r.key}=${r.count}`).join('/');
  if (!scriptSum) fail.push('byScript empty — moat dimension not derived');
  else if (isNum(conv) && scriptSum < conv * 0.5) warn.push(`byScript covers only ${scriptSum}/${conv} conversions`);
  info.byLocale = (ch.byLocale || []).length;
  info.byCountry = (ch.byCountry || []).length;
  if (!(ch.byCountry || []).length) warn.push('byCountry empty');
  return { fail, warn, info };
}

function checkReferral(ch) {
  const fail = [], warn = [], info = {};
  const groups = ch.groups || [], hosts = ch.hosts || [];
  if (!hosts.length) { fail.push('no referrer hosts'); return { fail, warn, info }; }
  info.groups = groups.map((g) => `${g.group}=${g.sessions}`).join('/');
  info.hosts = hosts.length;
  const gSum = groups.reduce((s, g) => s + (g.sessions || 0), 0);
  const hSum = hosts.reduce((s, h) => s + (h.sessions || 0), 0);
  if (gSum !== hSum) warn.push(`group/host session sums differ (${gSum} vs ${hSum})`);
  const unclassified = hosts.filter((h) => h.group === 'other').slice(0, 5).map((h) => h.host);
  if (unclassified.length) info.unclassified = unclassified.join(', ');
  return { fail, warn, info };
}

const CHECKS = {
  bing: (ch) => checkSearch(ch, { needTraffic: true }),
  gsc: (ch) => checkSearch(ch),
  baidu: (ch) => checkSearch(ch),
  vercel: checkVercel,
  events: checkEvents,
  referral: checkReferral,
};

export function verify() {
  const snap = SnapshotStore.latest();
  if (!snap) { console.error('✗ no snapshot found — run `npm run growth:snapshot`'); return 1; }

  console.log(`🔍 Channel spot-check — snapshot ${snap.date} (${snap.meta?.health?.runMs ?? '?'}ms)`);
  console.log(`   context: season=${snap.context?.season ?? 'none'} · algoUpdates=${snap.context?.algoUpdates?.length ?? 0}`);
  console.log('');

  let hardFail = 0;
  const present = Object.keys(snap.channels);
  for (const name of present) {
    const check = CHECKS[name];
    const res = check ? check(snap.channels[name]) : { fail: [], warn: [`no validator for '${name}'`], info: {} };
    const mark = res.fail.length ? '✗' : (res.warn.length ? '⚠' : '✓');
    hardFail += res.fail.length ? 1 : 0;
    const infoStr = Object.entries(res.info).map(([k, v]) => `${k}=${v}`).join(' · ');
    console.log(`${mark} ${name.padEnd(9)} ${infoStr}`);
    res.fail.forEach((m) => console.log(`     ✗ ${m}`));
    res.warn.forEach((m) => console.log(`     ⚠ ${m}`));
  }

  // Channels that errored (skipped) this run
  const skipped = Object.keys(snap.errors || {});
  if (skipped.length) {
    console.log('');
    skipped.forEach((n) => console.log(`· ${n.padEnd(9)} skipped — ${snap.errors[n].slice(0, 80)}`));
  }

  // Ledger consistency (§16)
  console.log('');
  const all = ExperimentLedger.all();
  const due = ExperimentLedger.due();
  const unscored = due.filter((e) => e.status === 'shipped' || e.status === 'measuring');
  console.log(`📒 ledger: ${all.length} experiments · ${due.length} due · ${unscored.length} due-but-unscored`);
  if (unscored.length) console.log('     ⚠ run `npm run growth:measure` to score due experiments');

  console.log('');
  console.log(hardFail ? `✗ ${hardFail} channel(s) FAILED` : `✓ all ${present.length} present channels healthy`);
  return hardFail ? 1 : 0;
}

if (isMain(import.meta.url)) process.exit(verify());
