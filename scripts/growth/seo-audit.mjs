// SEO best-practice validator (growth pipeline health check).
//
// Fetches the RAW served HTML of each page and verifies the on-page SEO essentials are
// present, non-empty, and IN <head>: <title>, <meta name="description">, canonical,
// <html lang>, and the Open Graph trio. Zero-dep, fail-soft, matches the collectors.
//
// WHY RAW HTML AND NOT A HEADLESS BROWSER — this is the whole point:
//   The bug that motivated this check (2026-07-15) was Next.js "Streaming Metadata"
//   rendering <title>/<meta description>/og into <body> instead of <head> when a route
//   is dynamic. A rendered browser DOM would HIDE it — React hoists those tags into
//   <head> on hydration — so Lighthouse-in-a-browser and our old `grep` both missed the
//   head-vs-body distinction. The raw HTML is exactly what JS-light crawlers (Bing, AI
//   indexers — major channels for this site) actually see, and it's where the bug shows.
//   So: parse the raw HTML, split on </head>, and assert the tags live BEFORE it.
//
//   node scripts/growth/seo-audit.mjs            # core representative sample (fast)
//   node scripts/growth/seo-audit.mjs --full     # every URL in sitemap.xml
//   npm run growth:seo                            # (exits non-zero if any errors → CI-gateable)

import path from 'node:path';
import { DATA_DIR, writeJsonAtomic, isMain } from './lib.mjs';

const SITE = (process.env.SEO_SITE || 'https://www.markdown.free').replace(/\/$/, '');

// Google SERP truncation guidance — outside these is a WARN (not an error).
const LIMITS = { titleMin: 15, titleMax: 65, descMin: 50, descMax: 165 };

// One page per template, so a site-wide regression is caught by the fast default run:
// home, EN tool pages (PDF/word/png), a content page, locale homepages, a locale sub-page.
const CORE = [
  '/', '/markdown-to-word', '/readme-to-pdf', '/obsidian-markdown-to-pdf',
  '/markdown-to-png', '/about', '/es', '/ja', '/zh-Hans', '/es/markdown-a-word',
];

const attr = (tag, name) => {
  const m = new RegExp(`${name}="([^"]*)"`, 'i').exec(tag || '');
  return m ? m[1] : null;
};
const splitHead = (html) => {
  const i = html.indexOf('</head>');
  return i < 0 ? { head: html, body: '', hasHead: false } : { head: html.slice(0, i), body: html.slice(i), hasHead: true };
};

// Core audit — pure function over raw HTML so it's unit-testable (see the --selftest flag).
export function auditHtml(html) {
  const issues = [];
  const add = (sev, code, msg) => issues.push({ sev, code, msg });
  const { head, body, hasHead } = splitHead(html);
  if (!hasHead) add('error', 'no-head', 'no </head> found in served HTML');

  const htmlTag = /<html[^>]*>/i.exec(html.slice(0, 500));
  if (!attr(htmlTag?.[0], 'lang')) add('error', 'html-lang', 'missing <html lang="…">');

  // <title>
  const titleIn = (s) => /<title[^>]*>([\s\S]*?)<\/title>/i.exec(s);
  const tH = titleIn(head), tB = titleIn(body);
  if (!tH && !tB) add('error', 'title-missing', 'no <title>');
  else if (!tH && tB) add('error', 'title-in-body', '<title> streamed into <body>, not <head>');
  else {
    const t = tH[1].trim();
    if (!t) add('error', 'title-empty', 'empty <title>');
    else if (t.length < LIMITS.titleMin || t.length > LIMITS.titleMax) add('warn', 'title-length', `title ${t.length} chars (aim ${LIMITS.titleMin}–${LIMITS.titleMax})`);
  }

  // <meta name="description"> — the check that would have caught the streaming-metadata bug
  const descRe = /<meta[^>]+name="description"[^>]*>/i;
  const dH = descRe.exec(head), dB = descRe.exec(body);
  if (!dH && !dB) add('error', 'desc-missing', 'no <meta name="description">');
  else if (!dH && dB) add('error', 'desc-in-body', '<meta name="description"> streamed into <body>, not <head> — Lighthouse + JS-light crawlers see none');
  else {
    const c = (attr(dH[0], 'content') || '').trim();
    if (!c) add('error', 'desc-empty', 'empty meta description');
    else if (c.length < LIMITS.descMin || c.length > LIMITS.descMax) add('warn', 'desc-length', `description ${c.length} chars (aim ${LIMITS.descMin}–${LIMITS.descMax})`);
  }

  // canonical
  const canonRe = /<link[^>]+rel="canonical"[^>]*>/i;
  if (!canonRe.test(head)) add(canonRe.test(body) ? 'error' : 'warn', 'canonical', canonRe.test(body) ? 'canonical link in <body>, not <head>' : 'missing canonical link');

  // Open Graph trio
  for (const p of ['og:title', 'og:description', 'og:image']) {
    const re = new RegExp(`property="${p}"`, 'i');
    if (!re.test(head) && !re.test(body)) add('warn', 'og-missing', `missing ${p}`);
    else if (!re.test(head) && re.test(body)) add('warn', 'og-in-body', `${p} in <body>, not <head>`);
  }

  // robots noindex — informational (may be an intentional draft/scaffold)
  const robots = /<meta[^>]+name="robots"[^>]*>/i.exec(head + body);
  if (robots && /noindex/i.test(robots[0])) add('info', 'noindex', 'page is noindex');

  return issues;
}

