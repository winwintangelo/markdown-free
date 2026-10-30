import { downloadFile, generateFilename } from "./download";

export interface PdfExportResult {
  success: boolean;
  error?: {
    code: string;
    message: string;
    retryable: boolean;
  };
  /** Requests made: 2 when the first failed and was retried. */
  attempts: number;
  /** Why the first request failed, when it was retried. */
  firstErrorCode?: string;
}

export interface PdfGenerateResult {
  success: boolean;
  blob?: Blob;
  filename?: string;
  error?: {
    code: string;
    message: string;
    retryable: boolean;
  };
  /** Requests made: 2 when the first failed and was retried. */
  attempts: number;
  /** Why the first request failed, when it was retried. */
  firstErrorCode?: string;
}

/**
 * Failures that a second request can fix: a dropped connection, a cold
 * instance that ran out of time, or the platform answering for a function that
 * crashed. GATEWAY_* are the platform's own non-JSON 5xx responses.
 */
const TRANSIENT_CODES = new Set([
  "NETWORK_ERROR",
  "GENERATION_TIMEOUT",
  "GENERATION_FAILED",
  "GATEWAY_TIMEOUT",
  "GATEWAY_ERROR",
]);

/**
 * A timeout that took this long most likely comes from the document itself
 * (a heavy one), and a second request would keep the visitor waiting as long
 * again for the same result. Shorter ones point at a cold start.
 */
const SLOW_TIMEOUT_MS = 20_000;

/** Pause before the retry, so a struggling instance or network can recover. */
const RETRY_DELAY_MS = 1500;

type Attempt = Omit<PdfGenerateResult, "attempts" | "firstErrorCode">;

export type PdfPageSize = "A4" | "Letter";
export type PdfFontStyle = "sans" | "serif";

export interface PdfOptions {
  /** Paper size; defaults to the locale-aware choice from getPdfPreferences() */
  pageSize?: PdfPageSize;
  /** Body typeface family (serif = Noto Serif incl. CJK faces) */
  fontStyle?: PdfFontStyle;
}

/**
 * Locale-native defaults (build plan Phase 0a): Letter for readers whose
 * browser reports a Letter-paper region (US, Canada, Philippines) on the
 * English site, A4 everywhere else. `?font=serif` in the URL selects the serif
 * stack — the hook template-preset pages use.
 */
export function getPdfPreferences(locale: string): Required<PdfOptions> {
  let pageSize: PdfPageSize = "A4";
  let fontStyle: PdfFontStyle = "sans";
  if (typeof window !== "undefined") {
    const lang = (navigator.language || "").toLowerCase();
    if (locale === "en" && /^(en-us|en-ca|en-ph|es-us)$/.test(lang)) pageSize = "Letter";
    try {
      const params = new URLSearchParams(window.location.search);
      const size = params.get("paper");
      if (size && /^letter$/i.test(size)) pageSize = "Letter";
      if (size && /^a4$/i.test(size)) pageSize = "A4";
      if (/^serif$/i.test(params.get("font") || "")) fontStyle = "serif";
    } catch {
      // URL access can fail in exotic embedding contexts; keep defaults
    }
  }
  return { pageSize, fontStyle };
}

/**
 * Generate PDF blob without downloading. A transient failure is retried once,
 * unless the visitor cancelled.
 */
export async function generatePdfBlob(
  markdown: string,
  originalFilename: string | null,
  signal?: AbortSignal,
  options: PdfOptions = {}
): Promise<PdfGenerateResult> {
  const started = Date.now();
  const first = await requestPdf(markdown, originalFilename, signal, options);
  const code = first.error?.code;
  const retry =
    !first.success &&
    code !== undefined &&
    TRANSIENT_CODES.has(code) &&
    !(code === "GENERATION_TIMEOUT" && Date.now() - started >= SLOW_TIMEOUT_MS) &&
    !signal?.aborted;
  if (!retry) return { ...first, attempts: 1 };

  const paused = await new Promise<boolean>((resolve) => {
    const timer = setTimeout(() => resolve(true), RETRY_DELAY_MS);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        resolve(false);
      },
      { once: true }
    );
  });
  if (!paused) return { ...first, attempts: 1 };

  const second = await requestPdf(markdown, originalFilename, signal, options);
  return { ...second, attempts: 2, firstErrorCode: code };
}

/** One request to the PDF route; never throws. */
async function requestPdf(
  markdown: string,
  originalFilename: string | null,
  signal?: AbortSignal,
  options: PdfOptions = {}
): Promise<Attempt> {
  try {
    const response = await fetch("/api/convert/pdf", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        markdown,
        filename: originalFilename,
        ...(options.pageSize ? { pageSize: options.pageSize } : {}),
        ...(options.fontStyle ? { fontStyle: options.fontStyle } : {}),
      }),
      signal,
    });

    // Handle error responses. The route and the middleware answer in JSON; a
    // body that isn't JSON comes from the platform (a 504
    // FUNCTION_INVOCATION_TIMEOUT, for one).
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);

      const errorCode =
        errorData?.error ||
        (response.status === 504
          ? "GATEWAY_TIMEOUT"
          : response.status >= 500
            ? "GATEWAY_ERROR"
            : "UNKNOWN_ERROR");
      const errorMessage = errorData?.message || `Request failed with status ${response.status}.`;

      return {
        success: false,
        error: {
          code: errorCode,
          message: errorMessage,
          retryable: TRANSIENT_CODES.has(errorCode),
        },
      };
    }

    // Get PDF blob
    const pdfBlob = await response.blob();

    // Extract filename from Content-Disposition header or generate one
    const contentDisposition = response.headers.get("Content-Disposition");
    let filename = generateFilename(originalFilename, "pdf");

    if (contentDisposition) {
      const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;\s]+)/i);
      if (utf8Match) {
        try {
          filename = decodeURIComponent(utf8Match[1]);
        } catch {
          // Fall back to ASCII filename
        }
      }

      if (!utf8Match) {
        const asciiMatch = contentDisposition.match(/filename="?([^";\n]+)"?/);
        if (asciiMatch) {
          filename = asciiMatch[1];
        }
      }
    }

    return { success: true, blob: pdfBlob, filename };
  } catch (error) {
    if (signal?.aborted || (error instanceof Error && error.name === "AbortError")) {
      return {
        success: false,
        error: {
          code: "ABORTED",
          message: "PDF generation was cancelled.",
          retryable: false,
        },
      };
    }

    // fetch() and reading the body reject with a TypeError when the connection
    // fails, worded per browser: "Failed to fetch" (Chrome), "NetworkError when
    // attempting to fetch resource." (Firefox), "Load failed" (Safari).
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: "Connection lost. Please check your internet and try again.",
        retryable: true,
      },
    };
  }
}

/**
 * Export content as PDF via server-side generation (generate + download)
 */
export async function exportPdf(
  markdown: string,
  originalFilename: string | null,
  signal?: AbortSignal,
  options: PdfOptions = {}
): Promise<PdfExportResult> {
  const result = await generatePdfBlob(markdown, originalFilename, signal, options);

  if (result.success && result.blob && result.filename) {
    const url = URL.createObjectURL(result.blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = result.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return {
    success: result.success,
    error: result.error,
    attempts: result.attempts,
    firstErrorCode: result.firstErrorCode,
  };
}

