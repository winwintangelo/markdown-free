import { test, expect } from "@playwright/test";
import path from "path";
import fs from "fs";

/**
 * Multilingual PDF Export Tests
 *
 * These tests validate that PDF export works correctly for all supported languages.
 * They use the actual PDF API (not mocked) to ensure fonts are properly rendered.
 *
 * Note: These tests require the dev server to be running with Google Fonts access.
 */

// Increase timeout for PDF tests (font loading takes time)
test.use({
  actionTimeout: 60000,
});

// Minimum expected PDF size in bytes (a valid PDF with content should be at least this size)
const MIN_PDF_SIZE = 10000;

// Test content for each supported language
const MULTILINGUAL_CONTENT = {
  english: {
    locale: "en",
    content: `# English Test

This is a test document in English.

- Feature one
- Feature two
- Feature three

**Bold text** and *italic text* work correctly.`,
  },
  italian: {
    locale: "it",
    content: `# Test Italiano

Questo è un documento di test in italiano.

Caratteri speciali: àèéìòù ÀÈÉÌÒÙ caffè più perché città

- Funzionalità uno
- Funzionalità due`,
  },
  spanish: {
    locale: "es",
    content: `# Prueba en Español

Este es un documento de prueba en español.

Caracteres especiales: áéíóúü ñ ¿¡ ÁÉÍÓÚÜ Ñ España año mañana

- Característica uno
- Característica dos`,
  },
  japanese: {
    locale: "ja",
    content: `# 日本語テスト

これは日本語のテストドキュメントです。

ひらがな: あいうえお かきくけこ さしすせそ
カタカナ: アイウエオ カキクケコ サシスセソ
漢字: 変換 文書 技術 開発者 無料

- 機能一
- 機能二`,
  },
  korean: {
    locale: "ko",
    content: `# 한국어 테스트

이것은 한국어 테스트 문서입니다.

한글: 가나다라마바사아자차카타파하
단어: 변환 문서 기술 개발자 무료

- 기능 하나
- 기능 둘`,
  },
  simplifiedChinese: {
    locale: "zh-Hans",
    content: `# 简体中文测试

这是一个简体中文测试文档。

常用字: 转换 文档 技术 开发者 免费 简单
数字: 零一二三四五六七八九十

- 功能一
- 功能二`,
  },
  traditionalChinese: {
    locale: "zh-Hant",
    content: `# 繁體中文測試

這是一個繁體中文測試文檔。

常用字: 轉換 文檔 技術 開發者 免費 簡單
注音: ㄅㄆㄇㄈㄉㄊㄋㄌㄍㄎㄏ

- 功能一
- 功能二`,
  },
  indonesian: {
    locale: "id",
    content: `# Tes Bahasa Indonesia

Ini adalah dokumen tes dalam Bahasa Indonesia.

Kata-kata: pengembang, dokumentasi, gratis, mudah, berkualitas tinggi

- Fitur satu
- Fitur dua`,
  },
  vietnamese: {
    locale: "vi",
    content: `# Kiểm tra Tiếng Việt

Đây là tài liệu kiểm tra bằng tiếng Việt.

Dấu thanh: à á ả ã ạ ă ằ ắ ẳ ẵ ặ â ầ ấ ẩ ẫ ậ
Chữ đặc biệt: đ Đ ơ ờ ớ ở ỡ ợ ư ừ ứ ử ữ ự

- Tính năng một
- Tính năng hai`,
  },
};

// Combined test with all languages in one document
const ALL_LANGUAGES_CONTENT = `# Multilingual Test Document

## English
Convert Markdown to PDF in 30 seconds.

## Italiano
Converti Markdown in PDF in 30 secondi. Caratteri: àèéìòù

## Español
Convierte Markdown a PDF en 30 segundos. Caracteres: áéíóúü ñ ¿¡

## 日本語
30秒でMarkdownをPDFに変換。ひらがな: あいうえお カタカナ: アイウエオ 漢字: 変換

## 한국어
30초 만에 마크다운을 PDF로 변환. 한글: 가나다라마바사

## 简体中文
30秒内将Markdown转换为PDF。简体字: 转换 文档 技术

## 繁體中文
30秒內將Markdown轉換為PDF。繁體字: 轉換 文檔 技術

## Bahasa Indonesia
Konversi Markdown ke PDF dalam 30 detik.

## Tiếng Việt
Chuyển đổi Markdown sang PDF trong 30 giây. Dấu: à á ả ã ạ đ

---

| Language | Hello | Thank you |
|----------|-------|-----------|
| English | Hello | Thank you |
| 日本語 | こんにちは | ありがとう |
| 한국어 | 안녕하세요 | 감사합니다 |
| 中文 | 你好 | 谢谢 |

**✅ If all text renders correctly, multilingual support is working.**
`;

