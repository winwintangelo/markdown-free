"use client";

import { cn } from "@/lib/utils";
import { useConverter } from "@/hooks/use-converter";

export function ExportRow() {
  const { state } = useConverter();
  const isDisabled = !state.content || state.status !== "ready";

  const handleExport = (format: "pdf" | "txt" | "html") => {
    // TODO: Implement actual export in Phase 2
    console.log(`Exporting to ${format}...`);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex flex-wrap gap-2">
        {/* Primary: To PDF */}
        <button
          type="button"
          disabled={isDisabled}
          onClick={() => handleExport("pdf")}
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-4 py-2 text-xs font-semibold shadow-sm transition",
            isDisabled
              ? "cursor-not-allowed bg-slate-200 text-slate-400"
              : "bg-emerald-600 text-white hover:bg-emerald-700"
          )}
        >
          To PDF
        </button>

        {/* Secondary: To TXT */}
        <button
          type="button"
          disabled={isDisabled}
          onClick={() => handleExport("txt")}
          className={cn(
            "inline-flex items-center gap-1 rounded-full border px-4 py-2 text-xs font-semibold shadow-sm transition",
            isDisabled
              ? "cursor-not-allowed border-slate-100 bg-slate-100 text-slate-400"
              : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white"
          )}
        >
          To TXT
        </button>

        {/* Secondary: To HTML */}
        <button
          type="button"
          disabled={isDisabled}
          onClick={() => handleExport("html")}
          className={cn(
            "inline-flex items-center gap-1 rounded-full border px-4 py-2 text-xs font-semibold shadow-sm transition",
            isDisabled
              ? "cursor-not-allowed border-slate-100 bg-slate-100 text-slate-400"
              : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white"
          )}
        >
          To HTML
        </button>
      </div>

      {/* Privacy notice */}
      <p className="text-[11px] text-slate-500">
        Files are processed temporarily for conversion and not stored.
      </p>
    </div>
  );
}

