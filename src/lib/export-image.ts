import { EMBEDDED_STYLES } from "./export-html";

/**
 * Client-side Markdown → PNG/JPG image export
 *
 * The rendered (already-sanitized) HTML is laid out in an offscreen host and
 * rasterized in the browser via html-to-image. No markdown ever leaves the
 * browser; only remote image URLs may be fetched through /api/img-proxy when
 * their host doesn't send CORS headers.
 *
 * Library decision: html-to-image (SVG <foreignObject> serialization →
 * canvas). html2canvas was rejected per spec — it re-implements CSS rendering
 * with worse fidelity and worse CJK line-breaking.
 */

export interface ImageExportOptions {
  format: "png" | "jpg";
  width: 600 | 800 | 1080 | 1200;
  pixelRatio: 1 | 2 | 3;
  quality?: number; // 0.6–1.0, JPG only
  splitMode: "auto" | "single" | "split";
  /**
   * Long-document gate for the one-tap flow: called in auto mode when the
   * document exceeds LONG_DOC_PAGES screen-heights, letting the UI ask the
   * user for one long image vs a split package. `canSingle` is false when
   * even a 1x canvas cannot hold the document as one image.
   */
  onLongDocument?: (pages: number, canSingle: boolean) => Promise<"single" | "split" | "cancel">;
}

export type ImageExportWarning =
  | { code: "images_blocked"; count: number }
  | { code: "block_sliced" };

export interface ImageExportResult {
  blobs: Blob[];
  warnings: ImageExportWarning[];
  /** Effective pixel ratio after matrix clamping / single-mode degradation */
  pixelRatio: 1 | 2 | 3;
}

export class ImageTooLargeError extends Error {
  readonly code = "IMG_TOO_LARGE";
  constructor() {
    super("Document is too large for image export");
    this.name = "ImageTooLargeError";
  }
}

export class ImageExportCancelledError extends Error {
  readonly code = "CANCELLED";
  constructor() {
    super("Image export cancelled by user");
    this.name = "ImageExportCancelledError";
  }
}

// Safari is the binding constraint: ~16.77M total canvas pixels. Stay under it.
const MAX_CANVAS_AREA = 16_000_000;
// Per-side canvas cap: html-to-image clamps (and silently downscales) any
// canvas side above 16,384px, and browsers have per-side limits of their own.
const MAX_CANVAS_SIDE = 16_000;
// Forced-split target part height (CSS px) — roughly screen-height parts
const FORCED_PART_CSS_HEIGHT = 1280;
// One "page" for long-document detection = one forced part height
const PAGE_CSS_HEIGHT = FORCED_PART_CSS_HEIGHT;
// Above this many pages, auto mode asks the user (single long image vs package)
const LONG_DOC_PAGES = 10;
// Per-image client fetch timeout
const IMAGE_FETCH_TIMEOUT_MS = 8000;
// Max images routed through the proxy per export (matches server-side cap)
const MAX_PROXY_IMAGES = 20;

const SCOPE_CLASS = "mdfree-image-export";

/**
 * Scale × width availability matrix (spec 2.1): pixelRatio squares the pixel
 * budget, so 3x at 1080/1200px forces absurdly small split parts. 3x is only
 * offered at 600/800px; wider widths clamp silently to 2x.
 */
export function allowedPixelRatios(width: ImageExportOptions["width"]): Array<1 | 2 | 3> {
  return width >= 1080 ? [1, 2] : [1, 2, 3];
}

export function clampPixelRatio(
  width: ImageExportOptions["width"],
  ratio: 1 | 2 | 3
): 1 | 2 | 3 {
  const allowed = allowedPixelRatios(width);
  return allowed.includes(ratio) ? ratio : allowed[allowed.length - 1];
}

/**
 * Device-aware defaults for the one-tap flow: phone-sized viewports get the
 * 1080px social/长图 width, larger screens the 800px document width; sharpness
 * follows the device pixel ratio (clamped by the scale×width matrix).
 */
