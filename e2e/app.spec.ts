import { test, expect } from "@playwright/test";
import path from "path";

test.describe("Markdown Free - App Layout", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should load with correct Header", async ({ page }) => {
    // Check logo
    const logo = page.locator("header").getByText("md");
    await expect(logo).toBeVisible();

    // Check brand name
    const brandName = page.locator("header").getByText("Markdown Free");
    await expect(brandName).toBeVisible();

    // Check nav links (visible on desktop)
    const aboutLink = page.locator("header").getByRole("link", { name: "About" });
    const privacyLink = page.locator("header").getByRole("link", { name: "Privacy" });
    const feedbackButton = page.locator("header").getByRole("button", { name: "Feedback" });

    await expect(aboutLink).toBeVisible();
    await expect(privacyLink).toBeVisible();
    await expect(feedbackButton).toBeVisible();
  });

  test("should load with correct Hero section", async ({ page }) => {
    // Check badge
    const badge = page.getByText("Free • No signup • Instant export");
    await expect(badge).toBeVisible();

    // Check headline
    const headline = page.getByRole("heading", {
      name: "Preview & convert Markdown files in one click",
    });
    await expect(headline).toBeVisible();

    // Check subheadline contains key text
    const subheadline = page.getByText(/Upload your .md file/);
    await expect(subheadline).toBeVisible();
  });

  test("should load with correct Footer", async ({ page }) => {
    const copyright = page.getByText("© 2025 Markdown Free");
    await expect(copyright).toBeVisible();

    const privacyNotice = page.getByText("No accounts • No tracking");
    await expect(privacyNotice).toBeVisible();
  });

  test("should have disabled export buttons initially", async ({ page }) => {
    const pdfButton = page.getByRole("button", { name: "To PDF" });
    const txtButton = page.getByRole("button", { name: "To TXT" });
    const htmlButton = page.getByRole("button", { name: "To HTML" });

    await expect(pdfButton).toBeDisabled();
    await expect(txtButton).toBeDisabled();
    await expect(htmlButton).toBeDisabled();
  });

  test("should show default preview content", async ({ page }) => {
    const previewHeading = page.getByRole("heading", { name: "How it works" });
    await expect(previewHeading).toBeVisible();

    const previewBadge = page.getByText("Waiting for Markdown…");
    await expect(previewBadge).toBeVisible();
  });
});

test.describe("Markdown Free - Upload Card", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should show upload card with correct content", async ({ page }) => {
    const uploadText = page.getByText("Drag & drop your Markdown file");
    await expect(uploadText).toBeVisible();

    const supportedFormats = page.getByText(/Supports .md, .markdown, .txt/);
    await expect(supportedFormats).toBeVisible();

    const statusText = page.getByText("No file selected yet");
    await expect(statusText).toBeVisible();
  });

  test("should change border color on drag over", async ({ page }) => {
    const uploadCard = page.locator('[class*="border-dashed"]').first();

    // Get initial border class
    const initialClasses = await uploadCard.getAttribute("class");
    expect(initialClasses).toContain("border-slate-200");

    // Simulate drag over using evaluate to trigger native events
    await uploadCard.evaluate((el) => {
      const event = new DragEvent("dragover", {
        bubbles: true,
        cancelable: true,
      });
      el.dispatchEvent(event);
    });

    // Wait for state update
    await page.waitForTimeout(100);

    // Check for emerald border
    const updatedClasses = await uploadCard.getAttribute("class");
    expect(updatedClasses).toContain("border-emerald-400");
  });

  test("should revert border color on drag leave", async ({ page }) => {
    const uploadCard = page.locator('[class*="border-dashed"]').first();

    // Simulate drag over
    await uploadCard.evaluate((el) => {
      const event = new DragEvent("dragover", {
        bubbles: true,
        cancelable: true,
      });
      el.dispatchEvent(event);
    });
    await page.waitForTimeout(100);

    // Simulate drag leave
    await uploadCard.evaluate((el) => {
      const event = new DragEvent("dragleave", {
        bubbles: true,
        cancelable: true,
      });
      el.dispatchEvent(event);
    });
    await page.waitForTimeout(100);

    // Check border reverted
    const classes = await uploadCard.getAttribute("class");
    expect(classes).toContain("border-slate-200");
  });
});

