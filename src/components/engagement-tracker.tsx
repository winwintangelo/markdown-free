"use client";

import { useEngagementTracking } from "@/hooks/use-engagement-tracking";

/**
 * Invisible component that tracks page-level engagement:
 * - Scroll depth (25%, 50%, 75%, 100%)
 * - Time on page (10s, 30s, 60s)
 * - File drag intent (user drags file over page)
 *
 * Mount this component once on pages where you want engagement tracking.
 */
export function EngagementTracker() {
  useEngagementTracking();
  return null;
}
