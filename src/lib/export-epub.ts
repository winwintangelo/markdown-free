import { generateFilename, downloadBlob } from "./download";
import { markdownToHtml } from "./markdown";
import { buildEpubBlob, type EpubChapter, type EpubImage } from "./epub-builder";
import { getKatexCssForHtmlExport, htmlHasMath } from "./katex-assets";

/**
 * Markdown → EPUB entirely in the browser (build plan Phase 0a).
 *
 * Previously a server route (epub-gen-memory on Vercel). Now: the shared
 * markdown pipeline renders HTML, images are embedded as files (data URIs from
 * pre-rendered Mermaid diagrams, remote images through the same direct-fetch /
 * image-proxy fallback the image exporter uses), the document is split into
 * chapters at H1 (or H2) boundaries exactly as before, and epub-builder.ts
 * packages it. Nothing leaves the browser except remote image URLs when a host
 * blocks CORS.
 */

export interface EpubExportResult {
  success: boolean;
  error?: {
    code: string;
    message: string;
    retryable: boolean;
  };
}

export interface EpubGenerateResult {
  success: boolean;
  blob?: Blob;
  filename?: string;
  error?: {
    code: string;
    message: string;
    retryable: boolean;
  };
}

export interface EpubOptions {
  /** BCP 47 language tag for the package metadata (defaults to "en") */
  language?: string;
}

// Per-image client fetch timeout and the same cap the image proxy enforces
const IMAGE_FETCH_TIMEOUT_MS = 8000;
const MAX_PROXY_IMAGES = 20;

const EPUB_STYLES = `
body {
  font-family: Georgia, "Times New Roman", "Noto Serif", "Noto Serif SC", "Noto Serif TC", "Noto Serif JP", "Noto Serif KR", serif;
  font-size: 1em;
  line-height: 1.6;
  color: #333;
}
h1 { font-size: 1.8em; font-weight: bold; margin-top: 1.5em; margin-bottom: 0.5em; }
h2 { font-size: 1.4em; font-weight: bold; margin-top: 1.2em; margin-bottom: 0.4em; }
h3 { font-size: 1.2em; font-weight: bold; margin-top: 1em; margin-bottom: 0.3em; }
h4, h5, h6 { font-size: 1em; font-weight: bold; margin-top: 0.8em; margin-bottom: 0.2em; }
p { margin-top: 0.5em; margin-bottom: 0.5em; }
ul, ol { margin-top: 0.5em; margin-bottom: 0.5em; padding-left: 1.5em; }
li { margin-top: 0.2em; margin-bottom: 0.2em; }
code { font-family: "Courier New", Courier, monospace; font-size: 0.9em; background-color: #f5f5f5; padding: 0.1em 0.3em; }
pre { font-family: "Courier New", Courier, monospace; font-size: 0.85em; background-color: #f5f5f5; padding: 1em; margin: 1em 0; white-space: pre-wrap; overflow-wrap: break-word; }
pre code { background-color: transparent; padding: 0; }
blockquote { border-left: 3px solid #ccc; margin: 1em 0; padding-left: 1em; color: #666; font-style: italic; }
table { border-collapse: collapse; width: 100%; margin: 1em 0; }
th, td { border: 1px solid #ccc; padding: 0.5em; }
th { background-color: #f0f0f0; font-weight: bold; }
hr { border: none; border-top: 1px solid #ccc; margin: 1.5em 0; }
a { color: #0563C1; text-decoration: underline; }
img { max-width: 100%; height: auto; }
`.trim();

/**
 * Split HTML content into chapters at H1 or H2 boundaries (same rule as the
 * former server route).
 */
function splitIntoChapters(html: string): { title: string; content: string }[] {
  const h1Parts = html.split(/(?=<h1[\s>])/i);
  if (h1Parts.length > 1) {
    return buildChapters(h1Parts, /<h1[^>]*>(.*?)<\/h1>/i);
  }
  const h2Parts = html.split(/(?=<h2[\s>])/i);
  if (h2Parts.length > 1) {
    return buildChapters(h2Parts, /<h2[^>]*>(.*?)<\/h2>/i);
  }
  return [{ title: "Document", content: html }];
}

function buildChapters(parts: string[], headingRegex: RegExp): { title: string; content: string }[] {
  const chapters: { title: string; content: string }[] = [];
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const match = trimmed.match(headingRegex);
    const title = match
      ? match[1].replace(/<[^>]+>/g, "").trim() || `Chapter ${chapters.length + 1}`
      : `Chapter ${chapters.length + 1}`;
    chapters.push({ title, content: trimmed });
  }
  return chapters.length > 0 ? chapters : [{ title: "Document", content: parts.join("") }];
}

