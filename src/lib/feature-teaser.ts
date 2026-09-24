/**
 * Phase 1.5 demand probe: the coming-features teaser and the vote board
 * (build plan §5).
 *
 * For 7 days from a browser's first conversion, the one-line teaser takes the
 * slot the post-convert thumbs prompt would have used; after that the thumbs
 * prompt takes it back, and a visitor who votes never sees the teaser again.
 * Opening it shows a
 * dialog in two states: pick the features you would use, with no counts and no
 * bars anywhere, then — once the vote is recorded — the tallies, one optional
 * question about paying, and an optional email.
 *
 * Counts stay hidden until someone has voted because showing them first biases
 * the vote: the popular feature gets more popular and the rest look unwanted.
 *
 * This module also decides which prompt, if any, follows a conversion. A
 * prompt after every single conversion is noise, so a browser sees at most one
 * per 30 minutes, whichever kind it is.
 *
 * It holds what the browser and the server share: the feature list, the
 * display rules and the anti-bot timing. The conversion count and the
 * timestamps live in localStorage and are never sent.
 */

export const FEATURE_KEYS = ["backup", "templates", "formatting", "equations", "merge", "share"] as const;
export type FeatureKey = (typeof FEATURE_KEYS)[number];

/**
 * Which features we expect to charge for. The board never shows this split —
 * a tier badge beside a feature bends the vote — but the pay answer is worth
 * more when we know how many premium candidates someone picked.
 */
export const PREMIUM_FEATURES: readonly FeatureKey[] = ["backup", "templates", "formatting"];

export const PAY_ANSWERS = ["yes", "maybe", "no"] as const;
export type PayAnswer = (typeof PAY_ANSWERS)[number];

export function isFeatureKey(value: unknown): value is FeatureKey {
  return typeof value === "string" && (FEATURE_KEYS as readonly string[]).includes(value);
}

export function isPayAnswer(value: unknown): value is PayAnswer {
  return typeof value === "string" && (PAY_ANSWERS as readonly string[]).includes(value);
}

export function isPremium(key: FeatureKey): boolean {
  return PREMIUM_FEATURES.includes(key);
}

/** One tally row as the board draws it. */
export type FeatureTally = { feature: FeatureKey; votes: number };

/**
 * How someone left the board. "abandoned" means nobody closed anything: the
 * teaser went away on its own, because the next conversion replaced it or the
 * page went.
 */
export const TEASER_EXITS = ["close", "escape", "backdrop", "just_vote", "abandoned"] as const;
export type TeaserExit = (typeof TEASER_EXITS)[number];

/** Where a visitor stopped when they left without voting. */
export type TeaserStage = "teaser" | "vote";

/**
 * Dwell time as a bucket, never the raw number. Analytics counts distinct
 * property values, so raw milliseconds would give every visit its own row and
 * the dashboard would show nothing.
 */
export function dwellBucket(ms: number): string {
  if (ms < 5_000) return "0-5s";
  if (ms < 15_000) return "5-15s";
  if (ms < 60_000) return "15-60s";
  return "60s+";
}

/**
 * Fill in the features the server did not return (nothing stored yet, or a
 * test server), so the board always draws the whole list.
 */
export function completeTallies(rows: FeatureTally[], picks: FeatureKey[]): FeatureTally[] {
  const byKey = new Map(rows.map((row) => [row.feature, row.votes]));
  return FEATURE_KEYS.map((feature) => ({
    feature,
    // Without a store, the only vote we know about is the one just cast here.
    votes: byKey.get(feature) ?? (picks.includes(feature) ? 1 : 0),
  })).sort((a, b) => b.votes - a.votes || FEATURE_KEYS.indexOf(a.feature) - FEATURE_KEYS.indexOf(b.feature));
}

/**
 * The teaser shows from this conversion on.
 *
 * It was 2 until 2026-09-23, when production said the probe was invisible: 14
 * teasers against 95 converting visitors in 24 hours. Waiting for a second
 * conversion AND 30 quiet minutes cannot both happen in one sitting, because
 * the first conversion's thumbs prompt starts the quiet period — so only
 * visitors returning half an hour later ever saw it. The teaser now takes the
 * first conversion's prompt slot instead of the thumbs prompt, which leaves the
 * number of interruptions unchanged and its own 7-day cooldown in charge.
 *
 * The 30-minute quiet period still applies to it: the teaser stamps the same
 * timestamp, so the rest of that sitting stays silent, and a teaser that falls
 * due mid-sitting waits for the quiet period like anything else (owner,
 * 2026-09-23: "I still want quiet period after the 1st conversion").
 */
