"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Loader2, AlertCircle, X, Share, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useConverter } from "@/hooks/use-converter";
import { exportTxt } from "@/lib/export-txt";
import { exportHtml } from "@/lib/export-html";
import { exportPdf, PdfExportResult } from "@/lib/export-pdf";
import { generatePdfBlob } from "@/lib/export-pdf";
import { exportDocx, DocxExportResult } from "@/lib/export-docx";
import { downloadBlob } from "@/lib/download";
import { generateDocxBlob } from "@/lib/export-docx";
import { markdownToHtml } from "@/lib/markdown";
import {
  trackConvertSuccess,
  trackConvertError,
  trackConvertAbandoned,
  trackExportHover,
  trackExportTriggerUpload,
  trackLocaleConversion,
  trackShareFile,
  type ExportFormat as AnalyticsExportFormat,
  type UploadSource,
  type SupportedLocale,
  type ConvertErrorCode,
} from "@/lib/analytics";
import { useSectionVisibility } from "@/hooks/use-engagement-tracking";
import { PostConvertFeedback } from "./post-convert-feedback";
import type { Locale, Dictionary } from "@/i18n";

import { useIsMobile } from "@/hooks/use-mobile";
import { useWebShare } from "@/hooks/use-web-share";

type ExportFormat = "pdf" | "txt" | "html" | "docx";

interface ExportError {
  format: ExportFormat;
  code: string;
  message: string;
  retryable: boolean;
}

interface ExportRowProps {
  locale?: Locale;
  dict?: Dictionary;
}

// Default dictionary values for backward compatibility
const defaultDict = {
  export: {
    toPdf: "To PDF",
    toTxt: "To TXT",
    toHtml: "To HTML",
    toDocx: "To DOCX",
    privacy: "Files are processed temporarily for conversion and not stored.",
    generating: "Generating PDF...",
    generatingDocx: "Generating DOCX...",
    selectFileHint: "Select a Markdown file to export",
    uploadOrPaste: "Upload or paste to continue",
    sharePdf: "Share as PDF",
    shareDocx: "Share as DOCX",
    savePdf: "Save PDF",
    saveDocx: "Save DOCX",
    more: "More formats",
  },
  errors: {
    pdfTimeout: "PDF generation timed out. Please try again.",
    pdfError: "Something went wrong. Please try again.",
    tryAgain: "Try Again"
  }
};

