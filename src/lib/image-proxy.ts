/**
 * Image Proxy for PDF Generation
 *
 * Pre-fetches external images, validates URLs for security,
 * and converts them to Base64 data URIs for safe embedding in PDFs.
 *
 * Security measures:
 * - HTTPS only (blocks HTTP to prevent downgrade attacks)
 * - Blocks localhost, internal IPs, IPv6 private ranges (SSRF protection)
 * - Manual redirect handling with re-validation at each hop
 * - Validates URL format and hostname (normalized, trailing dot stripped)
 * - Magic number validation (don't trust Content-Type)
 * - Maximum pixel dimensions (prevent decompression bombs)
 * - Limits image size (2MB max per image)
 * - Limits total embedded bytes (8MB max total)
 * - Timeout protection (5s per image)
 * - SVG blocked (can contain scripts)
 */

// Maximum image size in bytes (2MB per image)
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

// Maximum total embedded image bytes (8MB total)
const MAX_TOTAL_IMAGE_BYTES = 8 * 1024 * 1024;

// Maximum image dimensions (prevent decompression bombs)
// A 10000x10000 image at 4 bytes/pixel = 400MB decoded
const MAX_IMAGE_DIMENSION = 4096;
const MAX_IMAGE_PIXELS = 16 * 1024 * 1024; // 16 megapixels max

// Timeout for fetching each image (5 seconds)
const IMAGE_FETCH_TIMEOUT = 5000;

// Maximum number of images to process per document
const MAX_IMAGES_PER_DOC = 20;

// Maximum redirect hops to follow
const MAX_REDIRECTS = 3;

// Image magic number signatures
const IMAGE_MAGIC_NUMBERS: { [key: string]: { bytes: number[]; mask?: number[] } } = {
  "image/jpeg": { bytes: [0xff, 0xd8, 0xff] },
  "image/png": { bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  "image/gif": { bytes: [0x47, 0x49, 0x46, 0x38] }, // GIF87a or GIF89a
  "image/webp": { bytes: [0x52, 0x49, 0x46, 0x46] }, // RIFF header (need to also check WEBP at offset 8)
};

// Blocked IPv4 ranges for SSRF protection
const BLOCKED_IPV4_PATTERNS = [
  /^127\./, // Loopback
  /^0\./, // Current network
  /^10\./, // Private Class A
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // Private Class B
  /^192\.168\./, // Private Class C
  /^169\.254\./, // Link-local
  /^100\.(6[4-9]|[7-9][0-9]|1[0-1][0-9]|12[0-7])\./, // Carrier-grade NAT
  /^192\.0\.0\./, // IETF Protocol assignments
  /^192\.0\.2\./, // TEST-NET-1
  /^198\.51\.100\./, // TEST-NET-2
  /^203\.0\.113\./, // TEST-NET-3
  /^224\./, // Multicast
  /^240\./, // Reserved
  /^255\.255\.255\.255$/, // Broadcast
];

// Blocked IPv6 patterns
const BLOCKED_IPV6_PATTERNS = [
  /^::1$/, // Loopback
  /^::$/, // Unspecified
  /^fe80:/i, // Link-local
  /^fc00:/i, // Unique local (private)
  /^fd[0-9a-f]{2}:/i, // Unique local (private)
  /^ff[0-9a-f]{2}:/i, // Multicast
  /^::ffff:(127\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|192\.168\.|169\.254\.)/i, // IPv4-mapped private
];

// Blocked hostnames (expanded list)
const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "localhost.",
  "localhost.localdomain",
  "localhost.localdomain.",
  "ip6-localhost",
  "ip6-loopback",
  "broadcasthost",
  "local",
]);

// Blocked hostname suffixes (expanded list)
const BLOCKED_HOSTNAME_SUFFIXES = [
  ".local",
  ".local.",
  ".localhost",
  ".localhost.",
  ".internal",
  ".internal.",
  ".home",
  ".home.",
  ".lan",
  ".lan.",
  ".localdomain",
  ".localdomain.",
  ".intranet",
  ".intranet.",
  ".corp",
  ".corp.",
  ".private",
  ".private.",
];

// Allowed image MIME types
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

/**
 * Check if an IP address is in a blocked range
 */
