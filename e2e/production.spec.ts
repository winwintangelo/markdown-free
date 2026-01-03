import { test, expect } from "@playwright/test";

/**
 * Production E2E Test Suite for https://www.markdown.free/
 * 
 * These tests validate the production deployment with real API calls.
 * Run with: npm run test:production
 * 
 * Key differences from local tests:
 * - No mocking - tests real API endpoints
 * - Longer timeouts for cold starts
 * - Focus on critical user paths
 * - Tests actual PDF generation
 */

test.describe("Production - Health Check", () => {
  test("homepage is accessible", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
  });

  test("PDF API debug endpoint returns healthy status", async ({ request }) => {
    const response = await request.get("/api/convert/pdf");
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.environment.VERCEL_ENV).toBe("production");
    expect(data.chromium.status).toBe("ok");
    expect(data.chromium.executablePath).toBeTruthy();
  });
});

test.describe("Production - Page Load", () => {
  test("homepage loads with correct content", async ({ page }) => {
    await page.goto("/");

    // Check critical elements
    await expect(page.locator("header").getByText("Markdown Free")).toBeVisible();
    await expect(page.getByText("Free • No signup • Instant export")).toBeVisible();
    await expect(page.getByRole("heading", { name: /Free Markdown to PDF/i })).toBeVisible();
    await expect(page.getByText("Drag & drop your Markdown file")).toBeVisible();
    await expect(page.getByText("© 2025 Markdown Free")).toBeVisible();
  });

  test("about page loads correctly", async ({ page }) => {
    await page.goto("/about");
    await expect(page.getByRole("heading", { name: "About Markdown Free" })).toBeVisible();
  });

  test("privacy page loads correctly", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page.getByRole("heading", { name: "Privacy Policy" })).toBeVisible();
  });
});

test.describe("Production - SEO & Metadata", () => {
  test("homepage has correct meta tags", async ({ page }) => {
    await page.goto("/");
    
    // SEO-optimized title contains target keywords
    await expect(page).toHaveTitle(/Markdown to PDF/i);
    
    const description = await page.locator('meta[name="description"]').getAttribute("content");
    expect(description).toBeTruthy();
    expect(description).toContain("Markdown");
  });

  test("favicon is present", async ({ page }) => {
    await page.goto("/");
    const favicon = page.locator('link[rel="icon"]');
    await expect(favicon).toHaveAttribute("href", /favicon/);
  });

  test("site uses HTTPS", async ({ page }) => {
    await page.goto("/");
    expect(page.url()).toMatch(/^https:\/\//);
  });
});

test.describe("Production - Core Functionality", () => {
  test("export buttons are disabled initially", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("button", { name: "To PDF" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "To TXT" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "To HTML" })).toBeDisabled();
  });

  test("paste area toggle works", async ({ page }) => {
    await page.goto("/");

    // Initially hidden
    const textarea = page.getByPlaceholder("Paste your Markdown here…");
    await expect(textarea).not.toBeVisible();

    // Click toggle to show
    await page.getByRole("button", { name: "paste Markdown" }).click();
    await expect(textarea).toBeVisible();

    // Click toggle to hide
    await page.getByRole("button", { name: "paste Markdown" }).click();
    await expect(textarea).not.toBeVisible();
  });

  test("pasting markdown enables export buttons and updates preview", async ({ page }) => {
    await page.goto("/");

    // Open paste area
    await page.getByRole("button", { name: "paste Markdown" }).click();
    
    // Paste markdown
    const textarea = page.getByPlaceholder("Paste your Markdown here…");
    await textarea.fill("# Hello Production\n\nThis is a test.");

    // Wait for debounce
    await page.waitForTimeout(400);

    // Buttons should be enabled
    await expect(page.getByRole("button", { name: "To PDF" })).toBeEnabled();
    await expect(page.getByRole("button", { name: "To TXT" })).toBeEnabled();
    await expect(page.getByRole("button", { name: "To HTML" })).toBeEnabled();

    // Preview should show rendered content
    await expect(page.locator("article h1")).toContainText("Hello Production");
    await expect(page.getByText("Ready to export (pasted text)")).toBeVisible();
  });

  test("file upload enables export buttons", async ({ page }) => {
    await page.goto("/");

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: "test.md",
      mimeType: "text/markdown",
      buffer: Buffer.from("# Test File\n\nContent here."),
    });

    await page.waitForTimeout(300);

    // Buttons should be enabled
    await expect(page.getByRole("button", { name: "To PDF" })).toBeEnabled();
    await expect(page.getByRole("button", { name: "To TXT" })).toBeEnabled();
    await expect(page.getByRole("button", { name: "To HTML" })).toBeEnabled();

    // Status should show filename
    await expect(page.getByText(/test\.md/)).toBeVisible();
    await expect(page.getByText("Ready to export (uploaded file)")).toBeVisible();
  });
});

