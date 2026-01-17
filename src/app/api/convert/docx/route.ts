import { NextRequest, NextResponse } from "next/server";
import { markdownToHtml } from "@/lib/markdown";
import HTMLtoDOCX from "html-to-docx";

// Maximum content size (5MB)
const MAX_CONTENT_SIZE = 5 * 1024 * 1024;

// DOCX generation timeout (10 seconds)
const DOCX_TIMEOUT = 10000;

/**
 * Debug logging helper
 */
function debugLog(stage: string, message: string, data?: unknown) {
  const timestamp = new Date().toISOString();
  const prefix = `[DOCX Debug ${timestamp}] [${stage}]`;
  if (data !== undefined) {
    console.log(prefix, message, JSON.stringify(data, null, 2));
  } else {
    console.log(prefix, message);
  }
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
 * CSS styles for DOCX rendering - similar to PDF styles
 */
const DOCX_STYLES = `
body {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 11pt;
  line-height: 1.5;
  color: #333333;
}
h1 { font-size: 18pt; font-weight: bold; color: #2E74B5; margin-top: 24pt; margin-bottom: 12pt; }
h2 { font-size: 14pt; font-weight: bold; color: #2E74B5; margin-top: 18pt; margin-bottom: 8pt; }
h3 { font-size: 12pt; font-weight: bold; color: #1F4D78; margin-top: 14pt; margin-bottom: 6pt; }
h4, h5, h6 { font-size: 11pt; font-weight: bold; margin-top: 12pt; margin-bottom: 4pt; }
p { margin-top: 6pt; margin-bottom: 6pt; }
ul, ol { margin-top: 6pt; margin-bottom: 6pt; padding-left: 24pt; }
li { margin-top: 3pt; margin-bottom: 3pt; }
code { font-family: Consolas, Monaco, monospace; font-size: 10pt; background-color: #f5f5f5; padding: 2pt 4pt; }
pre { font-family: Consolas, Monaco, monospace; font-size: 10pt; background-color: #f5f5f5; padding: 12pt; margin: 12pt 0; white-space: pre-wrap; }
pre code { background-color: transparent; padding: 0; }
blockquote { border-left: 3pt solid #cccccc; margin: 12pt 0; padding-left: 12pt; color: #666666; font-style: italic; }
table { border-collapse: collapse; width: 100%; margin: 12pt 0; }
th, td { border: 1pt solid #cccccc; padding: 6pt 8pt; text-align: left; }
th { background-color: #f0f0f0; font-weight: bold; }
hr { border: none; border-top: 1pt solid #cccccc; margin: 18pt 0; }
a { color: #0563C1; text-decoration: underline; }
strong { font-weight: bold; }
em { font-style: italic; }
`;

/**
 * Convert markdown to DOCX buffer using html-to-docx
 * 
 * Pipeline: Markdown → HTML → DOCX
 * This produces more compatible Word documents
 */
async function markdownToDocx(markdown: string, title?: string): Promise<Buffer> {
  // Step 1: Convert markdown to HTML
  const htmlContent = await markdownToHtml(markdown);
  
  // Step 2: Wrap in full HTML document with styles
  const fullHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title || "Document"}</title>
  <style>${DOCX_STYLES}</style>
</head>
<body>
  ${htmlContent}
</body>
</html>
`;

  // Step 3: Convert HTML to DOCX
  const docxBuffer = await HTMLtoDOCX(fullHtml, null, {
    table: { row: { cantSplit: true } },
    footer: false,
    header: false,
    pageNumber: false,
    font: "Arial",
    fontSize: 22, // 22 half-points = 11pt
  });

  return docxBuffer as Buffer;
}

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7);
  const requestStart = Date.now();

  debugLog("Request", `[${requestId}] DOCX generation request started`, {
    url: request.url,
    method: request.method,
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

    // Generate DOCX with timeout
    debugLog("DOCX", `[${requestId}] Starting DOCX generation...`);
    const docxStart = Date.now();

    const docxPromise = markdownToDocx(markdown, filename?.replace(/\.(md|markdown|txt)$/i, ""));
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("DOCX generation timeout")), DOCX_TIMEOUT);
    });

    const docxBuffer = await Promise.race([docxPromise, timeoutPromise]);
    
    debugLog("DOCX", `[${requestId}] DOCX generated`, {
      durationMs: Date.now() - docxStart,
      docxSize: docxBuffer.length,
    });

    // Generate filename
    const outputFilename = filename
      ? filename.replace(/\.(md|markdown|txt)$/i, ".docx")
      : "document.docx";

    // Create ASCII-safe filename for Content-Disposition header
    const safeFilename = outputFilename.replace(/[^\x00-\x7F]/g, "-");
    const encodedFilename = encodeURIComponent(outputFilename);

    const totalDuration = Date.now() - requestStart;
    debugLog("Request", `[${requestId}] DOCX generation completed successfully`, {
      totalDurationMs: totalDuration,
      outputFilename,
      docxSize: docxBuffer.length,
    });

    // Return DOCX
    return new NextResponse(new Uint8Array(docxBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${safeFilename}"; filename*=UTF-8''${encodedFilename}`,
        "Content-Length": docxBuffer.length.toString(),
      },
    });
  } catch (error: unknown) {
    const totalDuration = Date.now() - requestStart;
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    debugLog("Error", `[${requestId}] DOCX generation FAILED`, {
      totalDurationMs: totalDuration,
      errorMessage,
      errorStack,
    });

    // Check for timeout errors
    if (errorMessage.includes("timeout") || errorMessage.includes("Timeout")) {
      return errorResponse(
        "GENERATION_TIMEOUT",
        "DOCX generation timed out. Please try again with a smaller document.",
        504
      );
    }

    // Generic error
    return errorResponse(
      "GENERATION_FAILED",
      "DOCX generation failed. Please try again.",
      500
    );
  }
}

// OPTIONS handler for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
