/**
 * Usage signals: how heavily this browser uses Markdown Free, measured in the
 * browser and sent to analytics only as broad ranges. They find the few
 * visitors likely to pay for advanced features without asking everyone.
 *
 * Stored in localStorage and never sent as is:
 * - the time and format of each conversion in the last 30 days;
 * - when this browser first converted anything;
 * - a short fingerprint of each document converted in the last 30 days (a hash
 *   of the file name, or of the pasted text), so a later conversion of the same
 *   document can be recognised. The name and the text never leave the device.
 *
 * Sent: the ranges built by the bucket functions below, on two events —
 * `usage_profile` once per browser per day and `doc_profile` once per document
 * per tab (src/lib/analytics.ts).
 */

import { TEASER_FIRST_AT_KEY, TEASER_SHOWN_AT_KEY } from "./feature-teaser";

export const USAGE_LOG_KEY = "mdfree:usage-log";
export const USAGE_FIRST_AT_KEY = "mdfree:usage-first-at";
export const USAGE_PROFILE_DAY_KEY = "mdfree:usage-profile-day";
export const DOCS_SEEN_KEY = "mdfree:docs-seen";
/** sessionStorage: the documents converted in this tab. */
export const SESSION_DOCS_KEY = "mdfree:session-docs";

const DAY_MS = 24 * 60 * 60 * 1000;
export const USAGE_WINDOW_MS = 30 * DAY_MS;
const MAX_LOG_ENTRIES = 500;
const MAX_DOCS_SEEN = 200;
const MAX_SESSION_DOCS = 50;

/**
 * A heavy user converts at least this often within 30 days, on at least this
 * many different days. The day rule keeps one long session from counting.
 */
export const HEAVY_MIN_CONVERSIONS = 3;
export const HEAVY_MIN_DAYS = 2;

/** One conversion: when, and which format. */
type LogEntry = [number, string];

export type UsageProfile = {
  uses: string;
  days: string;
  formats: string;
  since: string;
  when: string;
};

export type DocProfile = {
  source: string;
  size: string;
  images: string;
  again: string;
  docs: string;
};

/** What the export row knows about the document it just converted. */
export type ConvertedDocument = {
  source: "file" | "paste" | "sample";
  filename: string | null;
  content: string;
  size: number;
};

// ---------------------------------------------------------------------------
// Ranges. Each boundary is chosen for a question: HEAVY_MIN_CONVERSIONS falls
// on a boundary of `uses`, 20 images and 1 MB are limits in the paid-plan draft.
// ---------------------------------------------------------------------------

export function usesBucket(n: number): string {
  if (n <= 0) return "0";
  if (n === 1) return "1";
  if (n === 2) return "2";
  if (n <= 4) return "3-4";
  if (n <= 9) return "5-9";
  return "10+";
}

export function daysBucket(n: number): string {
  if (n <= 0) return "0";
  if (n === 1) return "1";
  if (n <= 3) return "2-3";
  if (n <= 7) return "4-7";
  return "8+";
}

export function formatsBucket(n: number): string {
  if (n <= 0) return "0";
  if (n === 1) return "1";
  if (n === 2) return "2";
  return "3+";
}

export function sinceBucket(firstAt: number, now: number): string {
  if (localDay(firstAt) === localDay(now)) return "today";
  const days = (now - firstAt) / DAY_MS;
  if (days < 7) return "1-6d";
  if (days < 30) return "7-29d";
  return "30d+";
}

/** Weekday office hours, the rest of the week, or the weekend (local time). */
export function whenBucket(now: number): string {
  const date = new Date(now);
  const day = date.getDay();
  if (day === 0 || day === 6) return "weekend";
  const hour = date.getHours();
  return hour >= 8 && hour < 18 ? "work_hours" : "off_hours";
}

export function sizeBucket(bytes: number): string {
  const KB = 1024;
  const MB = 1024 * KB;
  if (bytes < 10 * KB) return "0-10kb";
  if (bytes < 100 * KB) return "10-100kb";
  if (bytes < 500 * KB) return "100-500kb";
  if (bytes <= MB) return "500kb-1mb";
  if (bytes <= 2 * MB) return "1-2mb";
  if (bytes <= 5 * MB) return "2-5mb";
  return "5mb+";
}

export function imagesBucket(n: number): string {
  if (n <= 0) return "0";
  if (n <= 20) return "1-20";
  return "21+";
}

/** Markdown images (inline and reference style) plus HTML <img> tags. */
export function countImages(markdown: string): number {
  const inline = markdown.match(/!\[[^\]]*\]\([^)]*\)/g)?.length ?? 0;
  const reference = markdown.match(/!\[[^\]]*\]\[[^\]]*\]/g)?.length ?? 0;
  const html = markdown.match(/<img\b/gi)?.length ?? 0;
  return inline + reference + html;
}

// ---------------------------------------------------------------------------
// Storage
// ---------------------------------------------------------------------------

