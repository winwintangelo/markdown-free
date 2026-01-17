/**
 * Analytics - Dual tracking with Umami and Vercel Web Analytics
 *
 * Both are privacy-friendly and cookieless.
 * - Umami: Primary analytics with detailed event tracking
 * - Vercel: Secondary analytics with Web Vitals (can be disabled via env var)
 *
 * Event Categories:
 * - Conversion events: upload_start, upload_error, convert_success, convert_error
 * - Engagement events: section_visible, scroll_depth, time_on_page, upload_hover, paste_toggle_click, export_hover
 * - Navigation events: nav_click, feedback_click
 */

import { track as vercelTrack } from "@vercel/analytics";

declare global {
  interface Window {
    umami?: {
      track: (eventName: string, eventData?: Record<string, string>) => void;
    };
  }
}

/**
 * Feature switch for Vercel custom events
 * Set NEXT_PUBLIC_VERCEL_EVENTS_ENABLED=false to disable
 * Default: enabled (true)
 */
const isVercelEventsEnabled = (): boolean => {
  if (typeof window === "undefined") return false;
  const envValue = process.env.NEXT_PUBLIC_VERCEL_EVENTS_ENABLED;
  // Default to true if not set
  return envValue !== "false";
};

/**
 * Track a custom event with Umami Analytics
 * Also sends to Vercel Analytics if enabled
 * @param eventName - Short event name (max 50 chars)
 * @param data - Optional key-value properties (strings only, no PII)
 */
export function trackEvent(
  eventName: string,
  data?: Record<string, string>
): void {
  // Umami tracking (always enabled when available)
  if (typeof window !== "undefined" && window.umami?.track) {
    window.umami.track(eventName, data);
  }

  // Vercel tracking (controlled by feature switch)
  if (isVercelEventsEnabled()) {
    try {
      // Vercel track() accepts up to 5 properties
      // We limit data to avoid hitting Vercel's property limit
      const vercelData = data ? Object.fromEntries(
        Object.entries(data).slice(0, 5)
      ) : undefined;
      vercelTrack(eventName, vercelData);
    } catch {
      // Silently fail - don't break the app if Vercel tracking fails
    }
  }
}

// =============================================================================
// CONVERSION EVENTS (existing + enhanced)
// =============================================================================

export type UploadSource = "file" | "paste" | "sample";
export type ExportFormat = "pdf" | "txt" | "html";

// Error categories for "Failure Lens" tracking
export type ErrorCategory = "user_error" | "system_error";

// Upload error reasons with category mapping
export type UploadErrorReason = "invalid_type" | "too_large" | "parse_error" | "read_error";
export const UPLOAD_ERROR_CATEGORY: Record<UploadErrorReason, ErrorCategory> = {
  invalid_type: "user_error",    // User uploaded wrong file type
  too_large: "user_error",       // User uploaded file that's too big
  parse_error: "user_error",     // File couldn't be parsed (corrupted/binary)
  read_error: "system_error",    // System couldn't read the file
};

// Convert error codes with category mapping
export type ConvertErrorCode = 
  | "pdf_timeout" 
  | "pdf_server_error" 
  | "network_error"
  | "aborted"
  | "unknown";

export const CONVERT_ERROR_CATEGORY: Record<ConvertErrorCode, ErrorCategory> = {
  pdf_timeout: "system_error",      // Server took too long
  pdf_server_error: "system_error", // 500 error from server
  network_error: "system_error",    // Network connectivity issue
  aborted: "user_error",            // User cancelled the request
  unknown: "system_error",          // Unknown error (assume system)
};

/**
 * Track when user starts an upload (file or paste)
 */
export function trackUploadStart(source: UploadSource): void {
  trackEvent("upload_start", { source });
}

/**
 * Track upload errors with category (User Error vs System Error)
 */
export function trackUploadError(
  source: UploadSource,
  reason: UploadErrorReason
): void {
  const category = UPLOAD_ERROR_CATEGORY[reason];
  trackEvent("upload_error", { source, reason, category });
}

/**
 * Track when user abandons upload (closes tab during file read)
 */
