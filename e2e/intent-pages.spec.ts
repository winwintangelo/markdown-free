import { test, expect, type Page } from "@playwright/test";
import { INTENT_PAGES, intentGroupAlternates, intentPagePath } from "../src/content/intent-pages";
import { localeMetadata } from "../src/i18n/config";

/**
 * Long-tail intent pages (build plan Phase 1).
 *
 * Data-driven: every page in src/content/intent-pages/manifest.json is walked
 * and checked for the SEO essentials that make a generated page rank at all —
 * status, server-side lang, head metadata, a single H1, FAQ schema, reciprocal
 * hreflang, canonical — plus the live demo that separates these pages from
 * scaled boilerplate. A subset also exercises the demo end to end.
 */

const SITE = "https://www.markdown.free";
const PAGES = INTENT_PAGES.map((p) => ({
  path: intentPagePath(p),
  locale: p.locale,
  group: p.group,
  title: p.title,
  h1: p.h1,
  faqCount: p.faq.length,
  sample: p.sample,
}));

/** The few entities React escapes in text nodes (titles carry & and quotes). */
function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

/** Raw served HTML, split at </head> — the same check the SEO audit performs. */
async function fetchHtml(page: Page, path: string) {
  const response = await page.request.get(path);
  const html = await response.text();
  const headEnd = html.indexOf("</head>");
  return { status: response.status(), html, head: html.slice(0, headEnd), headEnd };
}

test.describe("Intent pages — structure and SEO", () => {
  test("manifest has the expected shape", () => {
    expect(PAGES.length).toBe(51);
    // Every page belongs to a group whose members declare each other
    for (const p of PAGES) {
      const alternates = intentGroupAlternates(p.group);
      expect(alternates[p.locale], `${p.path} is its group's ${p.locale} member`).toBe(p.path);
      expect(alternates["x-default"]).toBeTruthy();
    }
  });

  for (const p of PAGES) {
    test(`${p.path}`, async ({ page }) => {
      const { status, html, head, headEnd } = await fetchHtml(page, p.path);
      expect(status).toBe(200);
      expect(headEnd, "document has a </head>").toBeGreaterThan(0);

      // Server-rendered lang (JS-light crawlers never run the client)
      const lang = html.match(/<html[^>]*\blang="([^"]+)"/i);
      expect(lang?.[1]).toBe(localeMetadata[p.locale].htmlLang);

      // Title and description live in <head>, not streamed into <body>
      const title = head.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
      expect(title, "title in head").toBeTruthy();
      expect(decodeEntities(title![1])).toContain(p.title);
      expect(title![1].length, `title length for ${p.path}`).toBeLessThanOrEqual(80);
      const description = head.match(/<meta name="description" content="([^"]*)"/i);
      expect(description, "description in head").toBeTruthy();
      expect(description![1].length).toBeGreaterThan(50);

      // Canonical + reciprocal hreflang for every group member.
      // React serializes the JSX prop as `hrefLang`; HTML attribute names are
      // case-insensitive, so compare against a lower-cased head.
      expect(head).toContain(`<link rel="canonical" href="${SITE}${p.path}"/>`);
      const headLower = head.toLowerCase();
      const alternates = intentGroupAlternates(p.group);
      for (const [locale, href] of Object.entries(alternates)) {
        expect(headLower, `hreflang ${locale} on ${p.path}`).toContain(
          `hreflang="${locale}" href="${SITE}${href}"`.toLowerCase()
        );
      }

      // FAQPage JSON-LD with the questions from the content model
      const jsonLd = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
      expect(jsonLd, "FAQ JSON-LD present").toBeTruthy();
      const parsed = JSON.parse(jsonLd![1].replace(/\\u003c/g, "<"));
      expect(parsed["@type"]).toBe("FAQPage");
      expect(parsed.mainEntity.length).toBe(p.faqCount);
      expect(p.faqCount).toBeGreaterThanOrEqual(4);

      // Exactly one H1, matching the content model
      await page.goto(p.path);
      const h1 = page.getByRole("heading", { level: 1 });
      await expect(h1).toHaveCount(1);
      await expect(h1).toHaveText(p.h1);

      // The live demo and the cross-link hub are what make this more than boilerplate
      await expect(page.getByTestId("intent-demo")).toBeVisible();
      await expect(page.getByTestId("inline-converter")).toBeVisible();
      await expect(page.getByTestId("intent-load-sample")).toBeVisible();
      await expect(page.locator("nav[aria-label]").first()).toBeVisible();
      await expect(page.locator("footer")).toBeVisible();

      // No stale file-size claim (the cap is 1 MB)
      expect(html).not.toMatch(/\b5\s?MB\b/);
    });
  }
});

test.describe("Intent pages — live demo", () => {
  // One page per sample type: the demo must actually render the failing case.
  const CASES = [
    { path: "/chatgpt-formulas-to-word", expect: "math" },
    { path: "/zh-Hans/chatgpt-biaoge-excel", expect: "table" },
    { path: "/markdown-to-pdf-with-mermaid", expect: "mermaid" },
    { path: "/ja/deepseek-word-henkan", expect: "chat" },
  ] as const;

  for (const c of CASES) {
    test(`${c.path} — sample renders (${c.expect})`, async ({ page }) => {
      test.slow();
      await page.goto(c.path);
      await page.getByTestId("intent-load-sample").click();

      const preview = page.locator(".prose").last();
      if (c.expect === "math" || c.expect === "chat") {
        await expect(preview.locator(".katex").first()).toBeVisible({ timeout: 20000 });
      }
      if (c.expect === "table" || c.expect === "chat") {
        await expect(preview.locator("table").first()).toBeVisible({ timeout: 20000 });
      }
      if (c.expect === "mermaid") {
        await expect(preview.locator('img[src^="data:image/svg+xml"]')).toHaveCount(1, { timeout: 30000 });
      }
      // The real export row is present, so the reader can convert without
      // leaving (button labels are localized — assert the row, not the wording)
      await expect(page.getByTestId("more-formats-button")).toBeVisible();
    });
  }

  test("dropping a file into the inline converter enables export", async ({ page }) => {
    await page.goto("/markdown-table-to-excel");
    await page.locator('input[type="file"]').setInputFiles({
      name: "demo.md",
      mimeType: "text/markdown",
      buffer: Buffer.from("# Demo\n\n| a | b |\n|:-:|--:|\n| 1 | 2 |\n"),
    });
    await expect(page.getByTestId("inline-converter-loaded")).toBeVisible({ timeout: 15000 });
    await expect(page.locator(".prose").last().locator("table")).toBeVisible();
  });
});

test.describe("Intent pages — sitemap and samples", () => {
  test("every intent page is in the sitemap with its hreflang group", async ({ request }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    for (const p of PAGES) {
      expect(xml, `sitemap contains ${p.path}`).toContain(`<loc>${SITE}${p.path}</loc>`);
    }
    // Spot-check one reciprocal group's alternates in the sitemap
    const alternates = intentGroupAlternates("chatgpt-math-word");
    for (const href of Object.values(alternates)) {
      expect(xml).toContain(`href="${SITE}${href}"`);
    }
  });

  test("demo samples are served", async ({ request }) => {
    for (const sample of ["math", "table", "mermaid", "chat"]) {
      const response = await request.get(`/samples/${sample}.md`);
      expect(response.status(), `/samples/${sample}.md`).toBe(200);
      expect((await response.text()).length).toBeGreaterThan(100);
    }
  });
});
