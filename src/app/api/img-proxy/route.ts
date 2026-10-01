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
 * consumed same-origin only, so other sites can't read its responses with
 * fetch(). That alone doesn't stop an <img src> on another site, which needs
 * no CORS; the Sec-Fetch-Site check below does. Browsers too old to send the
 * header, and non-browser clients, get through and meet the rate limit.
 */

export const runtime = "nodejs";

const ALLOWED_FETCH_SITES = new Set(["same-origin", "none"]);

export async function GET(request: NextRequest) {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && !ALLOWED_FETCH_SITES.has(fetchSite)) {
    return NextResponse.json(
      { error: "CROSS_SITE", message: "This endpoint serves markdown.free pages only." },
      { status: 403 }
    );
  }

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
