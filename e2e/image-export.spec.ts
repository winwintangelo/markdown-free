import { test, expect, type Page } from "@playwright/test";
import fs from "fs";
import JSZip from "jszip";
import { openMoreFormats } from "./export-helpers";

/**
 * Markdown → PNG/JPG image export (spec section 5 + one-tap UX)
 *
 * "To Image (PNG)" is a plain one-tap button like every other converter:
 * device-based defaults (width from viewport, sharpness from DPR), no
 * options UI. Short documents always come out as a single image (degrading
 * sharpness to fit one canvas); long documents (> 10 pages) prompt for one
 * tall image vs a ZIP package, and either choice auto-downloads. WebKit runs
 * this file too (playwright.config.ts) — Safari's canvas area limit is the
 * binding constraint for the split logic.
 */

test.use({ actionTimeout: 60_000 });

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const SIMPLE_MD = `# Hello Image

This is a **test** document with a [link](https://example.com).

- item one
- item two
`;

const CJK_MD = `# 画像テスト・图片测试・이미지 테스트

日本語の文章です。漢字とかなが混在しています。マークダウンを画像に変換します。

简体中文段落：将 Markdown 文档转换为长图，用于微信公众号排版。

繁體中文段落：將 Markdown 文件轉換為圖片，檢查字型是否正確。

한국어 단락입니다. 마크다운 문서를 이미지로 변환하여 글꼴을 확인합니다.

Mixed CJK + Latin: 変換 conversion 변환 转换 test.
`;

function longDoc(sections: number): string {
  return Array.from(
    { length: sections },
    (_, i) =>
      `## Section ${i + 1}\n\n${"Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod. ".repeat(6)}`
  ).join("\n\n");
}

async function pasteMarkdown(page: Page, content: string) {
  await page.getByRole("button", { name: "paste Markdown" }).click();
  await page.locator("textarea").fill(content);
  await expect(page.getByText("Ready to export", { exact: false })).toBeVisible();
}

/** The device-based default sharpness the app should pick at a given width */
async function expectedDeviceRatio(page: Page, width: number): Promise<number> {
  const dpr = await page.evaluate(() => window.devicePixelRatio || 1);
  const ratio = Math.min(3, Math.max(1, Math.round(dpr)));
  return width >= 1080 ? Math.min(2, ratio) : ratio;
}

async function saveDownload(downloadPromise: Promise<import("@playwright/test").Download>): Promise<Buffer> {
  const download = await downloadPromise;
  const filePath = await download.path();
  return fs.readFileSync(filePath!);
}

/** Decode an image in the browser and count dark (glyph-like) pixels */
async function countDarkPixels(page: Page, imageBuffer: Buffer, mime: string): Promise<number> {
  return page.evaluate(
    async ({ b64, mime }) => {
      const img = new Image();
      img.src = `data:${mime};base64,${b64}`;
      await img.decode();
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      const { data } = ctx.getImageData(0, 0, img.width, img.height);
      let dark = 0;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i] < 128 && data[i + 1] < 128 && data[i + 2] < 128 && data[i + 3] > 128) dark++;
      }
      return dark;
    },
    { b64: imageBuffer.toString("base64"), mime }
  );
}

async function samplePixel(
  page: Page,
  imageBuffer: Buffer,
  mime: string,
  x: number,
  y: number
): Promise<[number, number, number]> {
  return page.evaluate(
    async ({ b64, mime, x, y }) => {
      const img = new Image();
      img.src = `data:${mime};base64,${b64}`;
      await img.decode();
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      const d = ctx.getImageData(x, y, 1, 1).data;
      return [d[0], d[1], d[2]] as [number, number, number];
    },
    { b64: imageBuffer.toString("base64"), mime, x, y }
  );
}

function stubAnalytics(page: Page) {
  return page.addInitScript(() => {
    (window as unknown as { __events: unknown[] }).__events = [];
    (window as unknown as { umami: unknown }).umami = {
      track: (name: string, data?: Record<string, string>) =>
        (window as unknown as { __events: unknown[] }).__events.push({ name, data }),
    };
  });
}

function getEvents(page: Page): Promise<Array<{ name: string; data?: Record<string, string> }>> {
  return page.evaluate(
    () => (window as unknown as { __events: Array<{ name: string; data?: Record<string, string> }> }).__events
  );
}