function localDay(time: number): string {
  const d = new Date(time);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function readJson<T>(storage: Storage, key: string, fallback: T): T {
  try {
    const raw = storage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function readTime(key: string): number {
  return parseInt(localStorage.getItem(key) ?? "0", 10) || 0;
}

/** The conversions of the last 30 days, oldest first. */
function readLog(now: number): LogEntry[] {
  const log = readJson<LogEntry[]>(localStorage, USAGE_LOG_KEY, []);
  if (!Array.isArray(log)) return [];
  return log.filter(
    (entry) => Array.isArray(entry) && typeof entry[0] === "number" && now - entry[0] < USAGE_WINDOW_MS
  );
}

function profileOf(log: LogEntry[], firstAt: number, now: number): UsageProfile {
  return {
    uses: usesBucket(log.length),
    days: daysBucket(new Set(log.map(([t]) => localDay(t))).size),
    formats: formatsBucket(new Set(log.map(([, f]) => f)).size),
    since: sinceBucket(firstAt, now),
    when: whenBucket(now),
  };
}

/**
 * A short, non-reversible fingerprint: FNV-1a over the file name (so an edited
 * version of the same file still matches) or over the pasted text.
 */
function fingerprint(doc: ConvertedDocument): string {
  const input = doc.source === "file" && doc.filename ? `f:${doc.filename.toLowerCase()}` : `p:${doc.content}`;
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36);
}

/**
 * Was this document converted on an earlier day, and is it new in this tab?
 * Updates both records.
 */
function recordDocument(doc: ConvertedDocument, now: number): { again: boolean; newInTab: boolean; tabDocs: number } {
  const fp = doc.source === "sample" ? "sample" : fingerprint(doc);

  let again = false;
  if (doc.source !== "sample") {
    const seen = readJson<Record<string, number>>(localStorage, DOCS_SEEN_KEY, {});
    const last = typeof seen[fp] === "number" ? seen[fp] : 0;
    again = last > 0 && now - last < USAGE_WINDOW_MS && localDay(last) !== localDay(now);
    seen[fp] = now;
    const kept = Object.entries(seen)
      .filter(([, t]) => typeof t === "number" && now - t < USAGE_WINDOW_MS)
      .sort((a, b) => b[1] - a[1])
      .slice(0, MAX_DOCS_SEEN);
    localStorage.setItem(DOCS_SEEN_KEY, JSON.stringify(Object.fromEntries(kept)));
  }

  let tabDocs: string[] = [];
  let newInTab = true;
  try {
    tabDocs = readJson<string[]>(sessionStorage, SESSION_DOCS_KEY, []);
    if (!Array.isArray(tabDocs)) tabDocs = [];
    newInTab = !tabDocs.includes(fp);
    if (newInTab) {
      tabDocs = [...tabDocs, fp].slice(-MAX_SESSION_DOCS);
      sessionStorage.setItem(SESSION_DOCS_KEY, JSON.stringify(tabDocs));
    }
  } catch {
    // No sessionStorage: every conversion counts as a new document.
    tabDocs = [fp];
  }
  return { again, newInTab, tabDocs: tabDocs.length };
}

function docsBucket(n: number): string {
  if (n <= 1) return "1";
  if (n === 2) return "2";
  if (n <= 5) return "3-5";
  return "6+";
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Count one successful conversion and say what to report:
 * - `profile` on the browser's first conversion of the day, else null;
 * - `doc` on the first conversion of this document in this tab, else null.
 *
 * Without working storage nothing is counted and nothing is reported.
 */
export function recordUsage(
  format: string,
  doc: ConvertedDocument | null,
  now: number = Date.now()
): { profile: UsageProfile | null; doc: DocProfile | null } {
  try {
    const log = [...readLog(now), [now, format] as LogEntry].slice(-MAX_LOG_ENTRIES);
    localStorage.setItem(USAGE_LOG_KEY, JSON.stringify(log));

    // Browsers that converted before this counter existed keep their real
    // start: the teaser window began at their first conversion since 2026-09-22.
    let firstAt = readTime(USAGE_FIRST_AT_KEY);
    if (!firstAt) {
      firstAt = readTime(TEASER_FIRST_AT_KEY) || readTime(TEASER_SHOWN_AT_KEY) || now;
      localStorage.setItem(USAGE_FIRST_AT_KEY, String(firstAt));
    }

    let profile: UsageProfile | null = null;
    const today = localDay(now);
    if (localStorage.getItem(USAGE_PROFILE_DAY_KEY) !== today) {
      localStorage.setItem(USAGE_PROFILE_DAY_KEY, today);
      profile = profileOf(log, firstAt, now);
    }

    let docProfile: DocProfile | null = null;
    if (doc) {
      const { again, newInTab, tabDocs } = recordDocument(doc, now);
      if (newInTab) {
        docProfile = {
          source: doc.source,
          size: sizeBucket(doc.size),
          images: imagesBucket(countImages(doc.content)),
          again: again ? "yes" : "no",
          docs: docsBucket(tabDocs),
        };
      }
    }
    return { profile, doc: docProfile };
  } catch {
    return { profile: null, doc: null };
  }
}

/** This browser's conversions in the last 30 days, as a range ("0" when none). */
export function currentUses(now: number = Date.now()): string {
  try {
    return usesBucket(readLog(now).length);
  } catch {
    return "0";
  }
}

/** At least HEAVY_MIN_CONVERSIONS conversions on HEAVY_MIN_DAYS days in 30 days. */
export function isHeavyUser(now: number = Date.now()): boolean {
  try {
    const log = readLog(now);
    const days = new Set(log.map(([t]) => localDay(t))).size;
    return log.length >= HEAVY_MIN_CONVERSIONS && days >= HEAVY_MIN_DAYS;
  } catch {
    return false;
  }
}
