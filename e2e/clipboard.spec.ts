import { test, expect } from "@playwright/test";

const MOBILE_VIEWPORT = { width: 375, height: 812 };
const DESKTOP_VIEWPORT = { width: 1280, height: 720 };

/**
 * Mock the Clipboard API in the browser context.
 * Must be called before page.goto().
 */
async function mockClipboardAPI(
  page: import("@playwright/test").Page,
  content: string = "# Test Document\n\nSome markdown content here."
) {
  await page.addInitScript((clipboardContent: string) => {
    Object.defineProperty(Navigator.prototype, "clipboard", {
      value: {
        readText: async () => clipboardContent,
        writeText: async () => {},
      },
      configurable: true,
      writable: true,
    });
  }, content);
}

/**
 * Mock the Clipboard API to reject with NotAllowedError.
 */
async function mockClipboardDenied(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    Object.defineProperty(Navigator.prototype, "clipboard", {
      value: {
        readText: async () => {
          throw new DOMException("Permission denied", "NotAllowedError");
        },
        writeText: async () => {},
      },
      configurable: true,
      writable: true,
    });
  });
}

/**
 * Mock the Clipboard API to return empty string.
 */
async function mockClipboardEmpty(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    Object.defineProperty(Navigator.prototype, "clipboard", {
      value: {
        readText: async () => "",
        writeText: async () => {},
      },
      configurable: true,
      writable: true,
    });
  });
}

// ============================================================================
// DESKTOP: Unchanged — no clipboard paste button
// ============================================================================
test.describe("Clipboard Paste - Desktop unchanged", () => {
  test.use({ viewport: DESKTOP_VIEWPORT });

  test("should NOT show clipboard paste button on desktop", async ({ page }) => {
    await mockClipboardAPI(page);
    await page.goto("/");
    await expect(page.getByTestId("clipboard-paste-button")).not.toBeVisible();
  });

  test("should show standard paste toggle on desktop", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: "paste Markdown" })).toBeVisible();
  });
});

