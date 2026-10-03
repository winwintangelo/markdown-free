/**
 * Feedback prompts after a conversion: the invitation to the vote board, the
 * board itself, and the paid-interest questions (feedback v2, 2026-09-27,
 * after a marketing review).
 *
 * Two separate paths:
 *   - "What should we improve?" — a neutral, one-choice vote open to everyone.
 *     It never asks about buying.
 *   - "Who would pay?" — a short, feature-specific question shown only where a
 *     visitor meets a real need (a file over 1 MB, a vote for a candidate paid
 *     feature, repeat use). It says plainly that the option may be paid. It is
 *     off until the public "no premium tier" copy is fixed; see
 *     paidInterestEnabled().
 *
 * The invitation runs as a two-arm test, fixed per browser: today's teaser line
 * (control) against a format-specific card (card).
 *
 * This module also decides which prompt, if any, follows a conversion. A
 * browser sees at most one per 30 minutes, whichever kind it is.
 *
 * It holds what the browser and the server share: the choice lists, the display
 * rules and the anti-bot timing. The counters and timestamps live in
 * localStorage and are never sent.
 */

/** The features on the board, in canonical order (the board shuffles them). */
export const FEATURE_KEYS = [
  "formatting",
  "equations",
  "templates",
  "large",
  "recover",
  "account",
  "merge",
  "share",
] as const;
export type FeatureKey = (typeof FEATURE_KEYS)[number];

/** Every answer the board accepts: a feature, "something else", or "nothing missing". */
export const CHOICE_KEYS = [...FEATURE_KEYS, "other", "nothing"] as const;
export type ChoiceKey = (typeof CHOICE_KEYS)[number];

/**
 * Choices an older page may still send during a rollout: "backup" was split
 * into "recover" (in this browser) and "account" (stored online).
 */
export const LEGACY_FEATURE_KEYS = ["backup"] as const;

/**
 * Features a visitor may be asked about paying for, once the paid path is on.
 * The board never marks them — a tier badge beside a feature bends the vote.
 */
export const PAID_INTEREST_FEATURES: readonly FeatureKey[] = ["formatting", "equations", "templates", "large", "account"];

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

export function isPaidInterestFeature(key: string): key is FeatureKey {
  return (PAID_INTEREST_FEATURES as readonly string[]).includes(key);
}

/** One tally row as the board draws it. */
export type FeatureTally = { feature: FeatureKey; votes: number };

/**
 * How someone left the invitation. "abandoned" means nobody closed anything:
 * the invitation went away on its own, because the page went.
 */
export const TEASER_EXITS = ["close", "escape", "backdrop", "done", "abandoned"] as const;
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
 * test server), so the results always list every feature. "other", "nothing"
 * and the retired "backup" are counted but not drawn.
 */
export function completeTallies(rows: { feature: string; votes: number }[], choice: ChoiceKey | null): FeatureTally[] {
  const byKey = new Map(rows.map((row) => [row.feature, row.votes]));
  return FEATURE_KEYS.map((feature) => ({
    feature,
    // Without a store, the only vote we know about is the one just cast here.
    votes: byKey.get(feature) ?? (choice === feature ? 1 : 0),
  })).sort((a, b) => b.votes - a.votes || FEATURE_KEYS.indexOf(a.feature) - FEATURE_KEYS.indexOf(b.feature));
}

/**
 * The invitation shows from this conversion on: it takes the first
 * conversion's prompt slot instead of the thumbs prompt (2026-09-23: waiting
 * for a second conversion AND 30 quiet minutes left the probe invisible).
 */
export const TEASER_FROM_CONVERSION = 1;
/**
 * How long the invitation keeps the prompt slot in one browser: every slot for
 * 7 days from its first showing (owner, 2026-09-23), then the thumbs prompt
 * takes the slot back. A vote ends it sooner.
 */
