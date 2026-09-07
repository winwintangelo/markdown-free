import { test, expect, type Page } from "@playwright/test";
import fs from "fs";
import path from "path";
import JSZip from "jszip";
import { openMoreFormats } from "./export-helpers";

/**
 * Fidelity suite over the benchmark corpus (build plan Phase 0a).
 *
 * Every document in test-fixtures/benchmark/ is loaded through the real UI and
 * checked structurally in the preview and the HTML export: formulas become
 * KaTeX markup, Mermaid fences become embedded images, GFM alignment survives,
 * chat residue is stripped, disallowed data URIs are dropped. A few documents
 * also go through the Excel, EPUB and PDF exporters. Assertions are structural
 * (no pixel goldens) so the suite is stable across machines.
 */

const CORPUS_DIR = path.join(__dirname, "..", "test-fixtures", "benchmark");
const ORIGIN_HEADERS = { Origin: "http://localhost:3000" };

interface Expectation {
  math?: boolean;
  mermaid?: number;
  alignedCells?: boolean;
  tables?: number;
  /** Text that must NOT appear in the rendered preview */
  absent?: string[];
  /** Text that must appear in the rendered preview */
  present?: string[];
}

// What each corpus document must produce (structural markers only)
const EXPECTATIONS: Record<string, Expectation> = {
  "01-latex-inline-display.md": { math: true, absent: ["\\frac", "\\("], present: ["$5", "$10"] },
  "02-math-in-table-and-list.md": { math: true, alignedCells: true, tables: 1 },
  "03-mermaid-flowchart.md": { mermaid: 1, present: ["npm run build"] },
  "04-mermaid-sequence-and-class.md": { mermaid: 2 },
  "05-gfm-aligned-tables.md": { alignedCells: true, tables: 2 },
  "06-merged-cells-html-table.md": { tables: 1, present: ["still"] },
  "07-code-blocks-mixed.md": { math: true, present: ["$notMath$", "\\(not math\\)"] },
  "08-cjk-mixed.md": { math: true, mermaid: 1, alignedCells: true, tables: 1, present: ["你好", "こんにちは", "안녕하세요"] },
  "09-deepseek-think-residue.md": { math: true, present: ["项目总结"] },
  "10-chatgpt-paste-residue.md": { math: true, tables: 1 },
  "11-kimi-doubao-residue.md": { math: true },
  "12-long-document.md": { math: true, present: ["Section 40"] },
  "13-nested-lists-tasks.md": { present: ["nested done"] },
  "14-images-remote-and-data.md": { absent: ["data:text/html"] },
  "15-blockquotes-footnotes-hr.md": { math: true },
  "16-emoji-rtl-special-chars.md": { present: ["مرحبا", "שלום", "* not italic *"] },
  "17-wide-table.md": { tables: 1, present: ["Col12"] },
  "18-heading-depth-toc.md": { present: ["H6 Note"] },
  "19-readme-style.md": { tables: 1, absent: ["html comment"] },
  "20-academic-paper.md": { math: true, alignedCells: true, tables: 1 },
};

const CORPUS = fs.readdirSync(CORPUS_DIR).filter((f) => f.endsWith(".md")).sort();

async function loadFixture(page: Page, file: string) {
  await page.locator('input[type="file"]').setInputFiles(path.join(CORPUS_DIR, file));
  await expect(page.getByText("Ready to export (uploaded file)")).toBeVisible({ timeout: 15000 });
}

/** The rendered preview article (first dangerouslySetInnerHTML container). */
function preview(page: Page) {
  return page.locator(".prose").first();
}

