"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, Download, Loader2, Share } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  allowedPixelRatios,
  clampPixelRatio,
  imagePartFilename,
  ImageTooLargeError,
  type ImageExportOptions,
  type ImageExportWarning,
} from "@/lib/export-image";
import { downloadBlob, generateFilename } from "@/lib/download";
import {
  trackConvertSuccess,
  trackConvertError,
  trackLocaleConversion,
  trackShareFilesUsed,
  type UploadSource,
  type SupportedLocale,
} from "@/lib/analytics";
import type { Locale, Dictionary } from "@/i18n";

type ImageFormat = "png" | "jpg";
type ImageWidth = ImageExportOptions["width"];
type PixelRatio = ImageExportOptions["pixelRatio"];
type SplitMode = ImageExportOptions["splitMode"];

const WIDTHS: ImageWidth[] = [600, 800, 1080, 1200];
// Above this part count the OS share sheet becomes unwieldy — ZIP instead
const MAX_SHARE_PARTS = 5;

interface ImageResult {
  blobs: Blob[];
  filename: string; // e.g. report.png — parts derive report-01.png, …
  warnings: ImageExportWarning[];
}

interface ImageExportPanelProps {
  format: ImageFormat;
  markdown: string;
  renderedHtml: string;
  originalFilename: string | null;
  locale: Locale;
  dict: Dictionary;
  source: UploadSource;
  onTryPdf: () => void;
  onSuccess: (format: ImageFormat) => void;
}

