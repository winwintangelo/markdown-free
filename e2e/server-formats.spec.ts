import { test, expect, type Page } from "@playwright/test";
import fs from "fs";
import path from "path";
import JSZip from "jszip";
import { openMoreFormats } from "./export-helpers";

/**
 * PDF and Word (DOCX) THROUGH THE UI — the two server formats on the Phase 0a
 * pipeline (build plan §5). The fidelity suite covers the browser formats and
 * hits the PDF API directly; this spec exercises the client path that only
 * runs in the app:
 *
 *   prepareMarkdown({ raster: true }) → Mermaid rendered to PNG in the browser
 *   → embedded in the Markdown → POSTed → PDF/DOCX
 *
 * plus the locale-native PDF options (Letter / serif) that the client derives,
 * the KaTeX font embedding the image exporter needs, and the document facts
 * the analytics layer reports. Assertions use markers verified against real
 * output: a PDF with math carries KaTeX font names, Letter is 612×792 pt, a
 * serif request embeds Noto Serif.
 */

const CORPUS = path.join(__dirname, "..", "test-fixtures", "benchmark");

interface Captured {
  markdown: string;
  pageSize?: string;
  fontStyle?: string;
}

/** Capture what the client actually POSTs to a convert route. */
function captureConvert(page: Page, format: "pdf" | "docx"): Captured[] {
  const seen: Captured[] = [];
  page.on("request", (req) => {
    if (req.url().endsWith(`/api/convert/${format}`) && req.method() === "POST") {
      seen.push(req.postDataJSON() as Captured);
    }
  });
  return seen;
}

async function loadFixture(page: Page, file: string) {
  await page.locator('input[type="file"]').setInputFiles(path.join(CORPUS, file));
  await expect(page.getByText("Ready to export (uploaded file)")).toBeVisible({ timeout: 15000 });
}

async function download(page: Page, trigger: () => Promise<void>) {
  const downloadPromise = page.waitForEvent("download", { timeout: 90000 });
  await trigger();
  const dl = await downloadPromise;
  const file = path.join("tmp", `srvfmt-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  await dl.saveAs(file);
  const buffer = fs.readFileSync(file);
  fs.unlinkSync(file);
  return { buffer, name: dl.suggestedFilename() };
}

const asLatin1 = (b: Buffer) => b.toString("latin1");

test.describe("PDF through the UI", () => {
  test.slow();

  test("math document: formulas are typeset (KaTeX fonts embedded in the PDF)", async ({ page }) => {
    await page.goto("/");
    const posted = captureConvert(page, "pdf");
    await loadFixture(page, "01-latex-inline-display.md");

    const { buffer, name } = await download(page, () =>
      page.getByRole("button", { name: /To PDF/i }).first().click()
    );

    expect(name).toMatch(/\.pdf$/);
    expect(buffer.subarray(0, 5).toString()).toBe("%PDF-");
    // KaTeX font programs are only embedded when math actually rendered
    expect(asLatin1(buffer), "PDF embeds KaTeX fonts").toContain("KaTeX");

    expect(posted).toHaveLength(1);
    expect(posted[0].markdown).toContain("$");
  });

  test("Mermaid document: the diagram is rasterized client-side and embedded before upload", async ({
    page,
  }) => {
    await page.goto("/");
    const posted = captureConvert(page, "pdf");
    await loadFixture(page, "03-mermaid-flowchart.md");
    // wait for the client-side pre-render (SVG in the preview)
    await expect(page.locator(".prose").first().locator('img[src^="data:image/svg+xml"]')).toHaveCount(1, {
      timeout: 30000,
    });

    const { buffer } = await download(page, () =>
      page.getByRole("button", { name: /To PDF/i }).first().click()
    );
    expect(buffer.subarray(0, 5).toString()).toBe("%PDF-");

    // The server must never see a ```mermaid fence — it runs Chromium with JS off
    expect(posted).toHaveLength(1);
    expect(posted[0].markdown, "diagram embedded as PNG").toContain("![Mermaid diagram](data:image/png;base64,");
    expect(posted[0].markdown, "no raw mermaid fence reaches the server").not.toContain("```mermaid");
    // The other fenced code block in the fixture is untouched
    expect(posted[0].markdown).toContain("```bash");
  });

  test("page size and typeface come from the client (Letter + serif via ?font=)", async ({ browser }) => {
    // A Letter-paper region on the English site → Letter, not A4
    const context = await browser.newContext({ locale: "en-US" });
    const page = await context.newPage();
    const posted = captureConvert(page, "pdf");
    await page.goto("/?font=serif");
    await loadFixture(page, "20-academic-paper.md");

    const { buffer } = await download(page, () =>
      page.getByRole("button", { name: /To PDF/i }).first().click()
    );

    expect(posted).toHaveLength(1);
    expect(posted[0].pageSize).toBe("Letter");
    expect(posted[0].fontStyle).toBe("serif");

    const text = asLatin1(buffer);
    expect(text, "Letter media box").toMatch(/MediaBox\s*\[\s*0\s+0\s+612\s+792\s*\]/);
    expect(text, "serif family embedded").toContain("Noto Serif");
    await context.close();
  });

  test("default is A4 with the sans stack", async ({ browser }) => {
    const context = await browser.newContext({ locale: "de-DE" });
    const page = await context.newPage();
    const posted = captureConvert(page, "pdf");
    await page.goto("/");
    await loadFixture(page, "20-academic-paper.md");

    const { buffer } = await download(page, () =>
      page.getByRole("button", { name: /To PDF/i }).first().click()
    );

    expect(posted[0].pageSize).toBe("A4");
    expect(posted[0].fontStyle).toBe("sans");
    const text = asLatin1(buffer);
    expect(text).toMatch(/MediaBox\s*\[\s*0\s+0\s+595\.?\d*\s+841\.?\d*\s*\]/);
    expect(text).toContain("Noto Sans");
    await context.close();
  });
});

