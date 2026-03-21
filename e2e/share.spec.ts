import { test, expect } from "@playwright/test";

/**
 * Mock the Web Share API in the browser context.
 * Must be called before page.goto() to inject before app hydration.
 */
async function mockWebShareAPI(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    let shareCallCount = 0;

    // Must override on Navigator.prototype — Chromium defines these on the prototype
    Object.defineProperty(Navigator.prototype, "canShare", {
      value: () => true,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(Navigator.prototype, "share", {
      value: async (data?: { files?: File[] }) => {
        shareCallCount++;
        (window as unknown as Record<string, unknown>).__shareCallCount = shareCallCount;
        (window as unknown as Record<string, unknown>).__lastShareData = {
          filesCount: data?.files?.length ?? 0,
          fileName: data?.files?.[0]?.name ?? null,
          fileType: data?.files?.[0]?.type ?? null,
        };
        return undefined;
      },
      configurable: true,
      writable: true,
    });
  });
}

const MOBILE_VIEWPORT = { width: 375, height: 812 };
const DESKTOP_VIEWPORT = { width: 1280, height: 720 };

// ============================================================================
// DESKTOP: No changes to existing experience
// ============================================================================
test.describe("Sharing Feature - Desktop (unchanged)", () => {
  test.use({ viewport: DESKTOP_VIEWPORT });

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should show standard download buttons on desktop", async ({ page }) => {
    const pdfButton = page.getByRole("button", { name: "To PDF" });
    const docxButton = page.getByRole("button", { name: "To DOCX" });
    const txtButton = page.getByRole("button", { name: "To TXT" });
    const htmlButton = page.getByRole("button", { name: "To HTML" });

    await expect(pdfButton).toBeVisible();
    await expect(docxButton).toBeVisible();
    await expect(txtButton).toBeVisible();
    await expect(htmlButton).toBeVisible();
  });

  test("should NOT show share buttons on desktop", async ({ page }) => {
    // Share buttons should not exist on desktop even if we could mock the API
    await expect(page.getByTestId("share-pdf-button")).not.toBeVisible();
    await expect(page.getByTestId("share-docx-button")).not.toBeVisible();
  });

  test("should NOT show share buttons on desktop even with Web Share API", async ({ page }) => {
    // Re-navigate with mocked API
    await mockWebShareAPI(page);
    await page.goto("/");

    // Desktop viewport: share buttons should still not appear
    await expect(page.getByTestId("share-pdf-button")).not.toBeVisible();
    await expect(page.getByTestId("share-docx-button")).not.toBeVisible();

    // Standard buttons should still be visible
    await expect(page.getByRole("button", { name: "To PDF" })).toBeVisible();
    await expect(page.getByRole("button", { name: "To DOCX" })).toBeVisible();
  });

  test("export buttons still work on desktop after file upload", async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');

    await fileInput.setInputFiles({
      name: "test.md",
      mimeType: "text/markdown",
      buffer: Buffer.from("# Test Heading\n\nSome content here."),
    });

    await page.waitForTimeout(500);

    // Standard download buttons should be enabled
    await expect(page.getByRole("button", { name: "To PDF" })).toBeEnabled();
    await expect(page.getByRole("button", { name: "To DOCX" })).toBeEnabled();
    await expect(page.getByRole("button", { name: "To TXT" })).toBeEnabled();
    await expect(page.getByRole("button", { name: "To HTML" })).toBeEnabled();
  });
});

