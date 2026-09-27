"use client";

import { useEffect, useRef } from "react";

/** Share of the element that must be on screen. */
const VISIBLE_RATIO = 0.5;
/** How long it must stay there, in a visible tab. */
const DWELL_MS = 1000;

/**
 * Calls `onSeen` once, when at least half of the element has stayed on screen
 * for a second while the tab is visible. This is the exposure definition for
 * the feedback prompts (marketing review): a prompt rendered in a hidden tab or
 * below the fold was not seen. It proves the prompt could be seen, not that
 * anyone read it.
 */
export function useSeenOnce<T extends Element>(onSeen: () => void) {
  const ref = useRef<T>(null);
  const callbackRef = useRef(onSeen);
  callbackRef.current = onSeen;

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === "undefined") return;

    let inView = false;
    let done = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const stop = () => {
      if (timer) clearTimeout(timer);
      timer = null;
    };
    const evaluate = () => {
      if (done) return;
      if (inView && document.visibilityState === "visible") {
        if (!timer) {
          timer = setTimeout(() => {
            done = true;
            observer.disconnect();
            callbackRef.current();
          }, DWELL_MS);
        }
      } else {
        stop();
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        inView = entries.some((entry) => entry.intersectionRatio >= VISIBLE_RATIO);
        evaluate();
      },
      { threshold: [0, VISIBLE_RATIO, 1] }
    );
    observer.observe(element);
    document.addEventListener("visibilitychange", evaluate);

    return () => {
      stop();
      observer.disconnect();
      document.removeEventListener("visibilitychange", evaluate);
    };
  }, []);

  return ref;
}
