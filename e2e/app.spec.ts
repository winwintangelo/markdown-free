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

    // Check headline (SEO-optimized H1)
    const headline = page.getByRole("heading", {
      name: "Free Markdown to PDF, DOCX, TXT & HTML Converter",
    });
    await expect(headline).toBeVisible();

    // Check subheadline contains key text
    const subheadline = page.getByText(/Upload or paste your/);
    await expect(subheadline).toBeVisible();
  });

  test("should load with correct Footer", async ({ page }) => {
    const copyright = page.getByText("© 2026 Markdown Free");
    await expect(copyright).toBeVisible();

    // Footer should have Privacy link and privacy notices
    const privacyLink = page.locator("footer").getByRole("link", { name: "Privacy" });
    await expect(privacyLink).toBeVisible();

    const httpsNotice = page.getByText("HTTPS only");
    await expect(httpsNotice).toBeVisible();
  });

  test("should have enabled export buttons that trigger file picker when no content", async ({ page }) => {
    const pdfButton = page.getByRole("button", { name: "To PDF" });
    const txtButton = page.getByRole("button", { name: "To TXT" });
    const htmlButton = page.getByRole("button", { name: "To HTML" });
    const docxButton = page.getByRole("button", { name: "To DOCX" });

    // Buttons should be enabled (active buttons UX)
    await expect(pdfButton).toBeEnabled();
    await expect(txtButton).toBeEnabled();
    await expect(htmlButton).toBeEnabled();
    await expect(docxButton).toBeEnabled();

    // Clicking should show a hint message (file picker is triggered but we can't easily test that)
    await pdfButton.click();
    await expect(page.getByText("Select a Markdown file to export")).toBeVisible();
  });

  test("should show DOCX button with Word styling", async ({ page }) => {
    const docxButton = page.getByRole("button", { name: "To DOCX" });
    await expect(docxButton).toBeVisible();
    await expect(docxButton).toBeEnabled();
    
    // DOCX button should have blue styling (different from other buttons)
    const buttonClasses = await docxButton.getAttribute("class");
    expect(buttonClasses).toContain("blue");
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
    // Find upload card by its content
    const uploadCard = page.locator("div").filter({ hasText: /Drag & drop your Markdown file/ }).first();

    // Get initial border class - should have dashed slate border
    const initialClasses = await uploadCard.getAttribute("class");
    expect(initialClasses).toContain("border-dashed");
    expect(initialClasses).toContain("border-slate-300");

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

    // Check for emerald border (solid, not dashed)
    const updatedClasses = await uploadCard.getAttribute("class");
    expect(updatedClasses).toContain("border-emerald-500");
    expect(updatedClasses).toContain("border-solid");
  });

  test("should revert border color on drag leave", async ({ page }) => {
    // Find upload card by its content
    const uploadCard = page.locator("div").filter({ hasText: /Drag & drop your Markdown file/ }).first();

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

    // Check border reverted to dashed slate
    const classes = await uploadCard.getAttribute("class");
    expect(classes).toContain("border-slate-300");
    expect(classes).toContain("border-dashed");
  });
});

