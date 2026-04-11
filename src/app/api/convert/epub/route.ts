import { NextRequest, NextResponse } from "next/server";
import { markdownToHtml } from "@/lib/markdown";
import { proxyImagesInHtml } from "@/lib/image-proxy";
import epub from "epub-gen-memory";

// Maximum content size (1MB)
const MAX_CONTENT_SIZE = 1 * 1024 * 1024;

// EPUB generation timeout (15 seconds)
const EPUB_TIMEOUT = 15000;

/**
 * Error response helper
 */
function errorResponse(
  code: string,
  message: string,
  status: number
): NextResponse {
  return NextResponse.json({ error: code, message }, { status });
}

/**
 * Replace non-embedded images with placeholder text.
 * EPUB needs images as data URIs or they won't render in e-readers.
 */
function replaceNonEmbeddedImages(html: string): string {
  let result = html.replace(/<img\s+[^>]*src=["']([^"']+)["'][^>]*\/?>/gi, (match, src) => {
    if (src.startsWith("data:image/")) {
      return match;
    }
    return "<em>[Image not available]</em>";
  });

  result = result.replace(/<img\s+(?![^>]*src=)[^>]*\/?>/gi, () => {
    return "<em>[Image not available]</em>";
  });

  return result;
}

/**
 * Split HTML content into chapters at H1 or H2 boundaries.
 * Returns an array of { title, content } objects for EPUB chapters.
 */
function splitIntoChapters(html: string): { title: string; content: string }[] {
  // Try splitting at H1 first
  const h1Parts = html.split(/(?=<h1[\s>])/i);
  if (h1Parts.length > 1) {
    return buildChapters(h1Parts, /<h1[^>]*>(.*?)<\/h1>/i);
  }

  // Fall back to H2
  const h2Parts = html.split(/(?=<h2[\s>])/i);
  if (h2Parts.length > 1) {
    return buildChapters(h2Parts, /<h2[^>]*>(.*?)<\/h2>/i);
  }

  // No headings — single chapter
  return [{ title: "Document", content: html }];
}

function buildChapters(
  parts: string[],
  headingRegex: RegExp
): { title: string; content: string }[] {
  const chapters: { title: string; content: string }[] = [];

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    const match = trimmed.match(headingRegex);
    const title = match
      ? match[1].replace(/<[^>]+>/g, "").trim() // Strip inner HTML tags
      : `Chapter ${chapters.length + 1}`;

    chapters.push({ title, content: trimmed });
  }

  return chapters.length > 0
    ? chapters
    : [{ title: "Document", content: parts.join("") }];
}

/**
 * CSS styles for EPUB rendering
 */
const EPUB_STYLES = `
body {
  font-family: Georgia, "Times New Roman", serif;
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
th, td { border: 1px solid #ccc; padding: 0.5em; text-align: left; }
th { background-color: #f0f0f0; font-weight: bold; }
hr { border: none; border-top: 1px solid #ccc; margin: 1.5em 0; }
a { color: #0563C1; text-decoration: underline; }
img { max-width: 100%; height: auto; }
`;

export async function POST(request: NextRequest) {
  const requestStart = Date.now();

  try {
    const body = await request.json();
    const { markdown, filename } = body;

    // Validate content
    if (!markdown || typeof markdown !== "string") {
      return errorResponse(
        "INVALID_CONTENT",
        "Please provide valid markdown content.",
        400
      );
    }

    // Check content size
    const contentSize = Buffer.byteLength(markdown, "utf-8");
    if (contentSize > MAX_CONTENT_SIZE) {
      return errorResponse(
        "CONTENT_TOO_LARGE",
        "Content exceeds maximum size of 1MB.",
        413
      );
    }

    // Step 1: Convert markdown to HTML
    let htmlContent = await markdownToHtml(markdown);

    // Step 2: Proxy external images (convert to base64 data URIs)
    htmlContent = await proxyImagesInHtml(htmlContent);

    // Step 3: Replace any remaining non-embedded images
    htmlContent = replaceNonEmbeddedImages(htmlContent);

    // Step 4: Split into chapters
    const chapters = splitIntoChapters(htmlContent);

    // Step 5: Derive title from filename or first heading
    const title = filename
      ? filename.replace(/\.(md|markdown|txt)$/i, "")
      : "Document";

    // Step 6: Generate EPUB with timeout
    const epubPromise = epub(
      {
        title,
        css: EPUB_STYLES,
        tocTitle: "Table of Contents",
        prependChapterTitles: false,
        ignoreFailedDownloads: true,
        verbose: false,
      },
      chapters.map((ch) => ({
        title: ch.title,
        content: ch.content,
      }))
    );

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("EPUB generation timeout")), EPUB_TIMEOUT);
    });

    const epubBuffer = await Promise.race([epubPromise, timeoutPromise]);

    // Generate filename
    const outputFilename = filename
      ? filename.replace(/\.(md|markdown|txt)$/i, ".epub")
      : "document.epub";

    const safeFilename = outputFilename.replace(/[^\x00-\x7F]/g, "-");
    const encodedFilename = encodeURIComponent(outputFilename);

    console.log(
      `[EPUB] Generated in ${Date.now() - requestStart}ms, ` +
      `${chapters.length} chapters, ${epubBuffer.length} bytes`
    );

    return new NextResponse(new Uint8Array(epubBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/epub+zip",
        "Content-Disposition": `attachment; filename="${safeFilename}"; filename*=UTF-8''${encodedFilename}`,
        "Content-Length": epubBuffer.length.toString(),
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    console.error(`[EPUB] Generation failed in ${Date.now() - requestStart}ms:`, errorMessage);

    if (errorMessage.includes("timeout") || errorMessage.includes("Timeout")) {
      return errorResponse(
        "GENERATION_TIMEOUT",
        "EPUB generation timed out. Please try again with a smaller document.",
        504
      );
    }

    return errorResponse(
      "GENERATION_FAILED",
      "EPUB generation failed. Please try again.",
      500
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
