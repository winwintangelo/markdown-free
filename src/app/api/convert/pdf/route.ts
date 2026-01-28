/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { markdownToHtml } from "@/lib/markdown";
import { proxyImagesInHtml } from "@/lib/image-proxy";

// Maximum content size (1MB - reduced from 5MB for security)
// This prevents memory exhaustion attacks while still allowing reasonable documents
const MAX_CONTENT_SIZE = 1 * 1024 * 1024;

// Maximum rendered HTML size (10MB - accounts for base64 images)
// Base64 encoding increases size by ~33%, plus HTML tags add overhead
const MAX_HTML_SIZE = 10 * 1024 * 1024;

// Vercel serverless function config
// This ensures the function times out before Vercel's hard limit
export const maxDuration = 25; // seconds

// PDF generation timeout (15 seconds)
const PDF_TIMEOUT = 15000;

// URL to the Chromium binary package hosted in /public
// Built during postinstall from @sparticuz/chromium (devDep)
// See: https://github.com/gabenunez/puppeteer-on-vercel
const CHROMIUM_PACK_URL = process.env.VERCEL_ENV
  ? "https://www.markdown.free/chromium-pack.tar"
  : "https://github.com/Sparticuz/chromium/releases/download/v141.0.0/chromium-v141.0.0-pack.tar";

// Cache the Chromium executable path to avoid re-downloading on subsequent requests
let cachedExecutablePath: string | null = null;
let downloadPromise: Promise<string> | null = null;

// Module initialization log
console.log("[PDF Module Init]", JSON.stringify({
  timestamp: new Date().toISOString(),
  NODE_ENV: process.env.NODE_ENV,
  VERCEL_ENV: process.env.VERCEL_ENV,
  VERCEL_REGION: process.env.VERCEL_REGION,
  CHROMIUM_PACK_URL,
}, null, 2));

/**
 * Debug logging helper
 */
function debugLog(stage: string, message: string, data?: any) {
  const timestamp = new Date().toISOString();
  const prefix = `[PDF Debug ${timestamp}] [${stage}]`;
  if (data !== undefined) {
    console.log(prefix, message, JSON.stringify(data, null, 2));
  } else {
    console.log(prefix, message);
  }
}

/**
 * Downloads and caches the Chromium executable path.
 * Uses a download promise to prevent concurrent downloads.
 */
async function getChromiumPath(): Promise<string> {
  debugLog("ChromiumPath", "getChromiumPath called", {
    cachedExecutablePath,
    hasDownloadPromise: !!downloadPromise,
    CHROMIUM_PACK_URL,
  });

  // Return cached path if available
  if (cachedExecutablePath) {
    debugLog("ChromiumPath", "Returning cached path", cachedExecutablePath);
    return cachedExecutablePath;
  }

  // Prevent concurrent downloads by reusing the same promise
  if (!downloadPromise) {
    debugLog("ChromiumPath", "Starting new download/extraction...");
    const startTime = Date.now();
    
    const chromium = (await import("@sparticuz/chromium-min")).default;
    debugLog("ChromiumPath", "chromium-min module imported");
    
    downloadPromise = chromium
      .executablePath(CHROMIUM_PACK_URL)
      .then((path: string) => {
        const duration = Date.now() - startTime;
        cachedExecutablePath = path;
        debugLog("ChromiumPath", "Chromium path resolved successfully", {
          path,
          durationMs: duration,
        });
        return path;
      })
      .catch((error: Error) => {
        const duration = Date.now() - startTime;
        debugLog("ChromiumPath", "Failed to get Chromium path", {
          error: error.message,
          stack: error.stack,
          durationMs: duration,
        });
        downloadPromise = null; // Reset on error to allow retry
        throw error;
      });
  } else {
    debugLog("ChromiumPath", "Reusing existing download promise");
  }

  return downloadPromise;
}

/**
 * CSS styles for PDF rendering - matches the preview/HTML export styling
 */
