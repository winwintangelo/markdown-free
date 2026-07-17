"use client";

import Link from "next/link";
import { trackComparisonCta } from "@/lib/analytics";

/**
 * Instrumented CTA block for comparison/intent pages.
 *
 * Fires `comparison_cta_click` on click — the growth loop recovers WHICH page the
 * click came from by grouping the event by requestPath server-side (Vercel's events
 * API can group by fixed dims but not by custom props, see scripts/growth/events.mjs).
 * The host pages stay server components; only this button is a client island.
 */
export function ComparisonCta({
  href,
  label,
  sub,
  target = "converter",
  position,
  className = "",
}: {
  href: string;
  label: string;
  sub?: string;
  /** What the CTA leads to — "image" for the PNG-first (WeChat 长图) variant. */
  target?: "converter" | "image";
  /** Which block on the page, so top-vs-bottom effectiveness is comparable. */
  position: "top" | "bottom";
  className?: string;
}) {
  return (
    <div className={`not-prose my-8 text-center ${className}`}>
      <Link
        href={href}
        onClick={() => trackComparisonCta(target, position)}
        className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-800"
      >
        {label}
        <span aria-hidden="true">→</span>
      </Link>
      {sub && <p className="mt-3 text-sm text-slate-500">{sub}</p>}
    </div>
  );
}