test.describe("Word (DOCX) through the UI", () => {
  test.slow();

  test("math is kept as LaTeX source, not KaTeX markup", async ({ page }) => {
    await page.goto("/");
    await loadFixture(page, "02-math-in-table-and-list.md");

    const { buffer, name } = await download(page, () =>
      page.getByRole("button", { name: /To Word/i }).first().click()
    );
    expect(name).toMatch(/\.docx$/);
    expect(buffer.subarray(0, 2).toString()).toBe("PK");

    const zip = await JSZip.loadAsync(buffer);
    const document = await zip.file("word/document.xml")!.async("string");
    // Phase 0a decision: DOCX renders with renderMath:false so the source survives
    expect(document, "no KaTeX markup dumped into the document").not.toContain("katex");
    expect(document, "LaTeX source preserved").toContain("\\frac");
    // Structure still converts properly
    expect(document).toContain("<w:tbl>");
  });

  test("Mermaid diagram arrives as an embedded image", async ({ page }) => {
    await page.goto("/");
    const posted = captureConvert(page, "docx");
    await loadFixture(page, "03-mermaid-flowchart.md");
    await expect(page.locator(".prose").first().locator('img[src^="data:image/svg+xml"]')).toHaveCount(1, {
      timeout: 30000,
    });

    const { buffer } = await download(page, () =>
      page.getByRole("button", { name: /To Word/i }).first().click()
    );

    expect(posted).toHaveLength(1);
    expect(posted[0].markdown).toContain("![Mermaid diagram](data:image/png;base64,");
    expect(posted[0].markdown).not.toContain("```mermaid");

    const zip = await JSZip.loadAsync(buffer);
    const media = Object.keys(zip.files).filter((f) => f.startsWith("word/media/"));
    expect(media.length, "diagram embedded as a media part").toBeGreaterThan(0);
  });
});

