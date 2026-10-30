/**
 * Analytics - Dual tracking with Umami and Vercel Web Analytics
 *
 * Both are privacy-friendly and cookieless.
 * - Umami: Primary analytics with detailed event tracking
 * - Vercel: Secondary analytics with Web Vitals (can be disabled via env var)
 *
 * Event Categories:
 * - Conversion events: upload_start, upload_error, convert_success, convert_error
 * - Usage signals: usage_profile, doc_profile (ranges only, see src/lib/usage-signals.ts)
 * - Feedback v2: invite_*, vote_*, limit_*, paid_*, suggest_*, idea_sent (catalog below)
 * - Engagement events: section_visible, scroll_depth, time_on_page, upload_hover, paste_toggle_click, export_hover
 * - Navigation events: nav_click, feedback_click
 */

import { track as vercelTrack } from "@vercel/analytics";
import {
  type FeatureKey,
  type IdeaKind,
  type LimitPayAnswer,
  type PaidAnswer,
  type PaidNeed,
} from "@/lib/feature-teaser";
import { currentUses, sizeBucket, type DocProfile, type UsageProfile } from "@/lib/usage-signals";

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
export type ExportFormat = "pdf" | "txt" | "html" | "docx" | "epub" | "png" | "jpg" | "xlsx";

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
  | "gateway_timeout"
  | "gateway_error"
  | "network_error"
  | "too_large"
  | "rate_limited"
  | "forbidden"
  | "invalid_content"
  | "client_error"
  | "aborted"
  | "img_too_large"
  | "img_render_failed"
  | "unknown";

export const CONVERT_ERROR_CATEGORY: Record<ConvertErrorCode, ErrorCategory> = {
  pdf_timeout: "system_error",      // The route ran out of time (JSON GENERATION_TIMEOUT)
  pdf_server_error: "system_error", // The route failed (JSON GENERATION_FAILED)
  gateway_timeout: "system_error",  // The platform stopped the function (non-JSON 504)
  gateway_error: "system_error",    // Any other non-JSON 5xx from the platform
  network_error: "system_error",    // Network connectivity issue
  too_large: "user_error",          // The document is over a size limit (413)
  rate_limited: "user_error",       // Too many conversions from one address (429)
  forbidden: "system_error",        // The request came from an origin we don't serve (403)
  invalid_content: "user_error",    // The route couldn't read the document (400)
  client_error: "system_error",     // An exception in the browser, outside the request
  aborted: "user_error",            // User cancelled the request
  img_too_large: "user_error",      // Document exceeds canvas limits even degraded
  img_render_failed: "system_error", // Browser canvas/rasterization failure
  unknown: "system_error",          // Unknown error (assume system)
};

/**
 * Track when user starts an upload (file or paste)
 */
export function trackUploadStart(source: UploadSource): void {
  trackEvent("upload_start", { source });
}

/**
 * Track upload errors with category (User Error vs System Error).
 * `uses` says whether the visitor who hit the error converts often; a file
 * rejected as too large also carries its size range (`fileSize` in bytes).
 */
export function trackUploadError(
  source: UploadSource,
  reason: UploadErrorReason,
  fileSize?: number
): void {
  const category = UPLOAD_ERROR_CATEGORY[reason];
  trackEvent("upload_error", {
    source,
    reason,
    category,
    uses: currentUses(),
    ...(reason === "too_large" && fileSize !== undefined ? { size: sizeBucket(fileSize) } : {}),
  });
}

/**
 * Track when user abandons upload (closes tab during file read)
 */
export function trackUploadAbandoned(source: UploadSource): void {
  trackEvent("upload_abandoned", { source });
}

/**
 * Track successful conversion
 * `extra` carries format-specific dimensions (e.g. split_parts for png/jpg)
 */
export function trackConvertSuccess(
  format: ExportFormat,
  source: UploadSource,
  extra?: Record<string, string>
): void {
  trackEvent("convert_success", { format, source, ...extra });
  // Also fire a per-format event so the growth loop can query conversions BY TYPE:
  // the Vercel Web Analytics API groups by eventName but NOT by custom properties,
  // so `format` on convert_success isn't queryable — a distinct `conv_<format>` name is.
  trackEvent(`conv_${format}`, { source });
}

/**
 * Track conversion errors with category (User Error vs System Error)
 */
export function trackConvertError(
  format: ExportFormat,
  errorCode: ConvertErrorCode
): void {
  const category = CONVERT_ERROR_CATEGORY[errorCode];
  trackEvent("convert_error", { format, error_code: errorCode, category, uses: currentUses() });
}

