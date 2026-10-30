import { NextRequest, NextResponse } from "next/server";
import { locales } from "@/i18n/config";
import { IDEA_MAX_CHARS, MIN_SUBMIT_MS, isFeatureKey, isIdeaKind } from "@/lib/feature-teaser";
import { notifyStoreConfigured, saveIdea } from "@/lib/notify-store";

/**
 * Typed feedback, stored privately and never shown on the site:
 *   { kind: "other", text }                 "Something else" on the vote board (retired)
 *   { kind: "workaround", feature, text }   "What do you do today…?" after a vote (retired)
 *   { kind: "suggestion", text }            the "Suggest an improvement" link
 * The retired kinds still arrive from a page loaded before 2026-10-29.
 *
 * One row per message, with no email, IP or session (privacy page: kept 12
 * months). The same silent anti-bot checks as /api/notify: a honeypot field and
 * a minimum time on the form drop a submission while answering exactly like a
 * stored one. Origin validation and the per-IP budget live in
 * src/middleware.ts.
 */

const MAX_BODY_BYTES = 2048;

function errorResponse(code: string, message: string, status: number): NextResponse {
  return NextResponse.json({ ok: false, error: code, message }, { status });
}

export async function POST(request: NextRequest) {
  const testMode = process.env.E2E_RELAXED_RATE_LIMITS === "1";
  const accepted = (outcome: string) =>
    NextResponse.json({ ok: true }, testMode ? { headers: { "x-ideas-outcome": outcome } } : undefined);

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

  if (!isIdeaKind(fields.kind)) {
    return errorResponse("INVALID_KIND", "Unknown kind of feedback.", 400);
  }
  const kind = fields.kind;

  let feature: string | null = null;
  if (fields.feature !== undefined && fields.feature !== null && fields.feature !== "") {
    if (!isFeatureKey(fields.feature)) {
      return errorResponse("INVALID_FEATURE", "Unknown feature.", 400);
    }
    feature = fields.feature;
  }

  // Control characters out, whitespace collapsed at the ends.
  const text =
    typeof fields.text === "string" ? fields.text.replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, "").trim() : "";
  if (!text) {
    return errorResponse("EMPTY_TEXT", "Type a few words first.", 400);
  }
  if ([...text].length > IDEA_MAX_CHARS) {
    return errorResponse("TEXT_TOO_LONG", `Keep it under ${IDEA_MAX_CHARS} characters.`, 400);
  }

  const locale =
    typeof fields.locale === "string" && (locales as readonly string[]).includes(fields.locale)
      ? fields.locale
      : "en";

  // Silent bot checks: answer "ok", store nothing.
  const honeypot = typeof fields.website === "string" ? fields.website : "";
  const elapsedMs = typeof fields.elapsedMs === "number" ? fields.elapsedMs : 0;
  if (honeypot) {
    console.log("[ideas] dropped a submission: honeypot filled");
    return accepted("dropped-honeypot");
  }
  if (!(elapsedMs >= MIN_SUBMIT_MS)) {
    console.log("[ideas] dropped a submission: sent too fast");
    return accepted("dropped-fast");
  }

  if (testMode) {
    console.log(`[ideas] test mode — not storing a ${kind} of ${text.length} chars`);
    return accepted("test-mode");
  }

  if (!notifyStoreConfigured()) {
    // Never log the text itself.
    console.log(`[ideas] storage not configured — dropped a ${kind}`);
    return accepted("not-configured");
  }

  try {
    await saveIdea(kind, feature, text, locale);
    return accepted("stored");
  } catch (error) {
    console.error("[ideas] save failed:", error instanceof Error ? error.message : String(error));
    return errorResponse("SAVE_FAILED", "Couldn't save that. Please try again.", 502);
  }
}