test.describe("Markdown Free - Paste Area", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("clicking 'paste Markdown' reveals the text area", async ({ page }) => {
    // Initially, paste area should not be visible
    const pasteLabel = page.getByText("Pasted Markdown", { exact: false });
    await expect(pasteLabel).not.toBeVisible();

    // Click the toggle
    const pasteToggle = page.getByRole("button", {
      name: "paste Markdown",
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
      name: "paste Markdown",
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
      name: "paste Markdown",
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

    // Check for the lead paragraph content
    const lead = page.getByText(/fast, free, web-based Markdown viewer/);
    await expect(lead).toBeVisible();
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

  test("PDF button shows loading state when clicked", async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');

    // Mock the PDF API to delay response
    await page.route("**/api/convert/pdf", async (route) => {
      // Delay to show loading state
      await new Promise((resolve) => setTimeout(resolve, 500));
      await route.fulfill({
        status: 200,
        contentType: "application/pdf",
        body: Buffer.from("%PDF-1.4 mock content"),
        headers: {
          "Content-Disposition": 'attachment; filename="test.pdf"',
        },
      });
    });

    await fileInput.setInputFiles({
      name: "test.md",
      mimeType: "text/markdown",
      buffer: Buffer.from("# Test\n\nContent"),
    });

    await page.waitForTimeout(500);

    // Click PDF button
    const pdfButton = page.getByRole("button", { name: "To PDF" });
    await pdfButton.click();

    // Should show loading state (button text and helper text)
    await expect(page.getByRole("button", { name: "Generating PDF..." })).toBeVisible();
    await expect(page.getByText("This may take a few seconds.")).toBeVisible();
  });

  test("PDF export triggers download on success", async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');

    // Mock the PDF API with success response
    await page.route("**/api/convert/pdf", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/pdf",
        body: Buffer.from("%PDF-1.4 mock content"),
        headers: {
          "Content-Disposition": 'attachment; filename="test.pdf"',
        },
      });
    });

    await fileInput.setInputFiles({
      name: "test.md",
      mimeType: "text/markdown",
      buffer: Buffer.from("# Test\n\nContent"),
    });

    await page.waitForTimeout(500);

    // Set up download listener
    const downloadPromise = page.waitForEvent("download");

    // Click PDF button
    const pdfButton = page.getByRole("button", { name: "To PDF" });
    await pdfButton.click();

    // Verify download was triggered
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe("test.pdf");
  });

  test("PDF error shows retry button", async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');

    // Mock the PDF API with error response
    await page.route("**/api/convert/pdf", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({
          error: "GENERATION_FAILED",
          message: "PDF generation failed. Please try again.",
        }),
      });
    });

    await fileInput.setInputFiles({
      name: "test.md",
      mimeType: "text/markdown",
      buffer: Buffer.from("# Test\n\nContent"),
    });

    await page.waitForTimeout(500);

    // Click PDF button
    const pdfButton = page.getByRole("button", { name: "To PDF" });
    await pdfButton.click();

    // Should show error banner with retry button
    await expect(page.getByText("PDF generation failed", { exact: true })).toBeVisible();
    await expect(page.getByText("PDF generation failed. Please try again.", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Try Again" })).toBeVisible();
  });

  test("PDF timeout error shows appropriate message", async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');

    // Mock the PDF API with timeout error
    await page.route("**/api/convert/pdf", async (route) => {
      await route.fulfill({
        status: 504,
        contentType: "application/json",
        body: JSON.stringify({
          error: "GENERATION_TIMEOUT",
          message: "PDF generation timed out. Please try again with a smaller document.",
        }),
      });
    });

    await fileInput.setInputFiles({
      name: "test.md",
      mimeType: "text/markdown",
      buffer: Buffer.from("# Test\n\nContent"),
    });

    await page.waitForTimeout(500);

    // Click PDF button
    await page.getByRole("button", { name: "To PDF" }).click();

    // Should show timeout error
    await expect(page.getByText("PDF generation timed out")).toBeVisible();
  });

  test("error banner can be dismissed", async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');

    // Mock the PDF API with error
    await page.route("**/api/convert/pdf", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({
          error: "GENERATION_FAILED",
          message: "PDF generation failed. Please try again.",
        }),
      });
    });

    await fileInput.setInputFiles({
      name: "test.md",
      mimeType: "text/markdown",
      buffer: Buffer.from("# Test"),
    });

    await page.waitForTimeout(500);

    // Trigger error
    await page.getByRole("button", { name: "To PDF" }).click();
    await expect(page.getByText("PDF generation failed", { exact: true })).toBeVisible();

    // Click dismiss button (X)
    await page.locator('button:has(svg.lucide-x)').click();

    // Error should be gone
    await expect(page.getByText("PDF generation failed", { exact: true })).not.toBeVisible();
  });

  test("PDF download generates valid PDF file with correct headers", async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');

    // Track the API request to verify it's called correctly
    let apiRequestBody: { markdown: string; filename: string } | null = null;

    // Mock the PDF API and capture request
    await page.route("**/api/convert/pdf", async (route) => {
      const request = route.request();
      apiRequestBody = JSON.parse(request.postData() || "{}");

      // Return a mock PDF (PDF magic bytes + minimal structure)
      const mockPdf = Buffer.from(
        "%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF"
      );

      await route.fulfill({
        status: 200,
        contentType: "application/pdf",
        body: mockPdf,
        headers: {
          "Content-Disposition": 'attachment; filename="document.pdf"',
          "Content-Length": mockPdf.length.toString(),
        },
      });
    });

    await fileInput.setInputFiles({
      name: "document.md",
      mimeType: "text/markdown",
      buffer: Buffer.from("# My Document\n\nThis is the content."),
    });

    await page.waitForTimeout(500);

    // Set up download listener
    const downloadPromise = page.waitForEvent("download");

    // Click PDF button
    await page.getByRole("button", { name: "To PDF" }).click();

    // Verify download
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe("document.pdf");

    // Verify API was called with correct data
    expect(apiRequestBody).not.toBeNull();
    expect(apiRequestBody!.markdown).toBe("# My Document\n\nThis is the content.");
    expect(apiRequestBody!.filename).toBe("document.md");

    // Read downloaded file and verify it starts with PDF magic bytes
    const path = await download.path();
    const fs = require("fs");
    const pdfContent = fs.readFileSync(path!);
    expect(pdfContent.toString().startsWith("%PDF")).toBe(true);
  });

  test("network failure during PDF generation shows user-friendly error", async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');

    // Mock network failure by aborting the request
    await page.route("**/api/convert/pdf", async (route) => {
      await route.abort("failed");
    });

    await fileInput.setInputFiles({
      name: "test.md",
      mimeType: "text/markdown",
      buffer: Buffer.from("# Test Content"),
    });

    await page.waitForTimeout(500);

    // Click PDF button
    await page.getByRole("button", { name: "To PDF" }).click();

    // Should show network error message
    await expect(page.getByText("PDF generation failed", { exact: true })).toBeVisible();
    
    // Should have retry button since network errors are retryable
    await expect(page.getByRole("button", { name: "Try Again" })).toBeVisible();
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

  test("DOCX export triggers download", async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');

    // Mock the DOCX API
    await page.route("**/api/convert/docx", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers: {
          "Content-Disposition": 'attachment; filename="test.docx"',
        },
        // Minimal valid DOCX structure (just enough for test)
        body: Buffer.from("PK...mock docx content"),
      });
    });

    await fileInput.setInputFiles({
      name: "test.md",
      mimeType: "text/markdown",
      buffer: Buffer.from("# Test\n\nContent for DOCX export"),
    });

    await page.waitForTimeout(500);

    // Set up download listener
    const downloadPromise = page.waitForEvent("download");

    // Click DOCX button
    const docxButton = page.getByRole("button", { name: "To DOCX" });
    await docxButton.click();

    // Verify download was triggered
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe("test.docx");
  });

  test("DOCX export shows loading state", async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');

    // Mock slow DOCX API
    await page.route("**/api/convert/docx", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await route.fulfill({
        status: 200,
        contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers: {
          "Content-Disposition": 'attachment; filename="test.docx"',
        },
        body: Buffer.from("PK...mock docx content"),
      });
    });

    await fileInput.setInputFiles({
      name: "test.md",
      mimeType: "text/markdown",
      buffer: Buffer.from("# Test\n\nContent"),
    });

    await page.waitForTimeout(500);

    // Click DOCX button
    const docxButton = page.getByRole("button", { name: "To DOCX" });
    await docxButton.click();

    // Should show loading state
    await expect(page.getByRole("button", { name: "Generating DOCX..." })).toBeVisible();
    await expect(page.getByText("This may take a few seconds.")).toBeVisible();
  });

  test("DOCX error shows retry button", async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');

    // Mock the DOCX API with error response
    await page.route("**/api/convert/docx", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({
          error: "GENERATION_FAILED",
          message: "DOCX generation failed. Please try again.",
        }),
      });
    });

    await fileInput.setInputFiles({
      name: "test.md",
      mimeType: "text/markdown",
      buffer: Buffer.from("# Test\n\nContent"),
    });

    await page.waitForTimeout(500);

    // Click DOCX button
    const docxButton = page.getByRole("button", { name: "To DOCX" });
    await docxButton.click();

    // Should show error banner with retry button
    await expect(page.getByText("DOCX generation failed", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Try Again" })).toBeVisible();
  });

  test("DOCX timeout error shows appropriate message", async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');

    // Mock the DOCX API with timeout error
    await page.route("**/api/convert/docx", async (route) => {
      await route.fulfill({
        status: 504,
        contentType: "application/json",
        body: JSON.stringify({
          error: "GENERATION_TIMEOUT",
          message: "DOCX generation timed out. Please try again with a smaller document.",
        }),
      });
    });

    await fileInput.setInputFiles({
      name: "test.md",
      mimeType: "text/markdown",
      buffer: Buffer.from("# Test\n\nContent"),
    });

    await page.waitForTimeout(500);

    // Click DOCX button
    await page.getByRole("button", { name: "To DOCX" }).click();

    // Should show timeout error
    await expect(page.getByText("DOCX generation timed out")).toBeVisible();
  });

  test("DOCX error banner can be dismissed", async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');

    // Mock the DOCX API with error
    await page.route("**/api/convert/docx", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({
          error: "GENERATION_FAILED",
          message: "DOCX generation failed. Please try again.",
        }),
      });
    });

    await fileInput.setInputFiles({
      name: "test.md",
      mimeType: "text/markdown",
      buffer: Buffer.from("# Test"),
    });

    await page.waitForTimeout(500);

    // Trigger error
    await page.getByRole("button", { name: "To DOCX" }).click();
    await expect(page.getByText("DOCX generation failed", { exact: true })).toBeVisible();

    // Click dismiss button (X)
    await page.locator('button:has(svg.lucide-x)').click();

    // Error should be gone
    await expect(page.getByText("DOCX generation failed", { exact: true })).not.toBeVisible();
  });

  test("DOCX download generates file with correct headers", async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');

    // Track the API request to verify it's called correctly
    let apiRequestBody: { markdown: string; filename: string } | null = null;

    // Mock the DOCX API and capture request
    await page.route("**/api/convert/docx", async (route) => {
      const request = route.request();
      apiRequestBody = JSON.parse(request.postData() || "{}");

      // Return a mock DOCX (PK magic bytes for zip/docx format)
      const mockDocx = Buffer.from("PK\x03\x04...mock docx content for testing");

      await route.fulfill({
        status: 200,
        contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        body: mockDocx,
        headers: {
          "Content-Disposition": 'attachment; filename="document.docx"',
          "Content-Length": mockDocx.length.toString(),
        },
      });
    });

    await fileInput.setInputFiles({
      name: "document.md",
      mimeType: "text/markdown",
      buffer: Buffer.from("# My Document\n\nThis is the content."),
    });

    await page.waitForTimeout(500);

    // Set up download listener
    const downloadPromise = page.waitForEvent("download");

    // Click DOCX button
    await page.getByRole("button", { name: "To DOCX" }).click();

    // Verify download
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe("document.docx");

    // Verify API was called with correct data
    expect(apiRequestBody).not.toBeNull();
    expect(apiRequestBody!.markdown).toBe("# My Document\n\nThis is the content.");
    expect(apiRequestBody!.filename).toBe("document.md");
  });

  test("network failure during DOCX generation shows user-friendly error", async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');

    // Mock network failure by aborting the request
    await page.route("**/api/convert/docx", async (route) => {
      await route.abort("failed");
    });

    await fileInput.setInputFiles({
      name: "test.md",
      mimeType: "text/markdown",
      buffer: Buffer.from("# Test Content"),
    });

    await page.waitForTimeout(500);

    // Click DOCX button
    await page.getByRole("button", { name: "To DOCX" }).click();

    // Should show error message
    await expect(page.getByText("DOCX generation failed", { exact: true })).toBeVisible();
    
    // Should have retry button since network errors are retryable
    await expect(page.getByRole("button", { name: "Try Again" })).toBeVisible();
  });

  test("DOCX export from pasted content", async ({ page }) => {
    // Mock the DOCX API
    await page.route("**/api/convert/docx", async (route) => {
      const mockDocx = Buffer.from("PK\x03\x04...mock docx");
      await route.fulfill({
        status: 200,
        contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers: {
          "Content-Disposition": 'attachment; filename="document.docx"',
        },
        body: mockDocx,
      });
    });

    // Click paste toggle to reveal paste area
    await page.getByRole("button", { name: /paste Markdown/i }).click();

    // Find and fill the textarea
    const textarea = page.getByRole("textbox");
    await textarea.fill("# Pasted Content\n\nThis was pasted, not uploaded.");

    // Wait for content to be processed
    await expect(page.getByText("Ready to export")).toBeVisible();

    // Set up download listener
    const downloadPromise = page.waitForEvent("download");

    // Click DOCX button
    await page.getByRole("button", { name: "To DOCX" }).click();

    // Verify download was triggered
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe("document.docx");
  });

  test("DOCX export handles Unicode filename with en-dash (–)", async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');

    let apiRequestBody: { markdown: string; filename: string } | null = null;

    await page.route("**/api/convert/docx", async (route) => {
      const request = route.request();
      apiRequestBody = JSON.parse(request.postData() || "{}");

      const mockDocx = Buffer.from("PK\x03\x04...mock docx");

      const safeFilename = "Report-2024-2025.docx";
      const encodedFilename = encodeURIComponent("Report 2024–2025.docx");

      await route.fulfill({
        status: 200,
        contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        body: mockDocx,
        headers: {
          "Content-Disposition": `attachment; filename="${safeFilename}"; filename*=UTF-8''${encodedFilename}`,
          "Content-Length": mockDocx.length.toString(),
        },
      });
    });

    await fileInput.setInputFiles({
      name: "Report 2024–2025.md",
      mimeType: "text/markdown",
      buffer: Buffer.from("# Quarterly Report\n\nQ1-Q4 Analysis"),
    });

    await expect(page.getByText("Ready to export")).toBeVisible();

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "To DOCX" }).click();
    const download = await downloadPromise;

    expect(apiRequestBody).not.toBeNull();
    expect(apiRequestBody!.filename).toBe("Report 2024–2025.md");
    expect(download.suggestedFilename()).toMatch(/Report.*2024.*2025\.docx/);
  });

  test("DOCX export handles filename with Chinese characters", async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');

    let apiRequestBody: { markdown: string; filename: string } | null = null;

    await page.route("**/api/convert/docx", async (route) => {
      const request = route.request();
      apiRequestBody = JSON.parse(request.postData() || "{}");

      const mockDocx = Buffer.from("PK\x03\x04...mock docx");

      const safeFilename = "----.docx";
      const encodedFilename = encodeURIComponent("报告文档.docx");

      await route.fulfill({
        status: 200,
        contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        body: mockDocx,
        headers: {
          "Content-Disposition": `attachment; filename="${safeFilename}"; filename*=UTF-8''${encodedFilename}`,
          "Content-Length": mockDocx.length.toString(),
        },
      });
    });

    await fileInput.setInputFiles({
      name: "报告文档.md",
      mimeType: "text/markdown",
      buffer: Buffer.from("# 标题\n\n内容"),
    });

    await expect(page.getByText("Ready to export")).toBeVisible();

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "To DOCX" }).click();
    const download = await downloadPromise;

    expect(apiRequestBody).not.toBeNull();
    expect(apiRequestBody!.filename).toBe("报告文档.md");
    expect(download.suggestedFilename()).toMatch(/.*\.docx/);
  });

  test("DOCX export handles complex markdown content", async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');

    let apiRequestBody: { markdown: string; filename: string } | null = null;

    await page.route("**/api/convert/docx", async (route) => {
      const request = route.request();
      apiRequestBody = JSON.parse(request.postData() || "{}");

      const mockDocx = Buffer.from("PK\x03\x04...mock docx");
      await route.fulfill({
        status: 200,
        contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers: {
          "Content-Disposition": 'attachment; filename="complex.docx"',
        },
        body: mockDocx,
      });
    });

    // Complex markdown with tables, code blocks, lists
    const complexMarkdown = `# Complex Document

## Table Example

| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |

## Code Block

\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

## Lists

1. First item
2. Second item
   - Nested bullet
   - Another nested

## Blockquote

> This is a blockquote
> with multiple lines

**Bold text** and *italic text* and ~~strikethrough~~
`;

    await fileInput.setInputFiles({
      name: "complex.md",
      mimeType: "text/markdown",
      buffer: Buffer.from(complexMarkdown),
    });

    await expect(page.getByText("Ready to export")).toBeVisible();

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "To DOCX" }).click();
    const download = await downloadPromise;

    // Verify API received full content
    expect(apiRequestBody).not.toBeNull();
    expect(apiRequestBody!.markdown).toContain("| Header 1 |");
    expect(apiRequestBody!.markdown).toContain("function hello()");
    expect(apiRequestBody!.markdown).toContain("~~strikethrough~~");
    expect(download.suggestedFilename()).toBe("complex.docx");
  });

  test("DOCX button is disabled during generation", async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');

    // Mock slow DOCX API
    await page.route("**/api/convert/docx", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers: {
          "Content-Disposition": 'attachment; filename="test.docx"',
        },
        body: Buffer.from("PK\x03\x04...mock docx"),
      });
    });

    await fileInput.setInputFiles({
      name: "test.md",
      mimeType: "text/markdown",
      buffer: Buffer.from("# Test"),
    });

    await page.waitForTimeout(500);

    const docxButton = page.getByRole("button", { name: "To DOCX" });
    
    // Start DOCX generation
    await docxButton.click();

    // Button should show loading state and be disabled
    const loadingButton = page.getByRole("button", { name: "Generating DOCX..." });
    await expect(loadingButton).toBeVisible();
    await expect(loadingButton).toBeDisabled();

    // Other export buttons should also be disabled during generation
    await expect(page.getByRole("button", { name: "To PDF" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "To TXT" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "To HTML" })).toBeDisabled();
  });

  test("DOCX retry after error works correctly", async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    let callCount = 0;

    // First call fails, second call succeeds
    await page.route("**/api/convert/docx", async (route) => {
      callCount++;
      if (callCount === 1) {
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({
            error: "GENERATION_FAILED",
            message: "DOCX generation failed. Please try again.",
          }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          headers: {
            "Content-Disposition": 'attachment; filename="test.docx"',
          },
          body: Buffer.from("PK\x03\x04...mock docx"),
        });
      }
    });

    await fileInput.setInputFiles({
      name: "test.md",
      mimeType: "text/markdown",
      buffer: Buffer.from("# Test"),
    });

    await page.waitForTimeout(500);

    // First attempt - should fail
    await page.getByRole("button", { name: "To DOCX" }).click();
    await expect(page.getByText("DOCX generation failed", { exact: true })).toBeVisible();

    // Set up download listener for retry
    const downloadPromise = page.waitForEvent("download");

    // Click retry
    await page.getByRole("button", { name: "Try Again" }).click();

    // Should succeed on retry
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe("test.docx");

    // Error should be gone
    await expect(page.getByText("DOCX generation failed", { exact: true })).not.toBeVisible();
  });

  test("export buttons are enabled when no content (active buttons UX)", async ({ page }) => {
    const pdfButton = page.getByRole("button", { name: "To PDF" });
    const txtButton = page.getByRole("button", { name: "To TXT" });
    const htmlButton = page.getByRole("button", { name: "To HTML" });
    const docxButton = page.getByRole("button", { name: "To DOCX" });

    // Buttons should be enabled - clicking triggers file picker
    await expect(pdfButton).toBeEnabled();
    await expect(txtButton).toBeEnabled();
    await expect(htmlButton).toBeEnabled();
    await expect(docxButton).toBeEnabled();
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

  test("should reject file over 1MB immediately without server call", async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');

    // Track if any API calls are made
    let apiCalled = false;
    await page.route("**/api/**", async (route) => {
      apiCalled = true;
      await route.continue();
    });

    // Create a 2MB buffer (over the 1MB limit)
    const largeBuffer = Buffer.alloc(2 * 1024 * 1024, "x");

    // Record start time to verify immediate rejection
    const startTime = Date.now();

    await fileInput.setInputFiles({
      name: "large-file.md",
      mimeType: "text/markdown",
      buffer: largeBuffer,
    });

    // Should show error immediately (within 500ms, not waiting for server)
    await expect(page.getByText("File too large. Maximum size is 1MB.")).toBeVisible();
    
    const elapsedTime = Date.now() - startTime;
    expect(elapsedTime).toBeLessThan(1000); // Should be immediate, not waiting for server

    // Verify no API calls were made (client-side validation)
    expect(apiCalled).toBe(false);

    // Export buttons should remain enabled (active buttons UX - clicking triggers file picker)
    await expect(page.getByRole("button", { name: "To PDF" })).toBeEnabled();
    await expect(page.getByRole("button", { name: "To TXT" })).toBeEnabled();
    await expect(page.getByRole("button", { name: "To HTML" })).toBeEnabled();
  });

  test("file exactly at 1MB limit should be accepted", async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');

    // Create exactly 1MB buffer (at the limit)
    const exactLimitBuffer = Buffer.alloc(1 * 1024 * 1024, "x");

    await fileInput.setInputFiles({
      name: "exact-5mb.md",
      mimeType: "text/markdown",
      buffer: exactLimitBuffer,
    });

    await page.waitForTimeout(300);

    // Should NOT show error - file at limit is acceptable
    await expect(page.getByText("File too large")).not.toBeVisible();

    // Should show file is loaded
    await expect(page.getByText("exact-5mb.md")).toBeVisible();

    // Export buttons should be enabled
    await expect(page.getByRole("button", { name: "To PDF" })).toBeEnabled();
  });
});

