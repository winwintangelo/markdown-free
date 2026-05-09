/**
 * Safely serialize JSON-LD data for inline <script> tags.
 *
 * JSON.stringify does not escape `</`, so a string field containing
 * `</script>` (or `<!--`) would break out of an inline JSON-LD script.
 * Replacing `<` with `<` neutralises every variant.
 *
 * U+2028 / U+2029 are also escaped — historical JS parsers treated them
 * as line terminators inside string literals, breaking the inline script.
 */
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
