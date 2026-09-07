import { test, expect } from "@playwright/test";

/**
 * Static apex guarantees (build plan Phase −1, "Option B").
 *
 * Every page is prerendered by one of two root layouts, so:
 *   1. <html lang> is correct in the RAW server HTML (no client-side patching),
 *      which JS-light crawlers (Bing, AI indexers) depend on;
 *   2. <meta name="description"> is inside <head>, not streamed into <body>;
 *   3. page responses never set cookies (the apex is cookieless by construction);
 *   4. against a production build, pages are cacheable (no `no-store`).
 *
 * Check 4 only runs when CI or PROD_BUILD is set, because `next dev` always
 * serves `no-store`. Locally: `npm run build && npm run start`, then
 * `PROD_BUILD=1 npx playwright test static-rendering.spec.ts`.
 */

const PAGES: Array<{ path: string; lang: string }> = [
  { path: "/", lang: "en" },
  { path: "/readme-to-pdf", lang: "en" },
  { path: "/markdown-to-word", lang: "en" },
  { path: "/es", lang: "es" },
  { path: "/ja/markdown-pdf-henkan", lang: "ja" },
  { path: "/ko/markdown-word-byeonhwan", lang: "ko" },
  { path: "/zh-Hans/markdown-zhuanhuan-word", lang: "zh-Hans" },
  { path: "/zh-Hant/markdown-pdf-zhuanhuan-tw", lang: "zh-Hant" },
  { path: "/hi", lang: "hi" },
];

const PROD_BUILD = !!(process.env.CI || process.env.PROD_BUILD);

test.describe("Static rendering: server-side lang, head metadata, cookieless apex", () => {
  for (const { path, lang } of PAGES) {
    test(`${path} → <html lang="${lang}"> in raw HTML, description in <head>, no cookies`, async ({
      request,
    }) => {
      const response = await request.get(path);
      expect(response.status()).toBe(200);

      const html = await response.text();

      // 1. Server-rendered lang attribute (regex on the raw markup, not the DOM)
      const langMatch = html.match(/<html[^>]*\blang="([^"]+)"/i);
      expect(langMatch, "html element carries a lang attribute").toBeTruthy();
      expect(langMatch![1]).toBe(lang);

      // 2. Metadata rendered in <head>, not hoisted from <body> by client JS
      const headEnd = html.indexOf("</head>");
      const descriptionAt = html.search(/<meta[^>]+name="description"/i);
      expect(headEnd, "document has a </head>").toBeGreaterThan(0);
      expect(descriptionAt, "meta description is present").toBeGreaterThan(0);
      expect(descriptionAt, "meta description sits inside <head>").toBeLessThan(headEnd);

      // 3. Cookieless apex: pages never set cookies
      const headers = response.headers();
      expect(headers["set-cookie"], "page responses must not set cookies").toBeUndefined();

      // 4. Cacheable (prod build only)
      if (PROD_BUILD) {
        const cacheControl = headers["cache-control"] || "";
        expect(cacheControl, `cache-control for ${path}`).not.toContain("no-store");
      }
    });
  }

  test("unknown locale prefix is a 404, not a fallback render", async ({ request }) => {
    const response = await request.get("/xx");
    expect(response.status()).toBe(404);
  });
});