// ============================================================================
// MOBILE: Fallback when Web Share API is unavailable
// ============================================================================
test.describe("Sharing Feature - Mobile fallback (no Web Share API)", () => {
  test.use({ viewport: MOBILE_VIEWPORT });

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should show export placeholder on mobile without content", async ({ page }) => {
    await page.waitForTimeout(500);
    await expect(page.getByTestId("mobile-export-placeholder")).toBeVisible();
  });

  test("should show standard download buttons on mobile after loading content", async ({ page }) => {
    // Load content first — export buttons only appear after content is loaded on mobile
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: "test.md",
      mimeType: "text/markdown",
      buffer: Buffer.from("# Test"),
    });
    await page.waitForTimeout(500);

    // Without Web Share API, mobile should fallback to standard buttons
    await expect(page.getByRole("button", { name: "To PDF" })).toBeVisible();
    await expect(page.getByRole("button", { name: "To DOCX" })).toBeVisible();
    await expect(page.getByRole("button", { name: "To TXT" })).toBeVisible();
    await expect(page.getByRole("button", { name: "To HTML" })).toBeVisible();
  });

  test("should NOT show share buttons on mobile without Web Share API", async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: "test.md",
      mimeType: "text/markdown",
      buffer: Buffer.from("# Test"),
    });
    await page.waitForTimeout(500);

    await expect(page.getByTestId("share-pdf-button")).not.toBeVisible();
    await expect(page.getByTestId("share-docx-button")).not.toBeVisible();
  });
});

