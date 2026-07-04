import { test, expect, type Page } from "@playwright/test";
import fs from "fs";
import JSZip from "jszip";
import { openMoreFormats } from "./export-helpers";

/**
 * Markdown → PNG/JPG image export (spec section 5 + one-tap UX)
 *
 * "To PNG" converts in one tap with device-based defaults (width from
 * viewport, sharpness from devicePixelRatio); the caret next to it opens the
 * options panel. Long documents (> 10 pages) pause with a prompt: one long
 * image vs a split package. WebKit runs this file too (playwright.config.ts)
 * — Safari's canvas area limit is the binding constraint for the split logic.
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

async function openImagePanel(page: Page) {
  await page.getByTestId("image-options-toggle").click();
  await expect(page.getByTestId("image-width-select")).toBeVisible();
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
  test("To PNG converts in one tap with device-based defaults", async ({ page }) => {
    await stubAnalytics(page);
    await page.goto("/");
    await pasteMarkdown(page, SIMPLE_MD);

    // No options panel step: one tap → download
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

  test("To JPG one-taps from the More formats menu", async ({ page }) => {
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
});

test.describe("Image export — options panel", () => {
  test("caret toggles the panel; format toggle controls the quality slider", async ({ page }) => {
    await page.goto("/");
    await pasteMarkdown(page, SIMPLE_MD);

    await openImagePanel(page);
    await expect(page.getByTestId("image-options-toggle")).toHaveAttribute("aria-expanded", "true");

    // PNG is the default: no quality slider
    await expect(page.getByTestId("image-quality-slider")).toHaveCount(0);

    // Switching to JPG reveals it, switching back hides it
    await page.getByTestId("image-format-jpg").click();
    await expect(page.getByTestId("image-quality-slider")).toBeVisible();
    await page.getByTestId("image-format-png").click();
    await expect(page.getByTestId("image-quality-slider")).toHaveCount(0);

    // Second caret click closes the panel
    await page.getByTestId("image-options-toggle").click();
    await expect(page.getByTestId("image-width-select")).toHaveCount(0);
  });

  test("JPG via panel: white background, quality changes byte size", async ({ page }) => {
    await page.goto("/");
    await pasteMarkdown(page, SIMPLE_MD);
    await openImagePanel(page);
    await page.getByTestId("image-format-jpg").click();

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
    const downloadLow = page.waitForEvent("download");
    await page.getByTestId("image-convert-button").click();
    const lowQuality = await saveDownload(downloadLow);

    await setQuality(100);
    const downloadHigh = page.waitForEvent("download");
    await page.getByTestId("image-convert-button").click();
    const highQuality = await saveDownload(downloadHigh);

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

  test("3x available at 800px, hidden at 1080/1200px, active 3x clamps to 2x", async ({ page }) => {
    await page.goto("/");
    await pasteMarkdown(page, SIMPLE_MD);
    await openImagePanel(page);

    const scale = page.getByTestId("image-scale-select");
    const width = page.getByTestId("image-width-select");

    await width.selectOption("800");
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

  test("forced split via panel downloads a ZIP of ordered, complete parts", async ({ page }) => {
    await stubAnalytics(page);
    await page.goto("/");
    await pasteMarkdown(page, longDoc(12));
    await openImagePanel(page);

    await page.getByTestId("image-split-split").click();

    // The ZIP auto-downloads when conversion finishes — no extra tap
    const downloadPromise = page.waitForEvent("download", { timeout: 60_000 });
    await page.getByTestId("image-convert-button").click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/-images\.zip$/);

    const result = page.getByTestId("image-result");
    await expect(result).toBeVisible({ timeout: 60_000 });

    // The Share button only appears on file-share-capable browsers (desktop
    // WebKit supports it natively; desktop Chromium doesn't) — deterministic
    // branching assertions live in the mocked share tests below
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

    const zipBuffer = fs.readFileSync((await download.path())!);
    const zip = await JSZip.loadAsync(zipBuffer);
    const names = Object.keys(zip.files).sort();

    expect(names.length).toBeGreaterThan(1);
    // Sequentially numbered: …-01.png, …-02.png, …
    names.forEach((name, i) => {
      expect(name).toMatch(new RegExp(`-${String(i + 1).padStart(2, "0")}\\.png$`));
    });

    // Every part is a real PNG at the device-default pixel width
    const ratio = await expectedDeviceRatio(page, 800);
    for (const name of names) {
      const part = await zip.files[name].async("nodebuffer");
      expect(part.subarray(0, 8).equals(PNG_MAGIC)).toBe(true);
      expect(part.readUInt32BE(16)).toBe(800 * ratio);
    }

    // The split note reflects the real part count, as does analytics
    await expect(result).toContainText(String(names.length));
    const events = await getEvents(page);
    const success = events.find((e) => e.name === "convert_success");
    expect(success?.data?.split_parts).toBe(String(names.length));
  });

  test("auto mode keeps short documents single, degrading sharpness to fit", async ({ page }) => {
    await page.goto("/");
    await pasteMarkdown(page, longDoc(45));
    await openImagePanel(page);

    // ~8,500 CSS px at 3x can't fit one canvas (~2,222 px budget) — auto
    // degrades sharpness to 1x instead of silently splitting
    await page.getByTestId("image-scale-select").selectOption("3");
    const downloadPromise = page.waitForEvent("download");
    await page.getByTestId("image-convert-button").click();
    const buf = await saveDownload(downloadPromise);

    expect(buf.subarray(0, 8).equals(PNG_MAGIC)).toBe(true);
    expect(buf.readUInt32BE(16)).toBe(800); // degraded to 1x
    await expect(page.getByTestId("image-longdoc-prompt")).toHaveCount(0);
    await expect(page.getByTestId("image-result")).toHaveCount(0);
  });
});

test.describe("Image export — long-document prompt (>10 pages)", () => {
  test.slow();

  test("one-tap on a very long doc prompts; split produces the package", async ({ page }) => {
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

    const zipBuffer = await saveDownload(downloadPromise);
    const zip = await JSZip.loadAsync(zipBuffer);
    // >10 pages split at ~1280 CSS px per part
    expect(Object.keys(zip.files).length).toBeGreaterThan(5);

    const events = await getEvents(page);
    const success = events.find((e) => e.name === "convert_success");
    expect(Number(success?.data?.split_parts)).toBeGreaterThan(5);
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
    await openImagePanel(page);

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
    await openImagePanel(page);

    await page.getByTestId("image-split-split").click();
    await page.getByTestId("image-convert-button").click();
    await expect(page.getByTestId("image-result")).toBeVisible({ timeout: 60_000 });

    await expect(page.getByTestId("image-share-button")).toHaveCount(0);
    await expect(page.getByTestId("image-zip-button")).toBeVisible();
  });
});

test.describe("Image export — input states", () => {
  test("no content: PNG button triggers the upload flow, no conversion", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("to-png-button").click();
    await expect(page.getByText("Select a Markdown file to export")).toBeVisible();
    await expect(page.getByTestId("image-options-panel")).toHaveCount(0);
  });
});
