import { test, expect, type Page } from "@playwright/test";
import { openMoreFormats } from "./export-helpers";

/**
 * Inline mini-converter on the comparison pages (experiment
 * comparison-cta-2026-07-16, iteration C): a drop-zone + the real ExportRow
 * embedded mid-article, so readers can test the tool without leaving the page.
 */

const EN_PAGE = "/best-markdown-to-pdf-converter-2026";
const ZH_PAGE = "/zh-Hans/markdown-zhuanhuanqi-bijiao";

async function loadSampleFile(page: Page) {
  const fileInput = page
    .getByTestId("inline-converter")
    .locator('input[type="file"]');
  await fileInput.setInputFiles({
    name: "sample.md",
    mimeType: "text/markdown",
    buffer: Buffer.from("# Hello\n\n| a | b |\n|---|---|\n| 1 | 2 |\n\nInline converter test."),
  });
  await expect(page.getByTestId("inline-converter-loaded")).toBeVisible({ timeout: 15000 });
}

test.describe("Comparison pages — inline converter (EN)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(EN_PAGE);
  });

  test("renders the drop-zone within the article", async ({ page }) => {
    const zone = page.getByTestId("inline-converter");
    await expect(zone).toBeVisible();
    await expect(zone.getByText(/drop your \.md here/i)).toBeVisible();
  });

  test("loading a file shows the loaded chip with filename and size", async ({ page }) => {
    await loadSampleFile(page);
    const chip = page.getByTestId("inline-converter-loaded");
    await expect(chip).toContainText("sample.md");
    await expect(chip).toContainText("pick a format below");
  });

  test("TXT export completes in place (client-side download)", async ({ page }) => {
    await loadSampleFile(page);
    const downloadPromise = page.waitForEvent("download");
    await openMoreFormats(page);
    await page.getByRole("button", { name: /To TXT/i }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.txt$/);
  });

  test("invalid file type shows a localized error, nothing loads", async ({ page }) => {
    const fileInput = page
      .getByTestId("inline-converter")
      .locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: "not-markdown.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF-1.4 fake"),
    });
    await expect(page.getByTestId("inline-converter").getByRole("alert")).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId("inline-converter-loaded")).toHaveCount(0);
  });
});

test.describe("Comparison pages — inline converter (zh-Hans)", () => {
  test("renders the 长图-first drop-zone and loads a file", async ({ page }) => {
    await page.goto(ZH_PAGE);
    const zone = page.getByTestId("inline-converter");
    await expect(zone).toBeVisible();
    await expect(zone.getByText("把你的 .md 拖到这里试试")).toBeVisible();
    await expect(zone.getByText(/可转长图（PNG）/)).toBeVisible();
    await loadSampleFile(page);
    // The real export row is present below the drop-zone (More-formats trigger).
    await expect(page.getByTestId("more-formats-button")).toBeVisible();
  });
});
