"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useConverter } from "@/hooks/use-converter";
import { trackUploadStart } from "@/lib/analytics";
import { useSectionVisibility } from "@/hooks/use-engagement-tracking";
import { MAX_FILE_SIZE } from "@/lib/utils";
import type { Locale, Dictionary } from "@/i18n";

interface PasteAreaProps {
  locale?: Locale;
  dict?: Dictionary;
}

// Default dictionary values for backward compatibility
const defaultDict = {
  paste: {
    label: "Pasted Markdown",
    placeholder: "Paste your Markdown here…",
    helper: "Changes here will also be used when exporting to PDF, DOCX, TXT or HTML.",
    tooLarge: "Content exceeds 1MB limit. It has been truncated.",
  }
};

export function PasteArea({ locale: _locale, dict = defaultDict as unknown as Dictionary }: PasteAreaProps) {
  const { state, dispatch } = useConverter();
  const [localValue, setLocalValue] = useState("");
  const [isTruncated, setIsTruncated] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const hasTrackedPasteRef = useRef(false);
  const sectionRef = useSectionVisibility("paste");

  // Get tooLarge message from dict or use default
  const tooLargeMessage = (dict as typeof defaultDict).paste?.tooLarge || defaultDict.paste.tooLarge;

  // Auto-focus when paste area becomes visible
  useEffect(() => {
    if (state.isPasteAreaVisible && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [state.isPasteAreaVisible]);

  // Sync local value with state when switching modes
  // Clear paste area when file is uploaded or sample is loaded
  useEffect(() => {
    if (state.content?.source === "paste") {
      setLocalValue(state.content.content);
    } else {
      // Clear paste area when content is null OR when source is file/sample
      setLocalValue("");
      setIsTruncated(false);
      hasTrackedPasteRef.current = false;
    }
  }, [state.content]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      let value = e.target.value;

      // Check content size (in bytes)
      const contentSize = new Blob([value]).size;

      // If content exceeds 1MB, truncate it
      if (contentSize > MAX_FILE_SIZE) {
        // Truncate to approximately 1MB (may not be exact due to UTF-8 encoding)
        // We use a binary search approach to find the right truncation point
        let low = 0;
        let high = value.length;
        while (low < high) {
          const mid = Math.floor((low + high + 1) / 2);
          if (new Blob([value.slice(0, mid)]).size <= MAX_FILE_SIZE) {
            low = mid;
          } else {
            high = mid - 1;
          }
        }
        value = value.slice(0, low);
        setIsTruncated(true);
      } else {
        setIsTruncated(false);
      }

      setLocalValue(value);

      // Debounce the state update
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        // Track paste start once when content becomes non-empty
        if (value.trim() && !hasTrackedPasteRef.current) {
          trackUploadStart("paste");
          hasTrackedPasteRef.current = true;
        }
        // Reset tracking flag when content is cleared
        if (!value.trim()) {
          hasTrackedPasteRef.current = false;
        }
        dispatch({ type: "LOAD_PASTE", content: value });
      }, 250);
    },
    [dispatch]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  if (!state.isPasteAreaVisible) {
    return null;
  }

  return (
    <div ref={sectionRef} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <label
        htmlFor="paste-input"
        className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500"
      >
        {dict.paste.label}
      </label>
      <textarea
        ref={textareaRef}
        id="paste-input"
        value={localValue}
        onChange={handleChange}
        placeholder={dict.paste.placeholder}
        className={`h-40 w-full resize-y rounded-lg border px-3 py-2 text-sm font-mono text-slate-800 outline-none transition-colors ${
          isTruncated
            ? "border-amber-400 bg-amber-50 ring-1 ring-amber-400/60"
            : "border-slate-200 bg-slate-50 ring-emerald-500/60 focus:bg-white focus:ring-1"
        }`}
      />
      {isTruncated ? (
        <p className="mt-2 text-[11px] text-amber-600 font-medium">
          ⚠️ {tooLargeMessage}
        </p>
      ) : (
        <p className="mt-2 text-[11px] text-slate-500">
          {dict.paste.helper}
        </p>
      )}
    </div>
  );
}
