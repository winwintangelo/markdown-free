/**
 * The contract between the browser and the DOCX route for formulas sent as
 * images (math-images.ts → api/convert/docx). Markdown images cannot carry a
 * size, so the rendered box travels in the image title:
 *
 *   ![<LaTeX>](data:image/png;base64,… "mdfree-math:i:60.52:20.31:4.12")
 *                                        mode : width : height : depth (CSS px)
 *
 * mode is `i` (inline) or `d` (display). depth is how far the formula reaches
 * below the text baseline; Word needs it to sit inline formulas on the line.
 * No DOM or Node dependencies: imported by both sides.
 */

export interface MathImageBox {
  display: boolean;
  width: number;
  height: number;
  depth: number;
}

const PREFIX = "mdfree-math";
const TITLE_RE = /^mdfree-math:([id]):(\d{1,5}(?:\.\d{1,3})?):(\d{1,5}(?:\.\d{1,3})?):(\d{1,5}(?:\.\d{1,3})?)$/;

/**
 * Upper bound for a DOCX request body. The document text itself stays capped
 * at 1MB (like the upload); the formula and diagram images the browser embeds
 * come on top, up to this cap, which keeps clear of Vercel's 4.5MB limit.
 */
export const DOCX_MAX_BODY_BYTES = 4 * 1024 * 1024;

// A formula wider or taller than this is not a formula (the page is ~600px wide)
const MAX_SIDE_PX = 4000;

const round2 = (n: number) => Math.round(n * 100) / 100;

export function formatMathImageTitle(box: MathImageBox): string {
  return [
    PREFIX,
    box.display ? "d" : "i",
    round2(box.width),
    round2(box.height),
    round2(Math.max(0, box.depth)),
  ].join(":");
}

/** Parse a title written by formatMathImageTitle; null for anything else. */
export function parseMathImageTitle(title: string): MathImageBox | null {
  const m = TITLE_RE.exec(title);
  if (!m) return null;
  const width = parseFloat(m[2]);
  const height = parseFloat(m[3]);
  const depth = parseFloat(m[4]);
  if (!(width > 0 && height > 0) || width > MAX_SIDE_PX || height > MAX_SIDE_PX) return null;
  return { display: m[1] === "d", width, height, depth: Math.min(depth, height) };
}