// ============================================================================
// MOBILE: Clipboard paste button flow
// ============================================================================
test.describe("Clipboard Paste - Mobile with Clipboard API", () => {
  test.use({ viewport: MOBILE_VIEWPORT });

  test("should show clipboard paste button on landing", async ({ page }) => {
    await mockClipboardAPI(page);
    await page.goto("/");
    await page.waitForTimeout(500);

    const pasteBtn = page.getByTestId("clipboard-paste-button");
    await expect(pasteBtn).toBeVisible();
    await expect(pasteBtn).toContainText("Paste from clipboard");
  });

  test("should show fallback links below paste button", async ({ page }) => {
    await mockClipboardAPI(page);
    await page.goto("/");
    await page.waitForTimeout(500);

    await expect(page.getByTestId("type-manually-link")).toBeVisible();
    await expect(page.getByTestId("mobile-choose-file")).toBeVisible();
    await expect(page.getByTestId("mobile-try-sample")).toBeVisible();
  });

  test("should NOT show textarea on landing", async ({ page }) => {
    await mockClipboardAPI(page);
    await page.goto("/");
    await page.waitForTimeout(500);

    await expect(page.locator("#paste-input")).not.toBeVisible();
  });

  test("tapping paste button shows confirmation bar", async ({ page }) => {
    await mockClipboardAPI(page, "# Hello World\n\nThis is test content for clipboard paste.");
    await page.goto("/");
    await page.waitForTimeout(500);

    // Tap paste button
    await page.getByTestId("clipboard-paste-button").click();

    // Confirmation bar should appear
    const confirmed = page.getByTestId("paste-confirmed");
    await expect(confirmed).toBeVisible({ timeout: 5000 });
    await expect(confirmed).toContainText("Pasted");
    await expect(confirmed).toContainText("~1 page");
  });

  test("confirmation bar shows correct page count for long content", async ({ page }) => {
    const longContent = "# Long Document\n\n" + "Lorem ipsum dolor sit amet. ".repeat(200);
    await mockClipboardAPI(page, longContent);
    await page.goto("/");
    await page.waitForTimeout(500);

    await page.getByTestId("clipboard-paste-button").click();

    const confirmed = page.getByTestId("paste-confirmed");
    await expect(confirmed).toBeVisible({ timeout: 5000 });
    // Should show multiple pages
    await expect(confirmed).toContainText("pages");
  });

  test("after paste, edit text link reveals textarea with content", async ({ page }) => {
    await mockClipboardAPI(page, "# Edit Test\n\nSome content.");
    await page.goto("/");
    await page.waitForTimeout(500);

    await page.getByTestId("clipboard-paste-button").click();
    await expect(page.getByTestId("paste-confirmed")).toBeVisible({ timeout: 5000 });

    // Click edit text
    await page.getByTestId("edit-text-link").click();

    // Textarea should appear with content
    const editing = page.getByTestId("paste-editing");
    await expect(editing).toBeVisible();
    const textarea = editing.locator("#paste-input");
    await expect(textarea).toBeVisible();
    const value = await textarea.inputValue();
    expect(value).toContain("# Edit Test");
  });

  test("done editing returns to confirmation bar", async ({ page }) => {
    await mockClipboardAPI(page, "# Done Test");
    await page.goto("/");
    await page.waitForTimeout(500);

    await page.getByTestId("clipboard-paste-button").click();
    await expect(page.getByTestId("paste-confirmed")).toBeVisible({ timeout: 5000 });

    // Edit
    await page.getByTestId("edit-text-link").click();
    await expect(page.getByTestId("paste-editing")).toBeVisible();

    // Done editing
    await page.getByTestId("done-editing-link").click();
    await expect(page.getByTestId("paste-confirmed")).toBeVisible();
  });

  test("paste again resets to landing state", async ({ page }) => {
    await mockClipboardAPI(page, "# Reset Test");
    await page.goto("/");
    await page.waitForTimeout(500);

    await page.getByTestId("clipboard-paste-button").click();
    await expect(page.getByTestId("paste-confirmed")).toBeVisible({ timeout: 5000 });

    // Paste again
    await page.getByTestId("paste-again-link").click();

    // Should be back to button state
    await expect(page.getByTestId("paste-button-zone")).toBeVisible();
    await expect(page.getByTestId("clipboard-paste-button")).toBeVisible();
  });

  test("type manually link reveals textarea", async ({ page }) => {
    await mockClipboardAPI(page);
    await page.goto("/");
    await page.waitForTimeout(500);

    await page.getByTestId("type-manually-link").click();

    // Should show textarea (editing state)
    await expect(page.getByTestId("paste-editing")).toBeVisible();
    await expect(page.locator("#paste-input")).toBeVisible();
  });

  test("try sample loads content and shows confirmation", async ({ page }) => {
    await mockClipboardAPI(page);
    await page.goto("/");
    await page.waitForTimeout(500);

    await page.getByTestId("mobile-try-sample").click();

    // Should transition to pasted state
    await expect(page.getByTestId("paste-confirmed")).toBeVisible({ timeout: 5000 });
    await expect(page.getByTestId("paste-confirmed")).toContainText("Pasted");
  });

  test("after paste, preview updates with rendered content", async ({ page }) => {
    await mockClipboardAPI(page, "# Preview Test\n\n**Bold text** here.");
    await page.goto("/");
    await page.waitForTimeout(500);

    await page.getByTestId("clipboard-paste-button").click();
    await expect(page.getByTestId("paste-confirmed")).toBeVisible({ timeout: 5000 });

    // Preview should render the content
    await page.waitForTimeout(500);
    const article = page.locator("article");
    await expect(article.locator("h1")).toContainText("Preview Test");
    await expect(article.locator("strong")).toContainText("Bold text");
  });

  test("export buttons activate after paste", async ({ page }) => {
    await mockClipboardAPI(page, "# Export Test");
    await page.goto("/");
    await page.waitForTimeout(500);

    // Before paste — export placeholder should be visible
    await expect(page.getByTestId("mobile-export-placeholder")).toBeVisible();

    // Paste
    await page.getByTestId("clipboard-paste-button").click();
    await expect(page.getByTestId("paste-confirmed")).toBeVisible({ timeout: 5000 });

    // Export placeholder should be gone, buttons should be active
    await expect(page.getByTestId("mobile-export-placeholder")).not.toBeVisible();
  });
});