async function downloadText(page: Page, trigger: () => Promise<void>): Promise<string> {
  const downloadPromise = page.waitForEvent("download", { timeout: 60000 });
  await trigger();
  const download = await downloadPromise;
  const file = path.join("tmp", `fidelity-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  await download.saveAs(file);
  const text = fs.readFileSync(file, "utf8");
  fs.unlinkSync(file);
  return text;
}

async function downloadBuffer(page: Page, trigger: () => Promise<void>): Promise<{ buffer: Buffer; name: string }> {
  const downloadPromise = page.waitForEvent("download", { timeout: 60000 });
  await trigger();
  const download = await downloadPromise;
  const file = path.join("tmp", `fidelity-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  await download.saveAs(file);
  const buffer = fs.readFileSync(file);
  fs.unlinkSync(file);
  return { buffer, name: download.suggestedFilename() };
}

test.describe("Fidelity corpus — preview + HTML export", () => {
  test("corpus has 20 documents, all with expectations", () => {
    expect(CORPUS.length).toBe(20);
    for (const file of CORPUS) expect(EXPECTATIONS[file], `expectation for ${file}`).toBeTruthy();
  });

  for (const file of CORPUS) {
    const exp = EXPECTATIONS[file] || {};
    test(`${file}`, async ({ page }) => {
      test.slow();
      await page.goto("/");
      await loadFixture(page, file);

      const article = preview(page);
      await expect(article).toBeVisible();

      if (exp.mermaid) {
        // Lazy mermaid bundle + render; SVG data-URI images replace the fences
        await expect(article.locator('img[src^="data:image/svg+xml"]')).toHaveCount(exp.mermaid, { timeout: 30000 });
        await expect(article.locator("code.language-mermaid")).toHaveCount(0);
      }
      if (exp.math) {
        await expect(article.locator(".katex").first()).toBeVisible({ timeout: 15000 });
        // The stylesheet was pulled in on demand
        await expect(page.locator("link#katex-css")).toHaveCount(1);
      }
      if (exp.alignedCells) {
        expect(await article.locator('td[align="center"], td[align="right"], th[align="center"], th[align="right"]').count()).toBeGreaterThan(0);
      }
      if (exp.tables !== undefined) {
        await expect(article.locator("table")).toHaveCount(exp.tables);
      }
      const text = await article.innerText();
      for (const needle of exp.present || []) expect(text, `preview contains ${needle}`).toContain(needle);
      // KaTeX keeps the LaTeX source in a hidden MathML <annotation> for
      // accessibility; "absent" checks look at everything else.
      const html = (await article.innerHTML()).replace(/<annotation[^>]*>[\s\S]*?<\/annotation>/g, "");
      for (const needle of exp.absent || []) expect(html, `preview lacks ${needle}`).not.toContain(needle);

      // HTML export carries the same structure, plus the KaTeX stylesheet when needed
      const exported = await downloadText(page, async () => {
        await openMoreFormats(page);
        await page.getByRole("button", { name: /To HTML/i }).click();
      });
      expect(exported).toContain("<!DOCTYPE html>");
      if (exp.math) {
        expect(exported).toContain('class="katex');
        expect(exported).toContain(".katex");
        expect(exported).toContain("katex/fonts/");
      }
      if (exp.mermaid) {
        expect((exported.match(/src="data:image\/svg\+xml;base64,/g) || []).length).toBeGreaterThanOrEqual(exp.mermaid);
      }
      if (exp.alignedCells) expect(exported).toMatch(/align="(center|right)"/);
      const exportedSansAnnotations = exported.replace(/<annotation[^>]*>[\s\S]*?<\/annotation>/g, "");
      for (const needle of exp.absent || []) expect(exportedSansAnnotations).not.toContain(needle);
    });
  }
});

test.describe("Fidelity corpus — other formats", () => {
  test("Excel export: one worksheet per table, header bold, numbers numeric", async ({ page }) => {
    await page.goto("/");
    await loadFixture(page, "05-gfm-aligned-tables.md");
    const { buffer, name } = await downloadBuffer(page, async () => {
      await openMoreFormats(page);
      await page.getByRole("button", { name: /To Excel/i }).click();
    });
    expect(name).toMatch(/\.xlsx$/);
    const zip = await JSZip.loadAsync(buffer);
    const workbook = await zip.file("xl/workbook.xml")!.async("string");
    expect((workbook.match(/<sheet /g) || []).length).toBe(2);
    const sheet1 = await zip.file("xl/worksheets/sheet1.xml")!.async("string");
    expect(sheet1).toContain('s="1"'); // bold header style
    expect(sheet1).toContain("<v>1234.56</v>"); // "1,234.56" → number
    expect(sheet1).toContain("longer text here");
    expect(await zip.file("xl/styles.xml")!.async("string")).toContain("<b/>");
  });

  test("Excel export on a document without tables shows the no-tables message", async ({ page }) => {
    await page.goto("/");
    await loadFixture(page, "13-nested-lists-tasks.md");
    await openMoreFormats(page);
    await page.getByRole("button", { name: /To Excel/i }).click();
    await expect(page.getByText(/No tables found/i)).toBeVisible();
  });

  test("EPUB export is built in the browser: valid container, chapters, images, no server call", async ({ page }) => {
    const serverCalls: string[] = [];
    page.on("request", (req) => {
      if (req.url().includes("/api/convert/")) serverCalls.push(req.url());
    });
    await page.goto("/");
    await loadFixture(page, "08-cjk-mixed.md");
    // wait for the mermaid pre-render so the EPUB gets the diagram as an image
    await expect(preview(page).locator('img[src^="data:image/svg+xml"]')).toHaveCount(1, { timeout: 30000 });

    const { buffer, name } = await downloadBuffer(page, async () => {
      await openMoreFormats(page);
      await page.getByRole("button", { name: /To EPUB/i }).click();
    });
    expect(name).toMatch(/\.epub$/);
    expect(serverCalls).toHaveLength(0);

    // mimetype must be the first entry, stored uncompressed
    expect(buffer.subarray(0, 2).toString()).toBe("PK");
    expect(buffer.subarray(30, 38).toString()).toBe("mimetype");
    const zip = await JSZip.loadAsync(buffer);
    expect(await zip.file("mimetype")!.async("string")).toBe("application/epub+zip");
    expect(await zip.file("META-INF/container.xml")!.async("string")).toContain("OEBPS/content.opf");
    const opf = await zip.file("OEBPS/content.opf")!.async("string");
    expect(opf).toContain('<dc:language>en</dc:language>');
    expect(opf).toMatch(/media-type="image\/svg\+xml"/);
    expect(opf).toContain('properties="mathml"'); // KaTeX emits MathML alongside HTML
    const chapter = await zip.file("OEBPS/chapter-1.xhtml")!.async("string");
    expect(chapter).toContain('xmlns="http://www.w3.org/1999/xhtml"');
    expect(chapter).toContain("你好");
    expect(chapter).toContain('class="katex');
    expect(zip.file("OEBPS/nav.xhtml")).toBeTruthy();
    expect(zip.file("OEBPS/toc.ncx")).toBeTruthy();
    expect(zip.file("OEBPS/style.css")).toBeTruthy();
  });

  test("PDF API renders math (KaTeX inlined) and honours Letter page size", async ({ request }) => {
    test.slow();
    const markdown = fs.readFileSync(path.join(CORPUS_DIR, "20-academic-paper.md"), "utf8");
    const response = await request.post("/api/convert/pdf", {
      headers: { ...ORIGIN_HEADERS, "Content-Type": "application/json" },
      data: { markdown, filename: "paper.md", pageSize: "Letter", fontStyle: "serif" },
    });
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toBe("application/pdf");
    const body = await response.body();
    expect(body.length).toBeGreaterThan(20000);
    expect(body.subarray(0, 5).toString()).toBe("%PDF-");
    // Letter: MediaBox 612 x 792 pt
    expect(body.toString("latin1")).toMatch(/MediaBox\s*\[\s*0\s+0\s+612\s+792\s*\]/);
  });

  test("PDF API accepts embedded SVG/PNG data images (pre-rendered diagrams)", async ({ request }) => {
    test.slow();
    const markdown = fs.readFileSync(path.join(CORPUS_DIR, "14-images-remote-and-data.md"), "utf8");
    const response = await request.post("/api/convert/pdf", {
      headers: { ...ORIGIN_HEADERS, "Content-Type": "application/json" },
      data: { markdown, filename: "images.md" },
    });
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toBe("application/pdf");
  });
});

test.describe("Paste cleanup", () => {
  async function pasteInto(page: Page, text: string) {
    await page.getByRole("button", { name: "paste Markdown" }).click();
    const textarea = page.getByPlaceholder("Paste your Markdown here…");
    await textarea.click();
    await textarea.evaluate((el, value) => {
      const dt = new DataTransfer();
      dt.setData("text/plain", value);
      el.dispatchEvent(new ClipboardEvent("paste", { clipboardData: dt, bubbles: true, cancelable: true }));
    }, text);
  }

  test("ChatGPT residue is stripped, source detected, math delimiters normalized", async ({ page }) => {
    await page.goto("/");
    const text = fs.readFileSync(path.join(CORPUS_DIR, "10-chatgpt-paste-residue.md"), "utf8");
    await pasteInto(page, text);

    const notice = page.getByTestId("paste-cleanup-notice");
    await expect(notice).toBeVisible();
    await expect(notice).toContainText(/ChatGPT/);
    await expect(notice).toContainText(/lines of chat clutter/);

    const value = await page.getByPlaceholder("Paste your Markdown here…").inputValue();
    expect(value).not.toContain("Copy code");
    expect(value).not.toContain("ChatGPT said:");
    expect(value).not.toContain("You said:");
    expect(value).not.toContain("Thought for 8s");
    expect(value).not.toContain("【12†source】");
    expect(value).toContain("theta -= lr * grad");

    await expect(page.getByText(/Ready to export \(/)).toBeVisible();
    await expect(preview(page).locator(".katex-display").first()).toBeVisible({ timeout: 15000 });
  });

  test("DeepSeek <think> block and 复制代码 lines are removed", async ({ page }) => {
    await page.goto("/");
    const text = fs.readFileSync(path.join(CORPUS_DIR, "09-deepseek-think-residue.md"), "utf8");
    await pasteInto(page, text);
    await expect(page.getByTestId("paste-cleanup-notice")).toContainText(/DeepSeek/);
    const value = await page.getByPlaceholder("Paste your Markdown here…").inputValue();
    expect(value).not.toContain("<think>");
    expect(value).not.toContain("复制代码");
    expect(value).not.toContain("已深度思考");
    expect(value).toContain("def solve(a):");
  });

  test("clean paste shows no notice", async ({ page }) => {
    await page.goto("/");
    // A paste with nothing to clean is not intercepted (the browser inserts it
    // natively), so drive the textarea directly here.
    await page.getByRole("button", { name: "paste Markdown" }).click();
    await page.getByPlaceholder("Paste your Markdown here…").fill("# Plain\n\nNothing to clean here.");
    await expect(page.getByText(/Ready to export \(/)).toBeVisible();
    await expect(page.getByTestId("paste-cleanup-notice")).toHaveCount(0);
  });

  test("uploaded file with <think> residue still renders its first heading", async ({ page }) => {
    await page.goto("/");
    await page.locator('input[type="file"]').setInputFiles(path.join(CORPUS_DIR, "09-deepseek-think-residue.md"));
    await expect(page.getByText("Ready to export (uploaded file)")).toBeVisible({ timeout: 15000 });
    await expect(preview(page).locator("h1")).toHaveText("项目总结");
    expect(await preview(page).innerText()).not.toContain("reasoning");
  });
});
