import { test, expect } from "@playwright/test";

/**
 * Related-tools cross-link hub (RelatedTools component + footer suite).
 *
 * Guards two things:
 *  1. The hub renders sibling-tool links on the homepage and intent pages.
 *  2. Localized pages link WITHIN their own locale — regression guard for the
 *     EN-leak bug where JA/KO/ID/VI/ZH epub pages linked to English routes
 *     (/markdown-to-docx, /readme-to-pdf) instead of localized ones.
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
    await expect(page.locator('a[href="/markdown-to-docx"]').first()).toBeVisible(VISIBLE);
    await expect(page.locator('a[href="/markdown-to-epub"]').first()).toBeVisible(VISIBLE);
  });

  // epub pages previously hardcoded English tool routes — lock the fix in.
  const localizedPages = [
    { path: "/ja/markdown-epub-henkan", sibling: "/ja/markdown-pdf-henkan" },
    { path: "/ko/markdown-epub-byeonhwan", sibling: "/ko/markdown-pdf-byeonhwan" },
    { path: "/id/konversi-markdown-epub", sibling: "/id/konversi-markdown-pdf" },
    { path: "/vi/chuyen-doi-markdown-epub", sibling: "/vi/chuyen-doi-markdown-pdf" },
    { path: "/zh-Hant/markdown-epub-zhuanhuan-tw", sibling: "/zh-Hant/markdown-pdf-zhuanhuan-tw" },
    { path: "/zh-Hans/markdown-epub-zhuanhuan", sibling: "/zh-Hans/markdown-pdf-zhuanhuan" },
  ];

  for (const { path, sibling } of localizedPages) {
    test(`${path} links within its locale and not to English tool routes`, async ({
      page,
    }) => {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      // Localized sibling link is present...
      await expect(page.locator(`a[href="${sibling}"]`).first()).toBeVisible(VISIBLE);
      // ...and there is no cross-locale leak to English tool routes.
      await expect(page.locator('a[href="/markdown-to-docx"]')).toHaveCount(0);
      await expect(page.locator('a[href="/readme-to-pdf"]')).toHaveCount(0);
    });
  }
});