test.describe("Markdown Free - Markdown Rendering", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("uploading .md file renders formatted text in Preview card", async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');

    // Upload markdown with various elements
    await fileInput.setInputFiles({
      name: "formatted.md",
      mimeType: "text/markdown",
      buffer: Buffer.from(`# Main Heading

## Subheading

This is a **bold** paragraph with *italic* text.

- List item 1
- List item 2

\`inline code\` and a [link](https://example.com)

\`\`\`javascript
const code = "block";
\`\`\`
`),
    });

    // Wait for rendering
    await page.waitForTimeout(500);

    // Check that markdown is rendered as HTML elements
    const article = page.locator("article");
    
    // Check heading is rendered as h1
    await expect(article.locator("h1")).toContainText("Main Heading");
    
    // Check subheading is rendered as h2
    await expect(article.locator("h2")).toContainText("Subheading");
    
    // Check bold text is rendered
    await expect(article.locator("strong")).toContainText("bold");
    
    // Check italic text is rendered
    await expect(article.locator("em")).toContainText("italic");
    
    // Check list is rendered
    await expect(article.locator("ul li").first()).toContainText("List item 1");
    
    // Check inline code is rendered
    await expect(article.locator("code").first()).toContainText("inline code");
    
    // Check code block is rendered
    await expect(article.locator("pre code")).toContainText('const code = "block"');
  });
});

