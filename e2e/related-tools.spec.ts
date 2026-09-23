import { test, expect } from "@playwright/test";

/**
 * Related-tools cross-link hub (RelatedTools component + footer suite).
 *
 * Guards two things:
 *  1. The hub renders sibling-tool links on the homepage and intent pages.
 *  2. Localized pages link WITHIN their own locale — regression guard for the
 *     EN-leak bug where JA/KO/ID/VI/ZH epub pages linked to English routes
 *     (/markdown-to-word, /readme-to-pdf) instead of localized ones.
 */

test.describe("Related tools cross-links", () => {
  // The local webServer is `next dev`, which compiles routes on first request.
  // Under parallel workers a cold first hit can exceed the default 5s assertion
  // timeout, so allow retries and a generous timeout (warm hits are instant).
  test.describe.configure({ retries: 2 });
  test.slow();
  const VISIBLE = { timeout: 30_000 };

  test("English homepage surfaces the related-tools hub", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { name: "Related tools" })
    ).toBeVisible(VISIBLE);
    // Home is the PDF converter, so the hub shows the OTHER tools.
    await expect(page.locator('a[href="/readme-to-pdf"]').first()).toBeVisible(VISIBLE);
    await expect(page.locator('a[href="/markdown-to-word"]').first()).toBeVisible(VISIBLE);
    await expect(page.locator('a[href="/markdown-to-epub"]').first()).toBeVisible(VISIBLE);
    await expect(page.locator('a[href="/markdown-to-png"]').first()).toBeVisible(VISIBLE);
  });

  // epub pages previously hardcoded English tool routes — lock the fix in.
  const localizedPages = [
    { path: "/ja/markdown-epub-henkan", sibling: "/ja/markdown-pdf-henkan" },
    { path: "/ko/markdown-epub-byeonhwan", sibling: "/ko/markdown-pdf-byeonhwan" },
    { path: "/id/konversi-markdown-epub", sibling: "/id/konversi-markdown-pdf" },
    { path: "/vi/chuyen-doi-markdown-epub", sibling: "/vi/chuyen-doi-markdown-pdf" },
    { path: "/zh-Hant/markdown-epub-zhuanhuan-tw", sibling: "/zh-Hant/markdown-pdf-zhuanhuan-tw" },
    { path: "/zh-Hans/markdown-epub-zhuanhuan", sibling: "/zh-Hans/markdown-pdf-zhuanhuan" },
    // Image cluster pages must also link within their own locale.
    { path: "/ja/markdown-gazou-henkan", sibling: "/ja/markdown-pdf-henkan" },
    { path: "/ko/markdown-imiji-byeonhwan", sibling: "/ko/markdown-pdf-byeonhwan" },
    { path: "/zh-Hans/markdown-zhuan-tupian", sibling: "/zh-Hans/markdown-pdf-zhuanhuan" },
    { path: "/vi/markdown-sang-anh", sibling: "/vi/chuyen-doi-markdown-pdf" },
  ];

  for (const { path, sibling } of localizedPages) {
    test(`${path} links within its locale and not to English tool routes`, async ({
      page,
    }) => {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      // Localized sibling link is present...
      await expect(page.locator(`a[href="${sibling}"]`).first()).toBeVisible(VISIBLE);
      // ...and there is no cross-locale leak to English tool routes.
      await expect(page.locator('a[href="/markdown-to-word"]')).toHaveCount(0);
      await expect(page.locator('a[href="/readme-to-pdf"]')).toHaveCount(0);
    });
  }
});

test.describe("The tool suite is listed once per page", () => {
  test.describe.configure({ retries: 2 });
  const VISIBLE = { timeout: 30_000 };

  // A page that renders the in-content hub must not ALSO repeat the same six
  // links in its footer: they sit a few pixels apart and read as a bug.
  const withHub = [
    "/",
    "/markdown-converter",
    "/ja/markdown-pdf-henkan",
    "/zh-Hans/markdown-zhuan-tupian",
    "/markdown-to-pdf-with-mermaid",
  ];
  for (const path of withHub) {
    test(`${path}: hub in content, no tool row in the footer`, async ({ page }) => {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await expect(page.getByTestId("related-tools")).toBeVisible(VISIBLE);
      await expect(page.locator('footer nav[aria-label="Tools"]')).toHaveCount(0);
    });
  }

  // Pages without the hub keep the footer links, which is how the rest of the
  // site stays crawlable.
  for (const path of ["/about", "/privacy", "/faq"]) {
    test(`${path}: no hub, footer keeps the tool row`, async ({ page }) => {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await expect(page.getByTestId("related-tools")).toHaveCount(0);
      await expect(page.locator('footer nav[aria-label="Tools"]')).toHaveCount(1);
    });
  }
});