async function fetchHtml(url) {
  const r = await fetch(url, { headers: { 'User-Agent': 'markdown-free-seo-audit/1.0' }, signal: AbortSignal.timeout(15000) });
  return { status: r.status, html: r.status === 200 ? await r.text() : '' };
}

async function sitemapPaths() {
  try {
    const r = await fetch(`${SITE}/sitemap.xml`, { signal: AbortSignal.timeout(15000) });
    if (!r.ok) return [];
    const xml = await r.text();
    return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
      .map((m) => m[1].replace(SITE, '') || '/')
      .filter((p) => !/\.(xml|txt|png|jpg|svg|ico)$/i.test(p));
  } catch { return []; }
}

// Small concurrency pool so a --full run over the sitemap stays polite + fast.
async function mapPool(items, n, fn) {
  const out = []; const q = items.map((it, i) => [it, i]);
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => {
    while (q.length) { const [it, i] = q.shift(); out[i] = await fn(it); }
  }));
  return out;
}

export async function runSeoAudit({ full = false, write = true } = {}) {
  const paths = full ? (await sitemapPaths()).slice(0, 200) : CORE;
  const list = paths.length ? paths : CORE;
  const results = await mapPool(list, 6, async (p) => {
    const url = `${SITE}${p}`;
    try {
      const { status, html } = await fetchHtml(url);
      if (status !== 200) return { path: p, status, issues: [{ sev: 'error', code: 'http', msg: `HTTP ${status}` }] };
      return { path: p, status, issues: auditHtml(html) };
    } catch (e) {
      return { path: p, status: 0, issues: [{ sev: 'error', code: 'fetch', msg: String(e?.message || e) }] };
    }
  });
  const flat = results.flatMap((r) => r.issues.map((i) => ({ path: r.path, ...i })));
  const summary = {
    site: SITE, checked: results.length, scope: full ? 'full' : 'core',
    errors: flat.filter((i) => i.sev === 'error'),
    warns: flat.filter((i) => i.sev === 'warn'),
    infos: flat.filter((i) => i.sev === 'info'),
    results,
  };
  summary.ok = summary.errors.length === 0;
  if (write) writeJsonAtomic(path.join(DATA_DIR(), 'seo-audit.json'), {
    generatedAt: new Date().toISOString(), site: SITE, scope: summary.scope, checked: summary.checked,
    ok: summary.ok, errors: summary.errors, warns: summary.warns, infos: summary.infos,
  });
  return summary;
}

// Self-test: prove the head-vs-body detection actually fires (no network needed).
function selftest() {
  const good = '<html lang="en"><head><title>A good, descriptive page title here</title><meta name="description" content="'
    + 'x'.repeat(120) + '"><link rel="canonical" href="/"><meta property="og:title" content="t"><meta property="og:description" content="d"><meta property="og:image" content="/o.png"></head><body>hi</body></html>';
  const streamed = '<html lang="en"><head><meta charset="utf-8"></head><body><title>Streamed title in body</title><meta name="description" content="'
    + 'x'.repeat(120) + '"></body></html>';
  const g = auditHtml(good), s = auditHtml(streamed);
  const gErr = g.filter((i) => i.sev === 'error');
  const sCodes = s.map((i) => i.code);
  const pass = gErr.length === 0 && sCodes.includes('desc-in-body') && sCodes.includes('title-in-body');
  console.log(`selftest: good page → ${gErr.length} errors (expect 0); streamed page flags → ${sCodes.filter((c) => c.endsWith('-in-body')).join(', ')}`);
  console.log(pass ? '✅ selftest PASS' : '❌ selftest FAIL');
  process.exit(pass ? 0 : 1);
}

function print(s) {
  const icon = { error: '❌', warn: '⚠️ ', info: 'ℹ️ ' };
  console.log(`🔎 SEO audit — ${s.site} · ${s.checked} pages (${s.scope}) · ${s.errors.length} errors · ${s.warns.length} warnings\n`);
  for (const r of s.results) {
    if (!r.issues.length) { console.log(`  ✅ ${r.path}`); continue; }
    console.log(`  ${r.issues.some((i) => i.sev === 'error') ? '❌' : '⚠️ '} ${r.path}`);
    for (const i of r.issues) console.log(`       ${icon[i.sev]} [${i.code}] ${i.msg}`);
  }
  console.log(`\n${s.ok ? '✅ no SEO errors' : `❌ ${s.errors.length} SEO error(s) — see above`}`);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--selftest')) return selftest();
  const s = await runSeoAudit({ full: args.includes('--full') });
  print(s);
  process.exit(s.ok ? 0 : 1); // non-zero on errors → usable as a CI / pre-deploy gate
}

if (isMain(import.meta.url)) main();