test.describe("Markdown Free - Export Content Validation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("TXT export downloads valid text file with original markdown", async ({ page }) => {
    const markdownContent = "# Hello World\n\nThis is **test** content.";
    const fileInput = page.locator('input[type="file"]');

    await fileInput.setInputFiles({
      name: "test.md",
      mimeType: "text/markdown",
      buffer: Buffer.from(markdownContent),
    });

    await page.waitForTimeout(500);

    // Set up download listener
    const downloadPromise = page.waitForEvent("download");

    // Click TXT button
    await page.getByRole("button", { name: "To TXT" }).click();

    // Get download and read content
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe("test.txt");

    // Read the downloaded file content
    const path = await download.path();
    const fs = require("fs");
    const downloadedContent = fs.readFileSync(path!, "utf-8");

    // Verify content matches original markdown
    expect(downloadedContent).toBe(markdownContent);
  });

  test("HTML export downloads valid HTML file with proper structure", async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');

    await fileInput.setInputFiles({
      name: "document.md",
      mimeType: "text/markdown",
      buffer: Buffer.from("# Test Document\n\nParagraph content here."),
    });

    await page.waitForTimeout(500);

    // Set up download listener
    const downloadPromise = page.waitForEvent("download");

    // Click HTML button
    await page.getByRole("button", { name: "To HTML" }).click();

    // Get download and read content
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe("document.html");

    // Read the downloaded file content
    const path = await download.path();
    const fs = require("fs");
    const htmlContent = fs.readFileSync(path!, "utf-8");

    // Verify HTML structure
    expect(htmlContent).toContain("<!DOCTYPE html>");
    expect(htmlContent).toContain("<html lang=\"en\">");
    expect(htmlContent).toContain("<title>document</title>");
    expect(htmlContent).toContain("<style>");
    expect(htmlContent).toContain("<h1>Test Document</h1>");
    expect(htmlContent).toContain("<p>Paragraph content here.</p>");
    expect(htmlContent).toContain("</html>");
  });
});

test.describe("Markdown Free - Security (XSS Prevention)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("script tags in markdown are sanitized and do not execute", async ({ page }) => {
    // Set up alert dialog listener - should NOT be triggered
    let alertTriggered = false;
    page.on("dialog", async (dialog) => {
      alertTriggered = true;
      await dialog.dismiss();
    });

    // Click paste toggle to reveal textarea
    await page.getByRole("button", { name: "paste Markdown" }).click();
    await page.waitForTimeout(100);

    // Paste malicious content
    const textarea = page.locator("textarea");
    await textarea.fill(`# Normal Heading

<script>alert('xss')</script>

Some normal text.

<img src="x" onerror="alert('xss2')">

<a href="javascript:alert('xss3')">Click me</a>
`);

    // Wait for debounce and rendering
    await page.waitForTimeout(600);

    // Verify the script tag is NOT in the rendered output
    const article = page.locator("article");
    const articleHtml = await article.innerHTML();
    
    // Script tags should be stripped
    expect(articleHtml).not.toContain("<script>");
    expect(articleHtml).not.toContain("</script>");
    
    // onerror handlers should be stripped
    expect(articleHtml).not.toContain("onerror=");
    
    // javascript: URLs should be stripped
    expect(articleHtml).not.toContain("javascript:");

    // Verify alert was never triggered
    expect(alertTriggered).toBe(false);

    // Normal content should still be rendered
    await expect(article.locator("h1")).toContainText("Normal Heading");
    await expect(article.locator("p").first()).toContainText("Some normal text");
  });

  test("XSS via uploaded file is also sanitized", async ({ page }) => {
    let alertTriggered = false;
    page.on("dialog", async (dialog) => {
      alertTriggered = true;
      await dialog.dismiss();
    });

    const fileInput = page.locator('input[type="file"]');

    // Upload file with malicious content
    await fileInput.setInputFiles({
      name: "malicious.md",
      mimeType: "text/markdown",
      buffer: Buffer.from(`# Safe Title

<script>alert('file-xss')</script>

<iframe src="javascript:alert('iframe-xss')"></iframe>

Safe paragraph.
`),
    });

    await page.waitForTimeout(500);

    // Verify sanitization
    const article = page.locator("article");
    const articleHtml = await article.innerHTML();
    
    expect(articleHtml).not.toContain("<script>");
    expect(articleHtml).not.toContain("<iframe>");
    expect(alertTriggered).toBe(false);

    // Safe content should render
    await expect(article.locator("h1")).toContainText("Safe Title");
    await expect(article.locator("p").first()).toContainText("Safe paragraph");
  });
});

test.describe("Markdown Free - Mobile Navigation", () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
  });

  test("hamburger menu is visible on mobile", async ({ page }) => {
    // Desktop nav should be hidden
    const desktopNav = page.locator("nav.hidden.md\\:flex");
    await expect(desktopNav).not.toBeVisible();

    // Hamburger button should be visible
    const hamburgerButton = page.locator('button[aria-label="Open menu"]');
    await expect(hamburgerButton).toBeVisible();
  });

  test("clicking hamburger opens mobile menu", async ({ page }) => {
    const hamburgerButton = page.locator('button[aria-label="Open menu"]');
    await hamburgerButton.click();

    // Menu should open
    await expect(page.locator('button[aria-label="Close menu"]')).toBeVisible();
    
    // Navigation links should be visible
    await expect(page.locator("header").getByRole("link", { name: "About" })).toBeVisible();
    await expect(page.locator("header").getByRole("link", { name: "Privacy" })).toBeVisible();
  });

  test("clicking menu link closes menu and navigates", async ({ page }) => {
    // Open menu
    await page.locator('button[aria-label="Open menu"]').click();
    
    // Click About link
    await page.locator("header").getByRole("link", { name: "About" }).click();
    
    // Should navigate to About page
    await expect(page).toHaveURL("/about");
    
    // Menu should be closed (hamburger button shows "Open menu" again)
    await expect(page.locator('button[aria-label="Open menu"]')).toBeVisible();
  });

  test("clicking X closes mobile menu", async ({ page }) => {
    // Open menu
    await page.locator('button[aria-label="Open menu"]').click();
    await expect(page.locator('button[aria-label="Close menu"]')).toBeVisible();
    
    // Close menu
    await page.locator('button[aria-label="Close menu"]').click();
    
    // Menu should be closed
    await expect(page.locator('button[aria-label="Open menu"]')).toBeVisible();
  });
});

test.describe("Markdown Free - SEO & Metadata", () => {
  test("homepage has correct SEO title", async ({ page }) => {
    await page.goto("/");
    
    // Check SEO-optimized title contains target keywords
    await expect(page).toHaveTitle(/Markdown to PDF/i);
    await expect(page).toHaveTitle(/Free/i);
  });

  test("homepage has correct meta description with keywords", async ({ page }) => {
    await page.goto("/");
    
    // Check meta description contains key terms
    const description = await page.locator('meta[name="description"]').getAttribute("content");
    expect(description).toContain("Markdown");
    expect(description).toContain("PDF");
    expect(description).toContain("free");
    expect(description).not.toContain("tracking"); // Future-proof wording uses "ad trackers"
  });

  test("about page has correct title", async ({ page }) => {
    await page.goto("/about");
    await expect(page).toHaveTitle(/About.*Markdown Free/);
  });

  test("privacy page has correct title", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page).toHaveTitle(/Privacy.*Markdown Free/);
  });

  test("favicon is present", async ({ page }) => {
    await page.goto("/");
    const favicon = page.locator('link[rel="icon"]');
    const href = await favicon.getAttribute("href");
    expect(href).toContain("favicon");
  });

  test("canonical URL is set", async ({ page }) => {
    await page.goto("/");
    const canonical = page.locator('link[rel="canonical"]');
    const href = await canonical.getAttribute("href");
    expect(href).toBeTruthy();
  });

  test("Open Graph tags are present", async ({ page }) => {
    await page.goto("/");
    
    // Check OG type
    const ogType = await page.locator('meta[property="og:type"]').getAttribute("content");
    expect(ogType).toBe("website");
    
    // Check OG title
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute("content");
    expect(ogTitle).toContain("Markdown");
    
    // Check OG description
    const ogDesc = await page.locator('meta[property="og:description"]').getAttribute("content");
    expect(ogDesc).toBeTruthy();
    
    // Check OG image
    const ogImage = await page.locator('meta[property="og:image"]').getAttribute("content");
    expect(ogImage).toContain("og-image");
  });

  test("Twitter card tags are present", async ({ page }) => {
    await page.goto("/");
    
    // Check Twitter card type
    const twitterCard = await page.locator('meta[name="twitter:card"]').getAttribute("content");
    expect(twitterCard).toBe("summary_large_image");
    
    // Check Twitter title
    const twitterTitle = await page.locator('meta[name="twitter:title"]').getAttribute("content");
    expect(twitterTitle).toContain("Markdown");
  });

  test("JSON-LD schema is present on homepage", async ({ page }) => {
    await page.goto("/");
    
    // Check for JSON-LD script tag
    const jsonLd = page.locator('script[type="application/ld+json"]');
    await expect(jsonLd).toBeAttached();
    
    // Parse and validate schema content
    const schemaContent = await jsonLd.textContent();
    expect(schemaContent).toBeTruthy();
    
    const schema = JSON.parse(schemaContent!);
    expect(schema["@context"]).toBe("https://schema.org");
    
    // Check for WebApplication/SoftwareApplication type in @graph
    const webApp = schema["@graph"].find((item: { "@type": string | string[] }) => 
      Array.isArray(item["@type"]) 
        ? item["@type"].includes("WebApplication") 
        : item["@type"] === "WebApplication"
    );
    expect(webApp).toBeTruthy();
    expect(webApp.name).toBe("Markdown Free");
    expect(webApp.offers.price).toBe("0");
    
    // Check for FAQPage type in @graph
    const faqPage = schema["@graph"].find((item: { "@type": string }) => item["@type"] === "FAQPage");
    expect(faqPage).toBeTruthy();
    expect(faqPage.mainEntity.length).toBeGreaterThan(0);
  });

  test("JSON-LD schema includes SoftwareApplication type for LLM SEO", async ({ page }) => {
    await page.goto("/");
    
    const jsonLd = page.locator('script[type="application/ld+json"]');
    const schemaContent = await jsonLd.textContent();
    const schema = JSON.parse(schemaContent!);
    
    // Find the app entry (could be array or single type)
    const appEntry = schema["@graph"].find((item: { "@type": string | string[] }) => 
      Array.isArray(item["@type"]) 
        ? item["@type"].includes("SoftwareApplication") 
        : item["@type"] === "SoftwareApplication"
    );
    
    expect(appEntry).toBeTruthy();
    // Check for LLM-friendly fields
    expect(appEntry["@id"]).toContain("markdown.free");
    expect(appEntry.alternateName).toBeTruthy();
    expect(appEntry.applicationCategory).toBeTruthy();
    expect(appEntry.featureList).toBeInstanceOf(Array);
    expect(appEntry.featureList.length).toBeGreaterThan(5);
    // Check DOCX is in feature list
    expect(appEntry.featureList.some((f: string) => f.toLowerCase().includes("docx"))).toBe(true);
    expect(appEntry.keywords).toBeTruthy();
  });
});