test.describe("Image export with formulas", () => {
  test.slow();

  test("KaTeX fonts are embedded for the rasterizer", async ({ page }) => {
    const fontRequests: string[] = [];
    page.on("request", (req) => {
      if (req.url().includes("/katex/fonts/")) fontRequests.push(req.url());
    });

    await page.goto("/");
    await loadFixture(page, "01-latex-inline-display.md");
    await expect(page.locator(".prose").first().locator(".katex").first()).toBeVisible({ timeout: 15000 });

    const { buffer, name } = await download(page, () =>
      page.getByRole("button", { name: /To Image/i }).first().click()
    );

    expect(name).toMatch(/\.(png|zip)$/);
    if (name.endsWith(".png")) {
      // PNG magic number
      expect(buffer.subarray(0, 8).toString("latin1")).toBe("\x89PNG\r\n\x1a\n");
    }
    // The exporter inlines the KaTeX faces as data URIs — it must fetch them
    expect(fontRequests.length, "KaTeX woff2 fetched for font embedding").toBeGreaterThan(0);
  });
});

test.describe("Conversion analytics", () => {
  /** Capture trackEvent calls by standing in for the Umami client. */
  async function captureEvents(page: Page) {
    await page.addInitScript(() => {
      (window as unknown as Record<string, unknown>).__events = [];
      (window as unknown as Record<string, unknown>).umami = {
        track: (name: string, data?: Record<string, string>) => {
          ((window as unknown as Record<string, unknown>).__events as unknown[]).push({ name, data });
        },
      };
    });
  }

  const events = (page: Page) =>
    page.evaluate(() => (window as unknown as Record<string, unknown>).__events as { name: string; data?: Record<string, string> }[]);

  test("convert_success carries the document facts (booleans and a closed enum only)", async ({ page }) => {
    await captureEvents(page);
    await page.goto("/");
    await loadFixture(page, "08-cjk-mixed.md");
    await expect(page.locator(".prose").first().locator('img[src^="data:image/svg+xml"]')).toHaveCount(1, {
      timeout: 30000,
    });

    await download(page, async () => {
      await openMoreFormats(page);
      await page.getByRole("button", { name: /To TXT/i }).click();
    });

    const captured = await events(page);
    const success = captured.find((e) => e.name === "convert_success");
    expect(success, "convert_success fired").toBeTruthy();
    expect(success!.data).toMatchObject({
      format: "txt",
      has_math: "yes",
      has_mermaid: "yes",
      source_chatbot: "none",
    });
    // The per-format event the growth loop groups by name
    expect(captured.some((e) => e.name === "conv_txt")).toBe(true);
    // Nothing document-derived beyond the closed vocabulary
    for (const key of Object.keys(success!.data ?? {})) {
      expect(["format", "source", "has_math", "has_mermaid", "source_chatbot"]).toContain(key);
    }
  });

  test("a pasted ChatGPT answer reports its detected source; Excel reports table count", async ({ page }) => {
    await captureEvents(page);
    await page.goto("/");
    const text = fs.readFileSync(path.join(CORPUS, "10-chatgpt-paste-residue.md"), "utf8");

    await page.getByRole("button", { name: "paste Markdown" }).click();
    const textarea = page.getByPlaceholder("Paste your Markdown here…");
    await textarea.click();
    await textarea.evaluate((el, value) => {
      const dt = new DataTransfer();
      dt.setData("text/plain", value);
      el.dispatchEvent(new ClipboardEvent("paste", { clipboardData: dt, bubbles: true, cancelable: true }));
    }, text);
    await expect(page.getByText(/Ready to export \(/)).toBeVisible();

    await download(page, async () => {
      await openMoreFormats(page);
      await page.getByRole("button", { name: /To Excel/i }).click();
    });

    const captured = await events(page);
    const success = captured.filter((e) => e.name === "convert_success").pop();
    expect(success!.data).toMatchObject({
      format: "xlsx",
      source_chatbot: "chatgpt",
      has_math: "yes",
      has_mermaid: "no",
      tables: "1",
    });
    expect(captured.some((e) => e.name === "conv_xlsx")).toBe(true);
  });
});