test.describe("Image export — one-tap flow", () => {
  test("To Image (PNG) converts in one tap with device-based defaults", async ({ page }) => {
    await stubAnalytics(page);
    await page.goto("/");
    await pasteMarkdown(page, SIMPLE_MD);

    // No options step: one tap → download
    const downloadPromise = page.waitForEvent("download");
    await page.getByTestId("to-png-button").click();
    const buf = await saveDownload(downloadPromise);

    expect(buf.subarray(0, 8).equals(PNG_MAGIC)).toBe(true);
    // Desktop viewport → 800px width; sharpness follows devicePixelRatio
    const ratio = await expectedDeviceRatio(page, 800);
    expect(buf.readUInt32BE(16)).toBe(800 * ratio);
    expect(buf.length).toBeGreaterThan(1000);

    const events = await getEvents(page);
    const success = events.find((e) => e.name === "convert_success");
    expect(success?.data?.format).toBe("png");
    expect(success?.data?.split_parts).toBe("1");
  });

  test("CJK content renders non-blank glyphs (no-tofu smoke check)", async ({ page }) => {
    await page.goto("/");
    await pasteMarkdown(page, CJK_MD);

    const downloadPromise = page.waitForEvent("download");
    await page.getByTestId("to-png-button").click();
    const buf = await saveDownload(downloadPromise);

    const darkPixels = await countDarkPixels(page, buf, "image/png");
    // CJK paragraphs produce thousands of glyph pixels; blank/tofu output would not
    expect(darkPixels).toBeGreaterThan(2000);
  });

  test("To JPG one-taps from the More formats menu, white background", async ({ page }) => {
    await page.goto("/");
    await pasteMarkdown(page, SIMPLE_MD);

    await openMoreFormats(page);
    // The menu carries the long-tail formats
    await expect(page.getByRole("button", { name: "To EPUB" })).toBeVisible();
    await expect(page.getByRole("button", { name: "To TXT" })).toBeVisible();
    await expect(page.getByRole("button", { name: "To HTML" })).toBeVisible();

    const downloadPromise = page.waitForEvent("download");
    await page.getByTestId("menu-to-jpg").click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.jpg$/);

    const buf = fs.readFileSync((await download.path())!);
    // JPEG SOI marker
    expect(buf[0]).toBe(0xff);
    expect(buf[1]).toBe(0xd8);

    // corner pixel is white (composited), never black-filled alpha
    const [r, g, b] = await samplePixel(page, buf, "image/jpeg", 2, 2);
    expect(r).toBeGreaterThan(240);
    expect(g).toBeGreaterThan(240);
    expect(b).toBeGreaterThan(240);
  });

  test("blocked remote image: export completes with warning and placeholder", async ({ page }) => {
    await page.goto("/");
    await pasteMarkdown(
      page,
      `# Doc with blocked image\n\n![blocked](https://127.0.0.1/nope.png)\n\nText after the image.`
    );

    const downloadPromise = page.waitForEvent("download");
    await page.getByTestId("to-png-button").click();
    const buf = await saveDownload(downloadPromise);
    expect(buf.subarray(0, 8).equals(PNG_MAGIC)).toBe(true);

    const warning = page.getByTestId("image-warning");
    await expect(warning).toBeVisible();
    await expect(warning).toContainText("1");
  });

  test("there is no options dropdown — image export is a plain button", async ({ page }) => {
    await page.goto("/");
    await pasteMarkdown(page, SIMPLE_MD);
    await expect(page.getByTestId("image-options-toggle")).toHaveCount(0);
    await expect(page.getByTestId("to-png-button")).not.toHaveAttribute("aria-haspopup");
  });
});

test.describe("Image export — short documents stay single", () => {
  test.slow();

  test("a tall short doc on a 3x device degrades sharpness instead of splitting", async ({
    browser,
  }) => {
    // Simulate a high-DPR device: default sharpness becomes 3x at 800px
    const context = await browser.newContext({
      deviceScaleFactor: 3,
      viewport: { width: 1280, height: 720 },
    });
    const page = await context.newPage();
    try {
      await page.goto("/");
      await pasteMarkdown(page, longDoc(45));

      // ~8,500 CSS px can't fit one canvas at 3x (~2,222 px budget) or 2x
      // (5,000) — auto degrades to 1x rather than silently splitting
      const downloadPromise = page.waitForEvent("download", { timeout: 60_000 });
      await page.getByTestId("to-png-button").click();
      const buf = await saveDownload(downloadPromise);

      expect(buf.subarray(0, 8).equals(PNG_MAGIC)).toBe(true);
      expect(buf.readUInt32BE(16)).toBe(800); // degraded to 1x
      await expect(page.getByTestId("image-longdoc-prompt")).toHaveCount(0);
      await expect(page.getByTestId("image-result")).toHaveCount(0);
    } finally {
      await context.close();
    }
  });
});