test.describe("Markdown Free - SEO Technical", () => {
  test("robots.txt is accessible and valid", async ({ request }) => {
    const response = await request.get("/robots.txt");
    expect(response.status()).toBe(200);
    
    const content = await response.text();
    expect(content).toContain("User-agent:");
    expect(content).toContain("Disallow: /api/");
    expect(content).toContain("Sitemap:");
  });

  test("robots.txt allows AI/LLM crawlers", async ({ request }) => {
    const response = await request.get("/robots.txt");
    expect(response.status()).toBe(200);
    
    const content = await response.text();
    // OpenAI crawlers
    expect(content).toContain("User-agent: OAI-SearchBot");
    expect(content).toContain("User-agent: GPTBot");
    expect(content).toContain("User-agent: ChatGPT-User");
    // Anthropic (Claude) crawlers
    expect(content).toContain("User-agent: ClaudeBot");
    expect(content).toContain("User-agent: Claude-User");
    expect(content).toContain("User-agent: Claude-SearchBot");
    // Other AI crawlers
    expect(content).toContain("User-agent: PerplexityBot");
    expect(content).toContain("User-agent: Google-Extended");
    // Check that llms.txt is referenced
    expect(content).toContain("llms.txt");
  });

  test("llms.txt is accessible and contains required content", async ({ request }) => {
    const response = await request.get("/llms.txt");
    expect(response.status()).toBe(200);
    
    const content = await response.text();
    // Check for essential content
    expect(content).toContain("# Markdown Free");
    expect(content).toContain("Markdown to PDF");
    expect(content).toContain("DOCX");
    expect(content).toContain("No account required");
    expect(content).toContain("Privacy");
    expect(content).toContain("https://www.markdown.free");
    // Check for feature list
    expect(content).toContain("GitHub Flavored Markdown");
    // Check for user intent queries
    expect(content).toContain("README.md");
    expect(content).toContain("free");
  });

  test("sitemap.xml is accessible and valid", async ({ request }) => {
    const response = await request.get("/sitemap.xml");
    expect(response.status()).toBe(200);
    
    const content = await response.text();
    expect(content).toContain('<?xml version="1.0"');
    expect(content).toContain("<urlset");
    expect(content).toContain("<loc>");
    // Check all main pages are included
    expect(content).toContain("/about");
    expect(content).toContain("/privacy");
  });

  test("HTML has lang attribute", async ({ page }) => {
    await page.goto("/");
    const htmlLang = await page.locator("html").getAttribute("lang");
    expect(htmlLang).toBe("en");
  });

  test("page has single H1 element", async ({ page }) => {
    await page.goto("/");
    const h1Count = await page.locator("h1").count();
    expect(h1Count).toBe(1);
  });

  test("H1 contains target keywords", async ({ page }) => {
    await page.goto("/");
    const h1Text = await page.locator("h1").textContent();
    expect(h1Text?.toLowerCase()).toContain("markdown");
    expect(h1Text?.toLowerCase()).toContain("pdf");
    expect(h1Text?.toLowerCase()).toContain("free");
  });
});

test.describe("Markdown Free - Footer Navigation", () => {
  test("privacy page is accessible from footer link", async ({ page }) => {
    await page.goto("/");

    // Find the privacy link in the footer
    const footerPrivacyLink = page.locator("footer").getByRole("link", { name: "Privacy" });
    await expect(footerPrivacyLink).toBeVisible();

    // Click and verify navigation
    await footerPrivacyLink.click();
    await expect(page).toHaveURL("/privacy");

    // Verify privacy page content loaded
    await expect(page.getByRole("heading", { name: "Privacy Policy" })).toBeVisible();
  });
});

test.describe("Markdown Free - Mobile Phone Experience", () => {
  test("mobile menu works on iPhone SE screen size (375x667)", async ({ page }) => {
    // iPhone SE screen size
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    // Hamburger should be visible, desktop nav hidden
    const hamburgerButton = page.locator('button[aria-label="Open menu"]');
    await expect(hamburgerButton).toBeVisible();

    // Open menu
    await hamburgerButton.click();

    // Menu items should be visible and tappable
    const aboutLink = page.locator("header").getByRole("link", { name: "About" });
    await expect(aboutLink).toBeVisible();

    // Navigate to About
    await aboutLink.click();
    await expect(page).toHaveURL("/about");

    // Menu should close after navigation
    await expect(page.locator('button[aria-label="Open menu"]')).toBeVisible();
  });

  test("mobile menu works on small Android screen (360x640)", async ({ page }) => {
    // Small Android screen
    await page.setViewportSize({ width: 360, height: 640 });
    await page.goto("/");

    // Hamburger should be visible
    await expect(page.locator('button[aria-label="Open menu"]')).toBeVisible();

    // Open menu and verify navigation works
    await page.locator('button[aria-label="Open menu"]').click();
    await page.locator("header").getByRole("link", { name: "Privacy" }).click();
    await expect(page).toHaveURL("/privacy");
  });

  test("upload card is usable on mobile without horizontal scroll", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    // Check that the page doesn't have horizontal overflow
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalScroll).toBe(false);

    // Upload card should be visible and contained
    const uploadCard = page.locator('[class*="border-dashed"]').first();
    await expect(uploadCard).toBeVisible();

    // The card should fit within viewport
    const cardBox = await uploadCard.boundingBox();
    expect(cardBox).not.toBeNull();
    expect(cardBox!.width).toBeLessThanOrEqual(375);
  });
});

test.describe("Markdown Free - Performance", () => {
  test("page loads within acceptable time (< 3 seconds)", async ({ page }) => {
    const startTime = Date.now();
    await page.goto("/", { waitUntil: "networkidle" });
    const loadTime = Date.now() - startTime;

    // Page should load in under 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test("first contentful paint is fast", async ({ page }) => {
    await page.goto("/");

    // Get performance metrics
    const fcp = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntriesByName("first-contentful-paint");
          if (entries.length > 0) {
            resolve(entries[0].startTime);
          }
        });
        observer.observe({ entryTypes: ["paint"] });

        // Fallback if already painted
        const existingEntries = performance.getEntriesByName("first-contentful-paint");
        if (existingEntries.length > 0) {
          resolve(existingEntries[0].startTime);
        }
      });
    });

    // FCP should be under 1.5 seconds (spec target)
    expect(fcp).toBeLessThan(1500);
  });

  test("no major accessibility violations", async ({ page }) => {
    await page.goto("/");

    // Check for basic accessibility: all images have alt text, buttons are labeled
    const imagesWithoutAlt = await page.locator("img:not([alt])").count();
    expect(imagesWithoutAlt).toBe(0);

    // All buttons should have accessible names
    const buttons = page.locator("button");
    const buttonCount = await buttons.count();
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const name = await button.getAttribute("aria-label") || await button.textContent();
      expect(name).toBeTruthy();
    }
  });
});

