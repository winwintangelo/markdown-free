/**
 * Feedback prompts after a conversion, and the choice lists the feedback
 * routes share (feedback v2, 2026-09-27, after a marketing review).
 *
 * What still asks:
 *   - the thumbs prompt, after a conversion;
 *   - the page-layout question, once, for a heavy user (repeat use);
 *   - the large-file card, under the 1 MB error;
 *   - the "Suggest an improvement" link, always available.
 * The large-file card and the heavy-user question say plainly that the option
 * may be paid.
 *
 * The vote invitation and its board were retired on 2026-10-29, after their
 * two-arm test ended on 2026-10-21. /api/votes still accepts a vote from a
 * page loaded before then, and the stored votes stay.
 *
 * This module also decides which prompt, if any, follows a conversion. A
 * browser sees at most one per 30 minutes, whichever kind it is.
 *
 * It holds what the browser and the server share: the choice lists, the display
 * rules and the anti-bot timing. The counters and timestamps live in
 * localStorage and are never sent.
 */

/** The features the board offered, in canonical order. /api/notify and /api/ideas accept them. */
export const FEATURE_KEYS = [
  "formatting",
  "templates",
  "large",
  "recover",
  "account",
  "merge",
  "share",
] as const;
export type FeatureKey = (typeof FEATURE_KEYS)[number];

/** Every answer the board accepted: a feature, "something else", or "nothing missing". */
export const CHOICE_KEYS = [...FEATURE_KEYS, "other", "nothing"] as const;
export type ChoiceKey = (typeof CHOICE_KEYS)[number];

/**
 * Choices an older page may still send: "backup" was split into "recover" (in
 * this browser) and "account" (stored online), and "equations" left the board
 * when editable equations in Word shipped (2026-10-03).
 */
export const LEGACY_FEATURE_KEYS = ["backup", "equations"] as const;

/** Answers to "Would you consider a paid option for this?" Analytics only. */
export const PAID_ANSWERS = ["maybe", "free", "unsure"] as const;
export type PaidAnswer = (typeof PAID_ANSWERS)[number];

/** The old results-page pay chips. /api/votes still accepts them from an older page. */
export const PAY_ANSWERS = ["yes", "maybe", "no"] as const;
export type PayAnswer = (typeof PAY_ANSWERS)[number];

/** Answers to the large-file card under the 1 MB error ("Would you consider paying for it?"). Analytics only. */
export const LIMIT_PAY_ANSWERS = ["yes", "maybe", "no"] as const;
export type LimitPayAnswer = (typeof LIMIT_PAY_ANSWERS)[number];

/** What a repeat visitor would change first, on the page-layout question. */
export const PAID_NEEDS = ["fonts", "margins", "pageSize", "headers", "other"] as const;
export type PaidNeed = (typeof PAID_NEEDS)[number];

/** The three kinds of typed text, stored privately by /api/ideas. */
export const IDEA_KINDS = ["other", "workaround", "suggestion"] as const;
export type IdeaKind = (typeof IDEA_KINDS)[number];
/** Longest typed text we store. */
export const IDEA_MAX_CHARS = 200;

export function isFeatureKey(value: unknown): value is FeatureKey {
  return typeof value === "string" && (FEATURE_KEYS as readonly string[]).includes(value);
}

export function isChoiceKey(value: unknown): value is ChoiceKey {
  return typeof value === "string" && (CHOICE_KEYS as readonly string[]).includes(value);
}

export function isLegacyFeatureKey(value: unknown): boolean {
  return typeof value === "string" && (LEGACY_FEATURE_KEYS as readonly string[]).includes(value);
}

export function isPayAnswer(value: unknown): value is PayAnswer {
  return typeof value === "string" && (PAY_ANSWERS as readonly string[]).includes(value);
}

export function isIdeaKind(value: unknown): value is IdeaKind {
  return typeof value === "string" && (IDEA_KINDS as readonly string[]).includes(value);
}

/**
 * Quiet period after any post-convert prompt. Converting a handful of files in
 * one sitting is normal, and a prompt each time is noise, so the next prompt
 * waits 30 minutes — every kind shares the budget.
 */
export const PROMPT_QUIET_MS = 30 * 60 * 1000;
/** A person needs longer than this between opening a form and submitting it. */
export const MIN_SUBMIT_MS = 1500;

export const CONVERSION_COUNT_KEY = "mdfree:conversions";
/**
 * When a browser first saw the vote invitation, and when it last did. Nothing
 * writes them any more; usage-signals.ts reads them to date a browser's first
 * conversion from before its own log started.
 */
export const TEASER_FIRST_AT_KEY = "mdfree:teaser-first-at";
export const TEASER_SHOWN_AT_KEY = "mdfree:teaser-shown-at";
export const PROMPT_SHOWN_AT_KEY = "mdfree:prompt-shown-at";
/** The page-layout question for repeat visitors shows once per browser. */
export const PAID_LAYOUT_SHOWN_KEY = "mdfree:paid-layout-shown";

export type PostConvertPrompt = "thumbs" | "paid" | "none";

function readTime(key: string): number {
  return parseInt(localStorage.getItem(key) ?? "0", 10) || 0;
}

/** The page-layout question showed; it never shows again in this browser. */
export function markPaidLayoutShown(): void {
  try {
    localStorage.setItem(PAID_LAYOUT_SHOWN_KEY, "1");
  } catch {
    // Without storage the question could not have been scheduled.
  }
}

/**
 * Count one successful conversion in this browser and decide which prompt
 * follows it, in this order:
 *   1. nothing within 30 minutes of the last prompt, whatever kind;
 *   2. the page-layout paid question, once, for a heavy user (`heavy`, see
 *      isHeavyUser in usage-signals.ts);
 *   3. the thumbs prompt.
 *
 * Without working storage neither cooldown can be honored, so only the thumbs
 * prompt shows.
 */
export function recordConversion(now: number = Date.now(), options: { heavy?: boolean } = {}): PostConvertPrompt {
  try {
    const count = (readTime(CONVERSION_COUNT_KEY) || 0) + 1;
    localStorage.setItem(CONVERSION_COUNT_KEY, String(count));

    // The quiet period comes first and has no exceptions: one prompt per 30
    // minutes, whichever kind.
    if (now - readTime(PROMPT_SHOWN_AT_KEY) < PROMPT_QUIET_MS) return "none";
    localStorage.setItem(PROMPT_SHOWN_AT_KEY, String(now));

    if (options.heavy && localStorage.getItem(PAID_LAYOUT_SHOWN_KEY) !== "1") return "paid";
    return "thumbs";
  } catch {
    return "thumbs";
  }
}
