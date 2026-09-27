/**
 * Browser-side calls for the vote board's follow-up forms: "Get updates"
 * emails (/api/notify) and typed feedback (/api/ideas). Every form carries the
 * same two anti-bot fields: a honeypot the person never sees, and the time
 * since the form appeared. Neither the address nor the text reaches analytics.
 */

import type { FeatureKey, IdeaKind } from "@/lib/feature-teaser";

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** "ok", "email" (the server rejected the address) or "save" (anything else). */
export type SubmitResult = "ok" | "email" | "save";

export async function postNotify(input: {
  email: string;
  features: FeatureKey[];
  locale: string;
  website: string;
  elapsedMs: number;
}): Promise<SubmitResult> {
  try {
    const response = await fetch("/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (response.ok) return "ok";
    const data = (await response.json().catch(() => ({}))) as { error?: string };
    return data.error === "INVALID_EMAIL" ? "email" : "save";
  } catch {
    return "save";
  }
}

export async function postIdea(input: {
  kind: IdeaKind;
  feature: FeatureKey | null;
  text: string;
  locale: string;
  website: string;
  elapsedMs: number;
}): Promise<boolean> {
  try {
    const response = await fetch("/api/ideas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    return response.ok;
  } catch {
    return false;
  }
}