export function defaultImageOptions(): {
  width: ImageExportOptions["width"];
  pixelRatio: 1 | 2 | 3;
} {
  if (typeof window === "undefined") {
    return { width: 800, pixelRatio: 2 };
  }
  const width: ImageExportOptions["width"] = window.innerWidth < 768 ? 1080 : 800;
  const dpr = Math.round(window.devicePixelRatio || 1);
  const ratio = Math.min(3, Math.max(1, dpr)) as 1 | 2 | 3;
  return { width, pixelRatio: clampPixelRatio(width, ratio) };
}

/** Tallest single canvas (in CSS px) for a given width × ratio */
function maxSingleCssHeight(width: number, ratio: number): number {
  const byArea = MAX_CANVAS_AREA / (width * ratio * ratio);
  const bySide = MAX_CANVAS_SIDE / ratio;
  return Math.floor(Math.min(byArea, bySide));
}

/** `report.png` → `report-01.png`, `report-02.png`, … */
export function imagePartFilename(filename: string, index: number, total: number): string {
  const dot = filename.lastIndexOf(".");
  const base = dot === -1 ? filename : filename.slice(0, dot);
  const ext = dot === -1 ? "" : filename.slice(dot);
  const pad = String(total).length > 2 ? String(total).length : 2;
  return `${base}-${String(index + 1).padStart(pad, "0")}${ext}`;
}

/**
 * Scope the shared export stylesheet under the offscreen host so it can live
 * inside the app's DOM without leaking styles. The stylesheet only uses
 * simple element selectors, so a mechanical transform is sufficient.
 */
function scopedExportCss(): string {
  const withoutComments = EMBEDDED_STYLES.replace(/\/\*[\s\S]*?\*\//g, "");
  const scoped = withoutComments.replace(/(^|\})([^@{}]+)\{/g, (_m, brace: string, selectors: string) => {
    const prefixed = selectors
      .split(",")
      .map((s) => {
        const sel = s.trim();
        if (!sel) return "";
        return sel === "body" ? `.${SCOPE_CLASS}` : `.${SCOPE_CLASS} ${sel}`;
      })
      .filter(Boolean)
      .join(", ");
    return `${brace}\n${prefixed} {`;
  });

  // Image-specific overrides: fixed width instead of centered page, and wrap
  // (rather than clip) code lines — the output has no horizontal scrollbar.
  return `${scoped}
.${SCOPE_CLASS} {
  max-width: none;
  margin: 0;
  background: #ffffff;
  box-sizing: border-box;
  overflow-wrap: break-word;
}
.${SCOPE_CLASS} pre {
  white-space: pre-wrap;
  word-break: break-word;
  overflow-x: hidden;
}
.${SCOPE_CLASS} > :first-child { margin-top: 0; }
`;
}

function buildHost(width: number): { host: HTMLDivElement; article: HTMLElement } {
  const host = document.createElement("div");
  host.setAttribute("aria-hidden", "true");
  host.style.cssText = `position:fixed; left:-99999px; top:0; width:${width}px; pointer-events:none;`;

  const style = document.createElement("style");
  style.textContent = scopedExportCss();

  const article = document.createElement("article");
  article.className = SCOPE_CLASS;

  host.append(style, article);
  return { host, article };
}

function doubleRaf(): Promise<void> {
  return new Promise((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  );
}

async function fetchAsDataUrl(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      mode: "cors",
      signal: AbortSignal.timeout(IMAGE_FETCH_TIMEOUT_MS),
    });
    if (!response.ok) return null;
    const blob = await response.blob();
    if (!blob.type.startsWith("image/")) return null;
    return await new Promise<string | null>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function replaceWithPlaceholder(img: HTMLImageElement): void {
  const placeholder = document.createElement("div");
  placeholder.setAttribute("data-image-placeholder", "true");
  placeholder.style.cssText =
    "display:flex; align-items:center; justify-content:center;" +
    "width:100%; max-width:320px; height:160px; margin:1rem 0;" +
    "background:#f1f5f9; border:1px dashed #cbd5e1; border-radius:8px;" +
    "color:#94a3b8; font-size:24px;";
  placeholder.textContent = "🖼";
  img.replaceWith(placeholder);
}

/**
 * Replace every cross-origin <img> with an inline data URI so the canvas is
 * never tainted: direct CORS fetch first, /api/img-proxy fallback, gray
 * placeholder if both fail. Returns the count of blocked images.
 */
async function inlineRemoteImages(root: HTMLElement): Promise<number> {
  const imgs = Array.from(root.querySelectorAll("img"));
  let blocked = 0;
  let proxyAttempts = 0;

  await Promise.all(
    imgs.map(async (img) => {
      const src = img.getAttribute("src") ?? "";
      if (!/^https?:\/\//i.test(src)) return; // data:/relative → same-origin, no tainting
      try {
        if (new URL(src, window.location.href).origin === window.location.origin) return;
      } catch {
        return;
      }

      let dataUrl = await fetchAsDataUrl(src);
      if (!dataUrl && proxyAttempts < MAX_PROXY_IMAGES) {
        proxyAttempts++;
        dataUrl = await fetchAsDataUrl(`/api/img-proxy?url=${encodeURIComponent(src)}`);
      }

      if (dataUrl) {
        img.src = dataUrl;
      } else {
        replaceWithPlaceholder(img);
        blocked++;
      }
    })
  );

  // Image heights affect pagination — wait for every remaining <img> to settle
  await Promise.all(
    Array.from(root.querySelectorAll("img")).map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise<void>((resolve) => {
        img.addEventListener("load", () => resolve(), { once: true });
        img.addEventListener("error", () => resolve(), { once: true });
      });
    })
  );

  return blocked;
}