function isBlockedIP(ip: string): boolean {
  for (const pattern of BLOCKED_IPV4_PATTERNS) {
    if (pattern.test(ip)) {
      return true;
    }
  }

  for (const pattern of BLOCKED_IPV6_PATTERNS) {
    if (pattern.test(ip)) {
      return true;
    }
  }

  return false;
}

/**
 * Normalize hostname: lowercase, strip trailing dot
 */
function normalizeHostname(hostname: string): string {
  let normalized = hostname.toLowerCase();
  // Strip trailing dot (FQDN notation)
  if (normalized.endsWith(".")) {
    normalized = normalized.slice(0, -1);
  }
  return normalized;
}

/**
 * Check if a URL is safe to fetch (not internal/localhost)
 */
function isUrlSafe(url: string): boolean {
  try {
    const parsed = new URL(url);

    // SECURITY: HTTPS only - block HTTP to prevent downgrade attacks
    if (parsed.protocol !== "https:") {
      console.log(`[ImageProxy] Blocked non-HTTPS URL: ${parsed.protocol}`);
      return false;
    }

    // Normalize hostname (lowercase, strip trailing dot)
    const hostname = normalizeHostname(parsed.hostname);

    // Block known unsafe hostnames
    if (BLOCKED_HOSTNAMES.has(hostname)) {
      console.log(`[ImageProxy] Blocked hostname: ${hostname}`);
      return false;
    }

    // Block unsafe hostname suffixes
    for (const suffix of BLOCKED_HOSTNAME_SUFFIXES) {
      if (hostname.endsWith(suffix) || hostname === suffix.slice(1)) {
        console.log(`[ImageProxy] Blocked hostname suffix: ${hostname}`);
        return false;
      }
    }

    // Check if hostname looks like an IP address and validate it
    // IPv4 pattern
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
      if (isBlockedIP(hostname)) {
        console.log(`[ImageProxy] Blocked IP: ${hostname}`);
        return false;
      }
    }

    // IPv6 pattern (URL class removes brackets from hostname)
    if (/^[0-9a-f:]+$/i.test(hostname)) {
      if (isBlockedIP(hostname)) {
        console.log(`[ImageProxy] Blocked IPv6: ${hostname}`);
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Verify image magic numbers (don't trust Content-Type header)
 */
function verifyImageMagic(buffer: ArrayBuffer): string | null {
  const bytes = new Uint8Array(buffer);

  // Check PNG (8 bytes)
  if (bytes.length >= 8 &&
      bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 &&
      bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a) {
    return "image/png";
  }

  // Check JPEG (3 bytes)
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }

  // Check GIF (4 bytes for GIF8)
  if (bytes.length >= 4 && bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) {
    return "image/gif";
  }

  // Check WebP (RIFF at 0, WEBP at 8)
  if (bytes.length >= 12 &&
      bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
      bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
    return "image/webp";
  }

  return null;
}

/**
 * Get image dimensions from buffer (basic parsing for decompression bomb prevention)
 * Returns { width, height } or null if unable to parse
 */
function getImageDimensions(buffer: ArrayBuffer, mimeType: string): { width: number; height: number } | null {
  const bytes = new Uint8Array(buffer);

  try {
    if (mimeType === "image/png") {
      // PNG: width at bytes 16-19, height at bytes 20-23 (big-endian)
      if (bytes.length >= 24) {
        const width = (bytes[16] << 24) | (bytes[17] << 16) | (bytes[18] << 8) | bytes[19];
        const height = (bytes[20] << 24) | (bytes[21] << 16) | (bytes[22] << 8) | bytes[23];
        return { width, height };
      }
    }

    if (mimeType === "image/jpeg") {
      // JPEG: scan for SOF markers (C0-CF except C4 and CC)
      let i = 2;
      while (i < bytes.length - 9) {
        if (bytes[i] === 0xff) {
          const marker = bytes[i + 1];
          // SOF markers: C0, C1, C2, C3, C5, C6, C7, C9, CA, CB, CD, CE, CF
          if ((marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc)) {
            const height = (bytes[i + 5] << 8) | bytes[i + 6];
            const width = (bytes[i + 7] << 8) | bytes[i + 8];
            return { width, height };
          }
          // Skip segment
          const segmentLength = (bytes[i + 2] << 8) | bytes[i + 3];
          i += 2 + segmentLength;
        } else {
          i++;
        }
      }
    }

    if (mimeType === "image/gif") {
      // GIF: width at bytes 6-7, height at bytes 8-9 (little-endian)
      if (bytes.length >= 10) {
        const width = bytes[6] | (bytes[7] << 8);
        const height = bytes[8] | (bytes[9] << 8);
        return { width, height };
      }
    }

    if (mimeType === "image/webp") {
      // WebP: more complex, check VP8/VP8L/VP8X chunks
      // For simplicity, we'll parse VP8 (lossy) and VP8L (lossless)
      if (bytes.length >= 30) {
        // Check for VP8 (lossy)
        if (bytes[12] === 0x56 && bytes[13] === 0x50 && bytes[14] === 0x38 && bytes[15] === 0x20) {
          // VP8 format
          const width = ((bytes[26] | (bytes[27] << 8)) & 0x3fff);
          const height = ((bytes[28] | (bytes[29] << 8)) & 0x3fff);
          return { width, height };
        }
        // Check for VP8L (lossless)
        if (bytes[12] === 0x56 && bytes[13] === 0x50 && bytes[14] === 0x38 && bytes[15] === 0x4c) {
          // VP8L format - dimensions encoded differently
          const signature = bytes[21];
          if (signature === 0x2f) {
            const bits = (bytes[22] | (bytes[23] << 8) | (bytes[24] << 16) | (bytes[25] << 24));
            const width = (bits & 0x3fff) + 1;
            const height = ((bits >> 14) & 0x3fff) + 1;
            return { width, height };
          }
        }
      }
    }
  } catch (e) {
    console.log(`[ImageProxy] Failed to parse dimensions for ${mimeType}: ${e}`);
  }

  return null;
}

/**
 * Fetch an image with manual redirect handling to prevent SSRF via redirects
 */
async function fetchWithRedirectValidation(
  url: string,
  redirectCount: number = 0
): Promise<Response | null> {
  if (redirectCount > MAX_REDIRECTS) {
    console.log(`[ImageProxy] Too many redirects for ${url.substring(0, 100)}`);
    return null;
  }

  if (!isUrlSafe(url)) {
    return null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), IMAGE_FETCH_TIMEOUT);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      redirect: "manual",
      headers: {
        "User-Agent": "MarkdownFree-ImageProxy/1.0",
        Accept: "image/*",
      },
    });

    clearTimeout(timeout);

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) {
        console.log(`[ImageProxy] Redirect without location header`);
        return null;
      }

      const redirectUrl = new URL(location, url).toString();
      console.log(`[ImageProxy] Following redirect to: ${redirectUrl.substring(0, 100)}`);

      return fetchWithRedirectValidation(redirectUrl, redirectCount + 1);
    }

    return response;
  } catch (error) {
    clearTimeout(timeout);
    if (error instanceof Error && error.name === "AbortError") {
      console.log(`[ImageProxy] Timeout fetching ${url.substring(0, 100)}`);
    } else {
      console.log(`[ImageProxy] Error fetching ${url}: ${error}`);
    }
    return null;
  }
}

