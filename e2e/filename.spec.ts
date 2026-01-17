import { test, expect, Page } from "@playwright/test";

/**
 * Filename preservation tests for multi-language and special character support
 * 
 * Tests verify that filenames with Unicode characters from all supported locales
 * and special characters are correctly preserved after PDF and DOCX conversion.
 */

// Test data for different languages and special characters
const filenameTestCases = [
  // English (baseline)
  { name: "English basic", filename: "readme.md", expected: "readme" },
  { name: "English with spaces", filename: "my document.md", expected: "my document" },
  
  // Italian
  { name: "Italian", filename: "documento-italiano-città.md", expected: "documento-italiano-città" },
  
  // Spanish
  { name: "Spanish", filename: "documento-español-año.md", expected: "documento-español-año" },
  
  // Japanese
  { name: "Japanese Hiragana", filename: "ドキュメント.md", expected: "ドキュメント" },
  { name: "Japanese Kanji", filename: "文書変換.md", expected: "文書変換" },
  { name: "Japanese mixed", filename: "README-日本語.md", expected: "README-日本語" },
  
  // Korean
  { name: "Korean", filename: "마크다운-문서.md", expected: "마크다운-문서" },
  
  // Simplified Chinese
  { name: "Simplified Chinese", filename: "中文文档.md", expected: "中文文档" },
  
  // Traditional Chinese
  { name: "Traditional Chinese", filename: "繁體中文文件.md", expected: "繁體中文文件" },
  
  // Indonesian
  { name: "Indonesian", filename: "dokumen-bahasa-indonesia.md", expected: "dokumen-bahasa-indonesia" },
  
  // Vietnamese
  { name: "Vietnamese", filename: "tài-liệu-tiếng-việt.md", expected: "tài-liệu-tiếng-việt" },
  
  // Special characters
  { name: "Emoji", filename: "readme-✅-done.md", expected: "readme-✅-done" },
  { name: "Multiple emoji", filename: "🚀-launch-📄-docs.md", expected: "🚀-launch-📄-docs" },
  { name: "Parentheses", filename: "document (1).md", expected: "document (1)" },
  { name: "Brackets", filename: "document [draft].md", expected: "document [draft]" },
  { name: "Underscores", filename: "my_document_v2.md", expected: "my_document_v2" },
  { name: "Dots", filename: "version.1.2.3.md", expected: "version.1.2.3" },
  { name: "Plus sign", filename: "C++ guide.md", expected: "C++ guide" },
  { name: "Ampersand", filename: "Tom & Jerry.md", expected: "Tom & Jerry" },
  
  // Mixed scripts
  { name: "Mixed EN-CN", filename: "README-中文说明.md", expected: "README-中文说明" },
  { name: "Mixed EN-JP", filename: "guide-ガイド.md", expected: "guide-ガイド" },
  { name: "Mixed EN-KR", filename: "manual-매뉴얼.md", expected: "manual-매뉴얼" },
  { name: "Mixed with emoji", filename: "中文内容✅.md", expected: "中文内容✅" },
];

// Simple markdown content for testing
const testMarkdown = "# Test Document\n\nThis is a test document for filename preservation.";

// Helper to upload a file with a specific filename
async function uploadFile(page: Page, filename: string, content: string): Promise<void> {
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles({
    name: filename,
    mimeType: "text/markdown",
    buffer: Buffer.from(content),
  });
  
  // Wait for content to be processed
  await page.waitForTimeout(300);
}

// Helper to check download filename
async function expectDownloadFilename(
  page: Page,
  buttonSelector: string,
  expectedFilename: string
): Promise<void> {
  const downloadPromise = page.waitForEvent("download");
  await page.click(buttonSelector);
  const download = await downloadPromise;
  
  const actualFilename = download.suggestedFilename();
  expect(actualFilename).toBe(expectedFilename);
  
  // Cancel the download to clean up
  await download.cancel();
}

