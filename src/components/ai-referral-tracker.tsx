"use client";

import { useEffect, useRef } from "react";
import { trackAIReferral } from "@/lib/analytics";

/**
 * AI Referral Tracker
 * 
 * Tracks when users arrive from AI assistants (ChatGPT, Claude, Perplexity, etc.)
 * This helps measure AI SEO effectiveness and understand which AI sources drive traffic.
 * 
 * Add this component to pages where you want to track AI referrals.
 */
export function AIReferralTracker() {
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    // Only track once per page load
    if (hasTrackedRef.current) return;
    hasTrackedRef.current = true;

    // Small delay to ensure analytics is loaded
    const timer = setTimeout(() => {
      trackAIReferral();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return null;
}