export function ExportRow({ locale = "en", dict = defaultDict as unknown as Dictionary }: ExportRowProps) {
  const { state, triggerFileUpload } = useConverter();
  const [loadingFormat, setLoadingFormat] = useState<ExportFormat | null>(null);
  const [error, setError] = useState<ExportError | null>(null);
  const [renderedHtml, setRenderedHtml] = useState<string>("");
  const [uploadHint, setUploadHint] = useState<string | null>(null);
  const [lastSuccessFormat, setLastSuccessFormat] = useState<ExportFormat | null>(null);
  const [loadingShareFormat, setLoadingShareFormat] = useState<"pdf" | "docx" | null>(null);
  const [pendingShare, setPendingShare] = useState<{
    blob: Blob;
    filename: string;
    format: "pdf" | "docx";
  } | null>(null);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const hoveredFormatsRef = useRef<Set<ExportFormat>>(new Set());
  const hintTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sectionRef = useSectionVisibility("export");

  const isMobile = useIsMobile();
  const { canShareFiles, canSharePdf, canShareDocx, shareFile } = useWebShare();
  const showShareUI = isMobile && canShareFiles;

  // Pre-generated blob cache for instant sharing (mobile only)
  const cachedBlobsRef = useRef<{
    pdf?: { blob: Blob; filename: string };
    docx?: { blob: Blob; filename: string };
  }>({});
  const preGenControllerRef = useRef<AbortController | null>(null);

  // Content is ready for export
  const hasContent = state.content && state.status === "ready";
  // Button is in loading state
  const isLoading = loadingFormat !== null || loadingShareFormat !== null;

  // Track hover on buttons when no content (shows interest)
  const handleButtonHover = useCallback((format: ExportFormat) => {
    if (!hasContent && !hoveredFormatsRef.current.has(format)) {
      hoveredFormatsRef.current.add(format);
      trackExportHover(format);
    }
  }, [hasContent]);

  // Clear hint after timeout
  useEffect(() => {
    return () => {
      if (hintTimeoutRef.current) {
        clearTimeout(hintTimeoutRef.current);
      }
    };
  }, []);

  // Clear hint when content is loaded
  useEffect(() => {
    if (hasContent && uploadHint) {
      setUploadHint(null);
    }
  }, [hasContent, uploadHint]);

  // Close "More" menu when clicking outside
  useEffect(() => {
    if (!moreMenuOpen) return;
    function handleClick(e: MouseEvent) {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setMoreMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [moreMenuOpen]);

  // Pre-render HTML when content changes (for HTML export)
  useEffect(() => {
    if (state.content) {
      markdownToHtml(state.content.content).then(setRenderedHtml);
    } else {
      setRenderedHtml("");
    }
  }, [state.content]);

  // Pre-generate PDF and DOCX blobs when content loads (mobile share only)
  // This enables instant navigator.share() on tap — no async gap, no activation expiry
  useEffect(() => {
    if (!showShareUI || !state.content) {
      cachedBlobsRef.current = {};
      return;
    }

    // Abort any previous pre-generation
    preGenControllerRef.current?.abort();
    const controller = new AbortController();
    preGenControllerRef.current = controller;
    cachedBlobsRef.current = {};

    const content = state.content.content;
    const filename = state.content.filename;

    // Pre-generate only formats that can be shared (no point caching unshareable formats)
    if (canSharePdf) {
      generatePdfBlob(content, filename, controller.signal)
        .then((result) => {
          if (!controller.signal.aborted && result.success && result.blob && result.filename) {
            cachedBlobsRef.current.pdf = { blob: result.blob, filename: result.filename };
          }
        })
        .catch(() => {});
    }

    if (canShareDocx) {
      generateDocxBlob(content, filename, controller.signal)
        .then((result) => {
          if (!controller.signal.aborted && result.success && result.blob && result.filename) {
            cachedBlobsRef.current.docx = { blob: result.blob, filename: result.filename };
          }
        })
        .catch(() => {});
    }

    return () => controller.abort();
  }, [showShareUI, canSharePdf, canShareDocx, state.content]);

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
      preGenControllerRef.current?.abort();
    };
  }, []);

  // Track conversion abandonment (user closes tab during PDF generation)
  useEffect(() => {
    if (loadingFormat !== "pdf" || !state.content) return;

    const source: UploadSource = state.content.source === "file" ? "file" : "paste";

    const handleBeforeUnload = () => {
      // User is leaving while PDF is generating - track abandonment
      trackConvertAbandoned("pdf", source);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [loadingFormat, state.content]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Map server error codes to analytics codes
  const mapErrorCode = useCallback((code: string): ConvertErrorCode => {
    switch (code) {
      case "GENERATION_TIMEOUT":
        return "pdf_timeout";
      case "GENERATION_FAILED":
      case "SERVER_ERROR":
        return "pdf_server_error";
      case "NETWORK_ERROR":
        return "network_error";
      case "ABORTED":
        return "aborted";
      default:
        return "unknown";
    }
  }, []);

  const handleExport = useCallback(
    async (format: ExportFormat) => {
      // If no content, trigger file upload instead of exporting
      if (!state.content) {
        // Track that export button triggered upload flow
        trackExportTriggerUpload(format as AnalyticsExportFormat);

        // Trigger file picker
        triggerFileUpload();

        // Show hint message
        setUploadHint(dict.export.selectFileHint || defaultDict.export.selectFileHint);

        // Auto-dismiss hint after 5 seconds
        if (hintTimeoutRef.current) {
          clearTimeout(hintTimeoutRef.current);
        }
        hintTimeoutRef.current = setTimeout(() => {
          setUploadHint(dict.export.uploadOrPaste || defaultDict.export.uploadOrPaste);
          // Second hint stays for another 5 seconds then clears
          hintTimeoutRef.current = setTimeout(() => {
            setUploadHint(null);
          }, 5000);
        }, 5000);

        return;
      }

      // Determine source for analytics
      const source: UploadSource = state.content.source === "file" ? "file" : "paste";

      // Clear any previous error, hint, and feedback widget
      setError(null);
      setUploadHint(null);
      setLastSuccessFormat(null);
      setLoadingFormat(format);

      try {
        if (format === "txt") {
          exportTxt(state.content.content, state.content.filename);
          trackConvertSuccess(format as AnalyticsExportFormat, source);
          trackLocaleConversion(locale as SupportedLocale, format);
          setLastSuccessFormat(format);
        } else if (format === "html") {
          const html = renderedHtml || (await markdownToHtml(state.content.content));
          exportHtml(html, state.content.filename);
          trackConvertSuccess(format as AnalyticsExportFormat, source);
          trackLocaleConversion(locale as SupportedLocale, format);
          setLastSuccessFormat(format);
        } else if (format === "pdf") {
          // Create abort controller for PDF request
          abortControllerRef.current = new AbortController();

          const result: PdfExportResult = await exportPdf(
            state.content.content,
            state.content.filename,
            abortControllerRef.current.signal
          );

          if (result.success) {
            trackConvertSuccess(format as AnalyticsExportFormat, source);
            trackLocaleConversion(locale as SupportedLocale, format);
            setLastSuccessFormat(format);
          } else if (result.error) {
            trackConvertError(format as AnalyticsExportFormat, mapErrorCode(result.error.code));
            setError({
              format: "pdf",
              code: result.error.code,
              message: result.error.message,
              retryable: result.error.retryable,
            });
          }
        } else if (format === "docx") {
          // Create abort controller for DOCX request
          abortControllerRef.current = new AbortController();

          const result: DocxExportResult = await exportDocx(
            state.content.content,
            state.content.filename,
            abortControllerRef.current.signal
          );

          if (result.success) {
            trackConvertSuccess(format as AnalyticsExportFormat, source);
            trackLocaleConversion(locale as SupportedLocale, format);
            setLastSuccessFormat(format);
          } else if (result.error) {
            trackConvertError(format as AnalyticsExportFormat, mapErrorCode(result.error.code));
            setError({
              format: "docx",
              code: result.error.code,
              message: result.error.message,
              retryable: result.error.retryable,
            });
          }
        }
      } catch (err) {
        console.error(`Export error (${format}):`, err);
        trackConvertError(format as AnalyticsExportFormat, "unknown");
        setError({
          format,
          code: "UNKNOWN_ERROR",
          message: dict.errors.pdfError,
          retryable: true,
        });
      } finally {
        setLoadingFormat(null);
        abortControllerRef.current = null;
      }
    },
    [state.content, renderedHtml, dict.errors.pdfError, dict.export.selectFileHint, dict.export.uploadOrPaste, locale, triggerFileUpload, mapErrorCode]
  );

  // Share handler: instant share from cache, or fallback to two-step flow
  const handleShareGenerate = useCallback(
    async (format: "pdf" | "docx") => {
      if (!state.content) {
        trackExportTriggerUpload(format as AnalyticsExportFormat);
        triggerFileUpload();
        setUploadHint(dict.export.selectFileHint || defaultDict.export.selectFileHint);
        if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
        hintTimeoutRef.current = setTimeout(() => {
          setUploadHint(dict.export.uploadOrPaste || defaultDict.export.uploadOrPaste);
          hintTimeoutRef.current = setTimeout(() => setUploadHint(null), 5000);
        }, 5000);
        return;
      }

      const source: UploadSource = state.content.source === "file" ? "file" : "paste";

      // FAST PATH: if blob was pre-generated, share instantly (within user activation)
      const cached = cachedBlobsRef.current[format];
      if (cached) {
        try {
          const mimeType = format === "pdf" ? "application/pdf" : "application/octet-stream";
          const file = new File([cached.blob], cached.filename, { type: mimeType });
          await navigator.share({ files: [file] });
          trackShareFile(format as AnalyticsExportFormat, source);
          trackLocaleConversion(locale as SupportedLocale, format);
          setLastSuccessFormat(format);
          return;
        } catch (err) {
          if (err instanceof Error && err.name === "AbortError") return; // user cancelled
          // Share API rejected — fall back to download (user still gets the file)
          downloadBlob(cached.blob, cached.filename);
          trackConvertSuccess(format as AnalyticsExportFormat, source);
          trackLocaleConversion(locale as SupportedLocale, format);
          setLastSuccessFormat(format);
          return;
        }
      }

      // SLOW PATH: blob not cached yet — generate and show "Tap to share"
      setError(null);
      setUploadHint(null);
      setLastSuccessFormat(null);
      setPendingShare(null);
      setLoadingShareFormat(format);

      try {
        abortControllerRef.current = new AbortController();

        const result = format === "pdf"
          ? await generatePdfBlob(state.content.content, state.content.filename, abortControllerRef.current.signal)
          : await generateDocxBlob(state.content.content, state.content.filename, abortControllerRef.current.signal);

        if (result.success && result.blob && result.filename) {
          // Cache for next time
          cachedBlobsRef.current[format] = { blob: result.blob, filename: result.filename };
          // Store blob — user must tap again to trigger share (browser requires fresh activation)
          setPendingShare({ blob: result.blob, filename: result.filename, format });
        } else if (result.error) {
          trackConvertError(format as AnalyticsExportFormat, mapErrorCode(result.error.code));
          setError({
            format,
            code: result.error.code,
            message: result.error.message,
            retryable: result.error.retryable,
          });
        }
      } catch (err) {
        console.error(`Share error (${format}):`, err);
        trackConvertError(format as AnalyticsExportFormat, "unknown");
        setError({
          format,
          code: "UNKNOWN_ERROR",
          message: dict.errors.pdfError,
          retryable: true,
        });
      } finally {
        setLoadingShareFormat(null);
        abortControllerRef.current = null;
      }
    },
    [state.content, dict.errors.pdfError, dict.export.selectFileHint, dict.export.uploadOrPaste, triggerFileUpload, mapErrorCode]
  );

  // Step 2: User taps "Tap to share" — triggers navigator.share() with fresh activation
  // IMPORTANT: Call navigator.share() directly and synchronously from the click handler
  // to preserve transient user activation. Do NOT go through useCallback/hook indirection.
  const handleShareSend = useCallback(
    async () => {
      if (!pendingShare || !state.content) return;

      const source: UploadSource = state.content.source === "file" ? "file" : "paste";

      try {
        const mimeType = pendingShare.blob.type === "application/pdf"
          ? "application/pdf"
          : "application/octet-stream";
        const file = new File([pendingShare.blob], pendingShare.filename, { type: mimeType });
        await navigator.share({ files: [file] });
        trackShareFile(pendingShare.format as AnalyticsExportFormat, source);
        trackLocaleConversion(locale as SupportedLocale, pendingShare.format);
        setLastSuccessFormat(pendingShare.format);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          // User cancelled — do nothing
        } else {
          // Share API rejected — fall back to download (user still gets the file)
          downloadBlob(pendingShare.blob, pendingShare.filename);
          trackConvertSuccess(pendingShare.format as AnalyticsExportFormat, source);
          trackLocaleConversion(locale as SupportedLocale, pendingShare.format);
          setLastSuccessFormat(pendingShare.format);
        }
      } finally {
        setPendingShare(null);
      }
    },
    [pendingShare, state.content, locale]
  );

  // Clear pending share when content changes
  useEffect(() => {
    setPendingShare(null);
  }, [state.content]);

  const handleRetry = useCallback(() => {
    if (error) {
      const format = error.format;
      clearError();
      handleExport(format);
    }
  }, [error, clearError, handleExport]);

  // Share icon SVG for mobile buttons
  const ShareIcon = () => (
    <Share className="h-3.5 w-3.5" />
  );

  return (
    <div className="space-y-3">
      {/* Error Banner */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">
              {error.format.toUpperCase()} generation failed
            </p>
            <p className="mt-1 text-xs text-red-600">{error.message}</p>
            {error.retryable && (
              <button
                type="button"
                onClick={handleRetry}
                className="mt-2 inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700 transition hover:bg-red-200"
              >
                {dict.errors.tryAgain}
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={clearError}
            className="flex-shrink-0 rounded-full p-1 text-red-400 transition hover:bg-red-100 hover:text-red-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Upload Hint (shown when export clicked with no content) */}
      {uploadHint && (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">
          <span>{uploadHint}</span>
        </div>
      )}

      {/* Export Buttons Row */}
      {/* On mobile with no content: show compact placeholder */}
      {isMobile && !hasContent ? (
        <div ref={sectionRef} className="flex items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-3" data-testid="mobile-export-placeholder">
          <p className="text-xs text-slate-400">
            {dict.export.uploadOrPaste || defaultDict.export.uploadOrPaste}
          </p>
        </div>
      ) : (
      <div ref={sectionRef} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        {showShareUI ? (
          /* ===== MOBILE SHARE-FIRST LAYOUT ===== */
          <div className="flex w-full flex-col gap-2">
            {/* Primary: Share buttons or "Tap to share" */}
            {pendingShare ? (
              /* File is ready — user taps to trigger native share sheet */
              <button
                type="button"
                onClick={handleShareSend}
                data-testid="share-send-button"
                className={cn(
                  "inline-flex w-full items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-semibold shadow-sm transition animate-pulse",
                  pendingShare.format === "pdf"
                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                )}
              >
                <ShareIcon />
                Tap to share {pendingShare.filename}
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleShareGenerate("pdf")}
                  data-testid="share-pdf-button"
                  className={cn(
                    "inline-flex flex-1 items-center justify-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold shadow-sm transition",
                    loadingShareFormat === "pdf"
                      ? "cursor-wait bg-emerald-500 text-white"
                      : "bg-emerald-600 text-white hover:bg-emerald-700"
                  )}
                >
                  {loadingShareFormat === "pdf" ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <ShareIcon />
                  )}
                  {loadingShareFormat === "pdf"
                    ? dict.export.generating
                    : (dict.export.sharePdf || defaultDict.export.sharePdf)}
                </button>

                {canShareDocx ? (
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleShareGenerate("docx")}
                    data-testid="share-docx-button"
                    className={cn(
                      "inline-flex flex-1 items-center justify-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold shadow-sm transition",
                      loadingShareFormat === "docx"
                        ? "cursor-wait bg-blue-500 text-white"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    )}
                  >
                    {loadingShareFormat === "docx" ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <ShareIcon />
                    )}
                    {loadingShareFormat === "docx"
                      ? (dict.export.generatingDocx || defaultDict.export.generatingDocx)
                      : (dict.export.shareDocx || defaultDict.export.shareDocx)}
                  </button>
                ) : (
                  /* DOCX sharing not supported — show download button instead */
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleExport("docx")}
                    data-testid="download-docx-button"
                    className={cn(
                      "inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold shadow-sm transition",
                      loadingFormat === "docx"
                        ? "cursor-wait border-blue-200 bg-blue-100 text-blue-600"
                        : "border-blue-200 bg-blue-50 text-blue-700 hover:border-blue-300 hover:bg-blue-100"
                    )}
                  >
                    {loadingFormat === "docx" && (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    )}
                    {loadingFormat === "docx"
                      ? (dict.export.generatingDocx || defaultDict.export.generatingDocx)
                      : (dict.export.toDocx || defaultDict.export.toDocx)}
                  </button>
                )}
              </div>
            )}

            {/* More options button */}
            <div ref={moreMenuRef} className="relative flex items-center justify-center">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                data-testid="more-options-button"
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-500 shadow-sm transition hover:border-slate-300 hover:bg-white"
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
                {dict.export.more || defaultDict.export.more}
              </button>

              {/* More options dropdown */}
              {moreMenuOpen && (
                <div className="absolute bottom-full left-1/2 z-50 mb-1 -translate-x-1/2 rounded-lg border border-slate-200 bg-white py-1 shadow-lg" data-testid="more-options-menu">
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => { handleExport("pdf"); setMoreMenuOpen(false); }}
                    data-testid="save-pdf-button"
                    className="flex w-full items-center px-4 py-2 text-xs text-slate-600 transition hover:bg-slate-50"
                  >
                    {dict.export.savePdf || defaultDict.export.savePdf}
                  </button>
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => { handleExport("docx"); setMoreMenuOpen(false); }}
                    data-testid="save-docx-button"
                    className="flex w-full items-center px-4 py-2 text-xs text-slate-600 transition hover:bg-slate-50"
                  >
                    {dict.export.saveDocx || defaultDict.export.saveDocx}
                  </button>
                  <div className="my-1 border-t border-slate-100" />
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => { handleExport("txt"); setMoreMenuOpen(false); }}
                    className="flex w-full items-center px-4 py-2 text-xs text-slate-600 transition hover:bg-slate-50"
                  >
                    {dict.export.toTxt}
                  </button>
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => { handleExport("html"); setMoreMenuOpen(false); }}
                    className="flex w-full items-center px-4 py-2 text-xs text-slate-600 transition hover:bg-slate-50"
                  >
                    {dict.export.toHtml}
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ===== DESKTOP / FALLBACK LAYOUT (unchanged) ===== */
          <>
            <div className="flex flex-wrap gap-2">
              {/* Primary: To PDF - Always active, triggers file picker if no content */}
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleExport("pdf")}
                onMouseEnter={() => handleButtonHover("pdf")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold shadow-sm transition",
                  loadingFormat === "pdf"
                    ? "cursor-wait bg-emerald-500 text-white"
                    : "bg-emerald-600 text-white hover:bg-emerald-700"
                )}
              >
                {loadingFormat === "pdf" && (
                  <Loader2 className="h-3 w-3 animate-spin" />
                )}
                {loadingFormat === "pdf" ? dict.export.generating : dict.export.toPdf}
              </button>

              {/* To DOCX - Right after PDF, blue styling */}
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleExport("docx")}
                onMouseEnter={() => handleButtonHover("docx")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold shadow-sm transition",
                  loadingFormat === "docx"
                    ? "cursor-wait border-blue-200 bg-blue-100 text-blue-600"
                    : "border-blue-200 bg-blue-50 text-blue-700 hover:border-blue-300 hover:bg-blue-100"
                )}
              >
                {loadingFormat === "docx" && (
                  <Loader2 className="h-3 w-3 animate-spin" />
                )}
                {loadingFormat === "docx"
                  ? (dict.export.generatingDocx || defaultDict.export.generatingDocx)
                  : (dict.export.toDocx || defaultDict.export.toDocx)}
              </button>

              {/* Secondary: To TXT */}
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleExport("txt")}
                onMouseEnter={() => handleButtonHover("txt")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold shadow-sm transition",
                  loadingFormat === "txt"
                    ? "cursor-wait border-slate-200 bg-slate-100 text-slate-500"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white"
                )}
              >
                {loadingFormat === "txt" && (
                  <Loader2 className="h-3 w-3 animate-spin" />
                )}
                {dict.export.toTxt}
              </button>

              {/* Secondary: To HTML */}
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleExport("html")}
                onMouseEnter={() => handleButtonHover("html")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold shadow-sm transition",
                  loadingFormat === "html"
                    ? "cursor-wait border-slate-200 bg-slate-100 text-slate-500"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white"
                )}
              >
                {loadingFormat === "html" && (
                  <Loader2 className="h-3 w-3 animate-spin" />
                )}
                {dict.export.toHtml}
              </button>
            </div>

            {/* Privacy notice */}
            <p className="text-[11px] text-slate-500">
              {dict.export.privacy}
            </p>
          </>
        )}
      </div>
      )}

      {/* Loading message for PDF */}
      {(loadingFormat === "pdf" || loadingShareFormat === "pdf") && (
        <p className="text-center text-xs text-slate-500">
          {dict.export.generating} This may take a few seconds.
        </p>
      )}

      {/* Loading message for DOCX */}
      {(loadingFormat === "docx" || loadingShareFormat === "docx") && (
        <p className="text-center text-xs text-slate-500">
          {dict.export.generatingDocx || defaultDict.export.generatingDocx} This may take a few seconds.
        </p>
      )}

      {/* Post-conversion feedback prompt */}
      {lastSuccessFormat && dict.postConvertFeedback && (
        <PostConvertFeedback
          key={lastSuccessFormat}
          format={lastSuccessFormat}
          dict={dict}
          onDismiss={() => setLastSuccessFormat(null)}
        />
      )}
    </div>
  );
}