// ============================================================================
// MOBILE: Error handling
// ============================================================================
test.describe("Clipboard Paste - Mobile error handling", () => {
  test.use({ viewport: MOBILE_VIEWPORT });

  test("permission denied shows error and fallback textarea", async ({ page }) => {
    await mockClipboardDenied(page);
    await page.goto("/");
    await page.waitForTimeout(500);

    // Tap paste button
    await page.getByTestId("clipboard-paste-button").click();

    // Should show error and editing state (textarea fallback)
    await expect(page.getByTestId("clipboard-error")).toBeVisible({ timeout: 5000 });
    await expect(page.getByTestId("paste-editing")).toBeVisible();
    await expect(page.locator("#paste-input")).toBeVisible();
  });

  test("empty clipboard shows error message with shake", async ({ page }) => {
    await mockClipboardEmpty(page);
    await page.goto("/");
    await page.waitForTimeout(500);

    // Tap paste button
    await page.getByTestId("clipboard-paste-button").click();

    // Should show error but stay on button state
    await expect(page.getByTestId("clipboard-error")).toBeVisible({ timeout: 5000 });
    await expect(page.getByTestId("clipboard-error")).toContainText("Nothing to paste");
    // Paste button should still be visible
    await expect(page.getByTestId("clipboard-paste-button")).toBeVisible();
  });
});

// ============================================================================
// MOBILE: Fallback when Clipboard API unavailable
// ============================================================================
test.describe("Clipboard Paste - Mobile without Clipboard API", () => {
  test.use({ viewport: MOBILE_VIEWPORT });

  test("should show textarea directly when Clipboard API unavailable", async ({ page }) => {
    // Don't mock clipboard — Playwright's Chromium may or may not have it
    // Instead, explicitly remove it
    await page.addInitScript(() => {
      Object.defineProperty(Navigator.prototype, "clipboard", {
        value: undefined,
        configurable: true,
        writable: true,
      });
    });
    await page.goto("/");
    await page.waitForTimeout(500);

    // Should show textarea directly (no paste button)
    await expect(page.getByTestId("clipboard-paste-button")).not.toBeVisible();
    await expect(page.locator("#paste-input")).toBeVisible();
  });
});

// ============================================================================
// MOBILE: i18n - clipboard paste in other languages
// ============================================================================
const testLocales = [
  { locale: "ja", pasteText: "クリップボードから" },
  { locale: "zh-Hans", pasteText: "从剪贴板" },
  { locale: "es", pasteText: "portapapeles" },
];

for (const { locale, pasteText } of testLocales) {
  test.describe(`Clipboard Paste - ${locale}`, () => {
    test.use({ viewport: MOBILE_VIEWPORT });

    test(`should show localized paste button for ${locale}`, async ({ page }) => {
      await mockClipboardAPI(page);
      await page.goto(`/${locale}`);
      await page.waitForTimeout(500);

      const pasteBtn = page.getByTestId("clipboard-paste-button");
      await expect(pasteBtn).toBeVisible();
      const text = await pasteBtn.textContent();
      expect(text).toContain(pasteText);
    });

    test(`paste flow works for ${locale}`, async ({ page }) => {
      await mockClipboardAPI(page, "# テスト\n\nContent");
      await page.goto(`/${locale}`);
      await page.waitForTimeout(500);

      await page.getByTestId("clipboard-paste-button").click();
      await expect(page.getByTestId("paste-confirmed")).toBeVisible({ timeout: 5000 });
    });
  });
}