test.describe("Multilingual PDF Export", () => {
  // These tests are slow due to PDF generation with font loading
  test.slow();

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should export PDF with all languages combined", async ({ page }) => {
    // Expand paste area
    await page.getByRole("button", { name: "paste Markdown" }).click();

    // Paste multilingual content
    const textarea = page.getByPlaceholder("Paste your Markdown here…");
    await textarea.fill(ALL_LANGUAGES_CONTENT);

    // Wait for preview to update
    await expect(page.getByText("Ready to export")).toBeVisible();

    // Set up download listener
    const downloadPromise = page.waitForEvent("download", { timeout: 60000 });

    // Click PDF button
    const pdfButton = page.getByRole("button", { name: "To PDF" });
    await pdfButton.click();

    // Wait for download
    const download = await downloadPromise;

    // Save to temp location and verify
    const downloadPath = path.join("tmp", `multilingual-all-${Date.now()}.pdf`);
    await download.saveAs(downloadPath);

    // Verify file exists and has reasonable size
    const stats = fs.statSync(downloadPath);
    expect(stats.size).toBeGreaterThan(MIN_PDF_SIZE);

    // Clean up
    fs.unlinkSync(downloadPath);
  });

  test("should export PDF with Japanese content", async ({ page }) => {
    const { content } = MULTILINGUAL_CONTENT.japanese;

    await page.getByRole("button", { name: "paste Markdown" }).click();
    const textarea = page.getByPlaceholder("Paste your Markdown here…");
    await textarea.fill(content);

    await expect(page.getByText("Ready to export")).toBeVisible();

    const downloadPromise = page.waitForEvent("download", { timeout: 60000 });
    await page.getByRole("button", { name: "To PDF" }).click();

    const download = await downloadPromise;
    const downloadPath = path.join("tmp", `multilingual-ja-${Date.now()}.pdf`);
    await download.saveAs(downloadPath);

    const stats = fs.statSync(downloadPath);
    expect(stats.size).toBeGreaterThan(MIN_PDF_SIZE);

    fs.unlinkSync(downloadPath);
  });

  test("should export PDF with Korean content", async ({ page }) => {
    const { content } = MULTILINGUAL_CONTENT.korean;

    await page.getByRole("button", { name: "paste Markdown" }).click();
    const textarea = page.getByPlaceholder("Paste your Markdown here…");
    await textarea.fill(content);

    await expect(page.getByText("Ready to export")).toBeVisible();

    const downloadPromise = page.waitForEvent("download", { timeout: 60000 });
    await page.getByRole("button", { name: "To PDF" }).click();

    const download = await downloadPromise;
    const downloadPath = path.join("tmp", `multilingual-ko-${Date.now()}.pdf`);
    await download.saveAs(downloadPath);

    const stats = fs.statSync(downloadPath);
    expect(stats.size).toBeGreaterThan(MIN_PDF_SIZE);

    fs.unlinkSync(downloadPath);
  });

  test("should export PDF with Simplified Chinese content", async ({ page }) => {
    const { content } = MULTILINGUAL_CONTENT.simplifiedChinese;

    await page.getByRole("button", { name: "paste Markdown" }).click();
    const textarea = page.getByPlaceholder("Paste your Markdown here…");
    await textarea.fill(content);

    await expect(page.getByText("Ready to export")).toBeVisible();

    const downloadPromise = page.waitForEvent("download", { timeout: 60000 });
    await page.getByRole("button", { name: "To PDF" }).click();

    const download = await downloadPromise;
    const downloadPath = path.join("tmp", `multilingual-zh-hans-${Date.now()}.pdf`);
    await download.saveAs(downloadPath);

    const stats = fs.statSync(downloadPath);
    expect(stats.size).toBeGreaterThan(MIN_PDF_SIZE);

    fs.unlinkSync(downloadPath);
  });

  test("should export PDF with Traditional Chinese content", async ({ page }) => {
    const { content } = MULTILINGUAL_CONTENT.traditionalChinese;

    await page.getByRole("button", { name: "paste Markdown" }).click();
    const textarea = page.getByPlaceholder("Paste your Markdown here…");
    await textarea.fill(content);

    await expect(page.getByText("Ready to export")).toBeVisible();

    const downloadPromise = page.waitForEvent("download", { timeout: 60000 });
    await page.getByRole("button", { name: "To PDF" }).click();

    const download = await downloadPromise;
    const downloadPath = path.join("tmp", `multilingual-zh-hant-${Date.now()}.pdf`);
    await download.saveAs(downloadPath);

    const stats = fs.statSync(downloadPath);
    expect(stats.size).toBeGreaterThan(MIN_PDF_SIZE);

    fs.unlinkSync(downloadPath);
  });

  test("should export PDF with Vietnamese content", async ({ page }) => {
    const { content } = MULTILINGUAL_CONTENT.vietnamese;

    await page.getByRole("button", { name: "paste Markdown" }).click();
    const textarea = page.getByPlaceholder("Paste your Markdown here…");
    await textarea.fill(content);

    await expect(page.getByText("Ready to export")).toBeVisible();

    const downloadPromise = page.waitForEvent("download", { timeout: 60000 });
    await page.getByRole("button", { name: "To PDF" }).click();

    const download = await downloadPromise;
    const downloadPath = path.join("tmp", `multilingual-vi-${Date.now()}.pdf`);
    await download.saveAs(downloadPath);

    const stats = fs.statSync(downloadPath);
    expect(stats.size).toBeGreaterThan(MIN_PDF_SIZE);

    fs.unlinkSync(downloadPath);
  });
});