test.describe("Production - Export (Real API)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    
    // Set up content via paste
    await page.getByRole("button", { name: "paste Markdown" }).click();
    const textarea = page.getByPlaceholder("Paste your Markdown here…");
    await textarea.fill("# Production Test\n\n**Bold** and *italic* text.\n\n- List item 1\n- List item 2");
    await page.waitForTimeout(400);
  });

  test("TXT export downloads correct file", async ({ page }) => {
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "To TXT" }).click();

    const download = await downloadPromise;
    // Pasted content generates timestamp-based filename: markdown-YYYYMMDD-HHMMSS.txt
    expect(download.suggestedFilename()).toMatch(/^markdown-\d{8}-\d{6}\.txt$/);

    // Verify content
    const path = await download.path();
    const fs = require("fs");
    const content = fs.readFileSync(path!, "utf-8");
    expect(content).toContain("# Production Test");
    expect(content).toContain("**Bold**");
  });

  test("HTML export downloads correct file", async ({ page }) => {
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "To HTML" }).click();

    const download = await downloadPromise;
    // Pasted content generates timestamp-based filename: markdown-YYYYMMDD-HHMMSS.html
    expect(download.suggestedFilename()).toMatch(/^markdown-\d{8}-\d{6}\.html$/);

    // Verify HTML structure
    const path = await download.path();
    const fs = require("fs");
    const content = fs.readFileSync(path!, "utf-8");
    expect(content).toContain("<!DOCTYPE html>");
    expect(content).toContain("<h1>Production Test</h1>");
    expect(content).toContain("<strong>Bold</strong>");
  });

  test("PDF export downloads valid PDF file (real API)", async ({ page }) => {
    // This tests the actual production PDF API - may take longer on cold start
    test.setTimeout(45000);

    const downloadPromise = page.waitForEvent("download", { timeout: 40000 });
    
    // Click PDF button
    await page.getByRole("button", { name: "To PDF" }).click();

    // Should show loading state
    await expect(page.getByText("Generating...")).toBeVisible();

    // Wait for download
    const download = await downloadPromise;
    // PDF API uses "document.pdf" fallback when no filename provided
    expect(download.suggestedFilename()).toBe("document.pdf");

    // Verify it's a valid PDF (starts with %PDF)
    const path = await download.path();
    const fs = require("fs");
    const buffer = fs.readFileSync(path!);
    expect(buffer.toString("utf-8", 0, 4)).toBe("%PDF");
    
    // PDF should have reasonable size (not empty)
    expect(buffer.length).toBeGreaterThan(1000);
  });

  test("PDF export with uploaded file uses correct filename", async ({ page }) => {
    test.setTimeout(45000);

    // Upload a file instead of pasting
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: "my-document.md",
      mimeType: "text/markdown",
      buffer: Buffer.from("# My Document\n\nThis is content."),
    });
    await page.waitForTimeout(300);

    const downloadPromise = page.waitForEvent("download", { timeout: 40000 });
    await page.getByRole("button", { name: "To PDF" }).click();

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe("my-document.pdf");
  });
});

