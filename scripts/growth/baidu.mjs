// Baidu collector (growth-impl.md §6.7) — the CN market directly (Bing is a proxy).
//
// Baidu 搜索资源平台's API is China-gated, so this starts as a manual CSV drop — the
// same Phase-0 bootstrap as GSC. Export the performance CSV from 百度搜索资源平台 and
// point BAIDU_CSV at it (or drop it at data/drops/baidu.csv).
//
// Treat the first drops as a COVERAGE PROBE: a non-ICP / non-CN-hosted site may index
// thinly on Baidu — the data answers "is this even worth automating."
//
// Env: BAIDU_CSV=/path/to/export.csv   (default: data/drops/baidu.csv)

import fs from 'node:fs';
import path from 'node:path';
import { DATA_DIR, pctNum, sortRows, saveTmpReport, isMain } from './lib.mjs';

// Baidu column headers vary (and are often Chinese). Map the common ones flexibly.
const COLS = {
  key: ['query', 'keyword', '关键词', '搜索词', 'page', 'url', '页面'],
  clicks: ['clicks', 'click', '点击', '点击量', '点击数'],
  impressions: ['impressions', 'impression', '展现', '展现量', '展示量'],
  position: ['position', 'rank', 'avgrank', '排名', '平均排名'],
};

const pick = (headers, names) => {
  const lower = headers.map((h) => h.trim().toLowerCase());
  for (const n of names) { const i = lower.indexOf(n.toLowerCase()); if (i >= 0) return i; }
  return -1;
};

// Minimal CSV parse (handles quoted fields + commas).
function parseCsv(text) {
  const rows = [];
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const cells = []; let cur = '', q = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (q) { if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; } else if (c === '"') q = false; else cur += c; }
      else if (c === '"') q = true;
      else if (c === ',') { cells.push(cur); cur = ''; }
      else cur += c;
    }
    cells.push(cur);
    rows.push(cells);
  }
  return rows;
}

export async function collect() {
  const file = process.env.BAIDU_CSV || path.join(DATA_DIR(), 'drops', 'baidu.csv');
  if (!fs.existsSync(file)) {
    throw new Error(`Baidu CSV not found at ${file}. Export from 百度搜索资源平台 → set BAIDU_CSV (§13).`);
  }
  const rows = parseCsv(fs.readFileSync(file, 'utf-8'));
  if (rows.length < 2) throw new Error('Baidu CSV appears empty');
  const headers = rows[0];
  const iKey = pick(headers, COLS.key);
  const iClk = pick(headers, COLS.clicks);
  const iImp = pick(headers, COLS.impressions);
  const iPos = pick(headers, COLS.position);
  if (iKey < 0) throw new Error(`Baidu CSV: no recognizable key column in [${headers.join(', ')}]`);

  const num = (v) => { const n = parseFloat(String(v).replace(/[,%]/g, '')); return Number.isFinite(n) ? n : 0; };
  const queries = sortRows(rows.slice(1).filter((r) => r[iKey]).map((r) => {
    const clicks = iClk >= 0 ? num(r[iClk]) : 0;
    const impressions = iImp >= 0 ? num(r[iImp]) : 0;
    return {
      key: r[iKey].trim(), clicks, impressions,
      ctr: pctNum(clicks, impressions),
      position: iPos >= 0 ? num(r[iPos]) || null : null,
    };
  }));

  return { channel: 'baidu', source: file, dateRange: null, queries, pages: [] };
}

export async function runCli() {
  console.log('📊 Baidu (CSV ingest)');
  try {
    const { source, queries } = await collect();
    saveTmpReport('baidu_queries', queries,
      queries.map((r) => ({ Query: r.key, Clicks: r.clicks, Impressions: r.impressions, CTR: `${r.ctr}%`, Position: r.position ?? '' })),
      ['Query', 'Clicks', 'Impressions', 'CTR', 'Position']);
    console.log(`   ✅ ${queries.length} rows from ${source} → tmp/reports/`);
    queries.slice(0, 8).forEach((r) => console.log(`      - ${r.key} — ${r.clicks} clk / ${r.impressions} imp · pos ${r.position}`));
  } catch (e) {
    console.error(`   ❌ ${e.message}`);
    process.exitCode = 1;
  }
}

if (isMain(import.meta.url)) runCli();
