import { test, expect } from "@playwright/test";
import {
  isBlockedIP,
  isUrlSafe,
  fetchWithRedirectValidation,
  fetchValidatedImage,
  __setFetchImplForTests,
} from "../src/lib/image-proxy";

/**
 * SSRF tests for the image proxy (spec 5.13)
 *
 * Two layers:
 * 1. Route-level: GET /api/img-proxy through the running app — every hostile
 *    URL shape must come back 4xx.
 * 2. Unit-level: the validation functions imported directly (these run in the
 *    Playwright Node process, no browser), including a mocked redirect from a
 *    public host to the cloud-metadata IP.
 */

const HOSTILE_URLS: Array<[string, string]> = [
  ["cloud metadata IP", "https://169.254.169.254/latest/meta-data/"],
  ["loopback IP", "https://127.0.0.1/x.png"],
  ["private 10.x", "https://10.0.0.5/x.png"],
  ["private 192.168.x", "https://192.168.1.1/x.png"],
  ["private 172.16.x", "https://172.16.0.1/x.png"],
  ["carrier-grade NAT", "https://100.64.0.1/x.png"],
  ["IPv6 loopback", "https://[::1]/x.png"],
  ["IPv4-mapped IPv6 loopback", "https://[::ffff:127.0.0.1]/x.png"],
  ["non-standard port", "https://example.com:8443/x.png"],
  ["plain http", "http://example.com/x.png"],
  ["ftp scheme", "ftp://example.com/x.png"],
  ["localhost hostname", "https://localhost/x.png"],
  ["internal suffix", "https://foo.internal/x.png"],
  ["SVG (script-capable)", "https://example.com/image.svg"],
];

test.describe("img-proxy route — hostile URLs rejected", () => {
  for (const [label, url] of HOSTILE_URLS) {
    test(`rejects ${label}`, async ({ request }) => {
      const response = await request.get(
        `/api/img-proxy?url=${encodeURIComponent(url)}`
      );
      expect(response.status()).toBeGreaterThanOrEqual(400);
      expect(response.status()).toBeLessThan(500);
    });
  }

  test("rejects missing url parameter", async ({ request }) => {
    const response = await request.get("/api/img-proxy");
    expect(response.status()).toBe(400);
  });

  test("rejects hostname that resolves to loopback (DNS validation)", async ({
    request,
  }) => {
    // localtest.me publicly resolves to 127.0.0.1 — passes every string-level
    // check and must be caught by resolved-address validation. If DNS is
    // unavailable the lookup fails, which also blocks: either way 4xx.
    const response = await request.get(
      `/api/img-proxy?url=${encodeURIComponent("https://localtest.me/x.png")}`
    );
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });
});

test.describe("image-proxy lib — unit validation", () => {
  test.afterEach(() => {
    __setFetchImplForTests(null);
  });

  test("isBlockedIP covers the spec's ranges", () => {
    const blocked = [
      "127.0.0.1",
      "0.0.0.0",
      "10.0.0.5",
      "172.16.0.1",
      "172.31.255.255",
      "192.168.1.1",
      "169.254.169.254",
      "100.64.0.1",
      "::1",
      "::",
      "fe80::1",
      "fc00::1",
      "fd12:3456::1",
      "::ffff:127.0.0.1",
      "::ffff:10.0.0.5",
      "::ffff:192.168.1.1",
      "::ffff:169.254.169.254",
      "::ffff:7f00:1", // hex form of ::ffff:127.0.0.1 (URL parser normalization)
      "::ffff:a9fe:a9fe", // hex form of ::ffff:169.254.169.254
    ];
    for (const ip of blocked) {
      expect(isBlockedIP(ip), `${ip} should be blocked`).toBe(true);
    }

    const allowed = ["93.184.216.34", "140.82.112.3", "2606:2800:220:1:248:1893:25c8:1946"];
    for (const ip of allowed) {
      expect(isBlockedIP(ip), `${ip} should be allowed`).toBe(false);
    }
  });

  test("isUrlSafe enforces scheme, port and hostname rules", () => {
    expect(isUrlSafe("https://example.com/a.png")).toBe(true);
    expect(isUrlSafe("https://example.com:443/a.png")).toBe(true);

    expect(isUrlSafe("http://example.com/a.png")).toBe(false);
    expect(isUrlSafe("ftp://example.com/a.png")).toBe(false);
    expect(isUrlSafe("file:///etc/passwd")).toBe(false);
    expect(isUrlSafe("https://example.com:8443/a.png")).toBe(false);
    expect(isUrlSafe("https://example.com:8080/a.png")).toBe(false);
    expect(isUrlSafe("https://localhost/a.png")).toBe(false);
    expect(isUrlSafe("https://127.0.0.1/a.png")).toBe(false);
    expect(isUrlSafe("https://[::1]/a.png")).toBe(false);
    expect(isUrlSafe("https://[::ffff:127.0.0.1]/a.png")).toBe(false);
    expect(isUrlSafe("https://169.254.169.254/latest/meta-data/")).toBe(false);
    expect(isUrlSafe("https://foo.internal/a.png")).toBe(false);
    expect(isUrlSafe("not a url")).toBe(false);
  });

  test("redirect from public host to metadata IP is rejected without fetching it", async () => {
    const fetched: string[] = [];
    __setFetchImplForTests((async (url: string) => {
      fetched.push(url);
      return new Response(null, {
        status: 302,
        headers: { location: "https://169.254.169.254/latest/meta-data/" },
      });
    }) as never);

    const result = await fetchWithRedirectValidation("https://public.example.com/img.png");

    expect(result).toBeNull();
    // Only the public first hop was fetched; the private redirect target was
    // rejected by validation before any request went out.
    expect(fetched).toEqual(["https://public.example.com/img.png"]);
  });

  test("redirect to another public https URL is followed and re-validated", async () => {
    const png = pngFixture();
    const fetched: string[] = [];
    __setFetchImplForTests((async (url: string) => {
      fetched.push(url);
      if (url === "https://public.example.com/img.png") {
        return new Response(null, {
          status: 301,
          headers: { location: "https://cdn.example.com/real.png" },
        });
      }
      return new Response(png, {
        status: 200,
        headers: { "content-type": "image/png" },
      });
    }) as never);

    const result = await fetchValidatedImage("https://public.example.com/img.png");

    expect(fetched).toEqual([
      "https://public.example.com/img.png",
      "https://cdn.example.com/real.png",
    ]);
    expect(result).not.toBeNull();
    expect(result?.mimeType).toBe("image/png");
  });

  test("accepts a valid public PNG (mocked) and verifies magic bytes", async () => {
    __setFetchImplForTests((async () =>
      new Response(pngFixture(), {
        status: 200,
        headers: { "content-type": "image/png" },
      })) as never);

    const result = await fetchValidatedImage("https://example.com/tiny.png");
    expect(result).not.toBeNull();
    expect(result?.mimeType).toBe("image/png");
  });

  test("rejects a response whose body is not a real image (magic bytes)", async () => {
    __setFetchImplForTests((async () =>
      new Response("<html>not an image</html>", {
        status: 200,
        headers: { "content-type": "image/png" }, // lying Content-Type
      })) as never);

    const result = await fetchValidatedImage("https://example.com/fake.png");
    expect(result).toBeNull();
  });
});

/** Minimal valid 1×1 transparent PNG */
function pngFixture(): ArrayBuffer {
  const bytes = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
    "base64"
  );
  const arrayBuffer = new ArrayBuffer(bytes.length);
  new Uint8Array(arrayBuffer).set(bytes);
  return arrayBuffer;
}
