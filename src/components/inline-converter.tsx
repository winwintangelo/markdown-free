"use client";

import { useCallback, useState } from "react";
import { useConverter } from "@/hooks/use-converter";
import { ExportRow } from "@/components/export-row";
import { cn, formatFileSize, isValidFileType, isValidFileSize } from "@/lib/utils";
import {
  trackUploadStart,
  trackUploadError,
  trackComparisonCta,
} from "@/lib/analytics";
import type { Locale, Dictionary } from "@/i18n";

/**
 * Inline mini-converter for comparison/intent pages (experiment
 * comparison-cta-2026-07-16, iteration C): a compact drop-zone that loads a
 * file into the page's ConverterProvider, then renders the REAL ExportRow —
 * readers comparing tools can test ours without leaving the article.
 *
 * All conversion, error handling, and funnel tracking is reused from ExportRow;
 * upload_start / convert_success fire with requestPath = this page, so on-page
 * conversions attribute to the comparison page for free in the events channel.
 * The hidden input also registers as the provider's fileInputRef, so ExportRow's
 * "click a format with no file" UX opens this picker.
 */
export function InlineConverter({
  locale,
  dict,
  heading,
  hint,
  readyHint,
  target = "converter",
}: {
  locale: Locale;
  dict: Dictionary;
  /** Drop-zone headline, localized by the host page. */
  heading: string;
  /** Sub-line under the headline (idle state). */
  hint: string;
  /** Sub-line once a file is loaded ("pick a format below"). */
  readyHint: string;
  /** Analytics target — "image" for the PNG-first (长图) variant. */
  target?: "converter" | "image";
}) {
  const { state, dispatch, fileInputRef } = useConverter();
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      setError(null);
      trackUploadStart("file");

      if (!isValidFileType(file.name)) {
        trackUploadError("file", "invalid_type");
        setError(dict.errors.invalidType);
        return;
      }
      if (!isValidFileSize(file.size)) {
        trackUploadError("file", "too_large");
        setError(dict.errors.tooLarge);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        dispatch({
          type: "LOAD_FILE",
          filename: file.name,
          content: String(reader.result ?? ""),
          size: file.size,
        });
        // The inline converter IS the strongest CTA — a loaded file is real
        // engagement, tracked alongside the button CTAs (position=inline).
        trackComparisonCta(target, "inline");
      };
      reader.onerror = () => {
        trackUploadError("file", "read_error");
        setError(dict.errors.readError);
      };
      reader.readAsText(file);
    },
    [dict, dispatch, target]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const loaded = state.content;

  return (
    <div className="not-prose my-8" data-testid="inline-converter">
      <div
        role="button"
        tabIndex={0}
        aria-label={heading}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click(); }}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={cn(
          "cursor-pointer rounded-xl border-2 border-dashed border-emerald-700 bg-emerald-50 p-6 text-center transition",
          isDragging && "border-emerald-800 bg-emerald-100"
        )}
      >
        <p className="text-base font-semibold text-slate-900">{heading}</p>
        {loaded ? (
          <p className="mt-2 text-sm font-medium text-emerald-800" data-testid="inline-converter-loaded">
            ✓ {loaded.filename ?? "markdown"} · {formatFileSize(loaded.size)} — {readyHint}
          </p>
        ) : (
          <p className="mt-2 text-sm text-slate-600">{hint}</p>
        )}
        {error && (
          <p className="mt-2 text-sm font-medium text-red-600" role="alert">
            {error}
          </p>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept=".md,.markdown,.txt"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = ""; // allow re-selecting the same file
          }}
        />
      </div>

      {/* The real export row — same buttons, conversions, and tracking as the converter. */}
      <div className="mt-4">
        <ExportRow locale={locale} dict={dict} />
      </div>
    </div>
  );
}
