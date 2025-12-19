"use client";

import { useEffect, useRef, useCallback } from "react";
import {
  trackSectionVisible,
  trackScrollDepth,
  trackTimeOnPage,
  trackDragEnter,
  type SectionName,
  type ScrollDepth,
  type TimeOnPageMilestone,
} from "@/lib/analytics";

/**
 * Hook to track engagement events: scroll depth, section visibility, time on page
 * All tracking is "fire once" per session to avoid event spam
 */
export function useEngagementTracking() {
  // Track which events have been fired to avoid duplicates
  const firedEventsRef = useRef<Set<string>>(new Set());

  // Helper to fire an event only once
  const fireOnce = useCallback((key: string, callback: () => void) => {
    if (!firedEventsRef.current.has(key)) {
      firedEventsRef.current.add(key);
      callback();
    }
  }, []);

  // Track scroll depth milestones
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      
      if (docHeight <= 0) return;
      
      const scrollPercent = (scrollTop / docHeight) * 100;

      if (scrollPercent >= 25) {
        fireOnce("scroll_25", () => trackScrollDepth("25"));
      }
      if (scrollPercent >= 50) {
        fireOnce("scroll_50", () => trackScrollDepth("50"));
      }
      if (scrollPercent >= 75) {
        fireOnce("scroll_75", () => trackScrollDepth("75"));
      }
      if (scrollPercent >= 95) {
        // Use 95% to account for rounding
        fireOnce("scroll_100", () => trackScrollDepth("100"));
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [fireOnce]);

  // Track time on page milestones
  useEffect(() => {
    const milestones: { time: number; key: TimeOnPageMilestone }[] = [
      { time: 10000, key: "10s" },
      { time: 30000, key: "30s" },
      { time: 60000, key: "60s" },
    ];

    const timers = milestones.map(({ time, key }) =>
      setTimeout(() => {
        fireOnce(`time_${key}`, () => trackTimeOnPage(key));
      }, time)
    );

    return () => timers.forEach(clearTimeout);
  }, [fireOnce]);

  // Track file drag enter on the page (shows upload intent)
  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      // Only track if dragging files
      if (e.dataTransfer?.types.includes("Files")) {
        fireOnce("drag_enter", () => trackDragEnter());
      }
    };

    window.addEventListener("dragenter", handleDragEnter);
    return () => window.removeEventListener("dragenter", handleDragEnter);
  }, [fireOnce]);

  return { fireOnce };
}

/**
 * Hook to track when an element becomes visible in the viewport
 * Uses IntersectionObserver for efficient visibility detection
 */
export function useSectionVisibility(sectionName: SectionName) {
  const elementRef = useRef<HTMLElement | null>(null);
  const hasFiredRef = useRef(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || hasFiredRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasFiredRef.current) {
            hasFiredRef.current = true;
            trackSectionVisible(sectionName);
            observer.disconnect();
          }
        });
      },
      {
        threshold: 0.3, // Fire when 30% of element is visible
        rootMargin: "0px",
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [sectionName]);

  // Return a callback ref so we can use it on any element
  const setRef = useCallback((el: HTMLElement | null) => {
    elementRef.current = el;
  }, []);

  return setRef;
}