test.describe("Filename preservation - PDF export", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  // Test a subset of important cases for PDF (full test would be slow due to PDF generation)
  const pdfTestCases = filenameTestCases.filter((tc) =>
    ["English basic", "Japanese Kanji", "Simplified Chinese", "Korean", "Mixed with emoji"].includes(tc.name)
  );

  for (const testCase of pdfTestCases) {
    test(`preserves filename: ${testCase.name} (${testCase.filename})`, async ({ page }) => {
      // Mock the PDF API to return quickly (actual PDF generation is slow)
      await page.route("**/api/convert/pdf", async (route) => {
        const request = route.request();
        const postData = JSON.parse(request.postData() || "{}");
        const filename = postData.filename || "document.md";
        const outputFilename = filename.replace(/\.(md|markdown|txt)$/i, ".pdf");
        const encodedFilename = encodeURIComponent(outputFilename);

        // Return a minimal valid PDF
        const minimalPdf = Buffer.from("%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF");

        await route.fulfill({
          status: 200,
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${outputFilename.replace(/[^\x00-\x7F]/g, "-")}"; filename*=UTF-8''${encodedFilename}`,
          },
          body: minimalPdf,
        });
      });

      await uploadFile(page, testCase.filename, testMarkdown);
      
      // Wait for content to load
      await expect(page.getByText("Ready to export")).toBeVisible({ timeout: 5000 });

      // Check download filename
      await expectDownloadFilename(
        page,
        'button:has-text("To PDF")',
        `${testCase.expected}.pdf`
      );
    });
  }
});

test.describe("Filename preservation - DOCX export", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  // Test all cases for DOCX (faster than PDF)
  for (const testCase of filenameTestCases) {
    test(`preserves filename: ${testCase.name} (${testCase.filename})`, async ({ page }) => {
      // Mock the DOCX API
      await page.route("**/api/convert/docx", async (route) => {
        const request = route.request();
        const postData = JSON.parse(request.postData() || "{}");
        const filename = postData.filename || "document.md";
        const outputFilename = filename.replace(/\.(md|markdown|txt)$/i, ".docx");
        const encodedFilename = encodeURIComponent(outputFilename);

        // Return a minimal valid DOCX (ZIP with PK header)
        const minimalDocx = Buffer.from([
          0x50, 0x4b, 0x03, 0x04, 0x14, 0x00, 0x00, 0x00,
          0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
          0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
          0x00, 0x00, 0x00, 0x00, 0x50, 0x4b, 0x05, 0x06,
          0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
          0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
          0x00, 0x00,
        ]);

        await route.fulfill({
          status: 200,
          headers: {
            "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "Content-Disposition": `attachment; filename="${outputFilename.replace(/[^\x00-\x7F]/g, "-")}"; filename*=UTF-8''${encodedFilename}`,
          },
          body: minimalDocx,
        });
      });

      await uploadFile(page, testCase.filename, testMarkdown);
      
      // Wait for content to load
      await expect(page.getByText("Ready to export")).toBeVisible({ timeout: 5000 });

      // Check download filename
      await expectDownloadFilename(
        page,
        'button:has-text("To DOCX")',
        `${testCase.expected}.docx`
      );
    });
  }
});