interface BlockBox {
  el: Element;
  top: number;
  bottom: number;
}

function measureBlocks(article: HTMLElement): BlockBox[] {
  const articleTop = article.getBoundingClientRect().top;
  return Array.from(article.children).map((el) => {
    const rect = el.getBoundingClientRect();
    return { el, top: rect.top - articleTop, bottom: rect.bottom - articleTop };
  });
}

/**
 * Greedily pack blocks into pages of at most `partHeight` CSS px, breaking
 * only at block boundaries (never mid-line / mid-image). An oversized single
 * block gets a page of its own.
 */
function paginateBlocks(blocks: BlockBox[], partHeight: number): BlockBox[][] {
  const pages: BlockBox[][] = [];
  let current: BlockBox[] = [];
  let pageStart = 0;

  for (const block of blocks) {
    if (current.length > 0 && block.bottom - pageStart > partHeight) {
      pages.push(current);
      current = [];
      pageStart = block.top;
    }
    current.push(block);
  }
  if (current.length > 0) pages.push(current);
  return pages;
}

type HtmlToImage = typeof import("html-to-image");

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("canvas.toBlob returned null"))),
      type,
      quality
    );
  });
}

async function encodeCanvas(
  canvas: HTMLCanvasElement,
  format: "png" | "jpg",
  quality: number
): Promise<Blob> {
  if (format === "png") {
    return canvasToBlob(canvas, "image/png");
  }
  // JPG has no alpha channel: composite onto a white-filled canvas first so an
  // uncomposited alpha canvas can never encode with a black background.
  const composite = document.createElement("canvas");
  composite.width = canvas.width;
  composite.height = canvas.height;
  const ctx = composite.getContext("2d");
  if (!ctx) throw new Error("2d context unavailable");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, composite.width, composite.height);
  ctx.drawImage(canvas, 0, 0);
  const blob = await canvasToBlob(composite, "image/jpeg", quality);
  composite.width = composite.height = 0; // release Safari canvas memory eagerly
  return blob;
}

async function renderNodeToCanvas(
  htmlToImage: HtmlToImage,
  node: HTMLElement,
  pixelRatio: number
): Promise<HTMLCanvasElement> {
  return htmlToImage.toCanvas(node, {
    pixelRatio,
    backgroundColor: "#ffffff",
    // The export stylesheet pins an explicit system font stack, so skip
    // html-to-image's webfont embedding pass (slow; can throw on Safari).
    skipFonts: true,
  });
}

