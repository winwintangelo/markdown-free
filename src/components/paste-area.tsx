"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FileText, Clipboard, Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useConverter } from "@/hooks/use-converter";
import { trackUploadStart, trackSampleClick, trackUploadStart as trackUploadStartEvent } from "@/lib/analytics";
import { useSectionVisibility } from "@/hooks/use-engagement-tracking";
import { MAX_FILE_SIZE } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { cleanPastedMarkdown, CHATBOT_LABELS } from "@/lib/paste-cleanup";
import type { ChatbotSource } from "@/types";
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
    helper: "Changes here will also be used when exporting to PDF, Word (DOCX), image (PNG), EPUB or HTML.",
    tooLarge: "Content exceeds 1MB limit. It has been truncated.",
    clipboardButton: "Paste from clipboard",
    clipboardHint: "One tap — from ChatGPT, Claude, Obsidian, etc.",
    orTypeManually: "or type manually",
    pasted: "Pasted",
    pages: "pages",
    page: "page",
    editText: "Edit text",
    pasteAgain: "Paste again",
    doneEditing: "Done editing",
    clearAll: "Clear all",
    permissionDenied: "Paste blocked by browser — use the text box below",
    emptyClipboard: "Nothing to paste — copy some markdown first",
    nonTextContent: "Only text/markdown is supported",
    cleanedNotice: "Cleaned up {n} lines of chat clutter",
    detectedSource: "Looks like it came from {source}",
  },
  upload: {
    chooseFile: "choose file",
    supports: "Supports .md, .markdown, .txt • Max 1 MB",
    trySample: "Try sample file",
  },
  errors: {
    sampleError: "Unable to load sample file. Please try again.",
  },
};

type MobileState = "button" | "pasted" | "editing";

function estimatePages(text: string): number {
  return Math.max(1, Math.ceil(text.length / 1800));
}

