"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Loader2, AlertCircle, X, Share, MoreHorizontal, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useConverter } from "@/hooks/use-converter";
import { exportTxt } from "@/lib/export-txt";
import { exportHtml } from "@/lib/export-html";
import { exportPdf, PdfExportResult } from "@/lib/export-pdf";
import { generatePdfBlob } from "@/lib/export-pdf";
import { exportDocx, DocxExportResult } from "@/lib/export-docx";
import { exportEpub, EpubExportResult } from "@/lib/export-epub";
import { exportXlsx } from "@/lib/export-xlsx";
import { downloadBlob } from "@/lib/download";
import { generateDocxBlob } from "@/lib/export-docx";
import { getPdfPreferences } from "@/lib/export-pdf";
import { markdownToHtml } from "@/lib/markdown";
import { prepareMarkdown } from "@/lib/prepare-markdown";
import { ensureKatexStylesheet, getKatexCssForHtmlExport, htmlHasMath } from "@/lib/katex-assets";
import { recordConversion, type PostConvertPrompt } from "@/lib/feature-teaser";
import {
  trackConvertSuccess,
  trackConvertError,
  trackConvertAbandoned,
  trackExportHover,
  trackExportTriggerUpload,
  trackLocaleConversion,
  trackShareFile,
  trackFeatureTeaserShown,
  type ExportFormat as AnalyticsExportFormat,
  type UploadSource,
  type SupportedLocale,
  type ConvertErrorCode,
} from "@/lib/analytics";
import { useSectionVisibility } from "@/hooks/use-engagement-tracking";
import { PostConvertFeedback } from "./post-convert-feedback";
import { FeatureTeaser } from "./feature-teaser";
import { ImageExportPanel, type ImageExportPanelHandle } from "./image-export-panel";
import type { Locale, Dictionary } from "@/i18n";

import { useIsMobile } from "@/hooks/use-mobile";
import { useWebShare } from "@/hooks/use-web-share";

type ExportFormat = "pdf" | "txt" | "html" | "docx" | "epub" | "png" | "jpg" | "xlsx";
type ImageFormat = "png" | "jpg";