export const TEASER_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;
/**
 * Quiet period after any post-convert prompt. Converting a handful of files in
 * one sitting is normal, and a prompt each time is noise, so the next prompt
 * waits 30 minutes — every kind shares the budget.
 */
export const PROMPT_QUIET_MS = 30 * 60 * 1000;
/** A person needs longer than this between opening a form and submitting it. */
export const MIN_SUBMIT_MS = 1500;

export const CONVERSION_COUNT_KEY = "mdfree:conversions";
/** When this browser first saw the invitation; the 7-day window runs from here. */
export const TEASER_FIRST_AT_KEY = "mdfree:teaser-first-at";
/** The most recent invitation. Kept for the migration below and for debugging. */
export const TEASER_SHOWN_AT_KEY = "mdfree:teaser-shown-at";
/** How many invitations this browser has seen, so analytics can separate the 1st. */
export const TEASER_IMPRESSIONS_KEY = "mdfree:teaser-impressions";
/** Set once the visitor votes. A voter is never asked again. */
export const TEASER_ANSWERED_KEY = "mdfree:teaser-answered";
export const PROMPT_SHOWN_AT_KEY = "mdfree:prompt-shown-at";
/** sessionStorage: an invitation showed in this tab, so no paid question here. */
export const INVITE_SESSION_KEY = "mdfree:invite-session";
/** The page-layout question for repeat visitors shows once per browser. */
export const PAID_LAYOUT_SHOWN_KEY = "mdfree:paid-layout-shown";
/** This browser's shuffled feature order, kept so the board never reshuffles. */
export const BOARD_ORDER_KEY = "mdfree:board-order";

export type PostConvertPrompt = "thumbs" | "teaser" | "paid" | "none";

/**
 * The two invitations under test, fixed per browser (marketing review: one
 * control, one meaningful treatment, instead of five wordings on a trickle of
 * traffic):
 *   control  today's one-line teaser with the "Missing something in your
 *            exports?" wording (the old v4)
 *   card     a compact card that asks about the format just exported
 */
export const INVITE_ARMS = ["control", "card"] as const;
export type InviteArm = (typeof INVITE_ARMS)[number];
export const INVITE_ARM_KEY = "mdfree:invite-arm";

export function isInviteArm(value: unknown): value is InviteArm {
  return typeof value === "string" && (INVITE_ARMS as readonly string[]).includes(value);
}

/**
 * A query parameter, read on localhost only. The manual-testing switches below
 * go through here: on the live site a URL that could steer the probe would let
 * anyone skew its data.
 */
function localParam(name: string): string | null {
  try {
    const { hostname, search } = window.location;
    const local = hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";
    return local ? new URLSearchParams(search).get(name) : null;
  } catch {
    return null;
  }
}

/**
 * Manual-testing switch: `?probe=teaser` shows the invitation after the next
 * conversion, whatever the counters say. Localhost only.
 */
export function teaserForcedLocally(): boolean {
  return localParam("probe") === "teaser";
}

/**
 * Whether the paid-interest questions may show. Off until the public copy that
 * promises "no premium tier" is corrected (marketing review, priority 0): set
 * NEXT_PUBLIC_PAID_INTEREST=1 at build time to turn them on. `?paid=1` turns
 * them on for a manual check on localhost.
 */
export function paidInterestEnabled(): boolean {
  return process.env.NEXT_PUBLIC_PAID_INTEREST === "1" || localParam("paid") === "1";
}

/**
 * The invitation this browser is in. Picked at random the first time and then
 * kept, so one visitor never sees both and every repeat counts for the same
 * arm. `isNew` tells the caller to record the assignment. `?arm=card` pins one
 * on localhost, for checking copy by hand.
 */
