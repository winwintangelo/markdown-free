"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { AlertCircle, Download, Loader2, Share, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  defaultImageOptions,
  imagePartFilename,
  ImageExportCancelledError,
  ImageTooLargeError,
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

/**
 * Status surface for the one-tap image export. There is intentionally NO
 * options UI — image export behaves like every other converter button:
 * device-based defaults (width from viewport, sharpness from DPR), and the
 * only decision users ever see is the long-document prompt (single tall
 * image vs ZIP package). This component renders progress, that prompt,
 * warnings/errors, and the split-result share row.
 */

type ImageFormat = "png" | "jpg";

const JPG_QUALITY = 0.9;
// Above this part count the OS share sheet becomes unwieldy — ZIP instead
const MAX_SHARE_PARTS = 5;

interface ImageResult {
  blobs: Blob[];
  filename: string; // e.g. report.png — parts derive report-01.png, …
  warnings: ImageExportWarning[];
}

interface LongDocPrompt {
  pages: number;
  canSingle: boolean;
  resolve: (choice: "single" | "split" | "cancel") => void;
}

export interface ImageExportPanelHandle {
  /** One-tap conversion with device-based defaults */
  convert: (format: ImageFormat) => void;
}

interface ImageExportPanelProps {
  markdown: string;
  renderedHtml: string;
  originalFilename: string | null;
  locale: Locale;
  dict: Dictionary;
  source: UploadSource;
  onTryPdf: () => void;
  onSuccess: (format: ImageFormat) => void;
  onConvertingChange: (converting: boolean) => void;
}