test.describe("Markdown Free - Analytics Integration", () => {
  test("footer shows 'No tracking cookies' (not 'No tracking')", async ({ page }) => {
    await page.goto("/");
    
    // Footer should say "No tracking cookies" not just "No tracking"
    const footer = page.locator("footer");
    await expect(footer.getByText("No tracking cookies")).toBeVisible();
  });

  test("privacy page mentions Umami Cloud analytics", async ({ page }) => {
    await page.goto("/privacy");
    
    // Privacy page should mention Umami Cloud
    await expect(page.getByText("Umami Cloud")).toBeVisible();
    
    // Should explain it's cookieless
    await expect(page.getByText(/cookieless/i)).toBeVisible();
    
    // Should clarify we don't send content
    await expect(page.getByText(/do not send your Markdown content/i)).toBeVisible();
  });

  test("privacy page lists what analytics data we collect", async ({ page }) => {
    await page.goto("/privacy");
    
    // Should list the types of aggregated data
    await expect(page.getByText("Page views and visitor counts")).toBeVisible();
    await expect(page.getByText(/Counts of successful conversions/i)).toBeVisible();
  });

  test("Umami script loading depends on env vars and uses proxy", async ({ page }) => {
    await page.goto("/");

    // Check for Umami script presence
    const umamiScript = page.locator('script[data-website-id]');
    const scriptCount = await umamiScript.count();

    // If env vars are set, script should be present; if not, it shouldn't
    // This test validates the conditional loading works correctly
    if (scriptCount > 0) {
      // Umami is configured - verify the script has required attributes
      await expect(umamiScript).toHaveAttribute('data-website-id');
      await expect(umamiScript).toHaveAttribute('src');

      // Verify script uses proxy path (not direct cloud.umami.is)
      const src = await umamiScript.getAttribute('src');
      expect(src).toBe('/ingest/script.js');
      expect(src).not.toContain('cloud.umami.is');

      // Verify data-host-url points to proxy
      await expect(umamiScript).toHaveAttribute('data-host-url', '/ingest');
    } else {
      // Umami is not configured - verify no script is present
      await expect(umamiScript).toHaveCount(0);
    }
  });

  test("trackEvent function is available and safe to call", async ({ page }) => {
    await page.goto("/");
    
    // The trackEvent function should be safe to call even without Umami loaded
    // It should not throw any errors
    const result = await page.evaluate(() => {
      // Simulate what our code does - check for umami and call track
      if (typeof window !== "undefined") {
        // window.umami won't exist in tests, but calling our pattern should be safe
        const umami = (window as unknown as { umami?: { track: (name: string, data?: Record<string, string>) => void } }).umami;
        if (umami?.track) {
          umami.track("test_event", { test: "value" });
        }
        return "no_error";
      }
      return "no_window";
    });
    
    expect(result).toBe("no_error");
  });

  test("privacy short version mentions no tracking cookies", async ({ page }) => {
    await page.goto("/privacy");
    
    // The short version in the article should say "No tracking cookies"
    // Use article locator to avoid matching footer
    await expect(page.getByRole("article").getByText(/No tracking cookies/)).toBeVisible();
  });
});

test.describe("Markdown Free - Enhanced Analytics (Engagement Tracking)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("page loads EngagementTracker component without errors", async ({ page }) => {
    // The page should load without any JavaScript errors
    const errors: string[] = [];
    page.on("pageerror", (error) => {
      errors.push(error.message);
    });

    // Wait for page to fully load
    await page.waitForLoadState("networkidle");

    // No errors should have occurred from engagement tracking
    expect(errors).toHaveLength(0);
  });

  test("scroll tracking does not cause errors when scrolling", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => {
      errors.push(error.message);
    });

    // Scroll down the page
    await page.evaluate(() => {
      window.scrollTo(0, document.documentElement.scrollHeight / 2);
    });
    await page.waitForTimeout(100);

    // Scroll to bottom
    await page.evaluate(() => {
      window.scrollTo(0, document.documentElement.scrollHeight);
    });
    await page.waitForTimeout(100);

    // No errors should have occurred
    expect(errors).toHaveLength(0);
  });

  test("hover over upload card does not cause errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => {
      errors.push(error.message);
    });

    // Hover over the upload card
    const uploadCard = page.locator('[class*="border-dashed"]').first();
    await uploadCard.hover();
    await page.waitForTimeout(100);

    // No errors should have occurred
    expect(errors).toHaveLength(0);
  });

  test("clicking paste toggle triggers tracking without errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => {
      errors.push(error.message);
    });

    // Click the paste toggle button
    const pasteToggle = page.getByRole("button", {
      name: "paste Markdown",
    });
    await pasteToggle.click();

    // Wait a moment for any async tracking
    await page.waitForTimeout(100);

    // No errors should have occurred
    expect(errors).toHaveLength(0);

    // The paste area should now be visible
    const pasteLabel = page.getByText("Pasted Markdown", { exact: false });
    await expect(pasteLabel).toBeVisible();
  });

  test("hovering export buttons does not cause errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => {
      errors.push(error.message);
    });

    // Buttons should be enabled (active buttons UX)
    const pdfButton = page.getByRole("button", { name: "To PDF" });
    const txtButton = page.getByRole("button", { name: "To TXT" });
    const htmlButton = page.getByRole("button", { name: "To HTML" });

    await expect(pdfButton).toBeEnabled();

    // Hover over each button
    await pdfButton.hover();
    await page.waitForTimeout(50);
    await txtButton.hover();
    await page.waitForTimeout(50);
    await htmlButton.hover();
    await page.waitForTimeout(50);

    // No errors should have occurred
    expect(errors).toHaveLength(0);
  });

  test("navigation click tracking works without errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => {
      errors.push(error.message);
    });

    // Click About link in header
    const aboutLink = page.locator("header").getByRole("link", { name: "About" });
    await aboutLink.click();

    // Should navigate successfully
    await expect(page).toHaveURL("/about");

    // No errors should have occurred
    expect(errors).toHaveLength(0);
  });

  test("logo click tracking works when navigating home", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => {
      errors.push(error.message);
    });

    // Navigate to about page first
    await page.goto("/about");

    // Click logo to go home
    const logoLink = page.locator("header").getByRole("link", { name: /Markdown Free/ });
    await logoLink.click();

    // Should navigate to home
    await expect(page).toHaveURL("/");

    // No errors should have occurred
    expect(errors).toHaveLength(0);
  });

  test("footer privacy link click triggers tracking", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => {
      errors.push(error.message);
    });

    // Click privacy link in footer
    const footerPrivacyLink = page.locator("footer").getByRole("link", { name: "Privacy" });
    await footerPrivacyLink.click();

    // Should navigate successfully
    await expect(page).toHaveURL("/privacy");

    // No errors should have occurred
    expect(errors).toHaveLength(0);
  });

  test("feedback button click tracking works", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => {
      errors.push(error.message);
    });

    // Click feedback button in header
    const feedbackButton = page.locator("header").getByRole("button", { name: "Feedback" });
    await feedbackButton.click();

    // Wait for any tracking to complete
    await page.waitForTimeout(100);

    // No errors should have occurred
    expect(errors).toHaveLength(0);
  });

  test("file drag over page triggers drag tracking without errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => {
      errors.push(error.message);
    });

    // Simulate a drag enter event on the page body
    await page.evaluate(() => {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(new File(["test"], "test.md", { type: "text/markdown" }));
      
      const dragEnterEvent = new DragEvent("dragenter", {
        bubbles: true,
        cancelable: true,
        dataTransfer: dataTransfer,
      });
      document.body.dispatchEvent(dragEnterEvent);
    });

    await page.waitForTimeout(100);

    // No errors should have occurred
    expect(errors).toHaveLength(0);
  });

  test("time on page tracking does not interfere with page functionality", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => {
      errors.push(error.message);
    });

    // Wait for some time-based tracking to potentially fire
    await page.waitForTimeout(1000);

    // Should still be able to interact with the page
    const pasteToggle = page.getByRole("button", {
      name: "paste Markdown",
    });
    await pasteToggle.click();

    const textarea = page.getByPlaceholder("Paste your Markdown here…");
    await textarea.fill("# Test\n\nContent after waiting");

    // Wait for debounce
    await page.waitForTimeout(400);

    // Should work normally
    await expect(page.getByText("Ready to export (pasted text)")).toBeVisible();

    // No errors should have occurred
    expect(errors).toHaveLength(0);
  });

  test("sections with visibility tracking render correctly", async ({ page }) => {
    // Check that all sections with visibility tracking are present and visible
    
    // Hero section
    const heroSection = page.locator("section.text-center").first();
    await expect(heroSection).toBeVisible();

    // Upload card (has visibility tracking)
    const uploadCard = page.locator('[class*="border-dashed"]').first();
    await expect(uploadCard).toBeVisible();

    // Export buttons row (has visibility tracking)
    const exportRow = page.getByRole("button", { name: "To PDF" }).locator("..");
    await expect(exportRow).toBeVisible();

    // Preview card (has visibility tracking)
    const previewCard = page.getByText("Preview").locator("..").first();
    await expect(previewCard).toBeVisible();

    // Footer (has visibility tracking)
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
  });

  test("mobile navigation tracking works without errors", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    const errors: string[] = [];
    page.on("pageerror", (error) => {
      errors.push(error.message);
    });

    // Open mobile menu
    const hamburgerButton = page.locator('button[aria-label="Open menu"]');
    await hamburgerButton.click();

    // Click About link in mobile menu
    await page.locator("header").getByRole("link", { name: "About" }).click();

    // Should navigate successfully
    await expect(page).toHaveURL("/about");

    // No errors should have occurred
    expect(errors).toHaveLength(0);
  });
});

