import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

/**
 * The export error banner speaks the visitor's language (src/lib/export-errors.ts).
 *
 * The convert routes answer with a code and an English message. The banner must
 * show the localized heading and a localized message chosen by the code, and
 * never the English message itself. It is an alert for screen readers, and its
 * dismiss button has a label.
 */

type Dict = {
  export: { toPdf: string; toDocx: string };
  errors: Record<string, string>;
};

function dictionary(locale: string): Dict {
  const file = path.join(process.cwd(), "src", "i18n", "dictionaries", `${locale}.json`);
  return JSON.parse(fs.readFileSync(file, "utf-8")) as Dict;
}

async function loadSample(page: Page, pathname: string) {
  await page.goto(pathname);
  await page.locator('input[type="file"]').setInputFiles({
    name: "sample.md",
    mimeType: "text/markdown",
    buffer: Buffer.from("# Hello\n\nThis is a test."),
  });
  await expect(page.getByRole("heading", { name: "Hello" })).toBeVisible({ timeout: 15000 });
}

function mockRoute(page: Page, route: string, status: number, code: string, message: string) {
  return page.route(`**${route}`, (r) =>
    r.fulfill({ status, contentType: "application/json", body: JSON.stringify({ error: code, message }) })
  );
}

test.describe("Export error banner — localized", () => {
  test("Japanese: a PDF timeout shows Japanese text, not the server's English", async ({ page }) => {
    const ja = dictionary("ja");
    const english = "PDF generation timed out. Please try again with a smaller document.";
    await mockRoute(page, "/api/convert/pdf", 504, "GENERATION_TIMEOUT", english);

    await loadSample(page, "/ja");
    await page.getByRole("button", { name: ja.export.toPdf }).first().click();

    const banner = page.getByTestId("export-error");
    await expect(banner).toBeVisible();
    await expect(banner).toHaveAttribute("role", "alert");
    await expect(banner).toContainText(ja.errors.exportFailed.replace("{format}", "PDF"));
    await expect(banner).toContainText(ja.errors.timeout.replace("{format}", "PDF"));
    await expect(banner).not.toContainText(english);
    await expect(banner).not.toContainText("generation failed");

    // A timeout can be retried; the button is localized too
    await expect(banner.getByRole("button", { name: ja.errors.tryAgain })).toBeVisible();
    await expect(banner.getByRole("button", { name: ja.errors.dismiss })).toBeVisible();
  });

  test("Simplified Chinese: a rate-limited Word export explains the wait, with no retry", async ({ page }) => {
    const zh = dictionary("zh-Hans");
    await mockRoute(page, "/api/convert/docx", 429, "RATE_LIMITED", "Too many requests. Please wait a minute before trying again.");

    await loadSample(page, "/zh-Hans");
    await page.getByRole("button", { name: zh.export.toDocx }).first().click();

    const banner = page.getByTestId("export-error");
    await expect(banner).toContainText(zh.errors.exportFailed.replace("{format}", "DOCX"));
    await expect(banner).toContainText(zh.errors.rateLimited);
    await expect(banner).not.toContainText("Too many requests");
    await expect(banner.getByRole("button", { name: zh.errors.tryAgain })).toHaveCount(0);
  });

  test("Spanish: a lost connection shows the Spanish network message", async ({ page }) => {
    const es = dictionary("es");
    await page.route("**/api/convert/pdf", (r) => r.abort("internetdisconnected"));

    await loadSample(page, "/es");
    await page.getByRole("button", { name: es.export.toPdf }).first().click();

    const banner = page.getByTestId("export-error");
    await expect(banner).toContainText(es.errors.exportFailed.replace("{format}", "PDF"));
    await expect(banner).toContainText(es.errors.networkError);
  });

  test("English: an oversized document gets its own message", async ({ page }) => {
    const en = dictionary("en");
    await mockRoute(page, "/api/convert/pdf", 413, "CONTENT_TOO_LARGE", "Content exceeds 1MB limit.");

    await loadSample(page, "/");
    await page.getByRole("button", { name: en.export.toPdf }).first().click();

    const banner = page.getByTestId("export-error");
    await expect(banner).toContainText("PDF generation failed");
    await expect(banner).toContainText(en.errors.contentTooLarge);
    await expect(banner).not.toContainText("Content exceeds 1MB limit.");

    await banner.getByRole("button", { name: "Dismiss" }).click();
    await expect(banner).toHaveCount(0);
  });

  test("every locale has the banner strings, with {format} where it belongs", async () => {
    const locales = ["en", "it", "es", "ja", "ko", "zh-Hans", "zh-Hant", "id", "vi", "hi"];
    for (const locale of locales) {
      const e = dictionary(locale).errors;
      for (const key of ["exportFailed", "timeout", "rateLimited", "contentTooLarge", "invalidContent", "aborted", "networkError", "pdfError", "dismiss", "tryAgain"]) {
        expect(e[key], `${locale}.errors.${key}`).toBeTruthy();
      }
      expect(e.exportFailed, `${locale}.errors.exportFailed`).toContain("{format}");
      expect(e.timeout, `${locale}.errors.timeout`).toContain("{format}");
    }
  });
});