/**
 * Render one page by wrapping its blocks in a fresh offscreen container and
 * rasterizing that. Per-page rendering is NOT an optimization choice — the
 * alternative (render everything once, then window-slice the canvas) needs a
 * source canvas that exceeds the same canvas area limit for exactly the
 * documents that need splitting, so it cannot work.
 */
async function renderPage(
  htmlToImage: HtmlToImage,
  blocks: Element[],
  width: number,
  pixelRatio: number,
  format: "png" | "jpg",
  quality: number
): Promise<Blob> {
  const { host, article } = buildHost(width);
  for (const el of blocks) {
    article.appendChild(el.cloneNode(true));
  }
  document.body.appendChild(host);
  try {
    await doubleRaf();
    const canvas = await renderNodeToCanvas(htmlToImage, article, pixelRatio);
    const blob = await encodeCanvas(canvas, format, quality);
    canvas.width = canvas.height = 0;
    return blob;
  } finally {
    host.remove();
  }
}

/**
 * Fallback for a single block taller than any allowed canvas (a huge <pre> or
 * <table>): render it once at the largest ratio that fits a single canvas,
 * then hard-slice that canvas into windows. Accepts mid-block cuts (spec 3.4
 * step 3) — callers surface a `block_sliced` warning.
 */
async function renderOversizedBlock(
  htmlToImage: HtmlToImage,
  block: Element,
  width: number,
  requestedRatio: number,
  partCssHeight: number,
  format: "png" | "jpg",
  quality: number
): Promise<Blob[]> {
  const { host, article } = buildHost(width);
  article.appendChild(block.cloneNode(true));
  document.body.appendChild(host);
  try {
    await doubleRaf();
    const blockHeight = Math.ceil(article.getBoundingClientRect().height);

    let ratio = requestedRatio;
    while (ratio > 1 && blockHeight > maxSingleCssHeight(width, ratio)) ratio--;
    if (blockHeight > maxSingleCssHeight(width, ratio)) {
      throw new ImageTooLargeError();
    }

    const canvas = await renderNodeToCanvas(htmlToImage, article, ratio);
    const sliceHeight = Math.floor(partCssHeight * ratio);
    const blobs: Blob[] = [];

    for (let y = 0; y < canvas.height; y += sliceHeight) {
      const h = Math.min(sliceHeight, canvas.height - y);
      const slice = document.createElement("canvas");
      slice.width = canvas.width;
      slice.height = h;
      const ctx = slice.getContext("2d");
      if (!ctx) throw new Error("2d context unavailable");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, slice.width, slice.height);
      ctx.drawImage(canvas, 0, y, canvas.width, h, 0, 0, canvas.width, h);
      blobs.push(await encodeCanvas(slice, format, quality));
      slice.width = slice.height = 0;
    }

    canvas.width = canvas.height = 0;
    return blobs;
  } finally {
    host.remove();
  }
}

/**
 * Convert already-rendered (sanitized) markdown HTML into one or more image
 * blobs. `blobs.length === 1` means a single image; more means the caller
 * should offer ZIP download / share. Throws ImageTooLargeError when even
 * degraded single-canvas rendering cannot fit.
 */
