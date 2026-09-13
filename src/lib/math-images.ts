import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { preprocessMarkdown } from "./math-delimiters";
import { katexOptions } from "./markdown";
import { ensureKatexStylesheet, getKatexCssWithEmbeddedFonts } from "./katex-assets";
import { formatMathImageTitle, type MathImageBox } from "./math-image-marker";

/**
 * Formulas as images for the Word (DOCX) export.
 *
 * html-to-docx has no equation support, so before a document goes to the DOCX
 * route every formula is typeset here with KaTeX, rasterized to a PNG and put
 * back into the Markdown as an embedded image:
 *
 *   $\frac{a}{b}$  →  ![<LaTeX>](data:image/png;base64,… "mdfree-math:i:w:h:depth")
 *
 * - The LaTeX travels in the alt text, entity-encoded so that no Markdown or
 *   math syntax survives in it; the route writes it into Word's alt text.
 * - The title carries the CSS-pixel box (math-image-marker.ts); the route turns
 *   it into the image size and lowers inline formulas onto the text baseline.
 * - Formulas KaTeX cannot parse stay as source (the route shows them as LaTeX
 *   in a code style, as before).
 *
 * All formulas are laid out in one offscreen column and rasterized in a few
 * large passes (one html-to-image call per chunk, then cropped): every call
 * re-serializes the ~400 KB embedded KaTeX font CSS, so per-formula calls
 * would not scale to math-heavy documents.
 */

export interface MathImageResult {
  markdown: string;
  rendered: number;
  failed: number;
}

interface Formula {
  latex: string;
  display: boolean;
}

interface Occurrence extends Formula {
  start: number;
  end: number;
}

interface RenderedFormula extends MathImageBox {
  uri: string;
}

// Word body text is 11pt (DOCX_STYLES in the route); KaTeX sizes itself relative to it
const BASE_FONT_PX = (11 * 96) / 72;
// 3× the CSS size: sharp at 200% zoom and in print (11pt at 300 dpi ≈ 3.1×)
const PIXEL_RATIO = 3;
// Bleed around the measured box so antialiased edges and glyph overhang survive the crop
const PAD_PX = 2;
const GAP_PX = 8;
// One rasterization pass stays well inside Safari's ~16.7M-pixel canvas cap
// and under html-to-image's 16,384px per-side clamp
const MAX_CHUNK_AREA = 12_000_000;
const MAX_CHUNK_SIDE = 12_000;

const MAX_CACHE_ENTRIES = 500;
const cache = new Map<string, RenderedFormula>();

const keyOf = (f: Formula) => `${f.display ? "d" : "i"}:${f.latex}`;

function cacheSet(key: string, value: RenderedFormula) {
  if (cache.size >= MAX_CACHE_ENTRIES) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.set(key, value);
}

// Parser only: node offsets must index the exact text we splice into
const parser = unified().use(remarkParse).use(remarkMath).use(remarkGfm);

interface MdNode {
  type: string;
  value?: string;
  position?: { start: { offset?: number }; end: { offset?: number } };
  children?: MdNode[];
}

function findFormulas(markdown: string): Occurrence[] {
  const found: Occurrence[] = [];
  const walk = (node: MdNode) => {
    if (node.type === "inlineMath" || node.type === "math") {
      const start = node.position?.start.offset;
      const end = node.position?.end.offset;
      if (start !== undefined && end !== undefined && node.value?.trim()) {
        found.push({ start, end, latex: node.value, display: node.type === "math" });
      }
      return;
    }
    node.children?.forEach(walk);
  };
  walk(parser.parse(markdown) as unknown as MdNode);
  return found.sort((a, b) => a.start - b.start);
}

/**
 * Entity-encode everything but letters, digits, spaces and non-ASCII. The alt
 * text then round-trips exactly (brackets, backslashes, `*`, `$`, newlines) and
 * gives the server's math and currency preprocessing nothing to act on.
 */
function encodeAlt(latex: string): string {
  return latex.trim().replace(/[^A-Za-z0-9 \u0080-\uffff]/g, (c) => `&#${c.charCodeAt(0)};`);
}

function buildColumn(): { host: HTMLDivElement; column: HTMLDivElement } {
  const host = document.createElement("div");
  host.setAttribute("aria-hidden", "true");
  host.style.cssText = "position:fixed;left:-100000px;top:0;width:max-content;pointer-events:none";
  const column = document.createElement("div");
  column.style.cssText = [
    "display:flex",
    "flex-direction:column",
    "align-items:flex-start",
    `gap:${GAP_PX}px`,
    `padding:${PAD_PX}px`,
    "width:max-content",
    "background:transparent",
    "color:#333333",
    "font-family:Arial,Helvetica,sans-serif",
    `font-size:${BASE_FONT_PX}px`,
    "line-height:1.5",
  ].join(";");
  host.appendChild(column);
  return { host, column };
}

