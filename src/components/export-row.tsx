"use client";

import { useState, useCallback, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useConverter } from "@/hooks/use-converter";
import { exportTxt } from "@/lib/export-txt";
import { exportHtml } from "@/lib/export-html";
import { markdownToHtml } from "@/lib/markdown";

type ExportFormat = "pdf" | "txt" | "html";

export function ExportRow() {
  const { state } = useConverter();
  const [loadingFormat, setLoadingFormat] = useState<ExportFormat | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [renderedHtml, setRenderedHtml] = useState<string>("");

  const isDisabled = !state.content || state.status !== "ready";

  // Pre-render HTML when content changes (for HTML export)
  useEffect(() => {
    if (state.content) {
      markdownToHtml(state.content.content).then(setRenderedHtml);
    } else {
      setRenderedHtml("");
    }
  }, [state.content]);

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleExport = useCallback(
    async (format: ExportFormat) => {
      if (!state.content) return;

      // PDF is not implemented yet
      if (format === "pdf") {
        setToast("PDF export coming soon!");
        return;
      }

      setLoadingFormat(format);

      try {
        if (format === "txt") {
          exportTxt(state.content.content, state.content.filename);
        } else if (format === "html") {
          // Use pre-rendered HTML or render now
          const html = renderedHtml || (await markdownToHtml(state.content.content));
          exportHtml(html, state.content.filename);
        }
      } catch (error) {
        console.error(`Export error (${format}):`, error);
        setToast(`Export failed. Please try again.`);
      } finally {
        setLoadingFormat(null);
      }
    },
    [state.content, renderedHtml]
  );

  return (
    <div className="relative flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex flex-wrap gap-2">
        {/* Primary: To PDF */}
        <button
          type="button"
          disabled={isDisabled || loadingFormat === "pdf"}
          onClick={() => handleExport("pdf")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold shadow-sm transition",
            isDisabled
              ? "cursor-not-allowed bg-slate-200 text-slate-400"
              : "bg-emerald-600 text-white hover:bg-emerald-700"
          )}
        >
          {loadingFormat === "pdf" && (
            <Loader2 className="h-3 w-3 animate-spin" />
          )}
          To PDF
        </button>

        {/* Secondary: To TXT */}
        <button
          type="button"
          disabled={isDisabled || loadingFormat === "txt"}
          onClick={() => handleExport("txt")}
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
          To TXT
        </button>

        {/* Secondary: To HTML */}
        <button
          type="button"
          disabled={isDisabled || loadingFormat === "html"}
          onClick={() => handleExport("html")}
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
          To HTML
        </button>
      </div>

      {/* Privacy notice */}
      <p className="text-[11px] text-slate-500">
        Files are processed temporarily for conversion and not stored.
      </p>

      {/* Toast notification */}
      {toast && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200">
          {toast}
        </div>
      )}
    </div>
  );
}