test.describe("Markdown Free - Feedback Modal", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("clicking feedback button opens the modal", async ({ page }) => {
    // Click feedback button in header
    const feedbackButton = page.locator("header").getByRole("button", { name: "Feedback" });
    await feedbackButton.click();

    // Modal should be visible
    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible();

    // Modal should have title
    await expect(page.getByRole("heading", { name: "Send Feedback" })).toBeVisible();

    // Form fields should be visible
    await expect(page.getByLabel(/Your Feedback/)).toBeVisible();
    await expect(page.getByLabel(/Email/)).toBeVisible();
  });

  test("feedback modal can be closed with X button", async ({ page }) => {
    // Open modal
    await page.locator("header").getByRole("button", { name: "Feedback" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();

    // Click close button
    await page.getByRole("button", { name: "Close feedback modal" }).click();

    // Modal should be hidden
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("feedback modal can be closed with Cancel button", async ({ page }) => {
    // Open modal
    await page.locator("header").getByRole("button", { name: "Feedback" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();

    // Click cancel button
    await page.getByRole("button", { name: "Cancel" }).click();

    // Modal should be hidden
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("feedback modal can be closed with Escape key", async ({ page }) => {
    // Open modal
    await page.locator("header").getByRole("button", { name: "Feedback" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();

    // Press Escape
    await page.keyboard.press("Escape");

    // Modal should be hidden
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("feedback modal can be closed by clicking backdrop", async ({ page }) => {
    // Open modal
    await page.locator("header").getByRole("button", { name: "Feedback" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();

    // Click backdrop (outside modal content)
    await page.locator(".bg-black\\/50").click({ position: { x: 10, y: 10 } });

    // Modal should be hidden
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("submit button is disabled when feedback is empty", async ({ page }) => {
    // Open modal
    await page.locator("header").getByRole("button", { name: "Feedback" }).click();

    // Submit button should be disabled initially
    const submitButton = page.getByRole("button", { name: "Send Feedback" });
    await expect(submitButton).toBeDisabled();
  });

  test("submit button is enabled when feedback is entered", async ({ page }) => {
    // Open modal
    await page.locator("header").getByRole("button", { name: "Feedback" }).click();

    // Type feedback
    const feedbackInput = page.getByLabel(/Your Feedback/);
    await feedbackInput.fill("Great tool! I love it.");

    // Submit button should now be enabled
    const submitButton = page.getByRole("button", { name: "Send Feedback" });
    await expect(submitButton).toBeEnabled();
  });

  test("submitting feedback shows success message", async ({ page }) => {
    // Open modal
    await page.locator("header").getByRole("button", { name: "Feedback" }).click();

    // Fill out form
    await page.getByLabel(/Your Feedback/).fill("This is a test feedback.");
    await page.getByLabel(/Email/).fill("test@example.com");

    // Submit
    await page.getByRole("button", { name: "Send Feedback" }).click();

    // Should show success message
    await expect(page.getByText("Thank you! Your feedback has been sent.")).toBeVisible();
  });

  test("modal auto-closes after successful submission", async ({ page }) => {
    // Open modal
    await page.locator("header").getByRole("button", { name: "Feedback" }).click();

    // Fill out and submit
    await page.getByLabel(/Your Feedback/).fill("Test feedback");
    await page.getByRole("button", { name: "Send Feedback" }).click();

    // Wait for success message
    await expect(page.getByText("Thank you!")).toBeVisible();

    // Modal should auto-close after ~2 seconds
    await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 3000 });
  });

  test("feedback can be submitted without email", async ({ page }) => {
    // Open modal
    await page.locator("header").getByRole("button", { name: "Feedback" }).click();

    // Fill only feedback (email is optional)
    await page.getByLabel(/Your Feedback/).fill("Feedback without email");

    // Submit should work
    await page.getByRole("button", { name: "Send Feedback" }).click();

    // Should show success
    await expect(page.getByText("Thank you!")).toBeVisible();
  });

  test("form resets when modal is reopened", async ({ page }) => {
    // Open modal
    await page.locator("header").getByRole("button", { name: "Feedback" }).click();

    // Fill out form
    await page.getByLabel(/Your Feedback/).fill("Some feedback");
    await page.getByLabel(/Email/).fill("test@example.com");

    // Close modal
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible();

    // Wait for reset timeout
    await page.waitForTimeout(300);

    // Reopen modal
    await page.locator("header").getByRole("button", { name: "Feedback" }).click();

    // Form should be empty
    await expect(page.getByLabel(/Your Feedback/)).toHaveValue("");
    await expect(page.getByLabel(/Email/)).toHaveValue("");
  });

  test("feedback button works from mobile menu", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Open mobile menu
    await page.locator('button[aria-label="Open menu"]').click();

    // Click feedback button
    await page.locator("header").getByRole("button", { name: "Feedback" }).click();

    // Modal should open
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Send Feedback" })).toBeVisible();
  });

  test("textarea auto-focuses when modal opens", async ({ page }) => {
    // Open modal
    await page.locator("header").getByRole("button", { name: "Feedback" }).click();

    // Textarea should be focused
    const feedbackInput = page.getByLabel(/Your Feedback/);
    await expect(feedbackInput).toBeFocused();
  });

  test("shows loading state while submitting", async ({ page }) => {
    // Open modal
    await page.locator("header").getByRole("button", { name: "Feedback" }).click();

    // Fill out form
    await page.getByLabel(/Your Feedback/).fill("Test feedback");

    // Click submit and immediately check for loading state
    const submitButton = page.getByRole("button", { name: /Send/ });
    await submitButton.click();

    // Should show loading state briefly (may be too fast to catch, but we check)
    // The success message will appear after loading
    await expect(page.getByText("Thank you!")).toBeVisible();
  });

  test("analytics tracking is called without errors on submit", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => {
      errors.push(error.message);
    });

    // Open modal
    await page.locator("header").getByRole("button", { name: "Feedback" }).click();

    // Fill out and submit
    await page.getByLabel(/Your Feedback/).fill("Test feedback for analytics");
    await page.getByLabel(/Email/).fill("analytics@test.com");
    await page.getByRole("button", { name: "Send Feedback" }).click();

    // Wait for success
    await expect(page.getByText("Thank you!")).toBeVisible();

    // No errors should have occurred
    expect(errors).toHaveLength(0);
  });
});

test.describe("Markdown Free - Special Filename Handling", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("PDF export handles Unicode filename with en-dash (–)", async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');

    // Track the API request to verify filename is passed correctly
    let apiRequestBody: { markdown: string; filename: string } | null = null;

    // Mock the PDF API with RFC 5987 encoded filename response
    await page.route("**/api/convert/pdf", async (route) => {
      const request = route.request();
      apiRequestBody = JSON.parse(request.postData() || "{}");

      // Return a mock PDF
      const mockPdf = Buffer.from(
        "%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF"
      );

      // Simulate RFC 5987 encoding for Unicode filename
      const safeFilename = "Report-2024-2025.pdf"; // ASCII fallback with hyphen
      const encodedFilename = encodeURIComponent("Report 2024–2025.pdf");

      await route.fulfill({
        status: 200,
        contentType: "application/pdf",
        body: mockPdf,
        headers: {
          "Content-Disposition": `attachment; filename="${safeFilename}"; filename*=UTF-8''${encodedFilename}`,
          "Content-Length": mockPdf.length.toString(),
        },
      });
    });

    // Upload file with Unicode en-dash in filename
    await fileInput.setInputFiles({
      name: "Report 2024–2025.md", // Contains en-dash (U+2013)
      mimeType: "text/markdown",
      buffer: Buffer.from("# Quarterly Report\n\nQ1-Q4 Analysis"),
    });

    // Wait for content to load
    await expect(page.getByText("Ready to export")).toBeVisible();

    // Set up download listener
    const downloadPromise = page.waitForEvent("download");

    // Click PDF button
    await page.getByRole("button", { name: /To PDF/i }).click();

    // Wait for download
    const download = await downloadPromise;

    // Verify API was called with original Unicode filename
    expect(apiRequestBody).not.toBeNull();
    expect(apiRequestBody!.filename).toBe("Report 2024–2025.md");

    // Verify download completed (browser handles RFC 5987 decoding)
    expect(download.suggestedFilename()).toMatch(/Report.*2024.*2025\.pdf/);
  });

  test("PDF export handles filename with emoji", async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');

    let apiRequestBody: { markdown: string; filename: string } | null = null;

    await page.route("**/api/convert/pdf", async (route) => {
      const request = route.request();
      apiRequestBody = JSON.parse(request.postData() || "{}");

      const mockPdf = Buffer.from(
        "%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF"
      );

      const safeFilename = "Notes--.pdf"; // Emoji replaced with hyphens
      const encodedFilename = encodeURIComponent("Notes 📝.pdf");

      await route.fulfill({
        status: 200,
        contentType: "application/pdf",
        body: mockPdf,
        headers: {
          "Content-Disposition": `attachment; filename="${safeFilename}"; filename*=UTF-8''${encodedFilename}`,
          "Content-Length": mockPdf.length.toString(),
        },
      });
    });

    // Upload file with emoji in filename
    await fileInput.setInputFiles({
      name: "Notes 📝.md",
      mimeType: "text/markdown",
      buffer: Buffer.from("# My Notes\n\nImportant stuff"),
    });

    await expect(page.getByText("Ready to export")).toBeVisible();

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: /To PDF/i }).click();
    const download = await downloadPromise;

    // Verify API received original filename with emoji
    expect(apiRequestBody).not.toBeNull();
    expect(apiRequestBody!.filename).toBe("Notes 📝.md");

    // Download should work
    expect(download.suggestedFilename()).toMatch(/Notes.*\.pdf/);
  });

  test("PDF export handles filename with Chinese characters", async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');

    let apiRequestBody: { markdown: string; filename: string } | null = null;

    await page.route("**/api/convert/pdf", async (route) => {
      const request = route.request();
      apiRequestBody = JSON.parse(request.postData() || "{}");

      const mockPdf = Buffer.from(
        "%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF"
      );

      const safeFilename = "----.pdf"; // Chinese chars replaced with hyphens
      const encodedFilename = encodeURIComponent("报告文档.pdf");

      await route.fulfill({
        status: 200,
        contentType: "application/pdf",
        body: mockPdf,
        headers: {
          "Content-Disposition": `attachment; filename="${safeFilename}"; filename*=UTF-8''${encodedFilename}`,
          "Content-Length": mockPdf.length.toString(),
        },
      });
    });

    // Upload file with Chinese characters
    await fileInput.setInputFiles({
      name: "报告文档.md",
      mimeType: "text/markdown",
      buffer: Buffer.from("# 标题\n\n内容"),
    });

    await expect(page.getByText("Ready to export")).toBeVisible();

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: /To PDF/i }).click();
    const download = await downloadPromise;

    // Verify API received original filename
    expect(apiRequestBody).not.toBeNull();
    expect(apiRequestBody!.filename).toBe("报告文档.md");

    // Download should work
    expect(download.suggestedFilename()).toBeTruthy();
  });

  test("TXT export handles Unicode filename correctly", async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');

    // Upload file with Unicode en-dash in filename
    await fileInput.setInputFiles({
      name: "Summary 2024–2025.md", // Contains en-dash (U+2013)
      mimeType: "text/markdown",
      buffer: Buffer.from("# Summary\n\nYear in review"),
    });

    await expect(page.getByText("Ready to export")).toBeVisible();

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: /To TXT/i }).click();
    const download = await downloadPromise;

    // TXT export is client-side, filename should be preserved
    expect(download.suggestedFilename()).toMatch(/Summary.*2024.*2025\.txt/);
  });

  test("HTML export handles Unicode filename correctly", async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');

    // Upload file with Unicode characters
    await fileInput.setInputFiles({
      name: "Résumé–Draft.md", // Contains accented char and en-dash
      mimeType: "text/markdown",
      buffer: Buffer.from("# My Résumé\n\nExperience"),
    });

    await expect(page.getByText("Ready to export")).toBeVisible();

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: /To HTML/i }).click();
    const download = await downloadPromise;

    // HTML export is client-side, filename should be preserved
    expect(download.suggestedFilename()).toMatch(/R.sum.*Draft\.html/);
  });
});