export function PasteArea({ locale: _locale, dict = defaultDict as unknown as Dictionary }: PasteAreaProps) {
  const { state, dispatch, triggerFileUpload } = useConverter();
  const [localValue, setLocalValue] = useState("");
  const [isTruncated, setIsTruncated] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const hasTrackedPasteRef = useRef(false);
  const sectionRef = useSectionVisibility("paste");
  const isMobile = useIsMobile();

  // Mobile-specific state
  const [mobileState, setMobileState] = useState<MobileState>("button");
  const [clipboardError, setClipboardError] = useState<string | null>(null);

  // Paste cleanup: what the last paste stripped, and where it looked like it came from
  const [cleanup, setCleanup] = useState<{ removed: number; source: ChatbotSource | null } | null>(null);
  const cleanupMetaRef = useRef<{ sourceChatbot: ChatbotSource | null; cleanedLines: number } | null>(null);
  const [shakeButton, setShakeButton] = useState(false);
  const [canUseClipboard, setCanUseClipboard] = useState(false);

  // Detect Clipboard API support
  useEffect(() => {
    setCanUseClipboard(
      typeof navigator !== "undefined" &&
      !!navigator.clipboard &&
      typeof navigator.clipboard.readText === "function"
    );
  }, []);

  // Dict helpers
  const d = dict as typeof defaultDict;
  const t = {
    clipboardButton: d.paste?.clipboardButton || defaultDict.paste.clipboardButton,
    clipboardHint: d.paste?.clipboardHint || defaultDict.paste.clipboardHint,
    orTypeManually: d.paste?.orTypeManually || defaultDict.paste.orTypeManually,
    pasted: d.paste?.pasted || defaultDict.paste.pasted,
    pages: d.paste?.pages || defaultDict.paste.pages,
    page: d.paste?.page || defaultDict.paste.page,
    editText: d.paste?.editText || defaultDict.paste.editText,
    pasteAgain: d.paste?.pasteAgain || defaultDict.paste.pasteAgain,
    doneEditing: d.paste?.doneEditing || defaultDict.paste.doneEditing,
    clearAll: d.paste?.clearAll || defaultDict.paste.clearAll,
    permissionDenied: d.paste?.permissionDenied || defaultDict.paste.permissionDenied,
    emptyClipboard: d.paste?.emptyClipboard || defaultDict.paste.emptyClipboard,
    nonTextContent: d.paste?.nonTextContent || defaultDict.paste.nonTextContent,
    cleanedNotice: d.paste?.cleanedNotice || defaultDict.paste.cleanedNotice,
    detectedSource: d.paste?.detectedSource || defaultDict.paste.detectedSource,
    chooseFile: d.upload?.chooseFile || defaultDict.upload.chooseFile,
    trySample: d.upload?.trySample || defaultDict.upload.trySample,
  };

  const tooLargeMessage = d.paste?.tooLarge || defaultDict.paste.tooLarge;

  // Reset mobile state when content is cleared
  useEffect(() => {
    if (!state.content) {
      setMobileState("button");
      setClipboardError(null);
    }
  }, [state.content]);

  // Auto-focus when paste area becomes visible (desktop)
  useEffect(() => {
    if (state.isPasteAreaVisible && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [state.isPasteAreaVisible]);

  // Sync local value with state
  useEffect(() => {
    if (state.content?.source === "paste") {
      setLocalValue(state.content.content);
    } else {
      setLocalValue("");
      setIsTruncated(false);
      setCleanup(null);
      cleanupMetaRef.current = null;
      hasTrackedPasteRef.current = false;
    }
  }, [state.content]);

  // Apply a new textarea value: truncate to 1 MB, debounce the dispatch.
  // `meta` carries the paste-cleanup facts; without it the last known facts
  // stay attached while the user keeps editing the same paste.
  const applyValue = useCallback(
    (raw: string, meta?: { sourceChatbot: ChatbotSource | null; cleanedLines: number }) => {
      let value = raw;
      if (meta) cleanupMetaRef.current = meta;
      if (!value.trim()) {
        cleanupMetaRef.current = null;
        setCleanup(null);
      }
      const contentSize = new Blob([value]).size;

      if (contentSize > MAX_FILE_SIZE) {
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

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        if (value.trim() && !hasTrackedPasteRef.current) {
          trackUploadStart("paste");
          hasTrackedPasteRef.current = true;
        }
        if (!value.trim()) hasTrackedPasteRef.current = false;
        dispatch({ type: "LOAD_PASTE", content: value, ...(cleanupMetaRef.current ?? {}) });
      }, 250);
    },
    [dispatch]
  );

  // Textarea change handler (shared between desktop and mobile edit mode)
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      applyValue(e.target.value);
    },
    [applyValue]
  );

  // Paste event: strip chat-UI residue (copy buttons, role labels, <think>
  // blocks, citation glyphs) before it lands in the textarea, and remember
  // which chatbot it looked like it came from.
  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const text = e.clipboardData.getData("text/plain");
      if (!text) return;
      const result = cleanPastedMarkdown(text);
      if (!result.changed && !result.source) return;
      e.preventDefault();
      const el = e.currentTarget;
      const next = el.value.slice(0, el.selectionStart) + result.text + el.value.slice(el.selectionEnd);
      setCleanup({ removed: result.removedLines, source: result.source });
      applyValue(next, { sourceChatbot: result.source, cleanedLines: result.removedLines });
    },
    [applyValue]
  );

  const cleanupNotice =
    cleanup && (cleanup.removed > 0 || cleanup.source)
      ? [
          cleanup.removed > 0 ? t.cleanedNotice.replace("{n}", String(cleanup.removed)) : null,
          cleanup.source ? t.detectedSource.replace("{source}", CHATBOT_LABELS[cleanup.source]) : null,
        ]
          .filter(Boolean)
          .join(" · ")
      : null;

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // Sample file loader
  const handleSampleClick = useCallback(async () => {
    trackSampleClick();
    trackUploadStartEvent("sample");
    try {
      const response = await fetch("/sample.md");
      if (!response.ok) throw new Error("Failed to fetch sample file");
      const content = await response.text();
      const size = new Blob([content]).size;
      dispatch({ type: "LOAD_SAMPLE", content, size });
      setMobileState("pasted");
    } catch {
      dispatch({
        type: "SET_ERROR",
        error: {
          code: "SAMPLE_ERROR",
          message: d.errors?.sampleError || defaultDict.errors.sampleError,
        },
      });
    }
  }, [dispatch, d]);

  // Clipboard paste handler (mobile only)
  const handleClipboardPaste = useCallback(async () => {
    setClipboardError(null);
    try {
      const text = await navigator.clipboard.readText();
      if (!text || !text.trim()) {
        setShakeButton(true);
        setClipboardError(t.emptyClipboard);
        setTimeout(() => setShakeButton(false), 500);
        return;
      }
      // Load content (after stripping chat-UI residue)
      const cleaned = cleanPastedMarkdown(text);
      trackUploadStart("paste");
      hasTrackedPasteRef.current = true;
      setLocalValue(cleaned.text);
      const meta = { sourceChatbot: cleaned.source, cleanedLines: cleaned.removedLines };
      cleanupMetaRef.current = meta;
      setCleanup(cleaned.changed || cleaned.source ? { removed: cleaned.removedLines, source: cleaned.source } : null);
      dispatch({ type: "LOAD_PASTE", content: cleaned.text, ...meta });
      setMobileState("pasted");
    } catch (err) {
      if (err instanceof Error && (err.name === "NotAllowedError" || err.message.includes("permission"))) {
        setClipboardError(t.permissionDenied);
        setMobileState("editing"); // Fallback to textarea
      } else {
        setClipboardError(t.nonTextContent);
      }
    }
  }, [dispatch, t]);

  // Handle "Paste again" — reset to button state
  const handlePasteAgain = useCallback(() => {
    setLocalValue("");
    dispatch({ type: "LOAD_PASTE", content: "" });
    setMobileState("button");
    setClipboardError(null);
    setCleanup(null);
    cleanupMetaRef.current = null;
    hasTrackedPasteRef.current = false;
  }, [dispatch]);

  // On desktop, hide when toggle is off. On mobile, always show.
  if (!isMobile && !state.isPasteAreaVisible) {
    return null;
  }

  // ==================== DESKTOP LAYOUT (unchanged) ====================
  if (!isMobile) {
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
          onPaste={handlePaste}
          placeholder={dict.paste.placeholder}
          className={`h-40 w-full resize-y rounded-lg border px-3 py-2 text-sm font-mono text-slate-800 outline-none transition-colors ${
            isTruncated
              ? "border-amber-400 bg-amber-50 ring-1 ring-amber-400/60"
              : "border-slate-200 bg-slate-50 ring-emerald-500/60 focus:bg-white focus:ring-1"
          }`}
        />
        {isTruncated ? (
          <p className="mt-2 text-[11px] text-amber-600 font-medium">
            {tooLargeMessage}
          </p>
        ) : cleanupNotice ? (
          <p className="mt-2 text-[11px] font-medium text-emerald-700" data-testid="paste-cleanup-notice">
            {cleanupNotice}
          </p>
        ) : (
          <p className="mt-2 text-[11px] text-slate-500">
            {dict.paste.helper}
          </p>
        )}
      </div>
    );
  }

  // ==================== MOBILE LAYOUT ====================
  const pageCount = localValue ? estimatePages(localValue) : 0;

  return (
    <div ref={sectionRef}>
      {/* Error messages */}
      {clipboardError && mobileState !== "editing" && (
        <div
          className="mx-0 mb-2 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800"
          data-testid="clipboard-error"
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0 text-amber-500" />
          {clipboardError}
        </div>
      )}

      {/* ===== STATE: BUTTON (landing) ===== */}
      {mobileState === "button" && (
        <div data-testid="paste-button-zone">
          {canUseClipboard ? (
            <>
              <button
                type="button"
                onClick={handleClipboardPaste}
                data-testid="clipboard-paste-button"
                className={cn(
                  "flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/80 px-6 py-8 transition-all active:scale-[0.98] active:border-emerald-500 active:bg-emerald-100",
                  shakeButton && "animate-[shake_0.4s_ease-in-out]"
                )}
                style={shakeButton ? {} : undefined}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                  <Clipboard className="h-5 w-5 text-emerald-700" />
                </div>
                <span className="text-[15px] font-semibold text-emerald-700">{t.clipboardButton}</span>
                <span className="text-[11px] text-slate-400">{t.clipboardHint}</span>
              </button>
              <div className="mt-2 flex items-center justify-center gap-3 text-[11px]">
                <button
                  type="button"
                  onClick={() => { setMobileState("editing"); setClipboardError(null); }}
                  data-testid="type-manually-link"
                  className="text-slate-400 transition hover:text-slate-600"
                >
                  {t.orTypeManually}
                </button>
                <span className="text-slate-200">|</span>
                <button
                  type="button"
                  onClick={triggerFileUpload}
                  data-testid="mobile-choose-file"
                  className="text-slate-400 transition hover:text-slate-600"
                >
                  {t.chooseFile}
                </button>
                <span className="text-slate-200">|</span>
                <button
                  type="button"
                  onClick={handleSampleClick}
                  data-testid="mobile-try-sample"
                  className="font-medium text-emerald-700 hover:underline"
                >
                  {t.trySample}
                </button>
              </div>
            </>
          ) : (
            /* Clipboard API not available — show textarea directly */
            <>
              <textarea
                ref={textareaRef}
                id="paste-input"
                value={localValue}
                onChange={handleChange}
                placeholder={dict.paste.placeholder}
                className="h-52 w-full resize-y rounded-xl border-2 border-slate-200 bg-slate-50 px-3 py-2 text-sm font-mono text-slate-800 outline-none transition-colors ring-emerald-500/60 focus:bg-white focus:ring-1"
              />
              <div className="mt-2 flex items-center justify-center gap-3 text-[11px]">
                <button type="button" onClick={triggerFileUpload} data-testid="mobile-choose-file"
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm">
                  <FileText className="h-3.5 w-3.5" /> {t.chooseFile}
                </button>
                <span className="text-slate-200">or</span>
                <button type="button" onClick={handleSampleClick} data-testid="mobile-try-sample"
                  className="text-xs font-medium text-emerald-700 hover:underline">{t.trySample}</button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ===== STATE: PASTED (confirmation bar) ===== */}
      {mobileState === "pasted" && (
        <div data-testid="paste-confirmed">
          {/* Confirmation bar */}
          <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5">
            <div className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-700">
                <Check className="h-3 w-3 text-white" strokeWidth={3} />
              </div>
              <span className="text-sm font-semibold text-emerald-800">{t.pasted}</span>
            </div>
            <span className="text-xs font-medium text-emerald-700">
              ~{pageCount} {pageCount === 1 ? t.page : t.pages}
            </span>
          </div>
          {cleanupNotice && (
            <p className="mt-1.5 text-center text-[11px] font-medium text-emerald-700" data-testid="paste-cleanup-notice">
              {cleanupNotice}
            </p>
          )}
          {/* Utility links */}
          <div className="mt-1.5 flex items-center justify-center gap-3 text-[11px]">
            <button
              type="button"
              onClick={() => setMobileState("editing")}
              data-testid="edit-text-link"
              className="font-medium text-emerald-700 hover:underline"
            >
              {t.editText}
            </button>
            <span className="text-slate-200">|</span>
            <button
              type="button"
              onClick={handlePasteAgain}
              data-testid="paste-again-link"
              className="font-medium text-emerald-700 hover:underline"
            >
              {t.pasteAgain}
            </button>
          </div>
        </div>
      )}

      {/* ===== STATE: EDITING (textarea with content) ===== */}
      {mobileState === "editing" && (
        <div data-testid="paste-editing">
          {/* Error message for permission denied */}
          {clipboardError && (
            <div className="mb-2 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800"
              data-testid="clipboard-error">
              <AlertCircle className="h-4 w-4 flex-shrink-0 text-amber-500" />
              {clipboardError}
            </div>
          )}
          <textarea
            ref={textareaRef}
            id="paste-input"
            value={localValue}
            onChange={handleChange}
            onPaste={handlePaste}
            placeholder={dict.paste.placeholder}
            autoFocus
            className={`h-52 w-full resize-y rounded-xl border-2 px-3 py-2 text-sm font-mono text-slate-800 outline-none transition-colors ${
              isTruncated
                ? "border-amber-400 bg-amber-50 ring-1 ring-amber-400/60"
                : "border-slate-200 bg-slate-50 ring-emerald-500/60 focus:bg-white focus:ring-1"
            }`}
          />
          {isTruncated && (
            <p className="mt-1 text-[11px] font-medium text-amber-600">{tooLargeMessage}</p>
          )}
          {!isTruncated && cleanupNotice && (
            <p className="mt-1 text-[11px] font-medium text-emerald-700" data-testid="paste-cleanup-notice">{cleanupNotice}</p>
          )}
          <div className="mt-1.5 flex items-center justify-center gap-3 text-[11px]">
            {localValue.trim() && (
              <>
                <button
                  type="button"
                  onClick={() => setMobileState("pasted")}
                  data-testid="done-editing-link"
                  className="font-medium text-emerald-700 hover:underline"
                >
                  {t.doneEditing}
                </button>
                <span className="text-slate-200">|</span>
              </>
            )}
            <button
              type="button"
              onClick={handlePasteAgain}
              data-testid="clear-all-link"
              className="text-slate-400 transition hover:text-slate-600"
            >
              {t.clearAll}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
