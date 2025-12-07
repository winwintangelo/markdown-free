/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { markdownToHtml } from "@/lib/markdown";

// Maximum content size (5MB)
const MAX_CONTENT_SIZE = 5 * 1024 * 1024;

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
/* Base styles */
body {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
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

/* Code */
code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.875em;
  background-color: #f1f5f9;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
}

pre {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
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
 */
function generatePdfHtml(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
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
  let browser = null;

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

    debugLog("Request", `[${requestId}] Request body parsed`, {
      filename,
      markdownLength: markdown?.length,
      markdownPreview: markdown?.substring(0, 100),
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
        "Content exceeds maximum size of 5MB.",
        413
      );
    }

    // Convert markdown to HTML
    debugLog("Markdown", `[${requestId}] Converting markdown to HTML...`);
    const markdownStart = Date.now();
    const renderedHtml = await markdownToHtml(markdown);
    const fullHtml = generatePdfHtml(renderedHtml);
    debugLog("Markdown", `[${requestId}] Markdown converted`, {
      durationMs: Date.now() - markdownStart,
      htmlLength: fullHtml.length,
    });

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
    const page = await browser.newPage();
    debugLog("Page", `[${requestId}] Page created`, {
      durationMs: Date.now() - pageStart,
    });

    // Set viewport to A4 dimensions (in pixels at 96 DPI)
    // A4: 210mm × 297mm = 794px × 1123px at 96 DPI
    debugLog("Page", `[${requestId}] Setting viewport...`);
    await page.setViewport({
      width: 794,
      height: 1123,
      deviceScaleFactor: 2, // Higher quality
    });

    // Set content with timeout
    debugLog("Page", `[${requestId}] Setting page content (networkidle0, 5000ms timeout)...`);
    const contentStart = Date.now();
    await page.setContent(fullHtml, {
      waitUntil: "networkidle0",
      timeout: 5000,
    });
    debugLog("Page", `[${requestId}] Page content set`, {
      durationMs: Date.now() - contentStart,
    });

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

    // Close browser
    debugLog("Browser", `[${requestId}] Closing browser...`);
    await browser.close();
    browser = null;
    debugLog("Browser", `[${requestId}] Browser closed`);

    // Generate filename
    const outputFilename = filename
      ? filename.replace(/\.(md|markdown|txt)$/i, ".pdf")
      : "document.pdf";

    const totalDuration = Date.now() - requestStart;
    debugLog("Request", `[${requestId}] PDF generation completed successfully`, {
      totalDurationMs: totalDuration,
      outputFilename,
      pdfSize: pdfBuffer.length,
    });

    // Return PDF - Convert Uint8Array to Buffer for NextResponse
    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${outputFilename}"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error: any) {
    const totalDuration = Date.now() - requestStart;
    
    // Clean up browser if still open
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