test.describe("Markdown Free - Paste Area", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("clicking 'Or paste Markdown' reveals the text area", async ({ page }) => {
    // Initially, paste area should not be visible
    const pasteLabel = page.getByText("Pasted Markdown", { exact: false });
    await expect(pasteLabel).not.toBeVisible();

    // Click the toggle
    const pasteToggle = page.getByRole("button", {
      name: "Or paste Markdown instead",
    });
    await pasteToggle.click();

    // Paste area should now be visible
    await expect(pasteLabel).toBeVisible();

    // Textarea should be visible and focused
    const textarea = page.getByPlaceholder("Paste your Markdown here…");
    await expect(textarea).toBeVisible();
    await expect(textarea).toBeFocused();
  });

  test("clicking toggle again hides the paste area", async ({ page }) => {
    const pasteToggle = page.getByRole("button", {
      name: "Or paste Markdown instead",
    });

    // Open paste area
    await pasteToggle.click();
    const pasteLabel = page.getByText("Pasted Markdown", { exact: false });
    await expect(pasteLabel).toBeVisible();

    // Close paste area
    await pasteToggle.click();
    await expect(pasteLabel).not.toBeVisible();
  });

  test("typing in paste area updates state after debounce", async ({ page }) => {
    // Open paste area
    const pasteToggle = page.getByRole("button", {
      name: "Or paste Markdown instead",
    });
    await pasteToggle.click();

    // Type markdown content
    const textarea = page.getByPlaceholder("Paste your Markdown here…");
    await textarea.fill("# Hello World\n\nThis is a test.");

    // Wait for debounce (250ms + buffer)
    await page.waitForTimeout(400);

    // Check that preview badge updated
    const readyBadge = page.getByText("Ready to export (pasted text)");
    await expect(readyBadge).toBeVisible();

    // Check that buttons are enabled
    const pdfButton = page.getByRole("button", { name: "To PDF" });
    await expect(pdfButton).toBeEnabled();
  });
});

test.describe("Markdown Free - File Upload", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("uploading a valid .md file updates status and enables buttons", async ({
    page,
  }) => {
    // Create a test file
    const fileInput = page.locator('input[type="file"]');

    // Upload a markdown file
    await fileInput.setInputFiles({
      name: "test.md",
      mimeType: "text/markdown",
      buffer: Buffer.from("# Test File\n\nThis is test content."),
    });

    // Wait for file processing
    await page.waitForTimeout(200);

    // Check status shows filename
    const statusText = page.getByText(/test\.md/);
    await expect(statusText).toBeVisible();

    // Check preview badge shows ready
    const readyBadge = page.getByText("Ready to export (uploaded file)");
    await expect(readyBadge).toBeVisible();

    // Check buttons are enabled
    const pdfButton = page.getByRole("button", { name: "To PDF" });
    const txtButton = page.getByRole("button", { name: "To TXT" });
    const htmlButton = page.getByRole("button", { name: "To HTML" });

    await expect(pdfButton).toBeEnabled();
    await expect(txtButton).toBeEnabled();
    await expect(htmlButton).toBeEnabled();
  });

  test("uploading a .txt file works correctly", async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');

    await fileInput.setInputFiles({
      name: "notes.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("# Notes\n\n- Item 1\n- Item 2"),
    });

    await page.waitForTimeout(200);

    const statusText = page.getByText(/notes\.txt/);
    await expect(statusText).toBeVisible();
  });

  test("uploading an invalid file type shows error", async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');

    // Try to upload an invalid file type
    await fileInput.setInputFiles({
      name: "image.png",
      mimeType: "image/png",
      buffer: Buffer.from("fake image content"),
    });

    await page.waitForTimeout(200);

    // Check error message appears
    const errorText = page.getByText(/Unsupported file type/);
    await expect(errorText).toBeVisible();
  });
});

test.describe("Markdown Free - Preview Card", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("preview renders markdown content when file is uploaded", async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');

    await fileInput.setInputFiles({
      name: "test.md",
      mimeType: "text/markdown",
      buffer: Buffer.from("# Hello World\n\nTest content here."),
    });

    // Wait for markdown to be parsed and rendered
    await page.waitForTimeout(500);

    // Check that the markdown is rendered as HTML (h1 element)
    const heading = page.locator("article h1").getByText("Hello World");
    await expect(heading).toBeVisible();

    // Check paragraph is also rendered
    const paragraph = page.locator("article p").getByText("Test content here.");
    await expect(paragraph).toBeVisible();
  });
});

