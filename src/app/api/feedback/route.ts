import { NextRequest, NextResponse } from "next/server";

/**
 * First-party feedback endpoint.
 *
 * Receives the feedback-modal message (+ optional reply email) and post-convert
 * free-text comments, and forwards them to the owner's inbox through Resend.
 * This exists so that feedback content and emails never enter analytics
 * (they used to be attached to Umami events, which the privacy policy forbids).
 *
 * Configuration (see env.example):
 *   RESEND_API_KEY       — Resend API key
 *   FEEDBACK_TO_EMAIL    — inbox that receives feedback
 *   FEEDBACK_FROM_EMAIL  — sender (optional; defaults to Resend's onboarding sender)
 *
 * When not configured the endpoint still accepts the message (so the UI keeps
 * working) but reports `delivered: false` and logs a one-line notice without
 * the message content.
 *
 * Origin validation and per-IP rate limiting happen in src/middleware.ts.
 */

const MAX_MESSAGE_CHARS = 2000;
const MAX_EMAIL_CHARS = 254;
const MAX_SHORT_CHARS = 200;
const MAX_CATEGORIES = 10;
const RESEND_TIMEOUT_MS = 8000;

const SOURCES = new Set(["modal", "post_convert"]);
// Deliberately loose: this only prevents obviously broken reply addresses.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function errorResponse(code: string, message: string, status: number): NextResponse {
  return NextResponse.json({ ok: false, error: code, message }, { status });
}

function shortString(value: unknown): string {
  return typeof value === "string" ? value.trim().slice(0, MAX_SHORT_CHARS) : "";
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("INVALID_JSON", "Request body must be JSON.", 400);
  }
  if (!body || typeof body !== "object") {
    return errorResponse("INVALID_BODY", "Request body must be an object.", 400);
  }
  const fields = body as Record<string, unknown>;

  const message = typeof fields.message === "string" ? fields.message.trim() : "";
  if (!message) {
    return errorResponse("EMPTY_MESSAGE", "Please enter your feedback.", 400);
  }
  if (message.length > MAX_MESSAGE_CHARS) {
    return errorResponse(
      "MESSAGE_TOO_LONG",
      `Feedback must be ${MAX_MESSAGE_CHARS} characters or fewer.`,
      413
    );
  }

  const email = typeof fields.email === "string" ? fields.email.trim() : "";
  if (email && (email.length > MAX_EMAIL_CHARS || !EMAIL_RE.test(email))) {
    return errorResponse("INVALID_EMAIL", "That email address doesn't look right.", 400);
  }

  const source =
    typeof fields.source === "string" && SOURCES.has(fields.source) ? fields.source : "modal";
  const format = shortString(fields.format);
  const page = shortString(fields.page);
  const locale = shortString(fields.locale);
  const categories = Array.isArray(fields.categories)
    ? fields.categories
        .filter((c): c is string => typeof c === "string")
        .slice(0, MAX_CATEGORIES)
        .map((c) => c.trim().slice(0, 40))
        .filter(Boolean)
        .join(", ")
    : "";

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.FEEDBACK_TO_EMAIL;
  if (!apiKey || !to) {
    // Never log the message itself.
    console.log(
      `[feedback] delivery not configured (RESEND_API_KEY / FEEDBACK_TO_EMAIL) — ` +
        `dropped a ${source} message of ${message.length} chars`
    );
    return NextResponse.json({ ok: true, delivered: false });
  }

  const from = process.env.FEEDBACK_FROM_EMAIL || "Markdown Free <onboarding@resend.dev>";
  const subject = `[markdown.free] ${source === "post_convert" ? "Post-convert feedback" : "Feedback"}${
    format ? ` · ${format}` : ""
  }`;
  const text = [
    `Source: ${source}`,
    format ? `Format: ${format}` : "",
    categories ? `Categories: ${categories}` : "",
    page ? `Page: ${page}` : "",
    locale ? `Locale: ${locale}` : "",
    email ? `Reply-to: ${email}` : "",
    "",
    message,
  ]
    .filter((line, i, arr) => line !== "" || i === arr.length - 2)
    .join("\n");

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        text,
        ...(email ? { reply_to: email } : {}),
      }),
      signal: AbortSignal.timeout(RESEND_TIMEOUT_MS),
    });

    if (!response.ok) {
      console.error(`[feedback] Resend responded ${response.status}`);
      return errorResponse("DELIVERY_FAILED", "Could not deliver your feedback. Please try again.", 502);
    }
    return NextResponse.json({ ok: true, delivered: true });
  } catch (error) {
    console.error("[feedback] delivery error:", error instanceof Error ? error.message : String(error));
    return errorResponse("DELIVERY_FAILED", "Could not deliver your feedback. Please try again.", 502);
  }
}