test.describe("Production - Navigation", () => {
  test("header navigation works", async ({ page }) => {
    await page.goto("/");

    // Navigate to About
    await page.locator("header").getByRole("link", { name: "About" }).click();
    await expect(page).toHaveURL(/\/about$/);

    // Navigate to Privacy
    await page.locator("header").getByRole("link", { name: "Privacy" }).click();
    await expect(page).toHaveURL(/\/privacy$/);

    // Navigate back to home via logo
    await page.locator("header").getByRole("link", { name: /Markdown Free/ }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test("footer privacy link works", async ({ page }) => {
    await page.goto("/");
    
    await page.locator("footer").getByRole("link", { name: "Privacy" }).click();
    await expect(page).toHaveURL(/\/privacy$/);
  });
});

test.describe("Production - Mobile Experience", () => {
  test("mobile menu works correctly", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    // Hamburger should be visible
    const hamburger = page.locator('button[aria-label="Open menu"]');
    await expect(hamburger).toBeVisible();

    // Open menu
    await hamburger.click();
    await expect(page.locator('button[aria-label="Close menu"]')).toBeVisible();

    // Navigate via mobile menu
    await page.locator("header").getByRole("link", { name: "About" }).click();
    await expect(page).toHaveURL(/\/about$/);

    // Menu should close
    await expect(page.locator('button[aria-label="Open menu"]')).toBeVisible();
  });

  test("no horizontal scroll on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalScroll).toBe(false);
  });
});

test.describe("Production - Security", () => {
  test("XSS is prevented in markdown preview", async ({ page }) => {
    await page.goto("/");

    let alertTriggered = false;
    page.on("dialog", async (dialog) => {
      alertTriggered = true;
      await dialog.dismiss();
    });

    // Open paste area and inject malicious content
    await page.getByRole("button", { name: "paste Markdown" }).click();
    const textarea = page.getByPlaceholder("Paste your Markdown here…");
    await textarea.fill(`# Safe Title\n\n<script>alert('xss')</script>\n\nSafe content.`);

    await page.waitForTimeout(500);

    // Verify XSS didn't execute
    expect(alertTriggered).toBe(false);

    // Verify script tag is not in output
    const articleHtml = await page.locator("article").innerHTML();
    expect(articleHtml).not.toContain("<script>");

    // Safe content should render
    await expect(page.locator("article h1")).toContainText("Safe Title");
  });
});

test.describe("Production - Error Handling", () => {
  test("invalid file type shows error", async ({ page }) => {
    await page.goto("/");

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: "image.png",
      mimeType: "image/png",
      buffer: Buffer.from("fake image"),
    });

    await page.waitForTimeout(200);
    await expect(page.getByText(/Unsupported file type/)).toBeVisible();
  });

  test("oversized file is rejected client-side", async ({ page }) => {
    await page.goto("/");

    const fileInput = page.locator('input[type="file"]');
    
    // 6MB file (over 5MB limit)
    const largeBuffer = Buffer.alloc(6 * 1024 * 1024, "x");
    await fileInput.setInputFiles({
      name: "large.md",
      mimeType: "text/markdown",
      buffer: largeBuffer,
    });

    await expect(page.getByText("File too large. Maximum size is 5MB.")).toBeVisible();
    await expect(page.getByRole("button", { name: "To PDF" })).toBeDisabled();
  });
});

test.describe("Production - Performance", () => {
  test("homepage loads within acceptable time", async ({ page }) => {
    const startTime = Date.now();
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const loadTime = Date.now() - startTime;

    // Should load DOM within 5 seconds even with network latency
    expect(loadTime).toBeLessThan(5000);
  });

  test("static assets are served with caching headers", async ({ request }) => {
    const response = await request.get("/favicon.svg");
    expect(response.status()).toBe(200);
    
    const cacheControl = response.headers()["cache-control"];
    expect(cacheControl).toContain("max-age");
  });
});

