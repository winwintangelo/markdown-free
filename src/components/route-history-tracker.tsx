"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const STORAGE_KEY = "mdf:prev-path";

export function RouteHistoryTracker() {
  const pathname = usePathname();
  const prevRef = useRef<string | null>(null);

  useEffect(() => {
    const prev = prevRef.current;
    if (prev && prev !== pathname) {
      try {
        sessionStorage.setItem(STORAGE_KEY, prev);
      } catch {
        // sessionStorage unavailable (private mode etc.) — silent fallback to document.referrer
      }
    }
    prevRef.current = pathname;
  }, [pathname]);

  return null;
}