export const ImageExportPanel = forwardRef<ImageExportPanelHandle, ImageExportPanelProps>(
  function ImageExportPanel(
    {
      markdown,
      renderedHtml,
      originalFilename,
      locale,
      dict,
      source,
      onTryPdf,
      onSuccess,
      onConvertingChange,
    },
    ref
  ) {
    const [format, setFormat] = useState<ImageFormat>("png");
    const [converting, setConverting] = useState(false);
    const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
    const [result, setResult] = useState<ImageResult | null>(null);
    const [errorCode, setErrorCode] = useState<"too_large" | "render_failed" | null>(null);
    const [longDocPrompt, setLongDocPrompt] = useState<LongDocPrompt | null>(null);
    const convertingRef = useRef(false);

    const t = dict.export;

    // Stale results don't survive input changes
    useEffect(() => {
      setResult(null);
      setErrorCode(null);
    }, [markdown]);

    useEffect(() => {
      onConvertingChange(converting);
    }, [converting, onConvertingChange]);

    const runConvert = useCallback(
      async (fmt: ImageFormat) => {
        if (convertingRef.current) return;
        convertingRef.current = true;
        setFormat(fmt);
        setConverting(true);
        setProgress(null);
        setResult(null);
        setErrorCode(null);

        try {
          const { exportToImage } = await import("@/lib/export-image");
          const html =
            renderedHtml ||
            (await (await import("@/lib/markdown")).markdownToHtml(markdown));

          // Device-aware defaults: phone-sized viewports → 1080px (长图 /
          // social width), desktop → 800px; sharpness from devicePixelRatio
          const { width, pixelRatio } = defaultImageOptions();

          const exported = await exportToImage(
            html,
            {
              format: fmt,
              width,
              pixelRatio,
              quality: JPG_QUALITY,
              splitMode: "auto",
              onLongDocument: (pages, canSingle) =>
                new Promise((resolve) => setLongDocPrompt({ pages, canSingle, resolve })),
            },
            (current, total) => setProgress({ current, total })
          );

          const filename = generateFilename(originalFilename, fmt);

          if (exported.blobs.length === 1) {
            downloadBlob(exported.blobs[0], filename);
          } else {
            // The split package auto-downloads too — same one-tap contract as
            // every other export button. The result row stays visible after
            // for the share path / re-download.
            const { zipImageBlobs } = await import("@/lib/export-image");
            const zipBlob = await zipImageBlobs(
              exported.blobs.map((blob, i) => ({
                name: imagePartFilename(filename, i, exported.blobs.length),
                blob,
              }))
            );
            downloadBlob(zipBlob, `${filename.replace(/\.(png|jpg)$/i, "")}-images.zip`);
          }

          setResult({ blobs: exported.blobs, filename, warnings: exported.warnings });
          trackConvertSuccess(fmt, source, {
            split_parts: String(exported.blobs.length),
          });
          trackLocaleConversion(locale as SupportedLocale, fmt);
          onSuccess(fmt);
        } catch (err) {
          if (err instanceof ImageExportCancelledError) {
            // User backed out of the long-document prompt — not an error
            return;
          }
          console.error(`Image export error (${fmt}):`, err);
          if (err instanceof ImageTooLargeError) {
            setErrorCode("too_large");
            trackConvertError(fmt, "img_too_large");
          } else {
            setErrorCode("render_failed");
            trackConvertError(fmt, "img_render_failed");
          }
        } finally {
          convertingRef.current = false;
          setConverting(false);
          setProgress(null);
          setLongDocPrompt(null);
        }
      },
      [markdown, renderedHtml, originalFilename, locale, source, onSuccess]
    );

    // One-tap entry point (To Image button, To JPG menu item)
    useImperativeHandle(
      ref,
      () => ({
        convert: (fmt: ImageFormat) => {
          void runConvert(fmt);
        },
      }),
      [runConvert]
    );

    const answerLongDoc = useCallback(
      (choice: "single" | "split" | "cancel") => {
        longDocPrompt?.resolve(choice);
        setLongDocPrompt(null);
      },
      [longDocPrompt]
    );

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

    const blockedWarning = result?.warnings.find((w) => w.code === "images_blocked") as
      | { code: "images_blocked"; count: number }
      | undefined;

    const hasStatus =
      converting || longDocPrompt !== null || errorCode !== null ||
      blockedWarning !== undefined || (result !== null && result.blobs.length > 1);

    if (!hasStatus) {
      return null;
    }

    return (
      <div
        className="space-y-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
        data-testid="image-options-panel"
      >
        {/* Long-document prompt: one long image vs split package, with the
            tradeoff spelled out on each choice */}
        {longDocPrompt && (
          <div
            className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5"
            data-testid="image-longdoc-prompt"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs font-medium text-emerald-900">
                {t.imageLongDoc.replace("{n}", String(longDocPrompt.pages))}
              </span>
              <button
                type="button"
                onClick={() => answerLongDoc("cancel")}
                data-testid="image-longdoc-cancel"
                aria-label="Cancel"
                className="flex-shrink-0 rounded-full p-1 text-emerald-700 transition hover:bg-emerald-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              {longDocPrompt.canSingle && (
                <button
                  type="button"
                  onClick={() => answerLongDoc("single")}
                  data-testid="image-longdoc-single"
                  className="flex-1 rounded-lg border border-emerald-300 bg-white px-3 py-2 text-left shadow-sm transition hover:bg-emerald-100"
                >
                  <span className="block text-xs font-semibold text-emerald-800">
                    {t.imageSplitSingle}
                  </span>
                  <span className="mt-0.5 block text-[11px] text-emerald-700">
                    {t.imageLongSingleHint}
                  </span>
                </button>
              )}
              <button
                type="button"
                onClick={() => answerLongDoc("split")}
                data-testid="image-longdoc-split"
                className="flex-1 rounded-lg bg-emerald-700 px-3 py-2 text-left shadow-sm transition hover:bg-emerald-800"
              >
                <span className="block text-xs font-semibold text-white">
                  {t.imageSplitParts} (ZIP)
                </span>
                <span className="mt-0.5 block text-[11px] text-emerald-100">
                  {t.imageLongSplitHint}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Progress while rendering */}
        {converting && !longDocPrompt && (
          <p className="flex items-center gap-2 text-xs text-slate-500" data-testid="image-progress">
            <Loader2 className="h-3 w-3 animate-spin" />
            {t.generatingImage}
            {progress && progress.total > 1 ? ` (${progress.current}/${progress.total})` : ""}
          </p>
        )}

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

        {/* Split result: the ZIP already auto-downloaded; this row carries the
            note plus share / re-download */}
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
                  "border border-slate-200 bg-white text-slate-700 hover:border-slate-300"
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
);
