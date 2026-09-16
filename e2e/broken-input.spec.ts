import { test, expect, type Page } from "@playwright/test";
import fs from "fs";
import path from "path";
import JSZip from "jszip";
import { openMoreFormats } from "./export-helpers";

/**
 * Failure paths: documents whose parts CANNOT render.
 *
 * The corpus in test-fixtures/benchmark/ is made of documents that work, so
 * nothing exercised what a failed render leaves behind. That gap shipped a bug:
 * a mermaid diagram with a syntax error made mermaid draw its "Syntax error in
 * text" graphic into the page, and it accumulated on every export.
 *
 * Every document here mixes broken parts with working ones. The rules:
 *  - the broken part degrades (diagram → code block, formula → its source),
 *  - the working parts still render,
 *  - nothing from a failed render is left in the page,
 *  - no uncaught exception reaches the window,
 *  - and the document still exports.
 */

const BROKEN_DIR = path.join(__dirname, "..", "test-fixtures", "broken");
const FIXTURES = fs.readdirSync(BROKEN_DIR).filter((f) => f.endsWith(".md")).sort();

/** Uncaught errors and TypeError-shaped console noise (either means real breakage). */
function collectFailures(page: Page): string[] {
  const failures: string[] = [];
  page.on("pageerror", (e) => failures.push(`pageerror: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() !== "error") return;
    const text = m.text();
    if (/TypeError|ReferenceError|is not a function|Cannot read|undefined is not/.test(text)) {
      failures.push(`console: ${text.slice(0, 200)}`);
    }
  });
  return failures;
}

const preview = (page: Page) => page.locator(".prose").first();

async function loadFixture(page: Page, file: string) {
  await page.locator('input[type="file"]').setInputFiles(path.join(BROKEN_DIR, file));
  await expect(page.getByText("Ready to export (uploaded file)")).toBeVisible({ timeout: 15000 });
}

async function download(page: Page, trigger: () => Promise<void>) {
  const downloadPromise = page.waitForEvent("download", { timeout: 90000 });
  await trigger();
  const dl = await downloadPromise;
  const file = path.join("tmp", `broken-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  await dl.saveAs(file);
  const buffer = fs.readFileSync(file);
  fs.unlinkSync(file);
  return { buffer, name: dl.suggestedFilename() };
}

/** Nothing a failed mermaid render could have left behind. */
async function expectNoDiagramResidue(page: Page) {
  await expect(page.getByText("Syntax error in text")).toHaveCount(0);
  await expect(page.locator('[id*="mdfree-mermaid"]')).toHaveCount(0);
}

test.describe("Documents that cannot fully render", () => {
  test("every failure fixture is exercised", () => {
    expect(FIXTURES).toEqual([
      "01-invalid-mermaid.md",
      "02-invalid-latex.md",
      "03-malformed-tables.md",
      "04-pathological-markdown.md",
      "05-mixed-scripts-broken.md",
    ]);
  });

  for (const file of FIXTURES) {
    test(`${file}: degrades, exports, and leaves nothing behind`, async ({ page }) => {
      test.slow();
      const failures = collectFailures(page);
      await page.goto("/");
      await loadFixture(page, file);

      // The preview renders, and the text after the broken parts survives
      await expect(preview(page)).toBeVisible();
      // (some fixtures use the phrase more than once)
      await expect(preview(page).getByText(/must still render/).first()).toBeVisible();

      // Give a failing diagram time to fail (the lazy mermaid bundle loads first)
      await page.waitForTimeout(3000);
      await expectNoDiagramResidue(page);

      // Still exports: one browser-side format and one server-side format
      const html = await download(page, async () => {
        await openMoreFormats(page);
        await page.getByRole("button", { name: /To HTML/i }).click();
      });
      expect(html.name).toMatch(/\.html$/);
      expect(html.buffer.toString("utf8")).toContain("<!DOCTYPE html>");

      const word = await download(page, () => page.getByRole("button", { name: /To Word/i }).first().click());
      expect(word.name).toMatch(/\.docx$/);
      expect(word.buffer.subarray(0, 2).toString()).toBe("PK");

      await expectNoDiagramResidue(page);
      expect(failures, `no uncaught errors for ${file}`).toEqual([]);
    });
  }
});

test.describe("How each failure degrades", () => {
  test("a broken diagram stays a code block; a valid one still becomes an image", async ({ page }) => {
    await page.goto("/");
    await loadFixture(page, "01-invalid-mermaid.md");
    // The one valid diagram renders; the three broken fences stay code blocks
    await expect(preview(page).locator('img[src^="data:image/svg+xml"]')).toHaveCount(1, { timeout: 30000 });
    await expect(preview(page).locator("code.language-mermaid")).toHaveCount(3);
    await expectNoDiagramResidue(page);
  });

  test("a broken formula keeps its source in Word; a valid one becomes a picture", async ({ page }) => {
    await page.goto("/");
    await loadFixture(page, "02-invalid-latex.md");
    await expect(preview(page).locator(".katex").first()).toBeVisible({ timeout: 15000 });

    const { buffer } = await download(page, () =>
      page.getByRole("button", { name: /To Word/i }).first().click()
    );
    const zip = await JSZip.loadAsync(buffer);
    const document = await zip.file("word/document.xml")!.async("string");
    const text = [...document.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map((m) => m[1]).join("");
    // KaTeX cannot parse these, so they travel as source…
    expect(text).toContain("\\notacommand");
    // …while the formula it can parse arrives as a picture with its alt text
    expect(document).toContain('descr="e^{i\\pi} + 1 = 0"');
  });

  test("malformed tables still produce a document, valid tables still become tables", async ({ page }) => {
    await page.goto("/");
    await loadFixture(page, "03-malformed-tables.md");
    // The two well-formed tables render; the separator-less one is a paragraph
    await expect(preview(page).locator("table")).toHaveCount(3);
    await expect(preview(page).getByText("| 1 | 2 |")).toBeVisible();
    // A ragged row is padded rather than dropped
    await expect(preview(page).locator("table").nth(0).locator("tbody tr")).toHaveCount(2);
  });

  test("injected script and handlers never execute or survive into exports", async ({ page }) => {
    await page.goto("/");
    await loadFixture(page, "04-pathological-markdown.md");
    await expect(preview(page).getByText(/must still render/).first()).toBeVisible();
    expect(await page.evaluate(() => (window as unknown as { __pwned?: number }).__pwned)).toBeUndefined();
    const html = await preview(page).innerHTML();
    expect(html).not.toContain("<script");
    expect(html).not.toContain("onerror");
    expect(html).not.toContain("javascript:");

    const exported = await download(page, async () => {
      await openMoreFormats(page);
      await page.getByRole("button", { name: /To HTML/i }).click();
    });
    const text = exported.buffer.toString("utf8");
    expect(text).not.toContain("<script>window.__pwned");
    expect(text).not.toContain("onerror=");
  });

  test("failures in a CJK/RTL document leave the rest of the scripts intact", async ({ page }) => {
    await page.goto("/");
    await loadFixture(page, "05-mixed-scripts-broken.md");
    await page.waitForTimeout(3000);
    await expectNoDiagramResidue(page);
    const text = await preview(page).innerText();
    for (const needle of ["你好，世界！", "こんにちは。", "안녕하세요", "مرحبا بالعالم", "שלום עולם"]) {
      expect(text, `preview keeps ${needle}`).toContain(needle);
    }
    await expect(preview(page).locator("table")).toHaveCount(1);
  });
});
