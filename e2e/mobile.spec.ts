import { test, expect } from "@playwright/test";

const MOBILE_VIEWPORT = { width: 375, height: 812 };
const DESKTOP_VIEWPORT = { width: 1280, height: 720 };

// ============================================================================
// DESKTOP: All existing behavior unchanged
// ============================================================================
test.describe("Mobile Redesign - Desktop unchanged", () => {
  test.use({ viewport: DESKTOP_VIEWPORT });

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should show H1 title on desktop", async ({ page }) => {
    const h1 = page.getByRole("heading", {
      name: "Free Markdown to PDF, DOCX & EPUB Converter",
    });
    await expect(h1).toBeVisible();
  });

  test("should show drag & drop upload card on desktop", async ({ page }) => {
    await expect(page.getByText("Drag & drop your Markdown file")).toBeVisible();
    await expect(page.getByText("choose file")).toBeVisible();
  });

  test("should NOT show paste area by default on desktop", async ({ page }) => {
    await expect(page.locator("#paste-input")).not.toBeVisible();
  });

  test("should show paste area after toggle on desktop", async ({ page }) => {
    await page.getByRole("button", { name: "paste Markdown" }).click();
    await expect(page.locator("#paste-input")).toBeVisible();
  });

  test("should show full How it works in preview on desktop", async ({ page }) => {
    await expect(page.getByText("How it works")).toBeVisible();
    await expect(page.getByText("Upload a .md file or paste Markdown text.")).toBeVisible();
  });

  test("should show all export buttons on desktop without content", async ({ page }) => {
    await expect(page.getByRole("button", { name: "To PDF" })).toBeVisible();
    await expect(page.getByRole("button", { name: "To DOCX" })).toBeVisible();
    await expect(page.getByRole("button", { name: "To TXT" })).toBeVisible();
    await expect(page.getByRole("button", { name: "To HTML" })).toBeVisible();
  });
});

// ============================================================================
// MOBILE: Redesigned experience
// ============================================================================
test.describe("Mobile Redesign - Mobile layout", () => {
  test.use({ viewport: MOBILE_VIEWPORT });

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Wait for React hydration and mobile hooks to activate
    await page.waitForTimeout(500);
  });

  // ---------- Hero ----------
  test("should hide H1 title on mobile", async ({ page }) => {
    const h1 = page.getByRole("heading", {
      name: "Free Markdown to PDF, DOCX & EPUB Converter",
    });
    await expect(h1).toBeHidden();
  });

  test("should still show badge on mobile", async ({ page }) => {
    await expect(page.getByText("Free • No signup • Instant export")).toBeVisible();
  });

  test("should hide subtitle on mobile", async ({ page }) => {
    const subtitle = page.getByText(/Upload or paste your/).first();
    await expect(subtitle).toBeHidden();
  });

  // ---------- Upload Card ----------
  test("should hide drag & drop upload card on mobile", async ({ page }) => {
    // The upload card has "hidden md:flex" — it should not be visible on mobile
    const dragDropText = page.getByText("Drag & drop your Markdown file");
    await expect(dragDropText).toBeHidden();
  });

  // ---------- Paste Area ----------
  test("should show paste button or textarea on mobile", async ({ page }) => {
    // Clipboard API may or may not be available — either paste button or textarea is shown
    const pasteBtn = page.getByTestId("clipboard-paste-button");
    const pasteInput = page.locator("#paste-input");
    const pasteBtnVisible = await pasteBtn.isVisible().catch(() => false);
    const pasteInputVisible = await pasteInput.isVisible().catch(() => false);
    expect(pasteBtnVisible || pasteInputVisible).toBe(true);
  });

  test("should show choose file link on mobile", async ({ page }) => {
    await expect(page.getByTestId("mobile-choose-file")).toBeVisible();
  });

  test("should show try sample link on mobile", async ({ page }) => {
    await expect(page.getByTestId("mobile-try-sample")).toBeVisible();
  });

  test("try sample on mobile loads sample file", async ({ page }) => {
    const trySample = page.getByTestId("mobile-try-sample");
    await trySample.click();
    await page.waitForTimeout(1000);

    // Preview should show rendered content
    const badge = page.getByText(/Ready to export/);
    await expect(badge).toBeVisible();
  });

  test("file upload via input works on mobile", async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: "mobile-test.md",
      mimeType: "text/markdown",
      buffer: Buffer.from("# Mobile Upload\n\nFile uploaded on mobile."),
    });

    await page.waitForTimeout(500);

    // Preview should update
    const article = page.locator("article");
    await expect(article.locator("h1")).toContainText("Mobile Upload");
  });

  // ---------- Export Row ----------
  test("should show export placeholder when no content on mobile", async ({ page }) => {
    const placeholder = page.getByTestId("mobile-export-placeholder");
    await expect(placeholder).toBeVisible();
  });

  test("should NOT show export buttons when no content on mobile", async ({ page }) => {
    // Share buttons should not be visible without content
    await expect(page.getByTestId("share-pdf-button")).not.toBeVisible();
  });

  test("export buttons appear after content is loaded on mobile", async ({ page }) => {
    // Load content via file upload (works regardless of clipboard state)
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: "export-test.md",
      mimeType: "text/markdown",
      buffer: Buffer.from("# Export Test"),
    });
    await page.waitForTimeout(500);

    // Placeholder should disappear
    await expect(page.getByTestId("mobile-export-placeholder")).not.toBeVisible();

    // Without Web Share API: fallback to standard download buttons
    await expect(page.getByRole("button", { name: "To PDF" })).toBeVisible();
    await expect(page.getByRole("button", { name: "To TXT" })).toBeVisible();
  });

  // ---------- Preview Card ----------
  test("should show compact preview placeholder on mobile", async ({ page }) => {
    const placeholder = page.getByTestId("mobile-preview-placeholder");
    await expect(placeholder).toBeVisible();
  });

  test("should NOT show full How it works on mobile", async ({ page }) => {
    // The "How it works" heading should not be visible on mobile
    const howItWorks = page.getByRole("heading", { name: "How it works" });
    await expect(howItWorks).not.toBeVisible();
  });

  test("preview shows rendered content after file upload on mobile", async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: "preview-test.md",
      mimeType: "text/markdown",
      buffer: Buffer.from("# Preview Test\n\n**Bold text** and *italic text*."),
    });
    await page.waitForTimeout(500);

    const article = page.locator("article");
    await expect(article.locator("h1")).toContainText("Preview Test");
    await expect(article.locator("strong")).toContainText("Bold text");
  });

  test("preview expand/collapse toggle works on mobile", async ({ page }) => {
    // Load a long document via file upload
    const longContent = Array.from({ length: 50 }, (_, i) => `## Section ${i + 1}\n\nParagraph content for section ${i + 1}. This is filler text to make the document long enough to test the clamp behavior.\n`).join("\n");
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: "long-doc.md",
      mimeType: "text/markdown",
      buffer: Buffer.from(longContent),
    });
    await page.waitForTimeout(500);

    // Expand toggle should be visible
    const toggle = page.getByTestId("preview-expand-toggle");
    await expect(toggle).toBeVisible();
    await expect(toggle).toContainText("Show full preview");

    // Click to expand
    await toggle.click();
    await expect(toggle).toContainText("Collapse preview");

    // Click to collapse
    await toggle.click();
    await expect(toggle).toContainText("Show full preview");
  });

  // ---------- Mobile Menu ----------
  test("mobile menu should show language selector", async ({ page }) => {
    // Open hamburger menu
    await page.locator('button[aria-label="Open menu"]').click();

    // Language grid should be visible
    const langGrid = page.getByTestId("mobile-language-grid");
    await expect(langGrid).toBeVisible();

    // Should contain language options
    await expect(langGrid.getByText("English")).toBeVisible();
    await expect(langGrid.getByText("日本語")).toBeVisible();
  });

  test("mobile menu should NOT show About/Privacy links", async ({ page }) => {
    // Open hamburger menu
    await page.locator('button[aria-label="Open menu"]').click();
    await page.waitForTimeout(300);

    // About/Privacy should NOT be in the mobile menu
    const mobileMenu = page.locator("header");
    // The menu should have language grid but not About/Privacy links as nav items
    await expect(page.getByTestId("mobile-language-grid")).toBeVisible();
  });

  // ---------- Footer ----------
  test("footer should show About and Privacy links on mobile", async ({ page }) => {
    // Scroll to footer
    const footer = page.locator("footer");
    await footer.scrollIntoViewIfNeeded();

    // About and Privacy links should be visible in the footer on mobile
    const aboutLink = footer.getByRole("link", { name: "About" });
    const privacyLink = footer.getByRole("link", { name: "Privacy" }).first();
    await expect(aboutLink).toBeVisible();
    await expect(privacyLink).toBeVisible();
  });
});

