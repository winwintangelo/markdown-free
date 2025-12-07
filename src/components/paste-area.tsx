"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useConverter } from "@/hooks/use-converter";

export function PasteArea() {
  const { state, dispatch } = useConverter();
  const [localValue, setLocalValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-focus when paste area becomes visible
  useEffect(() => {
    if (state.isPasteAreaVisible && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [state.isPasteAreaVisible]);

  // Sync local value with state when switching to paste mode
  useEffect(() => {
    if (state.content?.source === "paste") {
      setLocalValue(state.content.content);
    } else if (!state.content) {
      setLocalValue("");
    }
  }, [state.content]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setLocalValue(value);

      // Debounce the state update
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
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
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <label
        htmlFor="paste-input"
        className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500"
      >
        Pasted Markdown
      </label>
      <textarea
        ref={textareaRef}
        id="paste-input"
        value={localValue}
        onChange={handleChange}
        placeholder="Paste your Markdown here…"
        className="h-40 w-full resize-y rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-mono text-slate-800 outline-none ring-emerald-500/60 focus:bg-white focus:ring-1 transition-colors"
      />
      <p className="mt-2 text-[11px] text-slate-500">
        Changes here will also be used when exporting to PDF, TXT or HTML.
      </p>
    </div>
  );
}