/**
 * Fetch an image and convert to Base64 data URI
 */
async function fetchImageAsBase64(url: string): Promise<{ data: string; size: number } | null> {
  // Block SVG files by URL extension
  const urlLower = url.toLowerCase();
  if (urlLower.endsWith(".svg") || urlLower.includes(".svg?") || urlLower.includes(".svg#")) {
    console.log(`[ImageProxy] Blocked SVG image: ${url.substring(0, 100)}`);
    return null;
  }

  const response = await fetchWithRedirectValidation(url);
  if (!response) {
    return null;
  }

  if (!response.ok) {
    console.log(`[ImageProxy] Failed to fetch ${url.substring(0, 100)}: ${response.status}`);
    return null;
  }

  // Check content length header first
  const contentLength = response.headers.get("content-length");
  if (contentLength && parseInt(contentLength) > MAX_IMAGE_SIZE) {
    console.log(`[ImageProxy] Image too large: ${contentLength} bytes`);
    return null;
  }

  // Read the response as array buffer
  const buffer = await response.arrayBuffer();

  // Check actual size
  if (buffer.byteLength > MAX_IMAGE_SIZE) {
    console.log(`[ImageProxy] Image too large after download: ${buffer.byteLength} bytes`);
    return null;
  }

  // SECURITY: Verify magic numbers (don't trust Content-Type)
  const detectedMimeType = verifyImageMagic(buffer);
  if (!detectedMimeType) {
    console.log(`[ImageProxy] Invalid image magic bytes for ${url.substring(0, 50)}`);
    return null;
  }

  // SECURITY: Check image dimensions to prevent decompression bombs
  const dimensions = getImageDimensions(buffer, detectedMimeType);
  if (dimensions) {
    if (dimensions.width > MAX_IMAGE_DIMENSION || dimensions.height > MAX_IMAGE_DIMENSION) {
      console.log(`[ImageProxy] Image too large: ${dimensions.width}x${dimensions.height} exceeds ${MAX_IMAGE_DIMENSION}px`);
      return null;
    }
    if (dimensions.width * dimensions.height > MAX_IMAGE_PIXELS) {
      console.log(`[ImageProxy] Image too many pixels: ${dimensions.width * dimensions.height} exceeds ${MAX_IMAGE_PIXELS}`);
      return null;
    }
  } else {
    // Couldn't parse dimensions - be conservative and allow if file size is small
    if (buffer.byteLength > 500 * 1024) {
      console.log(`[ImageProxy] Couldn't verify dimensions for large image (${buffer.byteLength} bytes), blocking`);
      return null;
    }
  }

  // Convert to Base64
  const base64 = Buffer.from(buffer).toString("base64");

  return {
    data: `data:${detectedMimeType};base64,${base64}`,
    size: buffer.byteLength,
  };
}

