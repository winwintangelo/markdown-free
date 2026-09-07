/**
 * KaTeX styling for the browser-side surfaces (build plan Phase 0a).
 *
 * The KaTeX stylesheet and its woff2 fonts are served from /katex/ (copied
 * from node_modules by scripts/postinstall.mjs) and loaded ONLY when rendered
 * HTML actually contains math, so documents without formulas pay nothing.
 *
 *  - ensureKatexStylesheet(): <link> the stylesheet once for the live preview.
 *  - getKatexCssForHtmlExport(): CSS for the standalone HTML export, with font
 *    URLs pointing at the site (small file; fonts load when opened online).
 *  - getKatexCssWithEmbeddedFonts(): CSS with the fonts inlined as data URIs,
 *    for the image exporter (its SVG rasterizer can't reach external fonts)
 *    and for anything else that must be self-contained.
 *
 * The server-side equivalent (PDF route) lives in katex-server.ts.
 */

export const KATEX_CSS_PATH = "/katex/katex.min.css";
export const KATEX_FONTS_PATH = "/katex/fonts/";
const SITE_FONTS_URL = "https://www.markdown.free/katex/fonts/";

/** Does rendered HTML contain KaTeX output? */
export function htmlHasMath(html: string): boolean {
  return html.includes('class="katex');
}

let stylesheetPromise: Promise<void> | null = null;

/** Inject the KaTeX stylesheet into the page once (idempotent). */
export function ensureKatexStylesheet(): Promise<void> {
  if (typeof document === "undefined") return Promise.resolve();
  if (!stylesheetPromise) {
    stylesheetPromise = new Promise((resolve) => {
      const existing = document.getElementById("katex-css");
      if (existing) {
        resolve();
        return;
      }
      const link = document.createElement("link");
      link.id = "katex-css";
      link.rel = "stylesheet";
      link.href = KATEX_CSS_PATH;
      link.onload = () => resolve();
      // Never block on a failed stylesheet; formulas just render unstyled
      link.onerror = () => resolve();
      document.head.appendChild(link);
    });
  }
  return stylesheetPromise;
}

let cssTextPromise: Promise<string> | null = null;

async function fetchKatexCss(): Promise<string> {
  if (!cssTextPromise) {
    cssTextPromise = fetch(KATEX_CSS_PATH)
      .then((r) => (r.ok ? r.text() : ""))
      .catch(() => "");
  }
  return cssTextPromise;
}

// katex.min.css declares each face as:
//   src:url(fonts/X.woff2) format("woff2"),url(fonts/X.woff) format("woff"),url(fonts/X.ttf) format("truetype")
const FONT_SRC_RE =
  /src:url\(fonts\/([^)]+)\.woff2\) format\("woff2"\),url\([^)]+\) format\("woff"\),url\([^)]+\) format\("truetype"\)/g;

/** CSS for the standalone HTML export: fonts referenced from the site. */
export async function getKatexCssForHtmlExport(): Promise<string> {
  const css = await fetchKatexCss();
  return css.replace(
    FONT_SRC_RE,
    (_m, name: string) => `src:url(${SITE_FONTS_URL}${name}.woff2) format("woff2")`
  );
}

let embeddedCssPromise: Promise<string> | null = null;

async function fetchFontAsDataUri(name: string): Promise<string | null> {
  try {
    const response = await fetch(`${KATEX_FONTS_PATH}${name}.woff2`);
    if (!response.ok) return null;
    const buffer = await response.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.length; i += 0x8000) {
      binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    }
    return `data:font/woff2;base64,${btoa(binary)}`;
  } catch {
    return null;
  }
}

/** CSS with every KaTeX font inlined (self-contained; ~400 KB). */
export async function getKatexCssWithEmbeddedFonts(): Promise<string> {
  if (!embeddedCssPromise) {
    embeddedCssPromise = (async () => {
      const css = await fetchKatexCss();
      if (!css) return "";
      const names = new Set<string>();
      for (const m of css.matchAll(FONT_SRC_RE)) names.add(m[1]);
      const uris = new Map<string, string>();
      await Promise.all(
        [...names].map(async (name) => {
          const uri = await fetchFontAsDataUri(name);
          if (uri) uris.set(name, uri);
        })
      );
      return css.replace(FONT_SRC_RE, (match, name: string) => {
        const uri = uris.get(name);
        return uri ? `src:url(${uri}) format("woff2")` : match;
      });
    })();
  }
  return embeddedCssPromise;
}