export function ImageExportPanel({
  format,
  markdown,
  renderedHtml,
  originalFilename,
  locale,
  dict,
  source,
  onTryPdf,
  onSuccess,
}: ImageExportPanelProps) {
  const [width, setWidth] = useState<ImageWidth>(800);
  const [ratio, setRatio] = useState<PixelRatio>(2);
  const [quality, setQuality] = useState(90); // JPG only, 60–100
  const [splitMode, setSplitMode] = useState<SplitMode>("auto");
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [result, setResult] = useState<ImageResult | null>(null);
  const [errorCode, setErrorCode] = useState<"too_large" | "render_failed" | null>(null);

  const t = dict.export;

  // Stale results don't survive input or format changes
  useEffect(() => {
    setResult(null);
    setErrorCode(null);
  }, [format, markdown]);

  const handleWidthChange = useCallback((next: ImageWidth) => {
    setWidth(next);
    // 3x is hidden at 1080/1200 — clamp an active 3x selection visibly (spec 2.1)
    setRatio((current) => clampPixelRatio(next, current));
  }, []);

  const handleConvert = useCallback(async () => {
    setConverting(true);
    setProgress(null);
    setResult(null);
    setErrorCode(null);

    try {
      const { exportToImage } = await import("@/lib/export-image");
      const html =
        renderedHtml ||
        (await (await import("@/lib/markdown")).markdownToHtml(markdown));

      const exported = await exportToImage(
        html,
        {
          format,
          width,
          pixelRatio: ratio,
          quality: quality / 100,
          splitMode,
        },
        (current, total) => setProgress({ current, total })
      );

      const filename = generateFilename(originalFilename, format);

      if (exported.blobs.length === 1) {
        downloadBlob(exported.blobs[0], filename);
      }

      setResult({ blobs: exported.blobs, filename, warnings: exported.warnings });
      trackConvertSuccess(format, source, {
        split_parts: String(exported.blobs.length),
      });
      trackLocaleConversion(locale as SupportedLocale, format);
      onSuccess(format);
    } catch (err) {
      console.error(`Image export error (${format}):`, err);
      if (err instanceof ImageTooLargeError) {
        setErrorCode("too_large");
        trackConvertError(format, "img_too_large");
      } else {
        setErrorCode("render_failed");
        trackConvertError(format, "img_render_failed");
      }
    } finally {
      setConverting(false);
      setProgress(null);
    }
  }, [format, markdown, renderedHtml, originalFilename, locale, source, width, ratio, quality, splitMode, onSuccess]);

  const resultFiles = useMemo(() => {
    if (!result || result.blobs.length <= 1) return null;
    const mime = format === "png" ? "image/png" : "image/jpeg";
    return result.blobs.map(
      (blob, i) =>
        new File([blob], imagePartFilename(result.filename, i, result.blobs.length), {
          type: mime,
        })
    );
  }, [result, format]);

  const canShareResult = useMemo(() => {
    if (!resultFiles || resultFiles.length > MAX_SHARE_PARTS) return false;
    try {
      return (
        typeof navigator !== "undefined" &&
        "canShare" in navigator &&
        navigator.canShare({ files: resultFiles })
      );
    } catch {
      return false;
    }
  }, [resultFiles]);

  // navigator.share needs the transient user activation of THIS click —
  // called directly from the button handler, never auto-fired post-convert.
  const handleShare = useCallback(async () => {
    if (!resultFiles) return;
    try {
      await navigator.share({ files: resultFiles });
      trackShareFilesUsed(format, resultFiles.length);
    } catch (err) {
      // User-cancelled share is a normal outcome, not an error
      if (err instanceof Error && err.name === "AbortError") return;
      console.error("Image share failed:", err);
    }
  }, [resultFiles, format]);

  const handleDownloadZip = useCallback(async () => {
    if (!result || !resultFiles) return;
    const { zipImageBlobs } = await import("@/lib/export-image");
    const zipBlob = await zipImageBlobs(
      resultFiles.map((file) => ({ name: file.name, blob: file }))
    );
    const zipName = `${result.filename.replace(/\.(png|jpg)$/i, "")}-images.zip`;
    downloadBlob(zipBlob, zipName);
  }, [result, resultFiles]);

  const scaleOptions = allowedPixelRatios(width);
  const blockedWarning = result?.warnings.find((w) => w.code === "images_blocked") as
    | { code: "images_blocked"; count: number }
    | undefined;

  return (
    <div
      className="space-y-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
      data-testid="image-options-panel"
    >
      <div className="flex flex-wrap items-end gap-x-5 gap-y-3">
        {/* Width */}
        <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
          {t.imageWidth}
          <select
            value={width}
            disabled={converting}
            onChange={(e) => handleWidthChange(Number(e.target.value) as ImageWidth)}
            data-testid="image-width-select"
            className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs text-slate-700"
          >
            {WIDTHS.map((w) => (
              <option key={w} value={w}>
                {w} px
                {w === 1080 && (locale === "zh-Hans" || locale === "zh-Hant")
                  ? ` · ${t.imageWechatHint}`
                  : ""}
              </option>
            ))}
          </select>
        </label>

        {/* Scale — options depend on width (spec 2.1 matrix) */}
        <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
          {t.imageScale}
          <select
            value={ratio}
            disabled={converting}
            onChange={(e) => setRatio(Number(e.target.value) as PixelRatio)}
            data-testid="image-scale-select"
            className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs text-slate-700"
          >
            {scaleOptions.map((r) => (
              <option key={r} value={r}>
                {r}x
              </option>
            ))}
          </select>
        </label>

        {/* Quality — JPG only */}
        {format === "jpg" && (
          <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
            {t.imageQuality}: {quality}
            <input
              type="range"
              min={60}
              max={100}
              step={1}
              value={quality}
              disabled={converting}
              onChange={(e) => setQuality(Number(e.target.value))}
              data-testid="image-quality-slider"
              className="w-28 accent-emerald-700"
            />
          </label>
        )}

        {/* Long document handling */}
        <fieldset className="flex flex-col gap-1 text-xs font-medium text-slate-600">
          <legend className="mb-1">{t.imageSplit}</legend>
          <div className="flex overflow-hidden rounded-lg border border-slate-200" role="radiogroup">
            {(
              [
                ["auto", t.imageSplitAuto],
                ["single", t.imageSplitSingle],
                ["split", t.imageSplitParts],
              ] as Array<[SplitMode, string]>
            ).map(([mode, label]) => (
              <button
                key={mode}
                type="button"
                role="radio"
                aria-checked={splitMode === mode}
                disabled={converting}
                onClick={() => setSplitMode(mode)}
                data-testid={`image-split-${mode}`}
                className={cn(
                  "px-2.5 py-1.5 text-xs transition",
                  splitMode === mode
                    ? "bg-emerald-700 font-semibold text-white"
                    : "bg-slate-50 text-slate-600 hover:bg-white"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </fieldset>

        {/* Convert */}
        <button
          type="button"
          disabled={converting}
          onClick={handleConvert}
          data-testid="image-convert-button"
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold shadow-sm transition",
            converting
              ? "cursor-wait bg-emerald-500 text-white"
              : "bg-emerald-700 text-white hover:bg-emerald-800"
          )}
        >
          {converting ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Download className="h-3 w-3" />
          )}
          {converting
            ? `${t.generatingImage}${progress && progress.total > 1 ? ` (${progress.current}/${progress.total})` : ""}`
            : format === "png"
              ? t.downloadPng
              : t.downloadJpg}
        </button>
      </div>

      {/* Non-blocking warning: some images blocked */}
      {blockedWarning && (
        <div
          className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800"
          data-testid="image-warning"
        >
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
          <span>{t.imageBlocked.replace("{n}", String(blockedWarning.count))}</span>
        </div>
      )}

      {/* Error: too large / render failed */}
      {errorCode && (
        <div
          className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
          data-testid="image-error"
        >
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
          <span className="flex-1">
            {errorCode === "too_large" ? t.imageTooLarge : t.imageRenderFailed}
          </span>
          {errorCode === "too_large" && (
            <button
              type="button"
              onClick={onTryPdf}
              data-testid="image-try-pdf"
              className="rounded-full bg-red-100 px-3 py-1 font-medium text-red-700 transition hover:bg-red-200"
            >
              {t.imageTryPdf}
            </button>
          )}
        </div>
      )}

      {/* Split result: share (mobile 长图 path) or ZIP */}
      {result && result.blobs.length > 1 && (
        <div
          className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
          data-testid="image-result"
        >
          <span className="text-xs text-slate-600">
            {t.imageSplitNote.replace("{n}", String(result.blobs.length))}
          </span>
          <div className="flex gap-2">
            {canShareResult && (
              <button
                type="button"
                onClick={handleShare}
                data-testid="image-share-button"
                className="inline-flex items-center gap-1.5 rounded-full bg-emerald-700 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-800"
              >
                <Share className="h-3 w-3" />
                {t.shareImages}
              </button>
            )}
            <button
              type="button"
              onClick={handleDownloadZip}
              data-testid="image-zip-button"
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold shadow-sm transition",
                canShareResult
                  ? "border border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                  : "bg-emerald-700 text-white hover:bg-emerald-800"
              )}
            >
              <Download className="h-3 w-3" />
              {t.downloadZip}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