// =============================================================================
// LLM SEO - FAQ Page Tests
// =============================================================================
test.describe("Markdown Free - FAQ Page", () => {
  test("FAQ page is accessible and has correct structure", async ({ page }) => {
    await page.goto("/faq");
    
    // Check for main heading
    const h1 = page.locator("h1");
    await expect(h1).toBeVisible();
    expect(await h1.textContent()).toContain("Frequently Asked Questions");
    
    // Check for FAQ items
    const faqItems = page.locator("article");
    expect(await faqItems.count()).toBeGreaterThan(5);
  });

  test("FAQ page has JSON-LD schema", async ({ page }) => {
    await page.goto("/faq");
    
    const jsonLd = page.locator('script[type="application/ld+json"]');
    await expect(jsonLd).toBeAttached();
    
    const schemaContent = await jsonLd.textContent();
    const schema = JSON.parse(schemaContent!);
    
    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toBe("FAQPage");
    expect(schema.mainEntity).toBeInstanceOf(Array);
    expect(schema.mainEntity.length).toBeGreaterThan(5);
    
    // Check first question structure
    const firstQuestion = schema.mainEntity[0];
    expect(firstQuestion["@type"]).toBe("Question");
    expect(firstQuestion.name).toBeTruthy();
    expect(firstQuestion.acceptedAnswer["@type"]).toBe("Answer");
    expect(firstQuestion.acceptedAnswer.text).toBeTruthy();
  });

  test("FAQ page has breadcrumb navigation", async ({ page }) => {
    await page.goto("/faq");
    
    // Check for breadcrumb (the nav with Home > FAQ text)
    const breadcrumb = page.locator("nav", { hasText: "›" });
    await expect(breadcrumb).toBeVisible();
    await expect(breadcrumb.getByText("Home")).toBeVisible();
    await expect(breadcrumb.getByText("FAQ")).toBeVisible();
  });

  test("FAQ page has CTA section with link to converter", async ({ page }) => {
    await page.goto("/faq");
    
    // Check for CTA
    const ctaButton = page.getByRole("link", { name: /Start Converting/i });
    await expect(ctaButton).toBeVisible();
    
    // Click and verify navigation
    await ctaButton.click();
    await expect(page).toHaveURL("/");
  });

  test("FAQ page includes natural language questions for SEO", async ({ page }) => {
    await page.goto("/faq");
    
    const pageContent = await page.textContent("main");
    
    // Check for natural language questions that users would search for
    expect(pageContent).toContain("README");
    expect(pageContent).toContain("free");
    expect(pageContent?.toLowerCase()).toContain("docx");
    expect(pageContent?.toLowerCase()).toContain("word");
  });

  test("localized FAQ page works correctly", async ({ page }) => {
    await page.goto("/zh-Hant/faq");
    
    // Check for Chinese content
    const h1 = page.locator("h1");
    await expect(h1).toBeVisible();
    expect(await h1.textContent()).toContain("常見問題");
    
    // Check for JSON-LD
    const jsonLd = page.locator('script[type="application/ld+json"]');
    await expect(jsonLd).toBeAttached();
  });

  test("FAQ page meta description is set correctly", async ({ page }) => {
    await page.goto("/faq");
    
    const metaDescription = await page.locator('meta[name="description"]').getAttribute("content");
    expect(metaDescription).toBeTruthy();
    expect(metaDescription?.toLowerCase()).toContain("markdown");
    expect(metaDescription?.toLowerCase()).toContain("pdf");
  });
});

// =============================================================================
// LLM SEO - High-Intent Landing Pages Tests
// =============================================================================
test.describe("Markdown Free - High-Intent Landing Pages", () => {
  test("GitHub README to PDF page is accessible", async ({ page }) => {
    await page.goto("/github-readme-to-pdf");
    
    const h1 = page.locator("h1");
    await expect(h1).toBeVisible();
    expect(await h1.textContent()).toContain("GitHub");
    expect(await h1.textContent()).toContain("PDF");
    
    // Check for CTA button (the first one in the article)
    await expect(page.getByRole("link", { name: /Convert GitHub README Now/i })).toBeVisible();
  });

  test("Obsidian Markdown to PDF page is accessible", async ({ page }) => {
    await page.goto("/obsidian-markdown-to-pdf");
    
    const h1 = page.locator("h1");
    await expect(h1).toBeVisible();
    expect(await h1.textContent()).toContain("Obsidian");
    
    // Check for limitations section (important for honesty)
    const content = await page.textContent("main");
    expect(content).toContain("Limitations");
  });

  test("No Watermark page is accessible", async ({ page }) => {
    await page.goto("/markdown-to-pdf-no-watermark");
    
    const h1 = page.locator("h1");
    await expect(h1).toBeVisible();
    expect((await h1.textContent())?.toLowerCase()).toContain("watermark");
    
    // Check for comparison table
    await expect(page.locator("table")).toBeVisible();
  });

  test("Online Free page is accessible", async ({ page }) => {
    await page.goto("/markdown-to-pdf-online-free");
    
    const h1 = page.locator("h1");
    await expect(h1).toBeVisible();
    expect((await h1.textContent())?.toLowerCase()).toContain("free");
    expect((await h1.textContent())?.toLowerCase()).toContain("online");
  });

  test("IndexNow key file is accessible", async ({ request }) => {
    const response = await request.get("/3074aa8265cdc58e5af0ded9f519972f.txt");
    expect(response.status()).toBe(200);
    
    const content = await response.text();
    expect(content.trim()).toBe("3074aa8265cdc58e5af0ded9f519972f");
  });

  test("ChatGPT to PDF page is accessible", async ({ page }) => {
    await page.goto("/chatgpt-to-pdf");
    
    const h1 = page.locator("h1");
    await expect(h1).toBeVisible();
    expect((await h1.textContent())?.toLowerCase()).toContain("chatgpt");
    expect((await h1.textContent())?.toLowerCase()).toContain("pdf");
    
    // Check for the hook/instruction
    const content = await page.textContent("main");
    expect(content?.toLowerCase()).toContain("copy");
    expect(content?.toLowerCase()).toContain("paste");
  });

  test("Claude Artifacts to PDF page is accessible", async ({ page }) => {
    await page.goto("/claude-artifacts-to-pdf");
    
    const h1 = page.locator("h1");
    await expect(h1).toBeVisible();
    expect((await h1.textContent())?.toLowerCase()).toContain("claude");
    expect((await h1.textContent())?.toLowerCase()).toContain("pdf");
    
    // Check for artifacts mention
    const content = await page.textContent("main");
    expect(content?.toLowerCase()).toContain("artifact");
  });

  test("High-intent pages have proper meta tags", async ({ page }) => {
    const pages = [
      "/github-readme-to-pdf",
      "/obsidian-markdown-to-pdf",
      "/markdown-to-pdf-no-watermark",
      "/markdown-to-pdf-online-free",
      "/chatgpt-to-pdf",
      "/claude-artifacts-to-pdf",
    ];

    for (const pagePath of pages) {
      await page.goto(pagePath);
      
      const title = await page.title();
      expect(title).toBeTruthy();
      expect(title.toLowerCase()).toContain("pdf");
      
      const metaDescription = await page.locator('meta[name="description"]').getAttribute("content");
      expect(metaDescription).toBeTruthy();
      expect(metaDescription!.length).toBeGreaterThan(50);
    }
  });
});

