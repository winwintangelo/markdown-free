import { NextRequest, NextResponse } from "next/server";
import {
  FEATURE_KEYS,
  MIN_SUBMIT_MS,
  isChoiceKey,
  isFeatureKey,
  isLegacyFeatureKey,
  isPayAnswer,
} from "@/lib/feature-teaser";
import { notifyStoreConfigured, recordProbe } from "@/lib/notify-store";

/**
 * Votes for the feature board.
 *
 * A counter per choice: this route stores no address, no IP and no session,
 * and a person is never a row. The response carries the tallies, which is the
 * only way the browser ever sees them — the board hides counts until a vote is
 * in, so that the numbers cannot steer the vote.
 *
 * The call:
 *   { choice: "formatting" | … | "other" | "nothing", elapsedMs }   one choice
 *
 * A page loaded before the one-choice board may still send the old shapes for
 * a while, and they still count:
 *   { features: [...], elapsedMs }   several picks, possibly "backup"
 *   { pay: "yes" | "maybe" | "no" }  the old results-page chip
 *
 * Silent anti-bot checks match /api/notify: a honeypot field and a minimum
 * time on the dialog drop a submission while answering exactly like a stored
 * one. Origin validation and the per-IP budget live in src/middleware.ts.
 */

const MAX_BODY_BYTES = 1024;

function errorResponse(code: string, message: string, status: number): NextResponse {
  return NextResponse.json({ ok: false, error: code, message }, { status });
}

export async function POST(request: NextRequest) {
  // A server started for the e2e suite never stores (the same flag relaxes the
  // rate limits in middleware). Tests read the outcome from a header that a
  // production server never sends.
  const testMode = process.env.E2E_RELAXED_RATE_LIMITS === "1";

  const accepted = (outcome: string, tallies: { feature: string; votes: number }[]) =>
    NextResponse.json({ ok: true, tallies }, testMode ? { headers: { "x-votes-outcome": outcome } } : undefined);

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return errorResponse("BODY_TOO_LARGE", "Request body is too large.", 413);
  }

  let fields: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("not an object");
    fields = parsed as Record<string, unknown>;
  } catch {
    return errorResponse("INVALID_JSON", "Request body must be a JSON object.", 400);
  }

  let choices: string[];
  if (fields.choice !== undefined) {
    // A retired choice still counts when a page loaded before the change sends it.
    if (!isChoiceKey(fields.choice) && !isLegacyFeatureKey(fields.choice)) {
      return errorResponse("INVALID_CHOICE", "Choose one of the listed options.", 400);
    }
    choices = [fields.choice as string];
  } else {
    // The multi-pick board, from a page loaded before the change.
    const picked: unknown[] = Array.isArray(fields.features) ? fields.features : [];
    const known = (value: unknown) => isFeatureKey(value) || isLegacyFeatureKey(value);
    if (picked.length > FEATURE_KEYS.length + 1 || !picked.every(known)) {
      return errorResponse("INVALID_FEATURES", "Choose one of the listed options.", 400);
    }
    choices = [...new Set(picked as string[])];
  }

  const pay = typeof fields.pay === "string" && fields.pay ? fields.pay : null;
  if (pay !== null && !isPayAnswer(pay)) {
    return errorResponse("INVALID_PAY", "That answer isn't one of the options.", 400);
  }

  if (choices.length === 0 && pay === null) {
    return errorResponse("NOTHING_TO_RECORD", "Send a vote.", 400);
  }

  // Silent bot checks on the vote itself: answer "ok", store nothing. The old
  // pay chip arrives later in the session, so it skips the timing check.
  const honeypot = typeof fields.website === "string" ? fields.website : "";
  const elapsedMs = typeof fields.elapsedMs === "number" ? fields.elapsedMs : 0;
  if (honeypot) {
    console.log("[votes] dropped a submission: honeypot filled");
    return accepted("dropped-honeypot", []);
  }
  if (choices.length > 0 && !(elapsedMs >= MIN_SUBMIT_MS)) {
    console.log("[votes] dropped a submission: sent too fast");
    return accepted("dropped-fast", []);
  }

  if (testMode) {
    console.log(`[votes] test mode — not storing ${choices.length} vote(s)`);
    return accepted("test-mode", []);
  }

  if (!notifyStoreConfigured()) {
    console.log("[votes] storage not configured (SUPABASE_URL / SUPABASE_SECRET_KEY) — dropped a vote");
    return accepted("not-configured", []);
  }

  try {
    const tallies = await recordProbe(choices, pay);
    return accepted("stored", tallies);
  } catch (error) {
    console.error("[votes] save failed:", error instanceof Error ? error.message : String(error));
    return errorResponse("SAVE_FAILED", "Couldn't record that. Please try again.", 502);
  }
}