/**
 * A conversion request failed and was retried once (src/lib/export-pdf.ts).
 * `error_code` is the first failure; `outcome` says whether the retry
 * produced the file ("recovered") or failed too ("failed", which also logs a
 * convert_error with the second failure).
 */
export function trackConvertRetry(format: ExportFormat, firstError: ConvertErrorCode, recovered: boolean): void {
  trackEvent("convert_retry", { format, error_code: firstError, outcome: recovered ? "recovered" : "failed" });
}

/**
 * Once per browser per day, at its first conversion that day: how heavily this
 * browser uses the site, in ranges (src/lib/usage-signals.ts). The profile
 * describes the browser as of that conversion.
 */
export function trackUsageProfile(profile: UsageProfile): void {
  trackEvent("usage_profile", { ...profile });
}

/**
 * Once per document per tab, at its first successful conversion: its size and
 * image ranges, whether it was converted on an earlier day, and how many
 * documents this tab has converted. Never the content or the name.
 */
export function trackDocProfile(doc: DocProfile): void {
  trackEvent("doc_profile", { ...doc });
}

/**
 * Track when user abandons conversion (closes tab during PDF generation)
 * This is tracked via beforeunload when a conversion is in progress
 */
export function trackConvertAbandoned(format: ExportFormat, source: UploadSource): void {
  trackEvent("convert_abandoned", { format, source });
}

/**
 * Track when user shares a file via native share sheet (mobile)
 */
export function trackShareFile(
  format: ExportFormat,
  source: UploadSource
): void {
  trackEvent("share_file", { format, source });
}

/**
 * Track when split image output is handed to navigator.share({ files })
 * instead of ZIP download (the mobile 长图 workflow)
 */
export function trackShareFilesUsed(
  format: ExportFormat,
  parts: number
): void {
  trackEvent("share_files_used", { format, parts: String(parts) });
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
 * Track a feedback-form submission — counts only.
 *
 * The message text and any email go to the first-party /api/feedback endpoint
 * (src/app/api/feedback/route.ts), never to analytics: the privacy policy
 * promises no personal information reaches the analytics provider.
 */
export function trackFeedbackSubmit(data: {
  feedbackLength: string;
  hasEmail: string;
  delivered: string;
}): void {
  trackEvent("feedback_submit", {
    feedback_length: data.feedbackLength,
    has_email: data.hasEmail,
    delivered: data.delivered,
  });
}

// =============================================================================
// LOCALIZATION EVENTS (track language behavior)
// =============================================================================

export type SupportedLocale = "en" | "it" | "es" | "ja" | "ko" | "zh-Hans" | "zh-Hant" | "id" | "vi" | "hi";

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
  format: ExportFormat
): void {
  trackEvent("locale_conversion", { locale, format });
}

// =============================================================================
// AI REFERRAL TRACKING (track traffic from AI assistants)
// =============================================================================

/**
 * Known AI referrer domains for segmentation
 */
const AI_REFERRERS: Record<string, string> = {
  "chat.openai.com": "chatgpt",
  "chatgpt.com": "chatgpt",
  "copilot.microsoft.com": "copilot",
  "bing.com/chat": "copilot",
  "perplexity.ai": "perplexity",
  "claude.ai": "claude",
  "anthropic.com": "claude",
  "gemini.google.com": "gemini",
  "bard.google.com": "gemini",
  "you.com": "you",
  "poe.com": "poe",
  "phind.com": "phind",
  "kagi.com": "kagi",
};

/**
 * Detect if the referrer is from an AI assistant
 */
export function detectAIReferrer(): { isAI: boolean; source: string } {
  if (typeof window === "undefined" || !document.referrer) {
    return { isAI: false, source: "direct" };
  }

  try {
    const referrerUrl = new URL(document.referrer);
    const hostname = referrerUrl.hostname.toLowerCase();

    // Check exact matches and partial matches
    for (const [domain, source] of Object.entries(AI_REFERRERS)) {
      if (hostname === domain || hostname.endsWith(`.${domain}`)) {
        return { isAI: true, source };
      }
      // Check if domain is part of hostname (e.g., chat.openai.com)
      if (hostname.includes(domain.split(".")[0]) && domain.includes(".")) {
        return { isAI: true, source };
      }
    }

    // Return non-AI referrer
    return { isAI: false, source: hostname || "direct" };
  } catch {
    return { isAI: false, source: "unknown" };
  }
}

/**
 * Track AI referral on page load
 * Call this once when the page loads to track AI traffic sources
 */