/**
 * Process HTML and replace external image URLs with Base64 data URIs
 */
export async function proxyImagesInHtml(html: string): Promise<string> {
  const imgRegex = /<img\s+[^>]*src=["']([^"']+)["'][^>]*>/gi;
  const matches: RegExpExecArray[] = [];
  let match: RegExpExecArray | null;
  while ((match = imgRegex.exec(html)) !== null) {
    matches.push(match);
  }

  if (matches.length === 0) {
    return html;
  }

  const imagesToProcess = matches.slice(0, MAX_IMAGES_PER_DOC);

  if (matches.length > MAX_IMAGES_PER_DOC) {
    console.log(`[ImageProxy] Limiting from ${matches.length} to ${MAX_IMAGES_PER_DOC} images`);
  }

  const urlMap = new Map<string, { data: string; size: number } | null>();
  const urls = Array.from(new Set(imagesToProcess.map((m) => m[1])));

  const externalUrls = urls.filter((url) => {
    if (url.startsWith("data:")) {
      if (!url.startsWith("data:image/")) {
        console.log(`[ImageProxy] Blocked non-image data URI`);
        return false;
      }
      return false;
    }
    return true;
  });

  console.log(`[ImageProxy] Processing ${externalUrls.length} external images`);

  let totalBytes = 0;
  const CONCURRENCY = 5;

  for (let i = 0; i < externalUrls.length; i += CONCURRENCY) {
    const batch = externalUrls.slice(i, i + CONCURRENCY);
    const results = await Promise.all(batch.map((url) => fetchImageAsBase64(url)));

    for (let j = 0; j < batch.length; j++) {
      const result = results[j];
      if (result) {
        if (totalBytes + result.size > MAX_TOTAL_IMAGE_BYTES) {
          console.log(`[ImageProxy] Skipping image - would exceed total byte limit`);
          urlMap.set(batch[j], null);
        } else {
          totalBytes += result.size;
          urlMap.set(batch[j], result);
        }
      } else {
        urlMap.set(batch[j], null);
      }
    }
  }

  console.log(`[ImageProxy] Total embedded image bytes: ${totalBytes}`);

  let result = html;
  urlMap.forEach((imageData, url) => {
    if (imageData) {
      const escapedUrl = url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      result = result.replace(new RegExp(escapedUrl, "g"), imageData.data);
      console.log(`[ImageProxy] Replaced: ${url.substring(0, 50)}...`);
    } else {
      console.log(`[ImageProxy] Kept original (failed to fetch): ${url.substring(0, 50)}...`);
    }
  });

  return result;
}
