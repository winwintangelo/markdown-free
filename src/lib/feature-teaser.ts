/**
 * Phase 1.5 demand probe: the coming-features teaser (build plan §5).
 *
 * From a browser's 2nd successful conversion, and at most once per 7 days, a
 * one-line teaser replaces the post-convert thumbs prompt. It opens a list of
 * planned features shown as chips (premium and free); the visitor taps the
 * ones they would use, then leaves an email to be notified or just votes.
 *
 * This module holds what the browser and the server share: the feature list
 * and its tiers, the display rules, and the anti-bot timing. The conversion
 * count and the last-shown time live in localStorage and are never sent.
 */

export const FEATURE_KEYS = ["backup", "templates", "formatting", "equations", "merge", "share"] as const;
export type FeatureKey = (typeof FEATURE_KEYS)[number];

/** Draft tiers (2026-09-19). Move a key between the lists to change the chips. */
export const PREMIUM_FEATURES: readonly FeatureKey[] = ["backup", "templates", "formatting"];
export const FREE_FEATURES: readonly FeatureKey[] = ["equations", "merge", "share"];

export function isFeatureKey(value: unknown): value is FeatureKey {
  return typeof value === "string" && (FEATURE_KEYS as readonly string[]).includes(value);
}

export function isPremium(key: FeatureKey): boolean {
  return PREMIUM_FEATURES.includes(key);
}

/** The teaser shows from this conversion on; the 1st keeps the thumbs prompt. */
export const TEASER_FROM_CONVERSION = 2;
/** At most once per this many milliseconds per browser. */
export const TEASER_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;
/** A person needs longer than this between opening the chips and submitting. */
export const MIN_SUBMIT_MS = 1500;

export const CONVERSION_COUNT_KEY = "mdfree:conversions";
export const TEASER_SHOWN_AT_KEY = "mdfree:teaser-shown-at";

export type PostConvertPrompt = "thumbs" | "teaser";

/**
 * Count one successful conversion in this browser and decide which prompt
 * follows it. Without working storage the cooldown cannot be honored, so the
 * teaser never shows.
 */
export function recordConversion(now: number = Date.now()): PostConvertPrompt {
  try {
    const count = (parseInt(localStorage.getItem(CONVERSION_COUNT_KEY) ?? "0", 10) || 0) + 1;
    localStorage.setItem(CONVERSION_COUNT_KEY, String(count));
    if (count < TEASER_FROM_CONVERSION) return "thumbs";

    const shownAt = parseInt(localStorage.getItem(TEASER_SHOWN_AT_KEY) ?? "0", 10) || 0;
    if (now - shownAt < TEASER_COOLDOWN_MS) return "thumbs";

    localStorage.setItem(TEASER_SHOWN_AT_KEY, String(now));
    return "teaser";
  } catch {
    return "thumbs";
  }
}