// ============================================================================
// MOBILE: Share-first UI when Web Share API is available
// ============================================================================
test.describe("Sharing Feature - Mobile with Web Share API", () => {
  test.use({ viewport: MOBILE_VIEWPORT });

  test.beforeEach(async ({ page }) => {
    await mockWebShareAPI(page);
    await page.goto("/");
  });

  test("should show export placeholder before content on mobile", async ({ page }) => {
    await page.waitForTimeout(500);
    await expect(page.getByTestId("mobile-export-placeholder")).toBeVisible();
  });

  test("should show share buttons as primary on mobile after loading content", async ({ page }) => {
    // Load content first — export row shows placeholder until content is loaded
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: "test.md",
      mimeType: "text/markdown",
      buffer: Buffer.from("# Test"),
    });
    await page.waitForTimeout(500);

    const sharePdf = page.getByTestId("share-pdf-button");
    const shareDocx = page.getByTestId("share-docx-button");

    await expect(sharePdf).toBeVisible({ timeout: 5000 });
    await expect(shareDocx).toBeVisible();

    await expect(sharePdf).toContainText("Share as PDF");
    await expect(shareDocx).toContainText("Share as DOCX");
  });

  test("should show More button with save/export options on mobile after loading content", async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: "test.md",
      mimeType: "text/markdown",
      buffer: Buffer.from("# Test"),
    });
    await page.waitForTimeout(500);

    // More button should be visible
    const moreBtn = page.getByTestId("more-options-button");
    await expect(moreBtn).toBeVisible();

    // Open menu and verify options
    await moreBtn.click();
    const menu = page.getByTestId("more-options-menu");
    await expect(menu).toBeVisible();

    await expect(page.getByTestId("save-pdf-button")).toBeVisible();
    await expect(page.getByTestId("save-docx-button")).toBeVisible();
    await expect(menu.getByText(/TXT/)).toBeVisible();
    await expect(menu.getByText(/HTML/)).toBeVisible();
  });

  test("share button generates file then shows tap-to-share button", async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');

    await fileInput.setInputFiles({
      name: "test-share.md",
      mimeType: "text/markdown",
      buffer: Buffer.from("# Share Test\n\nThis will be shared."),
    });

    await page.waitForTimeout(500);

    // Mock the PDF API response
    await page.route("**/api/convert/pdf", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/pdf",
        headers: {
          "Content-Disposition": 'attachment; filename="test-share.pdf"',
        },
        body: Buffer.from("%PDF-1.4 fake pdf content"),
      });
    });

    // Step 1: Click share — generates the file
    const sharePdf = page.getByTestId("share-pdf-button");
    await sharePdf.click();

    // Step 2: Wait for "Tap to share" button to appear
    const tapToShare = page.getByTestId("share-send-button");
    await expect(tapToShare).toBeVisible({ timeout: 10000 });
    await expect(tapToShare).toContainText("Tap to share");
    await expect(tapToShare).toContainText("test-share.pdf");

    // Step 3: Tap to trigger native share
    await tapToShare.click();

    // Wait for navigator.share to be called
    await page.waitForFunction(() => {
      return (window as unknown as Record<string, unknown>).__shareCallCount === 1;
    }, null, { timeout: 10000 });

    // Verify navigator.share was called with correct data
    const shareData = await page.evaluate(() => {
      return (window as unknown as Record<string, unknown>).__lastShareData;
    });

    expect(shareData).toEqual({
      filesCount: 1,
      fileName: "test-share.pdf",
      fileType: "application/pdf",
    });
  });

  test("save PDF button downloads file instead of sharing on mobile", async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');

    await fileInput.setInputFiles({
      name: "test-save.md",
      mimeType: "text/markdown",
      buffer: Buffer.from("# Save Test"),
    });

    await page.waitForTimeout(500);

    // Mock the PDF API response
    await page.route("**/api/convert/pdf", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/pdf",
        headers: {
          "Content-Disposition": 'attachment; filename="test-save.pdf"',
        },
        body: Buffer.from("%PDF-1.4 fake pdf content"),
      });
    });

    // Open More menu, then click Save PDF
    await page.getByTestId("more-options-button").click();
    const savePdf = page.getByTestId("save-pdf-button");

    const downloadPromise = page.waitForEvent("download");
    await savePdf.click();

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe("test-save.pdf");
  });

  test("DOCX share works via pre-generated cache or two-step fallback", async ({ page }) => {
    // Mock the DOCX API - return valid ZIP header (PK magic bytes)
    const pkHeader = Buffer.from([0x50, 0x4b, 0x03, 0x04]);
    const docxBody = Buffer.concat([pkHeader, Buffer.alloc(100, 0)]);

    await page.route("**/api/convert/docx", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers: {
          "Content-Disposition": 'attachment; filename="test-docx.docx"',
        },
        body: docxBody,
      });
    });

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: "test-docx.md",
      mimeType: "text/markdown",
      buffer: Buffer.from("# DOCX Share Test"),
    });

    // Wait for pre-generation to complete in background
    await page.waitForTimeout(3000);

    // Tap share — should use cached blob (instant, no two-step)
    const shareDocx = page.getByTestId("share-docx-button");
    await shareDocx.click();

    // navigator.share should be called (either instant or via tap-to-share fallback)
    const tapToShare = page.getByTestId("share-send-button");
    const isTwoStep = await tapToShare.isVisible().catch(() => false);

    if (isTwoStep) {
      // Fallback: tap the "Tap to share" button
      await tapToShare.click();
    }

    await page.waitForFunction(() => {
      return (window as unknown as Record<string, unknown>).__shareCallCount === 1;
    }, null, { timeout: 10000 });

    const shareData = await page.evaluate(() => {
      return (window as unknown as Record<string, unknown>).__lastShareData;
    });

    expect(shareData).toMatchObject({
      filesCount: 1,
      fileName: "test-docx.docx",
    });
  });

  test("PDF share uses application/pdf MIME type", async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');

    await fileInput.setInputFiles({
      name: "test-pdf-mime.md",
      mimeType: "text/markdown",
      buffer: Buffer.from("# PDF MIME Test"),
    });

    await page.waitForTimeout(500);

    await page.route("**/api/convert/pdf", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/pdf",
        headers: {
          "Content-Disposition": 'attachment; filename="test-pdf-mime.pdf"',
        },
        body: Buffer.from("%PDF-1.4 fake pdf"),
      });
    });

    // Generate
    await page.getByTestId("share-pdf-button").click();
    const tapToShare = page.getByTestId("share-send-button");
    await expect(tapToShare).toBeVisible({ timeout: 10000 });

    // Share
    await tapToShare.click();

    await page.waitForFunction(() => {
      return (window as unknown as Record<string, unknown>).__shareCallCount === 1;
    }, null, { timeout: 10000 });

    const shareData = await page.evaluate(() => {
      return (window as unknown as Record<string, unknown>).__lastShareData;
    });

    // PDF keeps its native MIME type (universally supported)
    expect(shareData).toEqual({
      filesCount: 1,
      fileName: "test-pdf-mime.pdf",
      fileType: "application/pdf",
    });
  });
});
