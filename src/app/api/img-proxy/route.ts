import { NextRequest, NextResponse } from "next/server";
import { fetchValidatedImage } from "@/lib/image-proxy";

/**
 * CORS Image Proxy for client-side image export (PNG/JPG)
 *
 * The image exporter rasterizes markdown in the browser. Remote images whose
 * hosts don't send CORS headers would taint the canvas, so the client falls
 * back to fetching them through this same-origin route.
 *
 * All validation lives in @/lib/image-proxy (shared with the PDF/DOCX/EPUB
 * embedding path): HTTPS-only, default port only, private/loopback/metadata
 * IP rejection with a connect-time DNS-rebinding pin, manual redirects
 * re-validated per hop, magic-number + dimension checks, 2MB cap, 5s timeout.
 *
 * Privacy: this route only fetches images already referenced in the user's
 * markdown; the markdown itself never leaves the browser.
 *
 * No Access-Control-Allow-Origin header is set on purpose: the proxy is
 * consumed same-origin only, and omitting it keeps other sites from using
 * this endpoint as a free image proxy from their own frontends.
 */

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json(
      { error: "MISSING_URL", message: "Query parameter 'url' is required." },
      { status: 400 }
    );
  }

  const result = await fetchValidatedImage(url);

  if (!result) {
    return NextResponse.json(
      {
        error: "FETCH_BLOCKED",
        message: "The image could not be fetched or is not allowed.",
      },
      { status: 403 }
    );
  }

  return new NextResponse(result.buffer, {
    status: 200,
    headers: {
      "Content-Type": result.mimeType,
      "Content-Length": String(result.buffer.byteLength),
      "Cache-Control": "public, max-age=86400",
      "X-Content-Type-Options": "nosniff",
      "Content-Disposition": "inline",
    },
  });
}
