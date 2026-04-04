"use client";

import { useEffect, useRef } from "react";
import { trackInternalReferral } from "@/lib/analytics";

/**
 * Internal Referral Tracker
 *
 * Tracks when users arrive at the home/converter page from an internal intent page
 * (e.g., /readme-to-pdf, /it/convertire-markdown-pdf).
 * Uses document.referrer — no UTM params needed, zero SEO impact.
 *
 * Add this component to home pages where you want to track internal referrals.
 */
export function InternalReferralTracker() {
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    if (hasTrackedRef.current) return;
    hasTrackedRef.current = true;

    const timer = setTimeout(() => {
      trackInternalReferral();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return null;
}
