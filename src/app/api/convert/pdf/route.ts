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
const CHROMIUM_PACK_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}/chromium-pack.tar`
  : "https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar";

// Cache the Chromium executable path to avoid re-downloading on subsequent requests
let cachedExecutablePath: string | null = null;
let downloadPromise: Promise<string> | null = null;

/**
 * Downloads and caches the Chromium executable path.
 * Uses a download promise to prevent concurrent downloads.
 */
async function getChromiumPath(): Promise<string> {
  // Return cached path if available
  if (cachedExecutablePath) return cachedExecutablePath;

  // Prevent concurrent downloads by reusing the same promise
  if (!downloadPromise) {
    const chromium = (await import("@sparticuz/chromium-min")).default;
    downloadPromise = chromium
      .executablePath(CHROMIUM_PACK_URL)
      .then((path: string) => {
        cachedExecutablePath = path;
        console.log("Chromium path resolved:", path);
        return path;
      })
      .catch((error: Error) => {
        console.error("Failed to get Chromium path:", error);
        downloadPromise = null; // Reset on error to allow retry
        throw error;
      });
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
  let puppeteer: any;
  let launchOptions: any = { headless: true };

  if (isVercel) {
    // Vercel: Use puppeteer-core with downloaded Chromium binary
    const chromium = (await import("@sparticuz/chromium-min")).default;
    puppeteer = await import("puppeteer-core");
    const executablePath = await getChromiumPath();
    
    launchOptions = {
      ...launchOptions,
      args: chromium.args,
      executablePath,
    };
    console.log("Launching browser with executable path:", executablePath);
  } else {
    // Local: Use regular puppeteer with bundled Chromium
    puppeteer = await import("puppeteer");
  }

  return puppeteer.launch(launchOptions);
}

export async function POST(request: NextRequest) {
  let browser = null;

  try {
    // Parse request body
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
    if (Buffer.byteLength(markdown, "utf-8") > MAX_CONTENT_SIZE) {
      return errorResponse(
        "CONTENT_TOO_LARGE",
        "Content exceeds maximum size of 5MB.",
        413
      );
    }

    // Convert markdown to HTML
    const renderedHtml = await markdownToHtml(markdown);
    const fullHtml = generatePdfHtml(renderedHtml);

    // Launch browser with timeout
    const launchPromise = getBrowser();

    // Set timeout for browser launch
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("Browser launch timeout")), PDF_TIMEOUT);
    });

    browser = await Promise.race([launchPromise, timeoutPromise]);
    const page = await browser.newPage();

    // Set viewport to A4 dimensions (in pixels at 96 DPI)
    // A4: 210mm × 297mm = 794px × 1123px at 96 DPI
    await page.setViewport({
      width: 794,
      height: 1123,
      deviceScaleFactor: 2, // Higher quality
    });

    // Set content with timeout
    await page.setContent(fullHtml, {
      waitUntil: "networkidle0",
      timeout: 5000,
    });

    // Generate PDF with A4 size and margins
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

    // Close browser
    await browser.close();
    browser = null;

    // Generate filename
    const outputFilename = filename
      ? filename.replace(/\.(md|markdown|txt)$/i, ".pdf")
      : "document.pdf";

    // Return PDF - Convert Uint8Array to Buffer for NextResponse
    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${outputFilename}"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    // Clean up browser if still open
    if (browser) {
      try {
        await browser.close();
      } catch {
        // Ignore cleanup errors
      }
    }

    console.error("PDF generation error:", error);

    // Check for timeout errors
    if (
      error instanceof Error &&
      (error.message.includes("timeout") || error.message.includes("Timeout"))
    ) {
      return errorResponse(
        "GENERATION_TIMEOUT",
        "PDF generation timed out. Please try again with a smaller document.",
        504
      );
    }

    // Generic error
    return errorResponse(
      "GENERATION_FAILED",
      "PDF generation failed. Please try again.",
      500
    );
  }
}

// Rate limiting info in response headers
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
