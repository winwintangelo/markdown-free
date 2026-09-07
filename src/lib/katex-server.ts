import fs from "node:fs/promises";
import path from "node:path";

/**
 * Server-side KaTeX stylesheet for the PDF route (build plan Phase 0a).
 *
 * Puppeteer renders the PDF with JavaScript disabled and every external
 * request blocked except Google Fonts, so the KaTeX CSS is inlined into the
 * page template with its woff2 fonts embedded as data URIs. The files are read
 * from node_modules/katex/dist (traced into the function bundle via
 * `outputFileTracingIncludes` in next.config.js) and memoized for the life of
 * the function instance. Only used when the rendered HTML contains math.
 */

const FONT_SRC_RE =
  /src:url\(fonts\/([^)]+)\.woff2\) format\("woff2"\),url\([^)]+\) format\("woff"\),url\([^)]+\) format\("truetype"\)/g;

let inlineCssPromise: Promise<string> | null = null;

async function buildInlineCss(): Promise<string> {
  const dist = path.join(process.cwd(), "node_modules", "katex", "dist");
  const css = await fs.readFile(path.join(dist, "katex.min.css"), "utf8");

  const names = new Set<string>();
  for (const m of css.matchAll(FONT_SRC_RE)) names.add(m[1]);

  const uris = new Map<string, string>();
  await Promise.all(
    [...names].map(async (name) => {
      try {
        const buffer = await fs.readFile(path.join(dist, "fonts", `${name}.woff2`));
        uris.set(name, `data:font/woff2;base64,${buffer.toString("base64")}`);
      } catch {
        // Missing font file: leave the original (blocked) reference; text falls back
      }
    })
  );

  return css.replace(FONT_SRC_RE, (match, name: string) => {
    const uri = uris.get(name);
    return uri ? `src:url(${uri}) format("woff2")` : match;
  });
}

/** KaTeX CSS with embedded fonts, or "" if the assets cannot be read. */
export function getKatexInlineCss(): Promise<string> {
  if (!inlineCssPromise) {
    inlineCssPromise = buildInlineCss().catch((error) => {
      console.error("[katex] could not load stylesheet/fonts for PDF:", error instanceof Error ? error.message : error);
      inlineCssPromise = null; // allow a retry on the next request
      return "";
    });
  }
  return inlineCssPromise;
}

export function htmlHasMath(html: string): boolean {
  return html.includes('class="katex');
}