function buildItem(html: string, display: boolean): HTMLDivElement {
  const item = document.createElement("div");
  item.style.cssText = "display:block;white-space:nowrap;margin:0;padding:0";
  // KaTeX escapes everything it emits (trust:false), so its markup is safe to
  // inject. Inline formulas get a zero-size probe that sits on the baseline.
  item.innerHTML = display
    ? html
    : `<span data-baseline style="display:inline-block;width:0;height:0"></span>${html}`;
  const block = item.querySelector<HTMLElement>(".katex-display");
  if (block) block.style.margin = "0";
  return item;
}

interface Measured {
  x: number;
  y: number;
  w: number;
  h: number;
  baseline: number | null;
}

/**
 * The crop box, relative to the column: the item's width, and vertically the
 * union of KaTeX's struts (each carries the exact height + depth of its part
 * of the formula) rather than the looser line box.
 */
function measureItem(item: HTMLElement, origin: DOMRect): Measured {
  const box = item.getBoundingClientRect();
  let top = Infinity;
  let bottom = -Infinity;
  item.querySelectorAll(".strut").forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.height > 0) {
      top = Math.min(top, r.top);
      bottom = Math.max(bottom, r.bottom);
    }
  });
  if (!Number.isFinite(top)) {
    top = box.top;
    bottom = box.bottom;
  }
  const probe = item.querySelector("[data-baseline]");
  return {
    x: box.left - origin.left - PAD_PX,
    y: top - origin.top - PAD_PX,
    w: box.width + 2 * PAD_PX,
    h: bottom - top + 2 * PAD_PX,
    baseline: probe ? probe.getBoundingClientRect().bottom - origin.top : null,
  };
}

function crop(canvas: HTMLCanvasElement, m: Measured, ratio: number, display: boolean): RenderedFormula {
  const sx = Math.min(canvas.width - 1, Math.max(0, Math.floor(m.x * ratio)));
  const sy = Math.min(canvas.height - 1, Math.max(0, Math.floor(m.y * ratio)));
  const ex = Math.min(canvas.width, Math.ceil((m.x + m.w) * ratio));
  const ey = Math.min(canvas.height, Math.ceil((m.y + m.h) * ratio));
  const sw = Math.max(1, ex - sx);
  const sh = Math.max(1, ey - sy);
  const out = document.createElement("canvas");
  out.width = sw;
  out.height = sh;
  const ctx = out.getContext("2d");
  if (!ctx) throw new Error("canvas 2d context unavailable");
  ctx.drawImage(canvas, sx, sy, sw, sh, 0, 0, sw, sh);
  const uri = out.toDataURL("image/png");
  out.width = out.height = 0; // release Safari canvas memory eagerly
  const depth = m.baseline === null ? 0 : Math.max(0, (sy + sh) / ratio - m.baseline);
  return { uri, display, width: sw / ratio, height: sh / ratio, depth };
}

type HtmlToImage = typeof import("html-to-image");
type Item = { formula: Formula; el: HTMLDivElement };

async function rasterizeChunk(
  htmlToImage: HtmlToImage,
  fontEmbedCSS: string,
  chunk: Item[],
  results: Map<string, RenderedFormula>
) {
  const { host, column } = buildColumn();
  for (const it of chunk) column.appendChild(it.el); // moved out of the measuring column
  document.body.appendChild(host);
  try {
    const origin = column.getBoundingClientRect();
    const width = Math.ceil(origin.width);
    const height = Math.ceil(origin.height);
    // A single huge formula is rendered alone at whatever ratio fits one canvas
    const ratio = Math.min(
      PIXEL_RATIO,
      Math.sqrt(MAX_CHUNK_AREA / (width * height)),
      MAX_CHUNK_SIDE / Math.max(width, height)
    );
    const measured = chunk.map((it) => measureItem(it.el, origin));
    const canvas = await htmlToImage.toCanvas(column, {
      pixelRatio: ratio,
      width,
      height,
      skipFonts: true,
      fontEmbedCSS,
    });
    // html-to-image may clamp an oversized canvas; crop in the ratio it used
    const actual = canvas.width / width;
    chunk.forEach((it, k) => {
      const img = crop(canvas, measured[k], actual, it.formula.display);
      results.set(keyOf(it.formula), img);
      cacheSet(keyOf(it.formula), img);
    });
    canvas.width = canvas.height = 0;
  } finally {
    host.remove();
  }
}