export const TEASER_FROM_CONVERSION = 1;
/**
 * How long the teaser keeps the prompt slot in one browser.
 *
 * Owner, 2026-09-23: the teaser shows on every prompt slot for 7 days, then the
 * thumbs prompt takes the slot back. Before this it was the other way round —
 * one teaser per 7 days — which gave the probe a single impression per browser
 * and left the gate out of reach. The 30-minute quiet period still limits how
 * often a slot comes round, so 7 days of teasers is not 7 days of nagging.
 */
export const TEASER_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;
/**
 * Quiet period after any post-convert prompt. Converting a handful of files in
 * one sitting is normal, and a prompt each time is noise, so the next prompt
 * waits 30 minutes — the thumbs prompt and the teaser share the budget.
 */
export const PROMPT_QUIET_MS = 30 * 60 * 1000;
/** A person needs longer than this between opening the chips and submitting. */
export const MIN_SUBMIT_MS = 1500;

export const CONVERSION_COUNT_KEY = "mdfree:conversions";
/** When this browser first saw the teaser; the 7-day window runs from here. */
export const TEASER_FIRST_AT_KEY = "mdfree:teaser-first-at";
/** The most recent teaser. Kept for the migration below and for debugging. */
export const TEASER_SHOWN_AT_KEY = "mdfree:teaser-shown-at";
/** How many teasers this browser has seen, so analytics can separate the 1st. */
export const TEASER_IMPRESSIONS_KEY = "mdfree:teaser-impressions";
/** Set once the visitor votes. A voter is never asked again. */
export const TEASER_ANSWERED_KEY = "mdfree:teaser-answered";
export const PROMPT_SHOWN_AT_KEY = "mdfree:prompt-shown-at";

export type PostConvertPrompt = "thumbs" | "teaser" | "none";

/**
 * Manual-testing switch: `?probe=teaser` shows the teaser after the next
 * conversion, whatever the counters say.
 *
 * It works on localhost only. The display rules exist to keep the probe from
 * nagging people, and a URL that could switch them off would also let anyone
 * skew the data on the live site.
 */
export function teaserForcedLocally(): boolean {
  try {
    const { hostname, search } = window.location;
    const local = hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";
    return local && new URLSearchParams(search).get("probe") === "teaser";
  } catch {
    return false;
  }
}

function readTime(key: string): number {
  return parseInt(localStorage.getItem(key) ?? "0", 10) || 0;
}

/**
 * The visitor voted. They are done: every later conversion gets the thumbs
 * prompt, whatever is left of the 7-day window. Showing the board again would
 * also let one browser vote twice and inflate the counters.
 */
export function markTeaserAnswered(): void {
  try {
    localStorage.setItem(TEASER_ANSWERED_KEY, "1");
  } catch {
    // Storage is unavailable; the teaser could not have been shown either.
  }
}

/**
 * How many teasers this browser has seen, the current one included. Analytics
 * tags the event with it so the gate can be read on first impressions, which
 * is what the fake-door benchmark measures.
 */
export function teaserImpressions(): number {
  try {
    return readTime(TEASER_IMPRESSIONS_KEY);
  } catch {
    return 0;
  }
}

/**
 * Count one successful conversion in this browser and decide which prompt
 * follows it: the teaser when it is due, otherwise the thumbs prompt, and
 * nothing at all within 30 minutes of the last prompt.
 *
 * Without working storage neither cooldown can be honored, so only the thumbs
 * prompt shows.
 */
export function recordConversion(now: number = Date.now()): PostConvertPrompt {
  try {
    const count = (readTime(CONVERSION_COUNT_KEY) || 0) + 1;
    localStorage.setItem(CONVERSION_COUNT_KEY, String(count));

    // The quiet period comes first and has no exceptions: one prompt per 30
    // minutes, whichever kind.
    if (now - readTime(PROMPT_SHOWN_AT_KEY) < PROMPT_QUIET_MS) return "none";
    localStorage.setItem(PROMPT_SHOWN_AT_KEY, String(now));

    // Browsers that saw a teaser under the old rule start their window from
    // that teaser, not from today, so nobody gets a second 7-day run.
    const firstAt = readTime(TEASER_FIRST_AT_KEY) || readTime(TEASER_SHOWN_AT_KEY);
    const answered = localStorage.getItem(TEASER_ANSWERED_KEY) === "1";
    const inWindow = firstAt === 0 || now - firstAt < TEASER_WINDOW_MS;

    if (answered || count < TEASER_FROM_CONVERSION || !inWindow) return "thumbs";

    if (firstAt === 0) localStorage.setItem(TEASER_FIRST_AT_KEY, String(now));
    localStorage.setItem(TEASER_SHOWN_AT_KEY, String(now));
    localStorage.setItem(TEASER_IMPRESSIONS_KEY, String(readTime(TEASER_IMPRESSIONS_KEY) + 1));
    return "teaser";
  } catch {
    return "thumbs";
  }
}