export function trackAIReferral(): void {
  const { isAI, source } = detectAIReferrer();
  
  if (isAI) {
    trackEvent("ai_referral", { source });
  }
}

/**
 * Track conversion with AI referral context
 * Use this to track which AI sources drive actual conversions
 */
export function trackConversionWithReferrer(
  format: "pdf" | "txt" | "html" | "docx" | "epub"
): void {
  const { isAI, source } = detectAIReferrer();

  trackEvent("conversion_referrer", {
    format,
    is_ai: isAI ? "true" : "false",
    source,
  });
}

// =============================================================================
// INTERNAL REFERRAL TRACKING (track which intent pages drive traffic to home)
// =============================================================================

/**
 * Known home page paths (these are destinations, not sources)
 */
const HOME_PATHS = new Set(["/", "/it", "/es", "/ja", "/ko", "/zh-Hans", "/zh-Hant", "/id", "/vi", "/hi"]);

/**
 * Non-intent paths to exclude from internal referral tracking
 */
const EXCLUDED_PATHS = new Set(["/about", "/privacy", "/faq"]);

const PREV_PATH_KEY = "mdf:prev-path";

/**
 * Detect if the user arrived from an internal intent page.
 * Reads from sessionStorage first (client-side navigation, set by RouteHistoryTracker),
 * falls back to document.referrer (hard navigation / fresh tab).
 * Returns the intent page slug (e.g., "readme-to-pdf", "it/convertire-markdown-pdf")
 * or null if not an internal intent referral. Consuming the value clears it.
 */