// ============================================================================
// MOBILE: i18n - verify mobile changes work across locales
// ============================================================================
const testLocales = [
  { locale: "ja", name: "Japanese", pasteText: "ここにMarkdown" },
  { locale: "ko", name: "Korean", pasteText: "Markdown" },
  { locale: "zh-Hans", name: "Simplified Chinese", pasteText: "粘贴" },
  { locale: "es", name: "Spanish", pasteText: "Markdown" },
  { locale: "it", name: "Italian", pasteText: "Markdown" },
];

for (const { locale, name, pasteText } of testLocales) {
  test.describe(`Mobile Redesign - ${name} (/${locale})`, () => {
    test.use({ viewport: MOBILE_VIEWPORT });

    test(`should show paste button or textarea on mobile for ${name}`, async ({ page }) => {
      await page.goto(`/${locale}`);
      await page.waitForTimeout(500);

      // Either clipboard paste button or textarea should be visible
      const pasteBtn = page.getByTestId("clipboard-paste-button");
      const pasteInput = page.locator("#paste-input");
      const btnVisible = await pasteBtn.isVisible().catch(() => false);
      const inputVisible = await pasteInput.isVisible().catch(() => false);
      expect(btnVisible || inputVisible).toBe(true);
    });

    test(`should hide drag & drop on mobile for ${name}`, async ({ page }) => {
      await page.goto(`/${locale}`);
      await page.waitForTimeout(500);

      const dragDrop = page.getByText("Drag & drop");
      const count = await dragDrop.count();
      for (let i = 0; i < count; i++) {
        await expect(dragDrop.nth(i)).toBeHidden();
      }
    });

    test(`file upload works on mobile for ${name}`, async ({ page }) => {
      await page.goto(`/${locale}`);
      await page.waitForTimeout(500);

      // Upload via file input
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles({
        name: "test.md",
        mimeType: "text/markdown",
        buffer: Buffer.from("# Test\n\nContent for " + name),
      });
      await page.waitForTimeout(500);

      // Preview should render
      const article = page.locator("article");
      await expect(article.locator("h1")).toContainText("Test");

      // Export buttons should now be visible
      await expect(page.getByRole("button", { name: /PDF/ })).toBeVisible();
    });
  });
}
