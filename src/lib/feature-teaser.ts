/**
 * Phase 1.5 demand probe: the coming-features teaser and the vote board
 * (build plan §5).
 *
 * From a browser's 2nd successful conversion, and at most once per 7 days, a
 * one-line teaser replaces the post-convert thumbs prompt. Opening it shows a
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

/** The teaser shows from this conversion on; the 1st keeps the thumbs prompt. */
export const TEASER_FROM_CONVERSION = 2;
/** At most once per this many milliseconds per browser. */
export const TEASER_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;
/**
 * Quiet period after any post-convert prompt. Converting a handful of files in
 * one sitting is normal, and a prompt each time is noise, so the next prompt
 * waits 30 minutes — the thumbs prompt and the teaser share the budget.
 */
export const PROMPT_QUIET_MS = 30 * 60 * 1000;
/** A person needs longer than this between opening the chips and submitting. */
export const MIN_SUBMIT_MS = 1500;

export const CONVERSION_COUNT_KEY = "mdfree:conversions";
export const TEASER_SHOWN_AT_KEY = "mdfree:teaser-shown-at";
export const PROMPT_SHOWN_AT_KEY = "mdfree:prompt-shown-at";

export type PostConvertPrompt = "thumbs" | "teaser" | "none";

function readTime(key: string): number {
  return parseInt(localStorage.getItem(key) ?? "0", 10) || 0;
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

    if (now - readTime(PROMPT_SHOWN_AT_KEY) < PROMPT_QUIET_MS) return "none";

    const teaserDue =
      count >= TEASER_FROM_CONVERSION && now - readTime(TEASER_SHOWN_AT_KEY) >= TEASER_COOLDOWN_MS;

    localStorage.setItem(PROMPT_SHOWN_AT_KEY, String(now));
    if (!teaserDue) return "thumbs";

    localStorage.setItem(TEASER_SHOWN_AT_KEY, String(now));
    return "teaser";
  } catch {
    return "thumbs";
  }
}