/** Pre-render diagrams (SVG) then run the shared pipeline — the browser-side render path. */
async function renderPrepared(markdown: string): Promise<string> {
  const prepared = await prepareMarkdown(markdown);
  return markdownToHtml(prepared.markdown);
}

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
    toDocx: "To Word (DOCX)",
    toEpub: "To EPUB",
    toXlsx: "To Excel (XLSX)",
    privacy: "Files are processed temporarily for conversion and not stored.",
    generating: "Generating PDF...",
    generatingDocx: "Generating DOCX...",
    generatingEpub: "Generating EPUB...",
    selectFileHint: "Select a Markdown file to export",
    uploadOrPaste: "Upload or paste to continue",
    sharePdf: "Share as PDF",
    shareDocx: "Share as DOCX",
    savePdf: "Save PDF",
    saveDocx: "Save DOCX",
    more: "More formats",
    toPng: "To Image (PNG)",
    toJpg: "To JPG",
    generatingImage: "Rendering image...",
  },
  errors: {
    pdfTimeout: "PDF generation timed out. Please try again.",
    pdfError: "Something went wrong. Please try again.",
    noTables: "No tables found in this document. Excel export needs at least one Markdown table.",
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
  // Which prompt follows the latest success (the Phase 1.5 teaser or the thumbs
  // prompt), and a counter that remounts it so every success gets a fresh one
  const [postConvertPrompt, setPostConvertPrompt] = useState<PostConvertPrompt>("thumbs");
  const [successSeq, setSuccessSeq] = useState(0);
  const [loadingShareFormat, setLoadingShareFormat] = useState<"pdf" | "docx" | null>(null);
  const [pendingShare, setPendingShare] = useState<{
    blob: Blob;
    filename: string;
    format: "pdf" | "docx";
  } | null>(null);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [imageConverting, setImageConverting] = useState(false);
  const [rowGlow, setRowGlow] = useState(false);
  const glowContentRef = useRef(state.content);
  const imagePanelRef = useRef<ImageExportPanelHandle>(null);
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
  const isLoading = loadingFormat !== null || loadingShareFormat !== null || imageConverting;

  // One-shot glow on the export row when new content becomes ready — the
  // universal "ready to export" cue (fires for file, sample and paste, on
  // desktop and mobile), paired with the upload zone's checkmark.
  useEffect(() => {
    if (state.content && state.content !== glowContentRef.current) {
      glowContentRef.current = state.content;
      setRowGlow(true);
      const t = setTimeout(() => setRowGlow(false), 1300);
      return () => clearTimeout(t);
    }
    glowContentRef.current = state.content;
  }, [state.content]);

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

  // Document facts for analytics (booleans + a closed enum, never content)
  const docFactsRef = useRef<{ hasMath: boolean; hasMermaid: boolean }>({ hasMath: false, hasMermaid: false });
  const analyticsExtras = useCallback(
    () => ({
      source_chatbot: state.content?.sourceChatbot ?? "none",
      has_math: docFactsRef.current.hasMath ? "yes" : "no",
      has_mermaid: docFactsRef.current.hasMermaid ? "yes" : "no",
    }),
    [state.content]
  );

  // True from the moment the Phase 1.5 teaser is shown until the visitor
  // dismisses or answers it. People often export a second format right away;
  // the teaser must not give way to the thumbs prompt then.
  const teaserPendingRef = useRef(false);

  // Every successful conversion goes through here. It counts the conversion in
  // this browser (localStorage, never sent) and decides whether the Phase 1.5
  // teaser or the thumbs prompt follows it.
  const markSuccess = useCallback(
    (format: ExportFormat) => {
      if (recordConversion() === "teaser") {
        trackFeatureTeaserShown(locale);
        teaserPendingRef.current = true;
      }
      setPostConvertPrompt(teaserPendingRef.current ? "teaser" : "thumbs");
      setSuccessSeq((n) => n + 1);
      setLastSuccessFormat(format);
    },
    [locale]
  );

  // Pre-render HTML when content changes (for HTML / image / Excel export).
  // Diagrams are pre-rendered as SVG here; PDF and DOCX re-prepare with PNG.
  useEffect(() => {
    if (!state.content) {
      setRenderedHtml("");
      return;
    }
    let cancelled = false;
    prepareMarkdown(state.content.content)
      .then(async (prepared) => {
        docFactsRef.current = { hasMath: prepared.hasMath, hasMermaid: prepared.hasMermaid };
        const html = await markdownToHtml(prepared.markdown);
        if (htmlHasMath(html)) await ensureKatexStylesheet();
        if (!cancelled) setRenderedHtml(html);
      })
      .catch(() => {
        if (!cancelled) setRenderedHtml("");
      });
    return () => {
      cancelled = true;
    };
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

    const filename = state.content.filename;
    // Diagrams must be pre-rendered (as PNG) before the server sees the document
    const preparedContent = prepareMarkdown(state.content.content, { raster: true }).then((p) => p.markdown);

    // Pre-generate only formats that can be shared (no point caching unshareable formats)
    if (canSharePdf) {
      preparedContent
        .then((content) => generatePdfBlob(content, filename, controller.signal, getPdfPreferences(locale)))
        .then((result) => {
          if (!controller.signal.aborted && result.success && result.blob && result.filename) {
            cachedBlobsRef.current.pdf = { blob: result.blob, filename: result.filename };
          }
        })
        .catch(() => {});
    }

    if (canShareDocx) {
      // Word also needs its formulas as images (html-to-docx has no equation support)
      prepareMarkdown(state.content.content, { raster: true, mathImages: true })
        .then((p) => generateDocxBlob(p.markdown, filename, controller.signal))
        .then((result) => {
          if (!controller.signal.aborted && result.success && result.blob && result.filename) {
            cachedBlobsRef.current.docx = { blob: result.blob, filename: result.filename };
          }
        })
        .catch(() => {});
    }

    return () => controller.abort();
  }, [showShareUI, canSharePdf, canShareDocx, state.content, locale]);

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
          trackConvertSuccess(format as AnalyticsExportFormat, source, analyticsExtras());
          trackLocaleConversion(locale as SupportedLocale, format);
          markSuccess(format);
        } else if (format === "html") {
          const html = renderedHtml || (await renderPrepared(state.content.content));
          const extraCss = htmlHasMath(html) ? await getKatexCssForHtmlExport() : "";
          exportHtml(html, state.content.filename, { extraCss });
          trackConvertSuccess(format as AnalyticsExportFormat, source, analyticsExtras());
          trackLocaleConversion(locale as SupportedLocale, format);
          markSuccess(format);
        } else if (format === "pdf") {
          // Create abort controller for PDF request
          abortControllerRef.current = new AbortController();

          const prepared = await prepareMarkdown(state.content.content, { raster: true });
          const result: PdfExportResult = await exportPdf(
            prepared.markdown,
            state.content.filename,
            abortControllerRef.current.signal,
            getPdfPreferences(locale)
          );

          if (result.success) {
            trackConvertSuccess(format as AnalyticsExportFormat, source, analyticsExtras());
            trackLocaleConversion(locale as SupportedLocale, format);
            markSuccess(format);
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

          const prepared = await prepareMarkdown(state.content.content, { raster: true, mathImages: true });
          const result: DocxExportResult = await exportDocx(
            prepared.markdown,
            state.content.filename,
            abortControllerRef.current.signal
          );

          if (result.success) {
            trackConvertSuccess(format as AnalyticsExportFormat, source, analyticsExtras());
            trackLocaleConversion(locale as SupportedLocale, format);
            markSuccess(format);
          } else if (result.error) {
            trackConvertError(format as AnalyticsExportFormat, mapErrorCode(result.error.code));
            setError({
              format: "docx",
              code: result.error.code,
              message: result.error.message,
              retryable: result.error.retryable,
            });
          }
        } else if (format === "epub") {
          abortControllerRef.current = new AbortController();

          const prepared = await prepareMarkdown(state.content.content);
          const result: EpubExportResult = await exportEpub(
            prepared.markdown,
            state.content.filename,
            abortControllerRef.current.signal,
            { language: locale }
          );

          if (result.success) {
            trackConvertSuccess(format as AnalyticsExportFormat, source, analyticsExtras());
            trackLocaleConversion(locale as SupportedLocale, format);
            markSuccess(format);
          } else if (result.error) {
            trackConvertError(format as AnalyticsExportFormat, mapErrorCode(result.error.code));
            setError({
              format: "epub",
              code: result.error.code,
              message: result.error.message,
              retryable: result.error.retryable,
            });
          }
        } else if (format === "xlsx") {
          // Every table in the document → one worksheet; built in the browser
          const html = renderedHtml || (await renderPrepared(state.content.content));
          const result = await exportXlsx(html, state.content.filename);
          if (result.success) {
            trackConvertSuccess(format as AnalyticsExportFormat, source, {
              ...analyticsExtras(),
              tables: String(result.tables),
            });
            trackLocaleConversion(locale as SupportedLocale, format);
            markSuccess(format);
          } else if (result.error) {
            if (result.error.code !== "NO_TABLES") {
              trackConvertError(format as AnalyticsExportFormat, "unknown");
            }
            setError({
              format: "xlsx",
              code: result.error.code,
              message:
                result.error.code === "NO_TABLES"
                  ? dict.errors.noTables || defaultDict.errors.noTables
                  : result.error.message,
              retryable: false,
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
    [state.content, renderedHtml, dict.errors.pdfError, dict.export.selectFileHint, dict.export.uploadOrPaste, locale, triggerFileUpload, mapErrorCode, markSuccess]
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
          markSuccess(format);
          return;
        } catch (err) {
          if (err instanceof Error && err.name === "AbortError") return; // user cancelled
          // Share API rejected — fall back to download (user still gets the file)
          downloadBlob(cached.blob, cached.filename);
          trackConvertSuccess(format as AnalyticsExportFormat, source, analyticsExtras());
          trackLocaleConversion(locale as SupportedLocale, format);
          markSuccess(format);
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

        const prepared = await prepareMarkdown(state.content.content, {
          raster: true,
          mathImages: format === "docx",
        });
        const result = format === "pdf"
          ? await generatePdfBlob(prepared.markdown, state.content.filename, abortControllerRef.current.signal, getPdfPreferences(locale))
          : await generateDocxBlob(prepared.markdown, state.content.filename, abortControllerRef.current.signal);

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
    [state.content, dict.errors.pdfError, dict.export.selectFileHint, dict.export.uploadOrPaste, triggerFileUpload, mapErrorCode, markSuccess]
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
        markSuccess(pendingShare.format);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          // User cancelled — do nothing
        } else {
          // Share API rejected — fall back to download (user still gets the file)
          downloadBlob(pendingShare.blob, pendingShare.filename);
          trackConvertSuccess(pendingShare.format as AnalyticsExportFormat, source);
          trackLocaleConversion(locale as SupportedLocale, pendingShare.format);
          markSuccess(pendingShare.format);
        }
      } finally {
        setPendingShare(null);
      }
    },
    [pendingShare, state.content, locale, markSuccess]
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

  const triggerUploadWithHint = useCallback(
    (format: ImageFormat) => {
      trackExportTriggerUpload(format as AnalyticsExportFormat);
      triggerFileUpload();
      setUploadHint(dict.export.selectFileHint || defaultDict.export.selectFileHint);
      if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
      hintTimeoutRef.current = setTimeout(() => {
        setUploadHint(dict.export.uploadOrPaste || defaultDict.export.uploadOrPaste);
        hintTimeoutRef.current = setTimeout(() => setUploadHint(null), 5000);
      }, 5000);
    },
    [dict.export.selectFileHint, dict.export.uploadOrPaste, triggerFileUpload]
  );

  // One-tap image export: convert immediately with device-based defaults.
  // With no content it behaves like the other export buttons (upload flow).
  const handleImageOneTap = useCallback(
    (format: ImageFormat) => {
      if (!state.content) {
        triggerUploadWithHint(format);
        return;
      }
      imagePanelRef.current?.convert(format);
    },
    [state.content, triggerUploadWithHint]
  );

  const handleImageTryPdf = useCallback(() => {
    handleExport("pdf");
  }, [handleExport]);

  const handleImageSuccess = useCallback((format: ImageFormat) => {
    markSuccess(format);
  }, [markSuccess]);

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
      <div ref={sectionRef} className={cn("flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm", rowGlow && "export-ready-glow")}>
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
                    ? "bg-emerald-700 text-white hover:bg-emerald-800"
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
                      : "bg-emerald-700 text-white hover:bg-emerald-800"
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
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => { handleExport("epub"); setMoreMenuOpen(false); }}
                    data-testid="save-epub-button"
                    className="flex w-full items-center px-4 py-2 text-xs text-slate-600 transition hover:bg-slate-50"
                  >
                    {dict.export.toEpub || defaultDict.export.toEpub}
                  </button>
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => { handleExport("xlsx"); setMoreMenuOpen(false); }}
                    data-testid="save-xlsx-button"
                    className="flex w-full items-center px-4 py-2 text-xs text-slate-600 transition hover:bg-slate-50"
                  >
                    {dict.export.toXlsx || defaultDict.export.toXlsx}
                  </button>
                  <div className="my-1 border-t border-slate-100" />
                  {(["png", "jpg"] as ImageFormat[]).map((format) => (
                    <button
                      key={format}
                      type="button"
                      disabled={isLoading}
                      onClick={() => { handleImageOneTap(format); setMoreMenuOpen(false); }}
                      data-testid={`save-${format}-button`}
                      className="flex w-full items-center px-4 py-2 text-xs text-slate-600 transition hover:bg-slate-50"
                    >
                      {format === "png"
                        ? (dict.export.toPng || defaultDict.export.toPng)
                        : (dict.export.toJpg || defaultDict.export.toJpg)}
                    </button>
                  ))}
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
            <div className="flex flex-wrap items-center gap-2">
              {/* Primary: To PDF - Always active, triggers file picker if no content */}
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleExport("pdf")}
                onMouseEnter={() => handleButtonHover("pdf")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-[13px] font-semibold shadow-sm transition",
                  loadingFormat === "pdf"
                    ? "cursor-wait bg-emerald-500 text-white"
                    : "bg-emerald-700 text-white hover:bg-emerald-800"
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
                  "inline-flex items-center gap-1.5 rounded-full border px-5 py-2.5 text-[13px] font-semibold shadow-sm transition",
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

              {/* To Image (PNG) — one-tap, same contract as every other button */}
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleImageOneTap("png")}
                onMouseEnter={() => handleButtonHover("png")}
                data-testid="to-png-button"
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-5 py-2.5 text-[13px] font-semibold shadow-sm transition",
                  imageConverting
                    ? "cursor-wait border-amber-300 bg-amber-100 text-amber-800"
                    : "border-amber-200 bg-amber-50 text-amber-700 hover:border-amber-300 hover:bg-amber-100"
                )}
              >
                {imageConverting && <Loader2 className="h-3 w-3 animate-spin" />}
                {imageConverting
                  ? (dict.export.generatingImage || defaultDict.export.generatingImage)
                  : (dict.export.toPng || defaultDict.export.toPng)}
              </button>

              {/* Long-tail formats live behind the More formats menu */}
              <div ref={moreMenuRef} className="relative">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                  aria-expanded={moreMenuOpen}
                  aria-haspopup="true"
                  data-testid="more-formats-button"
                  className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-white"
                >
                  {dict.export.more || defaultDict.export.more}
                  <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", moreMenuOpen && "rotate-180")} />
                </button>
                {moreMenuOpen && (
                  <div
                    className="absolute left-0 top-full z-50 mt-1 min-w-[150px] rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
                    data-testid="more-formats-menu"
                  >
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => { handleExport("epub"); setMoreMenuOpen(false); }}
                      className="flex w-full items-center px-4 py-2 text-xs text-slate-600 transition hover:bg-slate-50"
                    >
                      {dict.export.toEpub || defaultDict.export.toEpub}
                    </button>
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => { handleExport("xlsx"); setMoreMenuOpen(false); }}
                      data-testid="menu-to-xlsx"
                      className="flex w-full items-center px-4 py-2 text-xs text-slate-600 transition hover:bg-slate-50"
                    >
                      {dict.export.toXlsx || defaultDict.export.toXlsx}
                    </button>
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => { handleExport("html"); setMoreMenuOpen(false); }}
                      className="flex w-full items-center px-4 py-2 text-xs text-slate-600 transition hover:bg-slate-50"
                    >
                      {dict.export.toHtml}
                    </button>
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
                      onClick={() => { handleImageOneTap("jpg"); setMoreMenuOpen(false); }}
                      data-testid="menu-to-jpg"
                      className="flex w-full items-center px-4 py-2 text-xs text-slate-600 transition hover:bg-slate-50"
                    >
                      {dict.export.toJpg || defaultDict.export.toJpg}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Privacy notice */}
            <p className="text-[11px] text-slate-500">
              {dict.export.privacy}
            </p>
          </>
        )}
      </div>
      )}

      {/* Image export status surface: progress, long-doc prompt, warnings,
          errors and the split-result share row */}
      {state.content && (
        <ImageExportPanel
          ref={imagePanelRef}
          markdown={state.content.content}
          renderedHtml={renderedHtml}
          originalFilename={state.content.filename}
          locale={locale}
          dict={dict}
          source={state.content.source === "file" ? "file" : "paste"}
          onTryPdf={handleImageTryPdf}
          onSuccess={handleImageSuccess}
          onConvertingChange={setImageConverting}
        />
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

      {/* Loading message for EPUB */}
      {loadingFormat === "epub" && (
        <p className="text-center text-xs text-slate-500">
          {dict.export.generatingEpub || defaultDict.export.generatingEpub} This may take a few seconds.
        </p>
      )}

      {/* Post-conversion prompt: the Phase 1.5 teaser, or the thumbs feedback */}
      {lastSuccessFormat && postConvertPrompt === "teaser" && dict.featureTeaser && (
        <FeatureTeaser
          key={`teaser-${successSeq}`}
          dict={dict}
          locale={locale}
          onAnswered={() => {
            teaserPendingRef.current = false;
          }}
          onDismiss={() => {
            teaserPendingRef.current = false;
            setLastSuccessFormat(null);
          }}
        />
      )}
      {lastSuccessFormat && postConvertPrompt === "thumbs" && dict.postConvertFeedback && (
        <PostConvertFeedback
          key={`${lastSuccessFormat}-${successSeq}`}
          format={lastSuccessFormat}
          dict={dict}
          onDismiss={() => setLastSuccessFormat(null)}
        />
      )}
    </div>
  );
}
