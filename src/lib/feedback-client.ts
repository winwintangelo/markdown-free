/**
 * Client for the first-party feedback endpoint (src/app/api/feedback/route.ts).
 *
 * Feedback text and any email the user volunteers go HERE and nowhere else —
 * never into analytics events (privacy policy: no personal information or
 * free text reaches the analytics provider).
 */

export type FeedbackSource = "modal" | "post_convert";

export interface FeedbackPayload {
  message: string;
  email?: string;
  source: FeedbackSource;
  /** Export format the feedback is about (post-convert prompt). */
  format?: string;
  /** Selected issue chips (post-convert prompt). */
  categories?: string[];
  /** Page path the feedback was sent from. */
  page?: string;
  locale?: string;
}

export interface FeedbackResult {
  /** The endpoint accepted the message. */
  ok: boolean;
  /** The message reached the inbox (false when delivery is not configured). */
  delivered: boolean;
}

export async function sendFeedback(payload: FeedbackPayload): Promise<FeedbackResult> {
  const response = await fetch("/api/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    return { ok: false, delivered: false };
  }

  const data = (await response.json().catch(() => ({}))) as { delivered?: unknown };
  return { ok: true, delivered: data.delivered === true };
}