test.describe("Production - Special Filename Handling (Real API)", () => {
  test("PDF export handles filename with en-dash (–) correctly", async ({ page }) => {
    // Tests RFC 5987 encoding for Unicode filenames in Content-Disposition
    test.setTimeout(45000);

    await page.goto("/");

    // Upload file with Unicode en-dash in filename
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: "Report 2024–2025.md", // Contains en-dash (U+2013)
      mimeType: "text/markdown",
      buffer: Buffer.from("# Quarterly Report\n\n## Q1-Q4 Analysis\n\nRevenue increased by 15%."),
    });
    await page.waitForTimeout(300);

    // Verify file is loaded
    await expect(page.getByText("Ready to export (uploaded file)")).toBeVisible();

    const downloadPromise = page.waitForEvent("download", { timeout: 40000 });
    await page.getByRole("button", { name: "To PDF" }).click();

    // Should show loading state
    await expect(page.getByText("Generating...")).toBeVisible();

    const download = await downloadPromise;

    // Download should succeed - browser decodes RFC 5987 filename
    // The exact filename depends on browser handling, but it should contain the base name
    const filename = download.suggestedFilename();
    expect(filename).toBeTruthy();
    expect(filename).toMatch(/Report.*2024.*2025\.pdf/);

    // Verify it's a valid PDF
    const path = await download.path();
    const fs = require("fs");
    const buffer = fs.readFileSync(path!);
    expect(buffer.toString("utf-8", 0, 4)).toBe("%PDF");
  });

  test("PDF export handles filename with Chinese characters", async ({ page }) => {
    test.setTimeout(45000);

    await page.goto("/");

    // Upload file with Chinese characters in filename
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: "报告文档.md", // Chinese: "Report Document"
      mimeType: "text/markdown",
      buffer: Buffer.from("# 季度报告\n\n## 摘要\n\n这是一份测试文档。"),
    });
    await page.waitForTimeout(300);

    await expect(page.getByText("Ready to export (uploaded file)")).toBeVisible();

    const downloadPromise = page.waitForEvent("download", { timeout: 40000 });
    await page.getByRole("button", { name: "To PDF" }).click();

    const download = await downloadPromise;

    // Download should succeed
    const filename = download.suggestedFilename();
    expect(filename).toBeTruthy();
    expect(filename).toMatch(/\.pdf$/);

    // Verify valid PDF
    const path = await download.path();
    const fs = require("fs");
    const buffer = fs.readFileSync(path!);
    expect(buffer.toString("utf-8", 0, 4)).toBe("%PDF");
  });

  test("PDF export handles filename with accented characters", async ({ page }) => {
    test.setTimeout(45000);

    await page.goto("/");

    // Upload file with French accented characters
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: "Résumé–Draft.md", // Contains é and en-dash
      mimeType: "text/markdown",
      buffer: Buffer.from("# Mon Résumé\n\n## Expérience\n\n- Développeur Senior"),
    });
    await page.waitForTimeout(300);

    await expect(page.getByText("Ready to export (uploaded file)")).toBeVisible();

    const downloadPromise = page.waitForEvent("download", { timeout: 40000 });
    await page.getByRole("button", { name: "To PDF" }).click();

    const download = await downloadPromise;

    // Download should succeed
    const filename = download.suggestedFilename();
    expect(filename).toBeTruthy();
    expect(filename).toMatch(/\.pdf$/);

    // Verify valid PDF
    const path = await download.path();
    const fs = require("fs");
    const buffer = fs.readFileSync(path!);
    expect(buffer.toString("utf-8", 0, 4)).toBe("%PDF");
    expect(buffer.length).toBeGreaterThan(1000);
  });

  test("TXT export preserves Unicode filename", async ({ page }) => {
    await page.goto("/");

    // Upload file with Unicode filename
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: "Summary 2024–2025.md", // Contains en-dash
      mimeType: "text/markdown",
      buffer: Buffer.from("# Summary\n\nYear in review."),
    });
    await page.waitForTimeout(300);

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "To TXT" }).click();

    const download = await downloadPromise;

    // TXT export is client-side, should preserve Unicode filename
    const filename = download.suggestedFilename();
    expect(filename).toMatch(/Summary.*2024.*2025\.txt/);
  });

  test("HTML export preserves Unicode filename", async ({ page }) => {
    await page.goto("/");

    // Upload file with Unicode filename
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: "Café–Menu.md", // Contains é and en-dash
      mimeType: "text/markdown",
      buffer: Buffer.from("# Café Menu\n\n- Espresso\n- Café au lait"),
    });
    await page.waitForTimeout(300);

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "To HTML" }).click();

    const download = await downloadPromise;

    // HTML export is client-side, should preserve Unicode filename
    const filename = download.suggestedFilename();
    expect(filename).toMatch(/Caf.*Menu\.html/);

    // Verify HTML content
    const path = await download.path();
    const fs = require("fs");
    const content = fs.readFileSync(path!, "utf-8");
    expect(content).toContain("<!DOCTYPE html>");
    expect(content).toContain("Café Menu");
  });
});