export function inviteArm(random: () => number = Math.random): { arm: InviteArm; isNew: boolean } {
  const pick = () => INVITE_ARMS[Math.floor(random() * INVITE_ARMS.length)];
  try {
    const pinned = localParam("arm");
    if (isInviteArm(pinned)) {
      localStorage.setItem(INVITE_ARM_KEY, pinned);
      return { arm: pinned, isNew: false };
    }
    const stored = localStorage.getItem(INVITE_ARM_KEY);
    if (isInviteArm(stored)) return { arm: stored, isNew: false };
    const picked = pick();
    localStorage.setItem(INVITE_ARM_KEY, picked);
    return { arm: picked, isNew: true };
  } catch {
    // Without storage no invitation shows (recordConversion returns thumbs),
    // so this only keeps the function total.
    return { arm: pick(), isNew: false };
  }
}

/**
 * The board's feature order for this browser: shuffled once, then kept, so
 * no feature gains from always sitting first and a visitor who reopens the
 * board finds it unchanged.
 */
export function boardOrder(random: () => number = Math.random): FeatureKey[] {
  try {
    const stored = JSON.parse(localStorage.getItem(BOARD_ORDER_KEY) ?? "null");
    if (
      Array.isArray(stored) &&
      stored.length === FEATURE_KEYS.length &&
      FEATURE_KEYS.every((key) => stored.includes(key))
    ) {
      return stored as FeatureKey[];
    }
  } catch {
    // Fall through to a fresh shuffle.
  }
  const order = [...FEATURE_KEYS];
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  try {
    localStorage.setItem(BOARD_ORDER_KEY, JSON.stringify(order));
  } catch {
    // The order just won't persist.
  }
  return order;
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
    // Storage is unavailable; the invitation could not have been shown either.
  }
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
 * How many invitations this browser has seen, the current one included.
 * Analytics tags the event with it so first impressions can be read apart.
 */
export function teaserImpressions(): number {
  try {
    return readTime(TEASER_IMPRESSIONS_KEY);
  } catch {
    return 0;
  }
}

function inviteShownThisSession(): boolean {
  try {
    return sessionStorage.getItem(INVITE_SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

function markInviteSession(): void {
  try {
    sessionStorage.setItem(INVITE_SESSION_KEY, "1");
  } catch {
    // Without sessionStorage the paid question simply waits for another day.
  }
}

/**
 * Count one successful conversion in this browser and decide which prompt
 * follows it, in this order:
 *   1. nothing within 30 minutes of the last prompt, whatever kind;
 *   2. the vote invitation, for 7 days from its first showing, unless the
 *      visitor voted;
 *   3. the page-layout paid question, once, for a heavy user (`heavy`, see
 *      isHeavyUser in usage-signals.ts), when the paid path is on and no
 *      invitation showed in this tab;
 *   4. the thumbs prompt.
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

    // Browsers that saw a teaser under the old rule start their window from
    // that teaser, not from today, so nobody gets a second 7-day run.
    const firstAt = readTime(TEASER_FIRST_AT_KEY) || readTime(TEASER_SHOWN_AT_KEY);
    // A dismissal does not end the window (owner: on hold since 2026-09-27),
    // though the marketing review recommends it.
    const finished = localStorage.getItem(TEASER_ANSWERED_KEY) === "1";
    const inWindow = firstAt === 0 || now - firstAt < TEASER_WINDOW_MS;

    if (!finished && count >= TEASER_FROM_CONVERSION && inWindow) {
      if (firstAt === 0) localStorage.setItem(TEASER_FIRST_AT_KEY, String(now));
      localStorage.setItem(TEASER_SHOWN_AT_KEY, String(now));
      localStorage.setItem(TEASER_IMPRESSIONS_KEY, String(readTime(TEASER_IMPRESSIONS_KEY) + 1));
      markInviteSession();
      return "teaser";
    }

    if (
      options.heavy &&
      paidInterestEnabled() &&
      localStorage.getItem(PAID_LAYOUT_SHOWN_KEY) !== "1" &&
      !inviteShownThisSession()
    ) {
      return "paid";
    }
    return "thumbs";
  } catch {
    return "thumbs";
  }
}