const PDF_STYLES = `
/* Base styles with multilingual font support */
body {
  font-family: 'Noto Sans', 'Noto Sans JP', 'Noto Sans KR', 'Noto Sans SC', 'Noto Sans TC', 'Noto Color Emoji', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
  color: #1e293b;
  margin: 0;
  padding: 0;
}

/* Headings */
h1, h2, h3, h4, h5, h6 {
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
  line-height: 1.25;
}
h1 { font-size: 1.5rem; }
h2 { font-size: 1.25rem; }
h3 { font-size: 1.125rem; }

/* Paragraphs */
p {
  margin-top: 0.75rem;
  margin-bottom: 0.75rem;
}

/* Links */
a {
  color: #059669;
  text-decoration: none;
}

/* Lists */
ul, ol {
  margin-top: 0.75rem;
  margin-bottom: 0.75rem;
  padding-left: 1.5rem;
}
li {
  margin-top: 0.25rem;
  margin-bottom: 0.25rem;
}

/* Code - with CJK fallback for comments in code */
code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Noto Sans JP', 'Noto Sans KR', 'Noto Sans SC', 'Noto Sans TC', monospace;
  font-size: 0.875em;
  background-color: #f1f5f9;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
}

pre {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Noto Sans JP', 'Noto Sans KR', 'Noto Sans SC', 'Noto Sans TC', monospace;
  font-size: 0.875em;
  background-color: #1e293b;
  color: #f8fafc;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin-top: 1rem;
  margin-bottom: 1rem;
}

pre code {
  background-color: transparent;
  padding: 0;
  color: inherit;
}

/* Blockquotes */
blockquote {
  border-left: 4px solid #e2e8f0;
  margin: 1rem 0;
  padding-left: 1rem;
  color: #64748b;
  font-style: italic;
}

/* Tables */
table {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
}
th, td {
  border: 1px solid #e2e8f0;
  padding: 0.5rem 0.75rem;
  text-align: left;
}
th {
  background-color: #f8fafc;
  font-weight: 600;
}

/* Horizontal rule */
hr {
  border: none;
  border-top: 1px solid #e2e8f0;
  margin: 2rem 0;
}

/* Images */
img {
  max-width: 100%;
  height: auto;
}
`.trim();

/**
 * Generate HTML template for PDF
 * Includes Google Noto fonts for multilingual support (CJK, Vietnamese, etc.)
 */