test.describe("Markdown Free - Navigation", () => {
  test("About page loads correctly", async ({ page }) => {
    await page.goto("/about");

    const heading = page.getByRole("heading", { name: "About Markdown Free" });
    await expect(heading).toBeVisible();

    const content = page.getByText(/Markdown Free is a fast, free/);
    await expect(content).toBeVisible();
  });

  test("Privacy page loads correctly", async ({ page }) => {
    await page.goto("/privacy");

    const heading = page.getByRole("heading", { name: "Privacy Policy" });
    await expect(heading).toBeVisible();

    const content = page.getByText(/Your privacy matters/);
    await expect(content).toBeVisible();
  });

  test("clicking About link navigates to About page", async ({ page }) => {
    await page.goto("/");

    const aboutLink = page.locator("header").getByRole("link", { name: "About" });
    await aboutLink.click();

    await expect(page).toHaveURL("/about");
  });

  test("clicking Privacy link navigates to Privacy page", async ({ page }) => {
    await page.goto("/");

    const privacyLink = page.locator("header").getByRole("link", { name: "Privacy" });
    await privacyLink.click();

    await expect(page).toHaveURL("/privacy");
  });

  test("clicking logo navigates to home", async ({ page }) => {
    await page.goto("/about");

    const logoLink = page.locator("header").getByRole("link", { name: /Markdown Free/ });
    await logoLink.click();

    await expect(page).toHaveURL("/");
  });
});

test.describe("Markdown Free - Export Functionality", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("PDF button shows coming soon toast", async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');

    await fileInput.setInputFiles({
      name: "test.md",
      mimeType: "text/markdown",
      buffer: Buffer.from("# Test\n\nContent"),
    });

    await page.waitForTimeout(500);

    // Click PDF button
    const pdfButton = page.getByRole("button", { name: "To PDF" });
    await pdfButton.click();

    // Should show toast
    await expect(page.getByText("PDF export coming soon!")).toBeVisible();
  });

  test("TXT export triggers download", async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');

    await fileInput.setInputFiles({
      name: "test.md",
      mimeType: "text/markdown",
      buffer: Buffer.from("# Test\n\nContent"),
    });

    await page.waitForTimeout(500);

    // Set up download listener
    const downloadPromise = page.waitForEvent("download");

    // Click TXT button
    const txtButton = page.getByRole("button", { name: "To TXT" });
    await txtButton.click();

    // Verify download was triggered
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe("test.txt");
  });

  test("HTML export triggers download", async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');

    await fileInput.setInputFiles({
      name: "test.md",
      mimeType: "text/markdown",
      buffer: Buffer.from("# Test\n\nContent"),
    });

    await page.waitForTimeout(500);

    // Set up download listener
    const downloadPromise = page.waitForEvent("download");

    // Click HTML button
    const htmlButton = page.getByRole("button", { name: "To HTML" });
    await htmlButton.click();

    // Verify download was triggered
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe("test.html");
  });

  test("export buttons are disabled when no content", async ({ page }) => {
    const pdfButton = page.getByRole("button", { name: "To PDF" });
    const txtButton = page.getByRole("button", { name: "To TXT" });
    const htmlButton = page.getByRole("button", { name: "To HTML" });

    await expect(pdfButton).toBeDisabled();
    await expect(txtButton).toBeDisabled();
    await expect(htmlButton).toBeDisabled();
  });

  test("export buttons are enabled after file upload", async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');

    await fileInput.setInputFiles({
      name: "test.md",
      mimeType: "text/markdown",
      buffer: Buffer.from("# Test"),
    });

    await page.waitForTimeout(500);

    const pdfButton = page.getByRole("button", { name: "To PDF" });
    const txtButton = page.getByRole("button", { name: "To TXT" });
    const htmlButton = page.getByRole("button", { name: "To HTML" });

    await expect(pdfButton).toBeEnabled();
    await expect(txtButton).toBeEnabled();
    await expect(htmlButton).toBeEnabled();
  });
});

test.describe("Markdown Free - File Validation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should reject file over 5MB", async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');

    // Create a 6MB buffer
    const largeBuffer = Buffer.alloc(6 * 1024 * 1024, "x");

    await fileInput.setInputFiles({
      name: "large.md",
      mimeType: "text/markdown",
      buffer: largeBuffer,
    });

    await page.waitForTimeout(300);

    // Should show error
    await expect(page.getByText("File too large. Maximum size is 5MB.")).toBeVisible();
  });
});

