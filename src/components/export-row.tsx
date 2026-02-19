"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Loader2, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useConverter } from "@/hooks/use-converter";
import { exportTxt } from "@/lib/export-txt";
import { exportHtml } from "@/lib/export-html";
import { exportPdf, PdfExportResult } from "@/lib/export-pdf";
import { exportDocx, DocxExportResult } from "@/lib/export-docx";
import { markdownToHtml } from "@/lib/markdown";
import {
  trackConvertSuccess,
  trackConvertError,
  trackConvertAbandoned,
  trackExportHover,
  trackExportTriggerUpload,
  trackLocaleConversion,
  type ExportFormat as AnalyticsExportFormat,
  type UploadSource,
  type SupportedLocale,
  type ConvertErrorCode,
} from "@/lib/analytics";
import { useSectionVisibility } from "@/hooks/use-engagement-tracking";
import { PostConvertFeedback } from "./post-convert-feedback";
import type { Locale, Dictionary } from "@/i18n";

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
    uploadOrPaste: "Upload or paste to continue"
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
  const abortControllerRef = useRef<AbortController | null>(null);
  const hoveredFormatsRef = useRef<Set<ExportFormat>>(new Set());
  const hintTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sectionRef = useSectionVisibility("export");

  // Content is ready for export
  const hasContent = state.content && state.status === "ready";
  // Button is in loading state
  const isLoading = loadingFormat !== null;

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

  // Pre-render HTML when content changes (for HTML export)
  useEffect(() => {
    if (state.content) {
      markdownToHtml(state.content.content).then(setRenderedHtml);
    } else {
      setRenderedHtml("");
    }
  }, [state.content]);

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
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
            // Map error codes to analytics error codes with User/System classification
            let errorCode: ConvertErrorCode;
            switch (result.error.code) {
              case "GENERATION_TIMEOUT":
                errorCode = "pdf_timeout";
                break;
              case "GENERATION_FAILED":
              case "SERVER_ERROR":
                errorCode = "pdf_server_error";
                break;
              case "NETWORK_ERROR":
                errorCode = "network_error";
                break;
              case "ABORTED":
                errorCode = "aborted";
                break;
              default:
                errorCode = "unknown";
            }
            trackConvertError(format as AnalyticsExportFormat, errorCode);
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
            // Map error codes to analytics error codes
            let errorCode: ConvertErrorCode;
            switch (result.error.code) {
              case "GENERATION_TIMEOUT":
                errorCode = "pdf_timeout"; // Reuse same timeout code
                break;
              case "GENERATION_FAILED":
              case "SERVER_ERROR":
                errorCode = "pdf_server_error";
                break;
              case "NETWORK_ERROR":
                errorCode = "network_error";
                break;
              case "ABORTED":
                errorCode = "aborted";
                break;
              default:
                errorCode = "unknown";
            }
            trackConvertError(format as AnalyticsExportFormat, errorCode);
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
    [state.content, renderedHtml, dict.errors.pdfError]
  );

  const handleRetry = useCallback(() => {
    if (error) {
      const format = error.format;
      clearError();
      handleExport(format);
    }
  }, [error, clearError, handleExport]);

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
      <div ref={sectionRef} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
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
      </div>

      {/* Loading message for PDF */}
      {loadingFormat === "pdf" && (
        <p className="text-center text-xs text-slate-500">
          {dict.export.generating} This may take a few seconds.
        </p>
      )}

      {/* Loading message for DOCX */}
      {loadingFormat === "docx" && (
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
