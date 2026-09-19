import { NextRequest, NextResponse } from "next/server";
import { locales } from "@/i18n/config";
import { FEATURE_KEYS, MIN_SUBMIT_MS, isFeatureKey } from "@/lib/feature-teaser";
import { notifyStoreConfigured, saveNotifySignup } from "@/lib/notify-store";

/**
 * "Notify me" signups from the coming-features teaser (Phase 1.5).
 *
 * Stores an email with the features it asked about, and sends nothing. Mail
 * goes out only when a feature ships, so this form cannot be used to send
 * email to someone else.
 *
 * Silent anti-bot checks (a honeypot field and a minimum time on the panel)
 * drop a submission but answer exactly like a stored one, and so does a
 * duplicate: the response never reveals whether an address is on the list.
 * Origin validation and the per-IP budget live in src/middleware.ts.
 */

const MAX_BODY_BYTES = 2048;
const MAX_EMAIL_CHARS = 254;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function errorResponse(code: string, message: string, status: number): NextResponse {
  return NextResponse.json({ ok: false, error: code, message }, { status });
}

export async function POST(request: NextRequest) {
  // A server started for the e2e suite never stores (the same flag relaxes the
  // rate limits in middleware). Tests read the outcome from a header that a
  // production server never sends.
  const testMode = process.env.E2E_RELAXED_RATE_LIMITS === "1";
  const accepted = (outcome: string) =>
    NextResponse.json({ ok: true }, testMode ? { headers: { "x-notify-outcome": outcome } } : undefined);

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

  const email = typeof fields.email === "string" ? fields.email.trim().toLowerCase() : "";
  if (!email || email.length > MAX_EMAIL_CHARS || !EMAIL_RE.test(email)) {
    return errorResponse("INVALID_EMAIL", "That email address doesn't look right.", 400);
  }

  const picked: unknown[] = Array.isArray(fields.features) ? fields.features : [];
  if (picked.length === 0 || picked.length > FEATURE_KEYS.length || !picked.every(isFeatureKey)) {
    return errorResponse("INVALID_FEATURES", "Choose one or more of the listed features.", 400);
  }
  // Deduplicated, in the canonical order
  const features = FEATURE_KEYS.filter((key) => picked.includes(key));

  const locale =
    typeof fields.locale === "string" && (locales as readonly string[]).includes(fields.locale)
      ? fields.locale
      : "en";

  // Silent bot checks: answer "ok", store nothing.
  const honeypot = typeof fields.website === "string" ? fields.website : "";
  const elapsedMs = typeof fields.elapsedMs === "number" ? fields.elapsedMs : 0;
  if (honeypot) {
    console.log("[notify] dropped a submission: honeypot filled");
    return accepted("dropped-honeypot");
  }
  if (!(elapsedMs >= MIN_SUBMIT_MS)) {
    console.log("[notify] dropped a submission: sent too fast");
    return accepted("dropped-fast");
  }

  if (testMode) {
    console.log(`[notify] test mode — not storing a signup for ${features.length} feature(s)`);
    return accepted("test-mode");
  }

  if (!notifyStoreConfigured()) {
    // Never log the address itself.
    console.log("[notify] storage not configured (SUPABASE_URL / SUPABASE_SECRET_KEY) — dropped a signup");
    return accepted("not-configured");
  }

  try {
    await saveNotifySignup(email, features, locale);
    return accepted("stored");
  } catch (error) {
    console.error("[notify] save failed:", error instanceof Error ? error.message : String(error));
    return errorResponse("SAVE_FAILED", "Couldn't save that. Please try again.", 502);
  }
}
