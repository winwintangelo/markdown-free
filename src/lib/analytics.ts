/**
 * Umami Analytics - Privacy-friendly event tracking
 *
 * Events are only sent if Umami is loaded (production with env vars set).
 * All events are fire-and-forget - never blocks UI.
 */

declare global {
  interface Window {
    umami?: {
      track: (eventName: string, eventData?: Record<string, string>) => void;
    };
  }
}

/**
 * Track a custom event with Umami Analytics
 * @param eventName - Short event name (max 50 chars)
 * @param data - Optional key-value properties (strings only, no PII)
 */
export function trackEvent(
  eventName: string,
  data?: Record<string, string>
): void {
  if (typeof window !== "undefined" && window.umami?.track) {
    window.umami.track(eventName, data);
  }
}

// Predefined event helpers for type safety

export type UploadSource = "file" | "paste";
export type ExportFormat = "pdf" | "txt" | "html";
export type UploadErrorReason = "invalid_type" | "too_large" | "parse_error";
export type ConvertErrorCode = "pdf_timeout" | "pdf_server_error" | "unknown";

/**
 * Track when user starts an upload (file or paste)
 */
export function trackUploadStart(source: UploadSource): void {
  trackEvent("upload_start", { source });
}

/**
 * Track upload errors (before conversion)
 */
export function trackUploadError(
  source: UploadSource,
  reason: UploadErrorReason
): void {
  trackEvent("upload_error", { source, reason });
}

/**
 * Track successful conversion
 */
export function trackConvertSuccess(
  format: ExportFormat,
  source: UploadSource
): void {
  trackEvent("convert_success", { format, source });
}

/**
 * Track conversion errors
 */
export function trackConvertError(
  format: ExportFormat,
  errorCode: ConvertErrorCode
): void {
  trackEvent("convert_error", { format, error_code: errorCode });
}