async function renderFormulas(formulas: Formula[]): Promise<Map<string, RenderedFormula>> {
  const results = new Map<string, RenderedFormula>();
  const [{ default: katex }, htmlToImage, fontEmbedCSS] = await Promise.all([
    import("katex"),
    import("html-to-image"),
    getKatexCssWithEmbeddedFonts(),
    ensureKatexStylesheet(),
  ]);
  // Without the fonts the images would bake in fallback glyphs; LaTeX source is better
  if (!fontEmbedCSS) throw new Error("KaTeX fonts unavailable");

  const items: Item[] = [];
  for (const formula of formulas) {
    try {
      const html = katex.renderToString(formula.latex, {
        ...katexOptions,
        displayMode: formula.display,
        throwOnError: true,
        output: "html",
      });
      items.push({ formula, el: buildItem(html, formula.display) });
    } catch {
      // Unparseable: the formula stays as LaTeX source in the document
    }
  }
  if (items.length === 0) return results;

  // Lay everything out once so every KaTeX face loads and the sizes are known
  const measuring = buildColumn();
  for (const it of items) measuring.column.appendChild(it.el);
  document.body.appendChild(measuring.host);
  try {
    measuring.column.getBoundingClientRect();
    await document.fonts.ready;
    const sizes = items.map((it) => it.el.getBoundingClientRect());

    let i = 0;
    while (i < items.length) {
      let j = i;
      let maxW = 0;
      let sumH = 0;
      while (j < items.length) {
        const w = Math.max(maxW, sizes[j].width) + 2 * PAD_PX;
        const h = sumH + sizes[j].height + GAP_PX + 2 * PAD_PX;
        const fits =
          w * h * PIXEL_RATIO * PIXEL_RATIO <= MAX_CHUNK_AREA && Math.max(w, h) * PIXEL_RATIO <= MAX_CHUNK_SIDE;
        if (j > i && !fits) break;
        maxW = Math.max(maxW, sizes[j].width);
        sumH += sizes[j].height + GAP_PX;
        j++;
      }
      await rasterizeChunk(htmlToImage, fontEmbedCSS, items.slice(i, j), results);
      i = j;
    }
  } finally {
    measuring.host.remove();
  }
  return results;
}

/**
 * Replace every formula in the Markdown with an embedded PNG. Returns the
 * preprocessed Markdown (delimiters normalized) with the images spliced in;
 * on any rendering failure, or if the result would exceed `maxBytes`, the
 * input comes back unchanged (formulas then reach Word as LaTeX source).
 */
export async function renderMathAsImages(
  markdown: string,
  options: { maxBytes?: number } = {}
): Promise<MathImageResult> {
  if (typeof window === "undefined") return { markdown, rendered: 0, failed: 0 };

  const text = preprocessMarkdown(markdown);
  const found = findFormulas(text);
  if (found.length === 0) return { markdown, rendered: 0, failed: 0 };

  const images = new Map<string, RenderedFormula>();
  const pending = new Map<string, Formula>();
  for (const f of found) {
    const key = keyOf(f);
    const hit = cache.get(key);
    if (hit) images.set(key, hit);
    else pending.set(key, { latex: f.latex, display: f.display });
  }
  if (pending.size > 0) {
    try {
      for (const [key, img] of await renderFormulas([...pending.values()])) images.set(key, img);
    } catch {
      return { markdown, rendered: 0, failed: found.length };
    }
  }

  const parts: string[] = [];
  let cursor = 0;
  let rendered = 0;
  let failed = 0;
  for (const f of found) {
    const img = images.get(keyOf(f));
    if (!img) {
      failed++;
      continue;
    }
    parts.push(
      text.slice(cursor, f.start),
      `![${encodeAlt(f.latex)}](${img.uri} "${formatMathImageTitle(img)}")`
    );
    cursor = f.end;
    rendered++;
  }
  parts.push(text.slice(cursor));
  const result = parts.join("");
  // Past the route's body cap the export would fail outright; LaTeX source is better
  if (options.maxBytes !== undefined && new TextEncoder().encode(result).length > options.maxBytes) {
    return { markdown, rendered: 0, failed: found.length };
  }
  return { markdown: result, rendered, failed };
}