function generatePdfHtml(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;600;700&family=Noto+Sans+JP:wght@400;600;700&family=Noto+Sans+KR:wght@400;600;700&family=Noto+Sans+SC:wght@400;600;700&family=Noto+Sans+TC:wght@400;600;700&family=Noto+Color+Emoji&display=swap" rel="stylesheet">
  <style>
${PDF_STYLES}
  </style>
</head>
<body>
  <article>
${content}
  </article>
</body>
</html>`;
}

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
 * Get browser instance based on environment
 * - Local development: uses full puppeteer with bundled Chromium
 * - Production (Vercel): uses puppeteer-core with @sparticuz/chromium-min
 * 
 * See: https://vercel.com/kb/guide/deploying-puppeteer-with-nextjs-on-vercel
 */
async function getBrowser() {
  const isVercel = !!process.env.VERCEL_ENV;
  
  debugLog("Browser", "getBrowser called", {
    isVercel,
    VERCEL_ENV: process.env.VERCEL_ENV,
    VERCEL_REGION: process.env.VERCEL_REGION,
    NODE_ENV: process.env.NODE_ENV,
  });
  
  let puppeteer: any;
  let launchOptions: any = { headless: true };

  if (isVercel) {
    debugLog("Browser", "Vercel environment detected, using puppeteer-core");
    
    // Vercel: Use puppeteer-core with downloaded Chromium binary
    const chromium = (await import("@sparticuz/chromium-min")).default;
    debugLog("Browser", "chromium-min imported, chromium.args:", chromium.args);
    
    puppeteer = await import("puppeteer-core");
    debugLog("Browser", "puppeteer-core imported");
    
    const executablePath = await getChromiumPath();
    
    launchOptions = {
      ...launchOptions,
      args: chromium.args,
      executablePath,
    };
    debugLog("Browser", "Launch options configured", {
      headless: launchOptions.headless,
      executablePath: launchOptions.executablePath,
      argsCount: launchOptions.args?.length,
      args: launchOptions.args,
    });
  } else {
    debugLog("Browser", "Local environment, using full puppeteer");
    // Local: Use regular puppeteer with bundled Chromium
    puppeteer = await import("puppeteer");
    debugLog("Browser", "puppeteer imported");
  }

  debugLog("Browser", "Launching browser...");
  const launchStart = Date.now();
  
  try {
    const browser = await puppeteer.launch(launchOptions);
    const launchDuration = Date.now() - launchStart;
    debugLog("Browser", "Browser launched successfully", {
      durationMs: launchDuration,
    });
    return browser;
  } catch (error: any) {
    const launchDuration = Date.now() - launchStart;
    debugLog("Browser", "Browser launch FAILED", {
      durationMs: launchDuration,
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7);
  const requestStart = Date.now();
  let browser: any = null;
  let page: any = null;

  debugLog("Request", `[${requestId}] PDF generation request started`, {
    url: request.url,
    method: request.method,
    VERCEL_ENV: process.env.VERCEL_ENV,
    VERCEL_REGION: process.env.VERCEL_REGION,
    NODE_ENV: process.env.NODE_ENV,
  });

  try {
    // Parse request body
    debugLog("Request", `[${requestId}] Parsing request body...`);
    const body = await request.json();
    const { markdown, filename } = body;

    // SECURITY: Log metadata only, never log user content (PII risk)
    debugLog("Request", `[${requestId}] Request body parsed`, {
      filename,
      markdownLength: markdown?.length,
      // Note: We intentionally don't log content preview to protect user privacy
    });

    // Validate content
    if (!markdown || typeof markdown !== "string") {
      debugLog("Request", `[${requestId}] Invalid content`);
      return errorResponse(
        "INVALID_CONTENT",
        "Please provide valid markdown content.",
        400
      );
    }

    // Check content size
    const contentSize = Buffer.byteLength(markdown, "utf-8");
    debugLog("Request", `[${requestId}] Content size: ${contentSize} bytes`);
    
    if (contentSize > MAX_CONTENT_SIZE) {
      debugLog("Request", `[${requestId}] Content too large`);
      return errorResponse(
        "CONTENT_TOO_LARGE",
        "Content exceeds maximum size of 1MB.",
        413
      );
    }

    // Convert markdown to HTML
    debugLog("Markdown", `[${requestId}] Converting markdown to HTML...`);
    const markdownStart = Date.now();
    let renderedHtml = await markdownToHtml(markdown);

    // SECURITY: URL sanitization pass for href and src attributes
    // Remove any remaining dangerous URL schemes that might have slipped through
    const DANGEROUS_URL_PATTERNS = [
      /href\s*=\s*["']?\s*javascript:/gi,
      /href\s*=\s*["']?\s*vbscript:/gi,
      /href\s*=\s*["']?\s*file:/gi,
      /href\s*=\s*["']?\s*ftp:/gi,
      /href\s*=\s*["']?\s*data:/gi,
      /src\s*=\s*["']?\s*javascript:/gi,
      /src\s*=\s*["']?\s*vbscript:/gi,
      /src\s*=\s*["']?\s*file:/gi,
      // Block non-image data URIs in src (only our proxy should generate data:image/*)
      /src\s*=\s*["']data:(?!image\/)/gi,
    ];
    for (const pattern of DANGEROUS_URL_PATTERNS) {
      if (pattern.test(renderedHtml)) {
        debugLog("Security", `[${requestId}] Blocked dangerous URL pattern: ${pattern.source}`);
        renderedHtml = renderedHtml.replace(pattern, 'href="#blocked"');
      }
    }

    // SECURITY: Proxy external images to prevent SSRF during PDF generation
    // This fetches images via Node.js, validates URLs, and converts to Base64
    debugLog("Security", `[${requestId}] Proxying external images...`);
    const imageProxyStart = Date.now();
    renderedHtml = await proxyImagesInHtml(renderedHtml);
    debugLog("Security", `[${requestId}] Image proxy complete`, {
      durationMs: Date.now() - imageProxyStart,
    });

    const fullHtml = generatePdfHtml(renderedHtml);
    debugLog("Markdown", `[${requestId}] Markdown converted`, {
      durationMs: Date.now() - markdownStart,
      htmlLength: fullHtml.length,
    });

    // SECURITY: Check rendered HTML size (prevents memory exhaustion from large base64 images)
    const htmlSize = Buffer.byteLength(fullHtml, "utf-8");
    if (htmlSize > MAX_HTML_SIZE) {
      debugLog("Security", `[${requestId}] HTML too large: ${htmlSize} bytes`);
      return errorResponse(
        "CONTENT_TOO_LARGE",
        "Rendered content exceeds maximum size. Try reducing the number or size of images.",
        413
      );
    }

    // Launch browser with timeout
    debugLog("Browser", `[${requestId}] Starting browser launch with ${PDF_TIMEOUT}ms timeout...`);
    const browserStart = Date.now();
    const launchPromise = getBrowser();

    // Set timeout for browser launch
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("Browser launch timeout")), PDF_TIMEOUT);
    });

    browser = await Promise.race([launchPromise, timeoutPromise]);
    debugLog("Browser", `[${requestId}] Browser obtained`, {
      durationMs: Date.now() - browserStart,
    });

    debugLog("Page", `[${requestId}] Creating new page...`);
    const pageStart = Date.now();
    page = await browser.newPage();
    debugLog("Page", `[${requestId}] Page created`, {
      durationMs: Date.now() - pageStart,
    });

    // SECURITY: Disable JavaScript execution to prevent XSS
    debugLog("Security", `[${requestId}] Disabling JavaScript...`);
    await page.setJavaScriptEnabled(false);

    // SECURITY: Block all network requests except Google Fonts (for CJK support)
    // Uses hostname-based matching (not string/regex on URL) to prevent bypass attacks
    const ALLOWED_FONT_HOSTNAMES = new Set([
      "fonts.googleapis.com",
      "fonts.gstatic.com",
    ]);
    const ALLOWED_FONT_RESOURCE_TYPES = new Set(["stylesheet", "font"]);

    debugLog("Security", `[${requestId}] Setting up request interception...`);
    await page.setRequestInterception(true);

    page.on("request", (request: any) => {
      const url = request.url();
      const resourceType = request.resourceType();

      // Allow data URIs (inline content - already validated by image proxy)
      if (url.startsWith("data:")) {
        // Only allow data:image/* URIs
        if (url.startsWith("data:image/")) {
          request.continue();
        } else {
          debugLog("Security", `[${requestId}] Blocking non-image data URI`);
          request.abort("blockedbyclient");
        }
        return;
      }

      // Parse URL and check hostname (secure hostname-based matching)
      let isAllowedDomain = false;
      try {
        const parsed = new URL(url);
        // Must be HTTPS and exact hostname match
        isAllowedDomain = parsed.protocol === "https:" && ALLOWED_FONT_HOSTNAMES.has(parsed.hostname);
      } catch {
        // Invalid URL - block it
        isAllowedDomain = false;
      }

      const isAllowedResourceType = ALLOWED_FONT_RESOURCE_TYPES.has(resourceType);

      if (isAllowedDomain && isAllowedResourceType) {
        debugLog("Security", `[${requestId}] Allowing font request: ${resourceType} from ${url.substring(0, 100)}`);
        request.continue();
      } else {
        // Block all other external requests (SSRF protection)
        debugLog("Security", `[${requestId}] Blocking request: ${resourceType} to ${url.substring(0, 100)}`);
        request.abort("blockedbyclient");
      }
    });

    // Set viewport to A4 dimensions (in pixels at 96 DPI)
    // A4: 210mm × 297mm = 794px × 1123px at 96 DPI
    debugLog("Page", `[${requestId}] Setting viewport...`);
    await page.setViewport({
      width: 794,
      height: 1123,
      deviceScaleFactor: 2, // Higher quality
    });

    // Set content with timeout (increased for Google Fonts/CJK loading)
    // Note: JS is disabled at this point, which is fine for font loading via CSS
    debugLog("Page", `[${requestId}] Setting page content (networkidle0, 10000ms timeout)...`);
    const contentStart = Date.now();
    await page.setContent(fullHtml, {
      waitUntil: "networkidle0",
      timeout: 10000,
    });
    debugLog("Page", `[${requestId}] Page content set`, {
      durationMs: Date.now() - contentStart,
    });

    // Wait for fonts to be loaded before enabling offline mode
    // We need to temporarily enable JS to check document.fonts.ready
    debugLog("Security", `[${requestId}] Waiting for fonts to load...`);
    await page.setJavaScriptEnabled(true);
    try {
      // Set a tight timeout for fonts.ready to prevent hanging
      const fontTimeout = 3000; // 3 seconds max for fonts
      await Promise.race([
        page.evaluate(() => document.fonts.ready),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Font load timeout")), fontTimeout)
        ),
      ]);
      debugLog("Security", `[${requestId}] Fonts loaded successfully`);
    } catch (fontError) {
      // If fonts.ready fails or times out, continue anyway
      // This ensures we don't hang indefinitely on cold starts
      debugLog("Security", `[${requestId}] Font wait failed, continuing: ${fontError}`);
    }
    // Re-disable JavaScript immediately
    await page.setJavaScriptEnabled(false);

    // SECURITY: Enable offline mode after fonts are loaded
    // Belt-and-suspenders control - prevents any late-loading resources
    await page.setOfflineMode(true);
    debugLog("Security", `[${requestId}] Offline mode enabled`);

    // Generate PDF with A4 size and margins
    debugLog("PDF", `[${requestId}] Generating PDF...`);
    const pdfStart = Date.now();
    const pdfBuffer = await page.pdf({
      format: "A4",
      margin: {
        top: "20mm",
        right: "20mm",
        bottom: "20mm",
        left: "20mm",
      },
      printBackground: true,
      timeout: PDF_TIMEOUT,
    });
    debugLog("PDF", `[${requestId}] PDF generated`, {
      durationMs: Date.now() - pdfStart,
      pdfSize: pdfBuffer.length,
    });

    // Close page and browser
    debugLog("Browser", `[${requestId}] Closing page and browser...`);
    if (page) {
      await page.close();
      page = null;
    }
    await browser.close();
    browser = null;
    debugLog("Browser", `[${requestId}] Browser closed`);

    // Generate filename
    const outputFilename = filename
      ? filename.replace(/\.(md|markdown|txt)$/i, ".pdf")
      : "document.pdf";

    // Create ASCII-safe filename for Content-Disposition header
    // Replace non-ASCII characters with hyphens to avoid ByteString errors
    const safeFilename = outputFilename.replace(/[^\x00-\x7F]/g, "-");
    // Also encode the full filename for RFC 5987 compliant clients
    const encodedFilename = encodeURIComponent(outputFilename);

    const totalDuration = Date.now() - requestStart;
    debugLog("Request", `[${requestId}] PDF generation completed successfully`, {
      totalDurationMs: totalDuration,
      outputFilename,
      safeFilename,
      pdfSize: pdfBuffer.length,
    });

    // Return PDF - Convert Uint8Array to Buffer for NextResponse
    // Use both filename (ASCII fallback) and filename* (UTF-8 encoded) per RFC 5987
    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeFilename}"; filename*=UTF-8''${encodedFilename}`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error: any) {
    const totalDuration = Date.now() - requestStart;

    // Clean up page and browser if still open (finally-like cleanup)
    if (page) {
      try {
        debugLog("Cleanup", `[${requestId}] Closing page after error...`);
        await page.close();
      } catch (pageCleanupError: any) {
        debugLog("Cleanup", `[${requestId}] Failed to close page`, {
          error: pageCleanupError.message,
        });
      }
    }
    if (browser) {
      try {
        debugLog("Cleanup", `[${requestId}] Closing browser after error...`);
        await browser.close();
        debugLog("Cleanup", `[${requestId}] Browser closed after error`);
      } catch (cleanupError: any) {
        debugLog("Cleanup", `[${requestId}] Failed to close browser`, {
          error: cleanupError.message,
        });
      }
    }

    debugLog("Error", `[${requestId}] PDF generation FAILED`, {
      totalDurationMs: totalDuration,
      errorName: error.name,
      errorMessage: error.message,
      errorStack: error.stack,
      errorCode: error.code,
    });

    // Check for timeout errors
    if (
      error instanceof Error &&
      (error.message.includes("timeout") || error.message.includes("Timeout"))
    ) {
      debugLog("Error", `[${requestId}] Returning timeout error`);
      return errorResponse(
        "GENERATION_TIMEOUT",
        "PDF generation timed out. Please try again with a smaller document.",
        504
      );
    }

    // Generic error
    debugLog("Error", `[${requestId}] Returning generic error`);
    return errorResponse(
      "GENERATION_FAILED",
      "PDF generation failed. Please try again.",
      500
    );
  }
}

