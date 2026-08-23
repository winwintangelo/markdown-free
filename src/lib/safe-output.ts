/**
 * Helpers for safely emitting user-supplied values into HTTP headers and
 * generated markup. Shared by the PDF/DOCX/EPUB convert routes.
 */

/**
 * Derive the download filename from the (untrusted) request `filename` field.
 * Non-string values fall back to the default rather than throwing.
 * Preserves the historical behavior of only swapping a .md/.markdown/.txt
 * extension (a name without one keeps its original form).
 */
export function deriveOutputFilename(filename: unknown, extension: string): string {
  if (typeof filename !== "string" || filename.trim() === "") {
    return `document.${extension}`;
  }
  return filename.replace(/\.(md|markdown|txt)$/i, `.${extension}`);
}

/**
 * Build a Content-Disposition value whose quoted `filename="…"` fallback can
 * never break out of the quoted-string (double quote, backslash) or the header
 * itself (CR/LF and other control characters). Non-ASCII characters become
 * "-" in the fallback; RFC 5987 clients get the real name via filename*.
 */
export function buildContentDisposition(outputFilename: string): string {
  // No legitimate filename contains control characters — drop them outright
  // (they'd otherwise allow header injection / malformed responses).
  // eslint-disable-next-line no-control-regex
  const cleaned = outputFilename.replace(/[\x00-\x1f\x7f]/g, "");
  const asciiFallback = cleaned
    // eslint-disable-next-line no-control-regex
    .replace(/[^\x20-\x7e]/g, "-")
    .replace(/["\\]/g, "-");
  const encoded = encodeURIComponent(cleaned);
  return `attachment; filename="${asciiFallback}"; filename*=UTF-8''${encoded}`;
}

/**
 * Minimal HTML/XML entity escaping for interpolating text into markup we
 * generate ourselves (e.g. the <title> of the DOCX intermediate document).
 */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
