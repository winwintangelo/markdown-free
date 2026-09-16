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

/** Media files in a DOCX (JSZip also lists the folder itself as an entry). */
const mediaParts = (zip: JSZip) =>
  Object.keys(zip.files).filter((f) => f.startsWith("word/media/") && !zip.files[f].dir);

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

  test("formulas arrive as sized images, with the LaTeX as Word alt text", async ({ page }) => {
    await page.goto("/");
    const posted = captureConvert(page, "docx");
    await loadFixture(page, "02-math-in-table-and-list.md");

    const { buffer, name } = await download(page, () =>
      page.getByRole("button", { name: /To Word/i }).first().click()
    );
    expect(name).toMatch(/\.docx$/);
    expect(buffer.subarray(0, 2).toString()).toBe("PK");

    // The browser replaced all 11 formulas (10 inline, 1 display) with PNGs carrying their box
    expect(posted).toHaveLength(1);
    const markers = posted[0].markdown.match(/"mdfree-math:[id]:[\d.]+:[\d.]+:[\d.]+"/g) ?? [];
    expect(markers.filter((m) => m.startsWith('"mdfree-math:i:')), "inline formulas").toHaveLength(10);
    expect(markers.filter((m) => m.startsWith('"mdfree-math:d:')), "display formula").toHaveLength(1);
    expect(posted[0].markdown, "no math delimiters reach the server").not.toMatch(/\$|\\\(/);

    const zip = await JSZip.loadAsync(buffer);
    const document = await zip.file("word/document.xml")!.async("string");
    expect(mediaParts(zip), "one picture per formula").toHaveLength(11);

    // The source is no longer body text; it survives as each picture's alt text
    const text = [...document.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map((m) => m[1]).join("");
    expect(text).not.toContain("\\frac");
    expect(document, "no KaTeX markup dumped into the document").not.toContain("katex");
    expect(document).toContain('descr="\\mu = \\frac{1}{n}\\sum x_i"');

    // Sized to the 11pt text, not left at 3× raster resolution
    const heights = [...document.matchAll(/<wp:extent cx="\d+" cy="(\d+)"/g)].map((m) => Number(m[1]) / 9525);
    expect(heights).toHaveLength(11);
    expect(Math.max(...heights)).toBeLessThan(60);

    // Inline formulas are lowered onto the baseline; a display one is not.
    // (This display formula is a list item's second paragraph, which the route
    // joins onto the first so html-to-docx keeps it; centring is covered below.)
    expect(document).toMatch(/<w:position w:val="-\d+"\/>/);
    const displayPara = document.split("<w:p>").find((p) => p.includes('descr="\\hat{H}\\psi = E\\psi"'));
    expect(displayPara, "display formula paragraph").toBeDefined();
    expect(displayPara).not.toContain("<w:position");

    // Structure still converts properly, formulas included inside table cells
    const table = document.slice(document.indexOf("<w:tbl>"), document.indexOf("</w:tbl>"));
    expect(table).toContain("<w:drawing>");
  });

  test("a formula KaTeX cannot parse stays as LaTeX source", async ({ page }) => {
    await page.goto("/");
    const posted = captureConvert(page, "docx");
    await page.locator('input[type="file"]').setInputFiles({
      name: "bad-math.md",
      mimeType: "text/markdown",
      buffer: Buffer.from("# Mixed\n\nGood $x^2 + y^2$ and bad $\\notacommand{z}$ here.\n"),
    });
    await expect(page.getByText("Ready to export (uploaded file)")).toBeVisible({ timeout: 15000 });

    const { buffer } = await download(page, () =>
      page.getByRole("button", { name: /To Word/i }).first().click()
    );

    expect(posted).toHaveLength(1);
    expect(posted[0].markdown.match(/"mdfree-math:/g) ?? []).toHaveLength(1);
    expect(posted[0].markdown).toContain("$\\notacommand{z}$");

    const zip = await JSZip.loadAsync(buffer);
    const document = await zip.file("word/document.xml")!.async("string");
    expect(document, "the bad formula is kept as text").toContain("\\notacommand{z}");
    expect(mediaParts(zip)).toHaveLength(1);
  });

  test("later paragraphs of a list item and images in quotes survive", async ({ page }) => {
    // html-to-docx keeps only a list item's first paragraph and drops images
    // inside a <blockquote>; the route rewrites both shapes before conversion
    await page.goto("/");
    await page.locator('input[type="file"]').setInputFiles({
      name: "loose-list.md",
      mimeType: "text/markdown",
      buffer: Buffer.from(
        "# Steps\n\n1. First paragraph\n\n   Second paragraph text\n\n   $$\n   x^2\n   $$\n\n2. Next item\n\n> Quote with math $a+b$\n"
      ),
    });
    await expect(page.getByText("Ready to export (uploaded file)")).toBeVisible({ timeout: 15000 });

    const { buffer } = await download(page, () =>
      page.getByRole("button", { name: /To Word/i }).first().click()
    );

    const zip = await JSZip.loadAsync(buffer);
    const document = await zip.file("word/document.xml")!.async("string");
    const text = [...document.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map((m) => m[1]).join("|");
    expect(text).toContain("Second paragraph text");
    expect(text).toContain("Next item");
    expect(mediaParts(zip), "display formula in the list item + formula in the quote").toHaveLength(2);
    const quote = document.split("<w:p>").find((p) => p.includes("Quote with math"));
    expect(quote).toContain("<w:drawing>");
    expect(quote).toContain('<w:ind w:left="284"/>');
  });

  test("a math-heavy mixed document stays under the upload limit", async ({ page }) => {
    await page.goto("/");
    const posted = captureConvert(page, "docx");
    await page
      .locator('input[type="file"]')
      .setInputFiles(path.join(__dirname, "..", "test-fixtures", "validation-math-mermaid-tables.md"));
    await expect(page.getByText("Ready to export (uploaded file)")).toBeVisible({ timeout: 15000 });

    const { buffer } = await download(page, () =>
      page.getByRole("button", { name: /To Word/i }).first().click()
    );

    // ~1MB posted, almost all of it images (5 diagrams + 36 formulas): only the
    // text counts against the 1MB document limit, the images against the 4MB cap
    const bytes = Buffer.byteLength(posted[0].markdown, "utf-8");
    const textBytes = Buffer.byteLength(
      posted[0].markdown.replace(/data:image\/[a-z0-9.+-]+;base64,[A-Za-z0-9+/=]+/gi, ""),
      "utf-8"
    );
    expect(textBytes).toBeLessThan(100 * 1024);
    expect(bytes).toBeGreaterThan(900 * 1024);
    expect(bytes).toBeLessThan(4 * 1024 * 1024);

    // Every formula in the fixture (36, per the remark-math parse) became an image
    expect(posted[0].markdown.match(/"mdfree-math:/g) ?? []).toHaveLength(36);
    const zip = await JSZip.loadAsync(buffer);
    const document = await zip.file("word/document.xml")!.async("string");
    // CJK inside \text{} and formulas glued to CJK text all became pictures
    expect(document).toContain('descr="P(\\text{雨} \\mid \\text{云})');
    expect(document).toContain('descr="E=mc^2"');
    // A top-level display formula gets a centred paragraph of its own
    const gaussian = document
      .split("<w:p>")
      .find((p) => p.includes('descr="\\int_{-\\infty}^{\\infty} e^{-x^2}\\,dx = \\sqrt{\\pi}"'));
    expect(gaussian, "display formula paragraph").toBeDefined();
    expect(gaussian).toContain('<w:jc w:val="center"/>');
    expect(gaussian).not.toContain("<w:position");
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

test.describe("Diagram failures", () => {
  test("a diagram that cannot parse leaves nothing on the page", async ({ page }) => {
    // mermaid draws a "Syntax error in text" graphic into the document when a
    // diagram fails to parse; suppressed, it would pile up under the footer on
    // every render (preview, then once more per PDF/Word export)
    await page.goto("/");
    await page.locator('input[type="file"]').setInputFiles(
      path.join(__dirname, "..", "test-fixtures", "validation-math-mermaid-tables.md")
    );
    await expect(page.getByText("Ready to export (uploaded file)")).toBeVisible({ timeout: 15000 });
    // Wait for the diagrams that do parse, so the failing one has been tried too
    await expect(page.locator(".prose").first().locator('img[src^="data:image/svg+xml"]')).toHaveCount(5, {
      timeout: 30000,
    });
    await expect(page.getByText("Syntax error in text")).toHaveCount(0);

    await download(page, () => page.getByRole("button", { name: /To Word/i }).first().click());
    await expect(page.getByText("Syntax error in text")).toHaveCount(0);
    // The broken fence stays a code block in the preview (the fixture also
    // quotes a mermaid fence inside a code block, hence first())
    await expect(
      page.locator(".prose").first().locator("pre", { hasText: "flowchart LR" }).first()
    ).toBeVisible();
  });
});

test.describe("DOCX formula pictures", () => {
  test("identical images keep their own alt text and inline/display treatment", async ({ page }) => {
    // `E=mc^2` and `E = mc^2` can rasterize to the same bytes; the route must
    // still pair each picture with its own occurrence (matched by hash + order)
    await page.goto("/");
    const docx = await page.evaluate(async () => {
      const png =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
      const markdown = [
        `Inline ![E&#61;mc&#94;2](${png} "mdfree-math:i:40:12:3") in text.`,
        "",
        `![E &#61; mc&#94;2](${png} "mdfree-math:d:40:12:0")`,
        "",
      ].join("\n");
      const res = await fetch("/api/convert/docx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markdown, filename: "same.md" }),
      });
      return { status: res.status, bytes: Array.from(new Uint8Array(await res.arrayBuffer())) };
    });
    expect(docx.status).toBe(200);

    const zip = await JSZip.loadAsync(Buffer.from(docx.bytes));
    const document = await zip.file("word/document.xml")!.async("string");
    const inline = document.split("<w:p>").find((p) => p.includes("Inline"));
    const display = document.split("<w:p>").find((p) => p.includes('descr="E = mc^2"'));
    expect(inline).toContain('descr="E=mc^2"');
    expect(inline, "3px deep → lowered 4.5 half-points, rounded").toContain('<w:position w:val="-5"/>');
    expect(display).toContain('<w:jc w:val="center"/>');
    expect(display).not.toContain("<w:position");
  });
});

test.describe("DOCX request size", () => {
  test("embedded images count toward a 4MB body cap, not the 1MB document limit", async ({ page }) => {
    await page.goto("/");
    const result = await page.evaluate(async () => {
      // Noise compresses badly: one 800×600 PNG is ~2.5MB of base64
      const canvas = document.createElement("canvas");
      canvas.width = 800;
      canvas.height = 600;
      const ctx = canvas.getContext("2d")!;
      const pixels = ctx.createImageData(800, 600);
      for (let i = 0; i < pixels.data.length; i++) pixels.data[i] = (Math.random() * 256) | 0;
      ctx.putImageData(pixels, 0, 0);
      const uri = canvas.toDataURL("image/png");
      const post = (markdown: string) =>
        fetch("/api/convert/docx", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ markdown, filename: "big.md" }),
        }).then((r) => r.status);
      const image = `\n![noise](${uri})\n`;
      return {
        uriBytes: uri.length,
        underCap: await post(`# Big${image}`),
        overCap: await post(`# Too big${image.repeat(2)}`),
        textOverLimit: await post("x".repeat(1024 * 1024 + 1)),
      };
    });
    expect(result.uriBytes).toBeGreaterThan(1024 * 1024);
    expect(result.underCap, "over 1MB only because of an image").toBe(200);
    expect(result.overCap, "over the 4MB body cap").toBe(413);
    expect(result.textOverLimit, "text is still capped at 1MB").toBe(413);
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