/**
 * GET handler for debugging - returns environment info and Chromium status
 * Access via: /api/convert/pdf (GET request)
 */
export async function GET() {
  const startTime = Date.now();
  const debugInfo: Record<string, any> = {
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV,
      VERCEL_REGION: process.env.VERCEL_REGION,
      VERCEL_URL: process.env.VERCEL_URL,
    },
    config: {
      CHROMIUM_PACK_URL,
      MAX_CONTENT_SIZE,
      PDF_TIMEOUT,
    },
    cache: {
      cachedExecutablePath,
      hasDownloadPromise: !!downloadPromise,
    },
  };

  // Try to get Chromium info if on Vercel
  if (process.env.VERCEL_ENV) {
    const chromiumStart = Date.now();
    try {
      debugLog("Debug", "GET: Testing Chromium path resolution...");
      const executablePath = await getChromiumPath();
      debugInfo.chromium = {
        status: "ok",
        executablePath,
        resolutionTimeMs: Date.now() - chromiumStart,
      };
      debugLog("Debug", "GET: Chromium path resolved", debugInfo.chromium);
    } catch (error: any) {
      debugInfo.chromium = {
        status: "error",
        error: error.message,
        stack: error.stack,
        resolutionTimeMs: Date.now() - chromiumStart,
      };
      debugLog("Debug", "GET: Chromium path resolution failed", debugInfo.chromium);
    }
  } else {
    debugInfo.chromium = {
      status: "skipped",
      reason: "Local environment - using bundled Puppeteer",
    };
  }

  debugInfo.totalTimeMs = Date.now() - startTime;

  return NextResponse.json(debugInfo, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

// Rate limiting info in response headers
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