function dataUriToBytes(uri: string): { bytes: Uint8Array; mediaType: string } | null {
  const match = uri.match(/^data:(image\/(?:png|jpeg|gif|webp|svg\+xml));base64,(.*)$/i);
  if (!match) return null;
  try {
    const binary = atob(match[2]);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return { bytes, mediaType: match[1].toLowerCase() };
  } catch {
    return null;
  }
}

async function fetchImageBytes(url: string): Promise<{ bytes: Uint8Array; mediaType: string } | null> {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(IMAGE_FETCH_TIMEOUT_MS) });
    if (!response.ok) return null;
    const type = (response.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
    if (!/^image\/(png|jpeg|gif|webp|svg\+xml)$/.test(type)) return null;
    return { bytes: new Uint8Array(await response.arrayBuffer()), mediaType: type };
  } catch {
    return null;
  }
}

const EXTENSIONS: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};

/**
 * Move every <img> into the package: data URIs become files; remote images are
 * fetched directly, then through the image proxy; anything unresolved becomes
 * the same "[Image not available]" note the server produced.
 */
async function embedImages(html: string): Promise<{ html: string; images: EpubImage[] }> {
  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, "text/html");
  const images: EpubImage[] = [];
  let proxied = 0;

  const imgs = [...doc.querySelectorAll("img")];
  for (const img of imgs) {
    const src = img.getAttribute("src") || "";
    let resolved: { bytes: Uint8Array; mediaType: string } | null = null;

    if (src.startsWith("data:")) {
      resolved = dataUriToBytes(src);
    } else if (/^https?:\/\//i.test(src)) {
      resolved = await fetchImageBytes(src);
      if (!resolved && proxied < MAX_PROXY_IMAGES) {
        proxied++;
        resolved = await fetchImageBytes(`/api/img-proxy?url=${encodeURIComponent(src)}`);
      }
    }

    if (!resolved) {
      const note = doc.createElement("em");
      note.textContent = "[Image not available]";
      img.replaceWith(note);
      continue;
    }

    const index = images.length + 1;
    const href = `images/img-${index}.${EXTENSIONS[resolved.mediaType] || "bin"}`;
    images.push({ href, mediaType: resolved.mediaType, data: resolved.bytes });
    img.setAttribute("src", href);
  }

  return { html: doc.body.innerHTML, images };
}

/**
 * Generate EPUB blob without downloading
 */
export async function generateEpubBlob(
  markdown: string,
  originalFilename: string | null,
  signal?: AbortSignal,
  options: EpubOptions = {}
): Promise<EpubGenerateResult> {
  try {
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

    const rendered = await markdownToHtml(markdown);
    const { html, images } = await embedImages(rendered);
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

    const chapters: EpubChapter[] = splitIntoChapters(html).map((c) => ({ title: c.title, html: c.content }));

    let css = EPUB_STYLES;
    if (htmlHasMath(html)) {
      // Formula layout rules; fonts come from the reader's fallback stack
      css += "\n" + (await getKatexCssForHtmlExport());
    }

    const title =
      typeof originalFilename === "string" && originalFilename.trim() !== ""
        ? originalFilename.replace(/\.(md|markdown|txt)$/i, "")
        : "Document";

    const blob = await buildEpubBlob({
      title,
      language: options.language || "en",
      css,
      chapters,
      images,
    });

    return { success: true, blob, filename: generateFilename(originalFilename, "epub") };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return {
        success: false,
        error: { code: "ABORTED", message: "EPUB generation was cancelled.", retryable: false },
      };
    }
    console.error("[EPUB] generation failed:", error);
    return {
      success: false,
      error: { code: "GENERATION_FAILED", message: "EPUB generation failed. Please try again.", retryable: true },
    };
  }
}

/**
 * Export content as EPUB (generate in the browser + download)
 */
export async function exportEpub(
  markdown: string,
  originalFilename: string | null,
  signal?: AbortSignal,
  options: EpubOptions = {}
): Promise<EpubExportResult> {
  const result = await generateEpubBlob(markdown, originalFilename, signal, options);

  if (result.success && result.blob && result.filename) {
    downloadBlob(result.blob, result.filename);
  }

  return { success: result.success, error: result.error };
}