export function trackUploadAbandoned(source: UploadSource): void {
  trackEvent("upload_abandoned", { source });
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
 * Track conversion errors with category (User Error vs System Error)
 */
export function trackConvertError(
  format: ExportFormat,
  errorCode: ConvertErrorCode
): void {
  const category = CONVERT_ERROR_CATEGORY[errorCode];
  trackEvent("convert_error", { format, error_code: errorCode, category });
}

/**
 * Track when user abandons conversion (closes tab during PDF generation)
 * This is tracked via beforeunload when a conversion is in progress
 */
export function trackConvertAbandoned(format: ExportFormat, source: UploadSource): void {
  trackEvent("convert_abandoned", { format, source });
}

// =============================================================================
// ENGAGEMENT EVENTS (new - understand user behavior before conversion)
// =============================================================================

export type SectionName = "hero" | "upload" | "paste" | "export" | "preview" | "footer";
export type ScrollDepth = "25" | "50" | "75" | "100";
export type TimeOnPageMilestone = "10s" | "30s" | "60s";
export type NavDestination = "about" | "privacy" | "home";

/**
 * Track when a section becomes visible in viewport
 * Helps understand how far users scroll before bouncing
 */
export function trackSectionVisible(section: SectionName): void {
  trackEvent("section_visible", { section });
}

/**
 * Track scroll depth milestones (25%, 50%, 75%, 100%)
 * Helps understand engagement depth
 */
export function trackScrollDepth(depth: ScrollDepth): void {
  trackEvent("scroll_depth", { depth });
}

/**
 * Track time-on-page engagement milestones
 * Users who stay longer are more engaged even without conversion
 */
export function trackTimeOnPage(milestone: TimeOnPageMilestone): void {
  trackEvent("time_on_page", { milestone });
}

/**
 * Track when user hovers over the upload area (shows intent)
 * Only track once per session to avoid spam
 */
export function trackUploadHover(): void {
  trackEvent("upload_hover");
}

/**
 * Track when user clicks "Or paste Markdown instead"
 * Shows consideration of alternative input method
 */
export function trackPasteToggleClick(): void {
  trackEvent("paste_toggle_click");
}

/**
 * Track when user clicks "Try sample file"
 * Shows interest in testing the tool without their own file
 */
export function trackSampleClick(): void {
  trackEvent("sample_click");
}

/**
 * Track when user hovers over disabled export buttons
 * Shows interest in conversion but no content loaded yet
 */
export function trackExportHover(format: ExportFormat): void {
  trackEvent("export_hover", { format });
}

/**
 * Track when user clicks export button with no content loaded
 * This triggers the file picker - measures "active buttons" UX effectiveness
 */
export function trackExportTriggerUpload(format: ExportFormat): void {
  trackEvent("export_trigger_upload", { format });
}

/**
 * Track when user starts dragging a file over the page
 * Shows intent to upload even if they don't complete it
 */
export function trackDragEnter(): void {
  trackEvent("drag_enter");
}

// =============================================================================
// NAVIGATION EVENTS (new - understand where users go instead of converting)
// =============================================================================

/**
 * Track navigation link clicks
 */
export function trackNavClick(destination: NavDestination): void {
  trackEvent("nav_click", { destination });
}

/**
 * Track feedback button clicks
 */
export function trackFeedbackClick(): void {
  trackEvent("feedback_click");
}

/**
 * Track feedback form submission with content
 * Note: Umami stores event data, making this a simple way to collect feedback
 * without needing a separate backend/database.
 */
export function trackFeedbackSubmit(data: {
  feedback: string;
  email?: string;
  feedbackLength: string;
  hasEmail: string;
}): void {
  trackEvent("feedback_submit", {
    feedback: data.feedback,
    email: data.email || "",
    feedback_length: data.feedbackLength,
    has_email: data.hasEmail,
  });
}

// =============================================================================
// LOCALIZATION EVENTS (track language behavior)
// =============================================================================

export type SupportedLocale = "en" | "it" | "es" | "ja" | "ko" | "zh-Hans" | "zh-Hant" | "id" | "vi";

/**
 * Track page view with locale information
 * This supplements Umami's automatic pageview tracking with locale data
 */
export function trackLocalePageView(locale: SupportedLocale, page: string): void {
  trackEvent("locale_pageview", { locale, page });
}

/**
 * Track language switcher usage
 */
export function trackLanguageSwitch(from: SupportedLocale, to: SupportedLocale): void {
  trackEvent("language_switched", { from, to, via: "switcher" });
}

/**
 * Track conversion (export) with locale context
 */
export function trackLocaleConversion(
  locale: SupportedLocale,
  format: "pdf" | "txt" | "html"
): void {
  trackEvent("locale_conversion", { locale, format });
}