export function detectInternalReferral(): string | null {
  if (typeof window === "undefined") return null;

  let path: string | null = null;

  // 1. Client-side nav: RouteHistoryTracker stored the previous pathname.
  try {
    const stored = sessionStorage.getItem(PREV_PATH_KEY);
    if (stored) {
      path = stored.replace(/\/$/, "") || "/";
      sessionStorage.removeItem(PREV_PATH_KEY);
    }
  } catch {
    // sessionStorage unavailable — fall through to document.referrer
  }

  // 2. Hard nav fallback: document.referrer must be same-origin.
  if (!path && document.referrer) {
    try {
      const referrerUrl = new URL(document.referrer);
      if (referrerUrl.hostname !== window.location.hostname) {
        return null;
      }
      path = referrerUrl.pathname.replace(/\/$/, "") || "/";
    } catch {
      return null;
    }
  }

  if (!path) return null;

  // Skip if source is a home page (not an intent page)
  if (HOME_PATHS.has(path)) return null;

  // Skip non-intent pages
  for (const excluded of EXCLUDED_PATHS) {
    if (path === excluded || path.endsWith(excluded)) {
      return null;
    }
  }

  return path.replace(/^\//, "");
}

/**
 * Track internal referral from an intent page to the home/converter page.
 * Fires once per page load when a user navigates from an intent page.
 */
export function trackInternalReferral(): void {
  const slug = detectInternalReferral();
  if (slug) {
    trackEvent("internal_referral", { source: slug });
  }
}

// =============================================================================
// COMPARISON / INTENT PAGE CTA EVENTS
// =============================================================================

/**
 * Track a CTA click on a comparison/intent page (→ the converter).
 * The source PAGE is recovered server-side by grouping this event by requestPath
 * (Vercel's events API can't group by custom props); `target` and `position`
 * ride along as Umami-side detail. `position: "inline"` = a file loaded into the
 * embedded InlineConverter (option C) — engagement, not just a click.
 */
export function trackComparisonCta(
  target: "converter" | "image",
  position: "top" | "bottom" | "inline"
): void {
  trackEvent("comparison_cta_click", { target, position });
}

// =============================================================================
// POST-CONVERT FEEDBACK EVENTS
// =============================================================================

/**
 * Track a thumbs-up (positive) post-conversion feedback
 */
export function trackFeedbackPositive(format: string): void {
  trackEvent("feedback_positive", { format });
}

/**
 * Track a thumbs-down (negative) post-conversion feedback with the selected
 * categories. Free-text comments never reach analytics — they go to the
 * first-party /api/feedback endpoint (see sendFeedback in lib/feedback-client.ts).
 */
export function trackFeedbackNegative(format: string, categories: string[], hasComment = false): void {
  trackEvent("feedback_negative", {
    format,
    ...(categories.length > 0 ? { categories: categories.join(",") } : {}),
    has_comment: hasComment ? "yes" : "no",
  });
}

/**
 * Track when a user skips the post-conversion feedback prompt
 */
export function trackFeedbackSkipped(format: string): void {
  trackEvent("feedback_skipped", { format });
}

// =============================================================================
// FEEDBACK V2: paid interest and suggestions (src/lib/feature-teaser.ts).
// Event catalog, one funnel per path:
//
//   File over 1 MB (always asks):  limit_prompt_shown → limit_pay_<answer>
//     → updates_signup (yes / maybe only)
//   Paid interest (trigger = repeat, the heavy-user question):
//     paid_prompt_shown → paid_prompt_viewed → paid_prompt_opened
//       → paid_need_<need> · paid_interest_<answer> → updates_signup
//       · paid_prompt_dismissed
//   Suggest link:  suggest_opened → idea_sent (kind = suggestion)
//
// The vote invitation and board (invite_*, vote_*) were retired on
// 2026-10-29; their events stop then.
//
// Key steps also fire under a name that carries the trigger or answer
// (paid_interest_maybe, …): the Vercel dashboard counts events by name and
// cannot break a property down, so a per-name count is what it can show. The
// properties stay filterable through the Vercel API (`eventData/<prop>`).
// Vercel keeps at most 5 properties per event. Typed text and email addresses
// never reach analytics.
// =============================================================================

/**
 * An email left for updates about a feature. The address goes to /api/notify
 * only. `source` says where: limit, or paid_repeat on the heavy-user question.
 */
export function trackUpdatesSignup(source: string, feature: string): void {
  trackEvent("updates_signup", { source, feature, uses: currentUses() });
  trackEvent(`updates_signup_${source}`, { feature });
}

/**
 * Typed text was stored (/api/ideas). Only the kind and the feature it is
 * about reach analytics, never the text.
 */
export function trackIdeaSent(kind: IdeaKind, feature: string | null): void {
  trackEvent("idea_sent", { kind, feature: feature ?? "none" });
  trackEvent(`idea_sent_${kind}`);
}

/**
 * The large-file card appeared under the "file too large" error. `detected` is
 * the rejected file's size range: what the visitor needs, without asking.
 */
export function trackLimitPromptShown(detectedBytes: number | null, where: string): void {
  trackEvent("limit_prompt_shown", {
    detected: detectedBytes === null ? "unknown" : sizeBucket(detectedBytes),
    where,
    uses: currentUses(),
  });
}

/**
 * The answer to "Would you consider paying for it?" (files up to 10 MB). A
 * stated intent from someone who just hit the limit, not a purchase.
 */
export function trackLimitPayAnswer(answer: LimitPayAnswer, detectedBytes: number | null, where: string): void {
  const detected = detectedBytes === null ? "unknown" : sizeBucket(detectedBytes);
  trackEvent("limit_pay", { answer, detected, where, uses: currentUses() });
  trackEvent(`limit_pay_${answer}`, { detected });
}

/** A paid-interest question appeared. `trigger`: repeat (the heavy-user question). */
export function trackPaidPromptShown(trigger: string, feature: FeatureKey): void {
  trackEvent("paid_prompt_shown", { trigger, feature, uses: currentUses() });
  trackEvent(`paid_prompt_shown_${trigger}`, { feature });
}

/** The repeat-visitor card stayed half on screen for a second in a visible tab. */
export function trackPaidPromptViewed(trigger: string, feature: FeatureKey): void {
  trackEvent("paid_prompt_viewed", { trigger, feature });
}

/** The visitor expanded a collapsed paid-interest question ("Tell us what you need"). */
export function trackPaidPromptOpened(trigger: string, feature: FeatureKey): void {
  trackEvent("paid_prompt_opened", { trigger, feature });
}

/** On the page-layout question: what the visitor would change first. */
export function trackPaidNeed(trigger: string, need: PaidNeed): void {
  trackEvent("paid_need", { trigger, need });
  trackEvent(`paid_need_${need}`, { trigger });
}

/**
 * The answer to "Would you consider a paid option for this?" A segment, not a
 * willingness-to-pay figure (marketing review): "paid-aware interest".
 */
export function trackPaidInterest(trigger: string, feature: FeatureKey, answer: PaidAnswer): void {
  trackEvent("paid_interest", { trigger, feature, answer, uses: currentUses() });
  trackEvent(`paid_interest_${answer}`, { trigger, feature });
}

/** The visitor closed a paid-interest question with ×. */
export function trackPaidPromptDismissed(trigger: string, feature: FeatureKey): void {
  trackEvent("paid_prompt_dismissed", { trigger, feature });
}

/** The "Suggest an improvement" box was opened. */
export function trackSuggestOpened(where: string): void {
  trackEvent("suggest_opened", { where });
}
