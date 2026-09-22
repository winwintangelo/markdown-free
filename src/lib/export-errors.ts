import type { Dictionary } from "@/i18n";

/**
 * Text for the export error banner, in the visitor's language.
 *
 * The convert routes and the client exporters report a code ("GENERATION_TIMEOUT",
 * "RATE_LIMITED", …) plus an English message. The banner shows neither the
 * English message nor a hard-coded English heading: both come from the
 * dictionary, chosen by the code. The raw message stays in the error object for
 * the console log.
 */

/** "PDF generation failed", "DOCX 生成失败", … */
export function exportErrorTitle(format: string, dict: Dictionary): string {
  return dict.errors.exportFailed.replace("{format}", format.toUpperCase());
}

/** The explanation under the heading, picked by the error code. */
export function exportErrorMessage(code: string, format: string, dict: Dictionary): string {
  const e = dict.errors;
  switch (code) {
    case "GENERATION_TIMEOUT":
      return e.timeout.replace("{format}", format.toUpperCase());
    case "NETWORK_ERROR":
      return e.networkError;
    case "RATE_LIMITED":
      return e.rateLimited;
    case "CONTENT_TOO_LARGE":
      return e.contentTooLarge;
    case "INVALID_CONTENT":
      return e.invalidContent;
    case "NO_TABLES":
      return e.noTables;
    case "ABORTED":
      return e.aborted;
    // GENERATION_FAILED, UNKNOWN_ERROR, FORBIDDEN and anything new
    default:
      return e.pdfError;
  }
}
