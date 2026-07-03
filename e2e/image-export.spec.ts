import { test, expect, type Page } from "@playwright/test";
import fs from "fs";
import JSZip from "jszip";

/**
 * Markdown → PNG/JPG image export (spec section 5)
 *
 * Rasterization happens fully client-side (html-to-image), so these tests
 * exercise the real pipeline: options panel → convert → download/ZIP/share.
 * WebKit runs this file too (playwright.config.ts) — Safari's canvas area
 * limit is the binding constraint for the split logic.
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

async function openImagePanel(page: Page, format: "png" | "jpg") {
  await page.getByTestId(`to-${format}-button`).click();
  await expect(page.getByTestId("image-options-panel")).toBeVisible();
}

async function convertAndDownload(page: Page): Promise<Buffer> {
  const downloadPromise = page.waitForEvent("download");
  await page.getByTestId("image-convert-button").click();
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

test.describe("Image export — single image", () => {
  test("PNG downloads with correct dimensions (width × scale)", async ({ page }) => {
    await stubAnalytics(page);
    await page.goto("/");
    await pasteMarkdown(page, SIMPLE_MD);
    await openImagePanel(page, "png");

    // defaults: 800px width, 2x
    const buf = await convertAndDownload(page);

    expect(buf.subarray(0, 8).equals(PNG_MAGIC)).toBe(true);
    // IHDR width: bytes 16–19 big-endian
    expect(buf.readUInt32BE(16)).toBe(800 * 2);
    expect(buf.length).toBeGreaterThan(1000);

    const events = await getEvents(page);
    const success = events.find((e) => e.name === "convert_success");
    expect(success?.data?.format).toBe("png");
    expect(success?.data?.split_parts).toBe("1");
  });

  test("CJK content renders non-blank glyphs (no-tofu smoke check)", async ({ page }) => {
    await page.goto("/");
    await pasteMarkdown(page, CJK_MD);
    await openImagePanel(page, "png");

    const buf = await convertAndDownload(page);
    const darkPixels = await countDarkPixels(page, buf, "image/png");
    // CJK paragraphs produce thousands of glyph pixels; blank/tofu output would not
    expect(darkPixels).toBeGreaterThan(2000);
  });

  test("JPG has a white background and quality changes byte size", async ({ page }) => {
    await page.goto("/");
    await pasteMarkdown(page, SIMPLE_MD);
    await openImagePanel(page, "jpg");
    await expect(page.getByTestId("image-quality-slider")).toBeVisible();

    const setQuality = (value: number) =>
      page.getByTestId("image-quality-slider").evaluate((el, v) => {
        const input = el as HTMLInputElement;
        const setter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          "value"
        )!.set!;
        setter.call(input, String(v));
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
      }, value);

    await setQuality(60);
    const lowQuality = await convertAndDownload(page);

    await setQuality(100);
    const highQuality = await convertAndDownload(page);

    // JPEG SOI marker, never a PNG
    expect(lowQuality[0]).toBe(0xff);
    expect(lowQuality[1]).toBe(0xd8);

    // corner pixel is white (composited), not black-filled alpha
    const [r, g, b] = await samplePixel(page, lowQuality, "image/jpeg", 2, 2);
    expect(r).toBeGreaterThan(240);
    expect(g).toBeGreaterThan(240);
    expect(b).toBeGreaterThan(240);

    expect(lowQuality.length).toBeLessThan(highQuality.length);
  });

  test("PNG panel hides the quality slider", async ({ page }) => {
    await page.goto("/");
    await pasteMarkdown(page, SIMPLE_MD);
    await openImagePanel(page, "png");
    await expect(page.getByTestId("image-quality-slider")).toHaveCount(0);
  });
});

test.describe("Image export — scale × width matrix", () => {
  test("3x available at 800px, hidden at 1080/1200px, active 3x clamps to 2x", async ({ page }) => {
    await page.goto("/");
    await pasteMarkdown(page, SIMPLE_MD);
    await openImagePanel(page, "png");

    const scale = page.getByTestId("image-scale-select");
    const width = page.getByTestId("image-width-select");

    await expect(scale.locator("option")).toHaveCount(3); // 1x/2x/3x at 800

    await scale.selectOption("3");
    await width.selectOption("1080");
    await expect(scale.locator("option")).toHaveCount(2); // 3x absent, not disabled
    await expect(scale).toHaveValue("2"); // visible clamp

    await width.selectOption("1200");
    await expect(scale.locator("option")).toHaveCount(2);

    await width.selectOption("600");
    await expect(scale.locator("option")).toHaveCount(3);
  });
});

test.describe("Image export — long documents", () => {
  test.slow();

  test("forced split downloads a ZIP of ordered, complete parts", async ({ page }) => {
    await stubAnalytics(page);
    await page.goto("/");
    await pasteMarkdown(page, longDoc(12));
    await openImagePanel(page, "png");

    await page.getByTestId("image-split-split").click();
    await page.getByTestId("image-convert-button").click();

    const result = page.getByTestId("image-result");
    await expect(result).toBeVisible({ timeout: 60_000 });

    // The Share button only appears on file-share-capable browsers (desktop
    // WebKit supports it natively; desktop Chromium doesn't) — the
    // deterministic branching assertions live in the mocked share tests below
    const canShareFiles = await page.evaluate(() => {
      try {
        return (
          "canShare" in navigator &&
          navigator.canShare({ files: [new File(["x"], "x.png", { type: "image/png" })] })
        );
      } catch {
        return false;
      }
    });
    await expect(page.getByTestId("image-share-button")).toHaveCount(canShareFiles ? 1 : 0);

    const downloadPromise = page.waitForEvent("download");
    await page.getByTestId("image-zip-button").click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/-images\.zip$/);

    const zipBuffer = fs.readFileSync((await download.path())!);
    const zip = await JSZip.loadAsync(zipBuffer);
    const names = Object.keys(zip.files).sort();

    expect(names.length).toBeGreaterThan(1);
    // Sequentially numbered: …-01.png, …-02.png, …
    names.forEach((name, i) => {
      expect(name).toMatch(new RegExp(`-${String(i + 1).padStart(2, "0")}\\.png$`));
    });

    // Every part is a real PNG at the selected pixel width
    for (const name of names) {
      const part = await zip.files[name].async("nodebuffer");
      expect(part.subarray(0, 8).equals(PNG_MAGIC)).toBe(true);
      expect(part.readUInt32BE(16)).toBe(800 * 2);
    }

    // The split note reflects the real part count, as does analytics
    await expect(result).toContainText(String(names.length));
    const events = await getEvents(page);
    const success = events.find((e) => e.name === "convert_success");
    expect(success?.data?.split_parts).toBe(String(names.length));
  });

  test("auto mode splits a document that exceeds the canvas limit", async ({ page }) => {
    await page.goto("/");
    await pasteMarkdown(page, longDoc(45));
    await openImagePanel(page, "png");

    // auto is the default; 800px × 2x caps a single canvas at 5000 CSS px
    await page.getByTestId("image-convert-button").click();
    await expect(page.getByTestId("image-result")).toBeVisible({ timeout: 60_000 });
  });
});

test.describe("Image export — share path branching (spec 5.12)", () => {
  test.slow();

  function mockShare(page: Page) {
    return page.addInitScript(() => {
      const w = window as unknown as { __sharedFiles: number };
      w.__sharedFiles = -1;
      (navigator as unknown as { canShare: (d: unknown) => boolean }).canShare = () => true;
      (navigator as unknown as { share: (d: { files: File[] }) => Promise<void> }).share = (
        data
      ) => {
        w.__sharedFiles = data.files.length;
        return Promise.resolve();
      };
    });
  }

  test("≤5 parts on a share-capable browser: Share is primary, called with the blobs", async ({
    page,
  }) => {
    await stubAnalytics(page);
    await mockShare(page);
    await page.goto("/");
    await pasteMarkdown(page, longDoc(12));
    await openImagePanel(page, "png");

    await page.getByTestId("image-split-split").click();
    await page.getByTestId("image-convert-button").click();
    await expect(page.getByTestId("image-result")).toBeVisible({ timeout: 60_000 });

    const shareButton = page.getByTestId("image-share-button");
    await expect(shareButton).toBeVisible();
    await expect(page.getByTestId("image-zip-button")).toBeVisible(); // ZIP stays as secondary

    await shareButton.click();
    const shared = await page.evaluate(
      () => (window as unknown as { __sharedFiles: number }).__sharedFiles
    );
    expect(shared).toBeGreaterThan(1);
    expect(shared).toBeLessThanOrEqual(5);

    const events = await getEvents(page);
    const shareEvent = events.find((e) => e.name === "share_files_used");
    expect(shareEvent?.data?.parts).toBe(String(shared));
  });

  test("more than 5 parts: share hidden even when canShare is true", async ({ page }) => {
    await mockShare(page);
    await page.goto("/");
    await pasteMarkdown(page, longDoc(40));
    await openImagePanel(page, "png");

    await page.getByTestId("image-split-split").click();
    await page.getByTestId("image-convert-button").click();
    await expect(page.getByTestId("image-result")).toBeVisible({ timeout: 60_000 });

    await expect(page.getByTestId("image-share-button")).toHaveCount(0);
    await expect(page.getByTestId("image-zip-button")).toBeVisible();
  });
});

test.describe("Image export — embedded images", () => {
  test("blocked remote image: export completes with warning and placeholder", async ({
    page,
  }) => {
    await page.goto("/");
    await pasteMarkdown(
      page,
      `# Doc with blocked image\n\n![blocked](https://127.0.0.1/nope.png)\n\nText after the image.`
    );
    await openImagePanel(page, "png");

    const buf = await convertAndDownload(page);
    expect(buf.subarray(0, 8).equals(PNG_MAGIC)).toBe(true);

    const warning = page.getByTestId("image-warning");
    await expect(warning).toBeVisible();
    await expect(warning).toContainText("1");
  });
});

test.describe("Image export — input states", () => {
  test("no content: PNG button triggers the upload flow, no panel", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("to-png-button").click();
    await expect(page.getByText("Select a Markdown file to export")).toBeVisible();
    await expect(page.getByTestId("image-options-panel")).toHaveCount(0);
  });

  test("panel toggles per format and closes on second click", async ({ page }) => {
    await page.goto("/");
    await pasteMarkdown(page, SIMPLE_MD);

    await openImagePanel(page, "png");
    await expect(page.getByTestId("to-png-button")).toHaveAttribute("aria-expanded", "true");

    // switching to JPG keeps the panel open, now with the quality slider
    await page.getByTestId("to-jpg-button").click();
    await expect(page.getByTestId("image-options-panel")).toBeVisible();
    await expect(page.getByTestId("image-quality-slider")).toBeVisible();

    // second click on the active format closes the panel
    await page.getByTestId("to-jpg-button").click();
    await expect(page.getByTestId("image-options-panel")).toHaveCount(0);
  });
});
