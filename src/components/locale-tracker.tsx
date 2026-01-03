"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackLocalePageView, type SupportedLocale } from "@/lib/analytics";

interface LocaleTrackerProps {
  locale: SupportedLocale;
}

/**
 * Tracks page views with locale information.
 * Fires once per page navigation to supplement Umami's automatic pageview
 * with locale context for language-specific analytics.
 */
export function LocaleTracker({ locale }: LocaleTrackerProps) {
  const pathname = usePathname();
  const hasTrackedRef = useRef<string | null>(null);

  useEffect(() => {
    // Only track once per unique path
    if (hasTrackedRef.current !== pathname) {
      hasTrackedRef.current = pathname;
      
      // Normalize the page path (remove locale prefix for consistency)
      const page = pathname.replace(/^\/(it|es)/, "") || "/";
      trackLocalePageView(locale, page);
    }
  }, [locale, pathname]);

  return null;
}

