// Shared storage + helpers for the growth loop (growth-impl.md §6.1, §7.4, §17).
//
// No external deps, hand-rolled .env loader, raw fetch — matches the existing
// scripts/ conventions. All committed-state writes go through writeJsonAtomic
// (write temp → rename) so a crash never leaves half-written JSON (§17).
//
// Normalized SEARCH row (Bing/GSC/Baidu): { key, clicks, impressions, ctr, position }
//   ctr = percentage number (3.53); position = 1-based average or null.

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// ---------------------------------------------------------------------------
// env + dates
// ---------------------------------------------------------------------------
export function loadEnv() {
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
    if (!line || line.startsWith('#')) continue;
    const [key, ...rest] = line.split('=');
    if (key && rest.length && !process.env[key.trim()]) {
      process.env[key.trim()] = rest.join('=').trim();
    }
  }
}

export const todayStr = () => new Date().toISOString().slice(0, 10);
export const ymd = (d) => d.toISOString().slice(0, 10);
export const daysAgo = (n) => { const d = new Date(); d.setUTCDate(d.getUTCDate() - n); return d; };
export const daysBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000);

// ---------------------------------------------------------------------------
// number + row helpers
// ---------------------------------------------------------------------------
// CTR is definitionally ≤100%; clamp to absorb source quirks (Bing weekly buckets
// occasionally report clicks > impressions across the aggregation window).
export const pctNum = (clicks, impr) => (impr ? +Math.min(100, (clicks / impr) * 100).toFixed(2) : 0);
export const sortRows = (rows) =>
  [...rows].sort((a, b) => b.clicks - a.clicks || b.impressions - a.impressions);

export function toCSV(data, columns) {
  if (!data || data.length === 0) return '';
  const cols = columns || Object.keys(data[0]);
  const esc = (v) => {
    if (v === null || v === undefined) return '';
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [cols.join(','), ...data.map((r) => cols.map((c) => esc(r[c])).join(','))].join('\n');
}

// ---------------------------------------------------------------------------
// paths
// ---------------------------------------------------------------------------
export const DATA_DIR = () => path.join(process.cwd(), 'data');
export const SNAP_DIR = () => path.join(DATA_DIR(), 'snapshots');
const TMP_DIR = () => path.join(process.cwd(), 'tmp', 'reports');
export const ensureDir = (dir) => fs.mkdirSync(dir, { recursive: true });

// ---------------------------------------------------------------------------
// atomic JSON store (§17: never leave state half-written)
// ---------------------------------------------------------------------------
export function writeJsonAtomic(file, obj) {
  ensureDir(path.dirname(file));
  const tmp = `${file}.tmp-${process.pid}`;
  fs.writeFileSync(tmp, JSON.stringify(obj, null, 2) + '\n');
  fs.renameSync(tmp, file); // rename is atomic on the same filesystem
}

export function readJson(file, fallback = null) {
  if (!fs.existsSync(file)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch (e) {
    // Corrupt/unreadable state must never be silently overwritten (§17). Surface it.
    throw new Error(`Corrupt JSON at ${file}: ${e.message}. Restore with: git show HEAD:${path.relative(process.cwd(), file)}`);
  }
}

// ---------------------------------------------------------------------------
// SnapshotStore (§7.4) — the only place snapshots are read/written
// ---------------------------------------------------------------------------
export const SnapshotStore = {
  write(snapshot) {
    ensureDir(SNAP_DIR());
    const file = path.join(SNAP_DIR(), `${snapshot.date}.json`);
    writeJsonAtomic(file, snapshot);
    return file;
  },
  // "latest" is derived from the newest dated file — no duplicate blob to churn.
  latest() { return this.recent(1)[0] ?? null; },
  at(date) { return readJson(path.join(SNAP_DIR(), `${date}.json`), null); },
  // Most recent `n` snapshots (newest first), by filename date.
  recent(n = 2) {
    const dir = SNAP_DIR();
    if (!fs.existsSync(dir)) return [];
    const files = fs.readdirSync(dir)
      .filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
      .sort()
      .reverse()
      .slice(0, n);
    return files.map((f) => readJson(path.join(dir, f)));
  },
};

// ---------------------------------------------------------------------------
// tmp report writer (human-glanceable output for standalone collectors)
// ---------------------------------------------------------------------------
export function saveTmpReport(name, rawData, csvRows, csvColumns) {
  ensureDir(TMP_DIR());
  const ts = todayStr();
  fs.writeFileSync(path.join(TMP_DIR(), `${name}_${ts}.json`), JSON.stringify(rawData, null, 2));
  if (csvRows && csvRows.length) {
    fs.writeFileSync(path.join(TMP_DIR(), `${name}_${ts}.csv`), toCSV(csvRows, csvColumns));
  }
}

// True when the module at `metaUrl` is being run directly as a CLI.
export const isMain = (metaUrl) =>
  !!process.argv[1] && metaUrl === pathToFileURL(process.argv[1]).href;

// ---------------------------------------------------------------------------
// intent-cluster + locale helpers (shared by the P3+ intelligence layer)
// A "topic" is the intent cluster (word/pdf/epub/image/readme/comparison) — the
// knowledge-graph key, so learnings transfer across locales & specific pages.
// ---------------------------------------------------------------------------
const CLUSTERS = [
  ['image', /png|jpe?g|image|图片|长图|imagen|immagine|画像|gambar/],
  ['epub', /epub/],
  ['comparison', /\bbest\b|\bvs\b|compare|converter-2026|alternative/],
  ['readme', /readme/],
  ['word', /word|docx|ke-word|a-word|in-word|sang-word|henkan|byeonhwan|zhuanhuan-word|word-zhuanhuan|转word|轉word/],
  ['pdf', /pdf/],
];
export function topicOf(s) {
  const t = String(s || '').toLowerCase();
  for (const [name, re] of CLUSTERS) if (re.test(t)) return name;
  return 'other';
}

const _LOCALES = new Set(['it', 'es', 'ja', 'ko', 'zh-Hans', 'zh-Hant', 'id', 'vi', 'hi']);
export function localeOfPath(p) {
  let seg;
  try { seg = new URL(p, 'https://x').pathname.split('/').filter(Boolean)[0]; }
  catch { seg = String(p || '/').split('/').filter(Boolean)[0]; }
  return _LOCALES.has(seg) ? seg : 'en';
}
export const isCJKLocale = (loc) => ['ja', 'ko', 'zh-Hans', 'zh-Hant', 'zh'].includes(loc);

// clamp helper
export const clamp01 = (x) => Math.max(0, Math.min(1, x));
