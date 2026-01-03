"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Loader2, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useConverter } from "@/hooks/use-converter";
import { exportTxt } from "@/lib/export-txt";
import { exportHtml } from "@/lib/export-html";
import { exportPdf, PdfExportResult } from "@/lib/export-pdf";
import { markdownToHtml } from "@/lib/markdown";
import {
  trackConvertSuccess,
  trackConvertError,
  trackExportHover,
  type ExportFormat as AnalyticsExportFormat,
  type UploadSource,
} from "@/lib/analytics";
import { useSectionVisibility } from "@/hooks/use-engagement-tracking";
import type { Locale, Dictionary } from "@/i18n";

type ExportFormat = "pdf" | "txt" | "html";

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
    privacy: "Files are processed temporarily for conversion and not stored.",
    generating: "Generating PDF..."
  },
  errors: {
    pdfTimeout: "PDF generation timed out. Please try again.",
    pdfError: "Something went wrong. Please try again.",
    tryAgain: "Try Again"
  }
};

export function ExportRow({ locale: _locale, dict = defaultDict as unknown as Dictionary }: ExportRowProps) {
  const { state } = useConverter();
  const [loadingFormat, setLoadingFormat] = useState<ExportFormat | null>(null);
  const [error, setError] = useState<ExportError | null>(null);
  const [renderedHtml, setRenderedHtml] = useState<string>("");
  const abortControllerRef = useRef<AbortController | null>(null);
  const hoveredFormatsRef = useRef<Set<ExportFormat>>(new Set());
  const sectionRef = useSectionVisibility("export");

  const isDisabled = !state.content || state.status !== "ready";

  // Track hover on disabled buttons (shows interest before content is loaded)
  const handleButtonHover = useCallback((format: ExportFormat) => {
    if (isDisabled && !hoveredFormatsRef.current.has(format)) {
      hoveredFormatsRef.current.add(format);
      trackExportHover(format);
    }
  }, [isDisabled]);

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

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleExport = useCallback(
    async (format: ExportFormat) => {
      if (!state.content) return;

      // Determine source for analytics
      const source: UploadSource = state.content.source === "file" ? "file" : "paste";

      // Clear any previous error
      setError(null);
      setLoadingFormat(format);

      try {
        if (format === "txt") {
          exportTxt(state.content.content, state.content.filename);
          trackConvertSuccess(format as AnalyticsExportFormat, source);
        } else if (format === "html") {
          const html = renderedHtml || (await markdownToHtml(state.content.content));
          exportHtml(html, state.content.filename);
          trackConvertSuccess(format as AnalyticsExportFormat, source);
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
          } else if (result.error) {
            // Map error codes to analytics error codes
            const errorCode = result.error.code === "GENERATION_TIMEOUT" 
              ? "pdf_timeout" 
              : result.error.code === "GENERATION_FAILED" || result.error.code === "SERVER_ERROR"
              ? "pdf_server_error"
              : "unknown";
            trackConvertError(format as AnalyticsExportFormat, errorCode);
            setError({
              format: "pdf",
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

      {/* Export Buttons Row */}
      <div ref={sectionRef} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {/* Primary: To PDF */}
          <button
            type="button"
            disabled={isDisabled || loadingFormat === "pdf"}
            onClick={() => handleExport("pdf")}
            onMouseEnter={() => handleButtonHover("pdf")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold shadow-sm transition",
              isDisabled
                ? "cursor-not-allowed bg-slate-200 text-slate-400"
                : loadingFormat === "pdf"
                ? "cursor-wait bg-emerald-500 text-white"
                : "bg-emerald-600 text-white hover:bg-emerald-700"
            )}
          >
            {loadingFormat === "pdf" && (
              <Loader2 className="h-3 w-3 animate-spin" />
            )}
            {loadingFormat === "pdf" ? dict.export.generating : dict.export.toPdf}
          </button>

          {/* Secondary: To TXT */}
          <button
            type="button"
            disabled={isDisabled || loadingFormat === "txt"}
            onClick={() => handleExport("txt")}
            onMouseEnter={() => handleButtonHover("txt")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold shadow-sm transition",
              isDisabled
                ? "cursor-not-allowed border-slate-100 bg-slate-100 text-slate-400"
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
            disabled={isDisabled || loadingFormat === "html"}
            onClick={() => handleExport("html")}
            onMouseEnter={() => handleButtonHover("html")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold shadow-sm transition",
              isDisabled
                ? "cursor-not-allowed border-slate-100 bg-slate-100 text-slate-400"
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
    </div>
  );
}