test.describe("Multilingual File Upload", () => {
  // These tests are slow due to PDF generation with font loading
  test.slow();

  test("should export PDF from multilingual test fixture file", async ({ page }) => {
    await page.goto("/");

    // Upload the multilingual test file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(path.join(process.cwd(), "test-fixtures/multilingual-test.md"));

    // Wait for file to be processed
    await expect(page.getByText("Ready to export")).toBeVisible();

    // Set up download listener with longer timeout for large file
    const downloadPromise = page.waitForEvent("download", { timeout: 60000 });

    // Click PDF button
    await page.getByRole("button", { name: "To PDF" }).click();

    // Wait for download
    const download = await downloadPromise;

    // Verify filename
    expect(download.suggestedFilename()).toBe("multilingual-test.pdf");

    // Save and verify size
    const downloadPath = path.join("tmp", `multilingual-fixture-${Date.now()}.pdf`);
    await download.saveAs(downloadPath);

    const stats = fs.statSync(downloadPath);
    // This file is larger due to all the content
    expect(stats.size).toBeGreaterThan(50000);

    fs.unlinkSync(downloadPath);
  });
});

test.describe("Special Characters Export", () => {
  // These tests are slow due to PDF generation with font loading
  test.slow();

  test("should export PDF with currency symbols", async ({ page }) => {
    await page.goto("/");

    const content = `# Currency Symbols Test

| Currency | Symbol |
|----------|--------|
| Dollar | $ |
| Euro | € |
| Pound | £ |
| Yen | ¥ |
| Won | ₩ |
| Dong | ₫ |
| Rupiah | Rp |

All currency symbols should render correctly.`;

    await page.getByRole("button", { name: "paste Markdown" }).click();
    const textarea = page.getByPlaceholder("Paste your Markdown here…");
    await textarea.fill(content);

    await expect(page.getByText("Ready to export")).toBeVisible();

    const downloadPromise = page.waitForEvent("download", { timeout: 60000 });
    await page.getByRole("button", { name: "To PDF" }).click();

    const download = await downloadPromise;
    const downloadPath = path.join("tmp", `currency-${Date.now()}.pdf`);
    await download.saveAs(downloadPath);

    const stats = fs.statSync(downloadPath);
    expect(stats.size).toBeGreaterThan(MIN_PDF_SIZE);

    fs.unlinkSync(downloadPath);
  });

  test("should export PDF with arrows and math symbols", async ({ page }) => {
    await page.goto("/");

    const content = `# Symbols Test

## Arrows
→ ← ↑ ↓ ↔ ⇒ ⇐ ⇑ ⇓ ⇔

## Math
+ − × ÷ = ≠ ≈ < > ≤ ≥ ± ∞ √ ∑ ∏ ∫ π

## Checkmarks
✓ ✗ ✔ ✘

All symbols should render correctly.`;

    await page.getByRole("button", { name: "paste Markdown" }).click();
    const textarea = page.getByPlaceholder("Paste your Markdown here…");
    await textarea.fill(content);

    await expect(page.getByText("Ready to export")).toBeVisible();

    const downloadPromise = page.waitForEvent("download", { timeout: 60000 });
    await page.getByRole("button", { name: "To PDF" }).click();

    const download = await downloadPromise;
    const downloadPath = path.join("tmp", `symbols-${Date.now()}.pdf`);
    await download.saveAs(downloadPath);

    const stats = fs.statSync(downloadPath);
    expect(stats.size).toBeGreaterThan(MIN_PDF_SIZE);

    fs.unlinkSync(downloadPath);
  });
});