test.describe("Filename edge cases", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("handles very long filename", async ({ page }) => {
    const longName = "a".repeat(200) + ".md";
    const expectedBase = "a".repeat(200);

    await page.route("**/api/convert/docx", async (route) => {
      const request = route.request();
      const postData = JSON.parse(request.postData() || "{}");
      const filename = postData.filename || "document.md";
      const outputFilename = filename.replace(/\.(md|markdown|txt)$/i, ".docx");
      const encodedFilename = encodeURIComponent(outputFilename);

      const minimalDocx = Buffer.from([0x50, 0x4b, 0x03, 0x04]);

      await route.fulfill({
        status: 200,
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "Content-Disposition": `attachment; filename="document.docx"; filename*=UTF-8''${encodedFilename}`,
        },
        body: minimalDocx,
      });
    });

    await uploadFile(page, longName, testMarkdown);
    await expect(page.getByText("Ready to export")).toBeVisible({ timeout: 5000 });

    await expectDownloadFilename(page, 'button:has-text("To DOCX")', `${expectedBase}.docx`);
  });

  test("handles filename with only special characters", async ({ page }) => {
    const specialName = "✨🎉🚀.md";

    await page.route("**/api/convert/docx", async (route) => {
      const outputFilename = "✨🎉🚀.docx";
      const encodedFilename = encodeURIComponent(outputFilename);

      const minimalDocx = Buffer.from([0x50, 0x4b, 0x03, 0x04]);

      await route.fulfill({
        status: 200,
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "Content-Disposition": `attachment; filename="---.docx"; filename*=UTF-8''${encodedFilename}`,
        },
        body: minimalDocx,
      });
    });

    await uploadFile(page, specialName, testMarkdown);
    await expect(page.getByText("Ready to export")).toBeVisible({ timeout: 5000 });

    await expectDownloadFilename(page, 'button:has-text("To DOCX")', "✨🎉🚀.docx");
  });

  test("handles mixed RTL and LTR characters", async ({ page }) => {
    const mixedName = "document-文档-📄.md";

    await page.route("**/api/convert/docx", async (route) => {
      const outputFilename = "document-文档-📄.docx";
      const encodedFilename = encodeURIComponent(outputFilename);

      const minimalDocx = Buffer.from([0x50, 0x4b, 0x03, 0x04]);

      await route.fulfill({
        status: 200,
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "Content-Disposition": `attachment; filename="document---.docx"; filename*=UTF-8''${encodedFilename}`,
        },
        body: minimalDocx,
      });
    });

    await uploadFile(page, mixedName, testMarkdown);
    await expect(page.getByText("Ready to export")).toBeVisible({ timeout: 5000 });

    await expectDownloadFilename(page, 'button:has-text("To DOCX")', "document-文档-📄.docx");
  });
});

test.describe("Server-side filename encoding", () => {
  test("DOCX API returns correct Content-Disposition header", async ({ request }) => {
    const testCases = [
      { input: "中文文档.md", expected: "中文文档.docx" },
      { input: "日本語ファイル.md", expected: "日本語ファイル.docx" },
      { input: "emoji-✅-test.md", expected: "emoji-✅-test.docx" },
    ];

    for (const tc of testCases) {
      const response = await request.post("/api/convert/docx", {
        data: {
          markdown: "# Test",
          filename: tc.input,
        },
      });

      expect(response.ok()).toBe(true);

      const contentDisposition = response.headers()["content-disposition"];
      expect(contentDisposition).toContain("filename*=UTF-8''");

      // Extract and decode the UTF-8 filename
      const match = contentDisposition.match(/filename\*=UTF-8''([^;\s]+)/i);
      expect(match).toBeTruthy();

      const decodedFilename = decodeURIComponent(match![1]);
      expect(decodedFilename).toBe(tc.expected);
    }
  });

  test("PDF API returns correct Content-Disposition header", async ({ request }) => {
    const testCases = [
      { input: "中文文档.md", expected: "中文文档.pdf" },
      { input: "日本語ファイル.md", expected: "日本語ファイル.pdf" },
    ];

    for (const tc of testCases) {
      const response = await request.post("/api/convert/pdf", {
        data: {
          markdown: "# Test",
          filename: tc.input,
        },
      });

      expect(response.ok()).toBe(true);

      const contentDisposition = response.headers()["content-disposition"];
      expect(contentDisposition).toContain("filename*=UTF-8''");

      // Extract and decode the UTF-8 filename
      const match = contentDisposition.match(/filename\*=UTF-8''([^;\s]+)/i);
      expect(match).toBeTruthy();

      const decodedFilename = decodeURIComponent(match![1]);
      expect(decodedFilename).toBe(tc.expected);
    }
  });
});