export async function exportToImage(
  html: string,
  opts: ImageExportOptions,
  onProgress?: (current: number, total: number) => void
): Promise<ImageExportResult> {
  const quality = Math.min(1, Math.max(0.6, opts.quality ?? 0.9));
  // Silently clamp stale 1080/1200 + 3x combinations (spec 2.1)
  let ratio = clampPixelRatio(opts.width, opts.pixelRatio);
  const warnings: ImageExportWarning[] = [];

  const htmlToImage = await import("html-to-image");

  const { host, article } = buildHost(opts.width);
  // The HTML comes from the markdownToHtml pipeline (rehype-sanitize, GitHub
  // schema), so it is safe to inject.
  article.innerHTML = html;
  document.body.appendChild(host);

  try {
    const blockedImages = await inlineRemoteImages(article);
    if (blockedImages > 0) {
      warnings.push({ code: "images_blocked", count: blockedImages });
    }

    // CJK-critical: rasterizing before fonts resolve bakes fallback glyphs
    // ("tofu") into the output. Wait for fonts, then let layout settle.
    await document.fonts.ready;
    await doubleRaf();

    const totalHeight = Math.ceil(article.getBoundingClientRect().height);

    // Auto mode: short documents (≤ LONG_DOC_PAGES) are ALWAYS a single
    // image — never silently split — degrading sharpness if needed to fit
    // one canvas. Long documents pause and ask the user (single vs package);
    // without a prompt callback they default to the split package.
    let splitMode = opts.splitMode;
    if (splitMode === "auto") {
      const pages = Math.ceil(totalHeight / PAGE_CSS_HEIGHT);
      if (pages > LONG_DOC_PAGES) {
        const canSingle = totalHeight <= maxSingleCssHeight(opts.width, 1);
        if (opts.onLongDocument) {
          const choice = await opts.onLongDocument(pages, canSingle);
          if (choice === "cancel") {
            throw new ImageExportCancelledError();
          }
          splitMode = choice;
        } else {
          splitMode = "split";
        }
      } else {
        splitMode = "single";
      }
    }

    // Decide single vs split (spec 3.4)
    let partHeight: number | null = null; // null → render as one image
    if (splitMode === "split") {
      partHeight = Math.min(FORCED_PART_CSS_HEIGHT, maxSingleCssHeight(opts.width, ratio));
    } else if (totalHeight > maxSingleCssHeight(opts.width, ratio)) {
      // Progressively degrade sharpness rather than splitting
      while (ratio > 1 && totalHeight > maxSingleCssHeight(opts.width, ratio)) {
        ratio = (ratio - 1) as 1 | 2;
      }
      if (totalHeight > maxSingleCssHeight(opts.width, ratio)) {
        throw new ImageTooLargeError();
      }
    }

    if (partHeight === null) {
      onProgress?.(1, 1);
      const canvas = await renderNodeToCanvas(htmlToImage, article, ratio);
      const blob = await encodeCanvas(canvas, opts.format, quality);
      canvas.width = canvas.height = 0;
      return { blobs: [blob], warnings, pixelRatio: ratio };
    }

    const pages = paginateBlocks(measureBlocks(article), partHeight);
    const hardLimit = maxSingleCssHeight(opts.width, ratio);
    const blobs: Blob[] = [];

    // Render pages SEQUENTIALLY: a wide × 3x page can allocate hundreds of MB
    // of canvas; parallel rendering multiplies peak memory (spec 3.7).
    for (let i = 0; i < pages.length; i++) {
      onProgress?.(i + 1, pages.length);
      const page = pages[i];
      const pageHeight = page[page.length - 1].bottom - page[0].top;

      if (page.length === 1 && pageHeight > hardLimit) {
        blobs.push(
          ...(await renderOversizedBlock(
            htmlToImage,
            page[0].el,
            opts.width,
            ratio,
            partHeight,
            opts.format,
            quality
          ))
        );
        if (!warnings.some((w) => w.code === "block_sliced")) {
          warnings.push({ code: "block_sliced" });
        }
      } else {
        blobs.push(
          await renderPage(
            htmlToImage,
            page.map((b) => b.el),
            opts.width,
            ratio,
            opts.format,
            quality
          )
        );
      }
    }

    return { blobs, warnings, pixelRatio: ratio };
  } finally {
    host.remove();
  }
}

/**
 * Bundle split-output images into a ZIP. STORE compression — PNG/JPG payloads
 * are already compressed.
 */
export async function zipImageBlobs(
  files: Array<{ name: string; blob: Blob }>
): Promise<Blob> {
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();
  for (const file of files) {
    zip.file(file.name, file.blob);
  }
  return zip.generateAsync({ type: "blob", compression: "STORE" });
}
