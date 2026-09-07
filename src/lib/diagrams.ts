/**
 * Client-side Mermaid pre-rendering (build plan Phase 0a).
 *
 * Mermaid needs a browser to render, and the PDF route runs Chromium with
 * JavaScript disabled, so diagrams are rendered HERE — once, in the user's
 * browser — and substituted into the Markdown as embedded images before any
 * format is produced. Every export path (preview, HTML, PDF, DOCX, EPUB,
 * PNG/JPG) then sees an ordinary image.
 *
 *   ```mermaid          →   ![Mermaid diagram](data:image/svg+xml;base64,…)
 *   graph LR; A-->B
 *   ```
 *
 * `raster: true` produces PNG instead of SVG. Server-side targets (PDF, DOCX)
 * use PNG because their renderers cannot access the browser's fonts inside an
 * <img>-embedded SVG (CJK labels would render as tofu on Vercel's Chromium).
 *
 * The mermaid bundle is multi-MB, so it is loaded lazily and only when a
 * document actually contains a mermaid fence.
 */

const FENCE_OPEN_RE = /^[ \t]{0,3}(`{3,}|~{3,})[ \t]*mermaid\b[^\n]*$/;
const MAX_CACHE_ENTRIES = 50;
const RASTER_SCALE = 2;

export interface MermaidFence {
  /** Index of the opening fence line */
  start: number;
  /** Index of the closing fence line */
  end: number;
  code: string;
}

export interface DiagramRenderOptions {
  raster?: boolean;
}

export interface DiagramRenderResult {
  markdown: string;
  rendered: number;
  failed: number;
}

const cache = new Map<string, string>();

function cacheGet(key: string): string | undefined {
  return cache.get(key);
}

function cacheSet(key: string, value: string) {
  if (cache.size >= MAX_CACHE_ENTRIES) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.set(key, value);
}

export function hasMermaidFence(markdown: string): boolean {
  return /^[ \t]{0,3}(`{3,}|~{3,})[ \t]*mermaid\b/m.test(markdown);
}

/** Locate every mermaid fence (respecting other fenced blocks). */
export function findMermaidFences(markdown: string): MermaidFence[] {
  const lines = markdown.split("\n");
  const fences: MermaidFence[] = [];
  let open: { fence: string; mermaid: boolean; start: number } | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const m = line.match(/^[ \t]{0,3}(`{3,}|~{3,})/);
    if (!m) continue;
    if (!open) {
      open = { fence: m[1], mermaid: FENCE_OPEN_RE.test(line), start: i };
      continue;
    }
    if (m[1][0] === open.fence[0] && m[1].length >= open.fence.length) {
      if (open.mermaid) {
        fences.push({
          start: open.start,
          end: i,
          code: lines.slice(open.start + 1, i).join("\n"),
        });
      }
      open = null;
    }
  }
  return fences;
}

type MermaidModule = typeof import("mermaid").default;
let mermaidPromise: Promise<MermaidModule> | null = null;

async function loadMermaid(): Promise<MermaidModule> {
  if (!mermaidPromise) {
    mermaidPromise = import("mermaid").then((mod) => {
      const mermaid = mod.default;
      mermaid.initialize({
        startOnLoad: false,
        // Labels are sanitized; no click handlers or HTML injection from diagrams
        securityLevel: "strict",
        theme: "neutral",
        // SVG <text> labels (not foreignObject) so the SVG rasterizes on every
        // browser and renders inside <img> without HTML support
        htmlLabels: false,
        flowchart: { htmlLabels: false },
        fontFamily:
          "system-ui, -apple-system, 'Segoe UI', Roboto, 'Noto Sans', 'Noto Sans SC', 'Noto Sans TC', 'Noto Sans JP', 'Noto Sans KR', sans-serif",
      });
      return mermaid;
    });
  }
  return mermaidPromise;
}

let renderCounter = 0;

/** Give the SVG explicit pixel dimensions (from its viewBox) so <img> and canvas size it. */
function withExplicitSize(svg: string): { svg: string; width: number; height: number } {
  const vb = svg.match(/viewBox="([\d.\-]+)\s+([\d.\-]+)\s+([\d.]+)\s+([\d.]+)"/);
  let width = vb ? Math.ceil(parseFloat(vb[3])) : 800;
  let height = vb ? Math.ceil(parseFloat(vb[4])) : 400;
  if (!(width > 0) || !(height > 0)) {
    width = 800;
    height = 400;
  }
  let out = svg
    .replace(/\swidth="[^"]*"/, "")
    .replace(/\sheight="[^"]*"/, "")
    .replace(/<svg\b/, `<svg width="${width}" height="${height}"`);
  // mermaid pins a max-width in an inline style; drop it so the explicit size wins
  out = out.replace(/(<svg\b[^>]*?)\sstyle="[^"]*"/, "$1");
  if (!/xmlns="http:\/\/www\.w3\.org\/2000\/svg"/.test(out)) {
    out = out.replace(/<svg\b/, '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  return { svg: out, width, height };
}

function svgToDataUri(svg: string): string {
  const bytes = new TextEncoder().encode(svg);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return `data:image/svg+xml;base64,${btoa(binary)}`;
}

async function rasterize(svgDataUri: string, width: number, height: number): Promise<string> {
  const img = new Image();
  img.decoding = "async";
  img.src = svgDataUri;
  await img.decode();
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(width * RASTER_SCALE);
  canvas.height = Math.ceil(height * RASTER_SCALE);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas 2d context unavailable");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.scale(RASTER_SCALE, RASTER_SCALE);
  ctx.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL("image/png");
}

async function renderOne(code: string, raster: boolean): Promise<string> {
  const key = `${raster ? "png" : "svg"}:${code}`;
  const hit = cacheGet(key);
  if (hit) return hit;

  const mermaid = await loadMermaid();
  const id = `mdfree-mermaid-${Date.now()}-${renderCounter++}`;
  const { svg } = await mermaid.render(id, code);
  const sized = withExplicitSize(svg);
  const svgUri = svgToDataUri(sized.svg);
  const result = raster ? await rasterize(svgUri, sized.width, sized.height) : svgUri;
  cacheSet(key, result);
  return result;
}

/**
 * Replace every mermaid fence with an embedded image. Fences that fail to
 * render are left untouched (they fall back to a code block) and counted.
 */
export async function prerenderMermaid(
  markdown: string,
  options: DiagramRenderOptions = {}
): Promise<DiagramRenderResult> {
  if (typeof window === "undefined" || !hasMermaidFence(markdown)) {
    return { markdown, rendered: 0, failed: 0 };
  }

  const fences = findMermaidFences(markdown);
  if (fences.length === 0) return { markdown, rendered: 0, failed: 0 };

  const lines = markdown.split("\n");
  let rendered = 0;
  let failed = 0;

  // Replace bottom-up so earlier line indices stay valid
  for (let i = fences.length - 1; i >= 0; i--) {
    const fence = fences[i];
    try {
      const uri = await renderOne(fence.code, !!options.raster);
      lines.splice(fence.start, fence.end - fence.start + 1, `![Mermaid diagram](${uri})`);
      rendered++;
    } catch (error) {
      console.warn("[diagrams] Mermaid render failed; leaving the code block", error);
      failed++;
    }
  }

  return { markdown: lines.join("\n"), rendered, failed };
}
