import type { Page } from "@playwright/test";

/**
 * Desktop long-tail export formats (EPUB / HTML / TXT / JPG) live behind the
 * "More formats" menu. Open it (idempotently) before clicking a menu item.
 */
export async function openMoreFormats(page: Page): Promise<void> {
  const menu = page.getByTestId("more-formats-menu");
  if (!(await menu.isVisible().catch(() => false))) {
    await page.getByTestId("more-formats-button").click();
  }
  await menu.waitFor({ state: "visible" });
}