test.describe("Image export — long-document prompt (>10 pages)", () => {
  test.slow();

  test("one-tap on a very long doc prompts; split auto-downloads the package", async ({ page }) => {
    await stubAnalytics(page);
    await page.goto("/");
    // ~21,000 CSS px — beyond the 16,000px per-side canvas cap, so the
    // "single image" choice is honestly unavailable (canSingle = false)
    await pasteMarkdown(page, longDoc(110));

    await page.getByTestId("to-png-button").click();

    const prompt = page.getByTestId("image-longdoc-prompt");
    await expect(prompt).toBeVisible({ timeout: 30_000 });
    // The tradeoff is explained on the choice itself
    await expect(prompt).toContainText("ZIP of screen-sized images");
    await expect(page.getByTestId("image-longdoc-single")).toHaveCount(0);

    // Choosing the package auto-downloads the ZIP when rendering finishes
    const downloadPromise = page.waitForEvent("download", { timeout: 120_000 });
    await page.getByTestId("image-longdoc-split").click();
    await expect(prompt).toHaveCount(0);

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/-images\.zip$/);
    const zipBuffer = fs.readFileSync((await download.path())!);
    const zip = await JSZip.loadAsync(zipBuffer);
    const names = Object.keys(zip.files).sort();

    // >10 pages split at ~1280 CSS px per part
    expect(names.length).toBeGreaterThan(5);
    // Sequentially numbered: …-01.png, …-02.png, …
    names.forEach((name, i) => {
      expect(name).toMatch(new RegExp(`-${String(i + 1).padStart(2, "0")}\\.png$`));
    });
    // Every part is a real PNG at the device-default pixel width
    const ratio = await expectedDeviceRatio(page, 800);
    for (const name of names.slice(0, 3)) {
      const part = await zip.files[name].async("nodebuffer");
      expect(part.subarray(0, 8).equals(PNG_MAGIC)).toBe(true);
      expect(part.readUInt32BE(16)).toBe(800 * ratio);
    }

    // The result row shows the split note; with >5 parts the share path is
    // not offered even on share-capable browsers
    const result = page.getByTestId("image-result");
    await expect(result).toBeVisible();
    await expect(result).toContainText(String(names.length));
    await expect(page.getByTestId("image-share-button")).toHaveCount(0);

    const events = await getEvents(page);
    const success = events.find((e) => e.name === "convert_success");
    expect(success?.data?.split_parts).toBe(String(names.length));
  });

  test("choosing single produces one tall image (degraded sharpness)", async ({ page }) => {
    await page.goto("/");
    // ~14,000 CSS px: above the 10-page prompt threshold (12,800) but under
    // the 16,000px per-side cap, so "single image" is offered at 1x
    await pasteMarkdown(page, longDoc(75));

    const downloadPromise = page.waitForEvent("download", { timeout: 60_000 });
    await page.getByTestId("to-png-button").click();

    await expect(page.getByTestId("image-longdoc-prompt")).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId("image-longdoc-single")).toBeVisible();
    await page.getByTestId("image-longdoc-single").click();

    const buf = await saveDownload(downloadPromise);
    expect(buf.subarray(0, 8).equals(PNG_MAGIC)).toBe(true);
    // Sharpness degrades to 1x so the whole document fits one canvas
    expect(buf.readUInt32BE(16)).toBe(800);
    // IHDR height (bytes 20–23): genuinely one long image, > 10 pages tall
    expect(buf.readUInt32BE(20)).toBeGreaterThan(12_800);
  });

  test("cancelling the prompt aborts without error", async ({ page }) => {
    await page.goto("/");
    await pasteMarkdown(page, longDoc(90));

    await page.getByTestId("to-png-button").click();
    await expect(page.getByTestId("image-longdoc-prompt")).toBeVisible({ timeout: 30_000 });

    await page.getByTestId("image-longdoc-cancel").click();
    await expect(page.getByTestId("image-longdoc-prompt")).toHaveCount(0);
    await expect(page.getByTestId("image-result")).toHaveCount(0);
    await expect(page.getByTestId("image-error")).toHaveCount(0);
    // The button returns to its idle label
    await expect(page.getByTestId("to-png-button")).toContainText("(PNG)");
  });
});

test.describe("Image export — input states", () => {
  test("no content: image button triggers the upload flow, no conversion", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("to-png-button").click();
    await expect(page.getByText("Select a Markdown file to export")).toBeVisible();
    await expect(page.getByTestId("image-options-panel")).toHaveCount(0);
  });
});
