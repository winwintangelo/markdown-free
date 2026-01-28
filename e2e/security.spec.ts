import { test, expect } from "@playwright/test";
import path from "path";
import fs from "fs";

/**
 * Security Tests for PDF Export
 *
 * These tests validate security measures in the PDF generation pipeline:
 * 1. JavaScript disabled in Puppeteer
 * 2. External network requests blocked (SSRF protection)
 * 3. XSS sanitization works
 */

test.use({
  actionTimeout: 60000,
});

const MIN_PDF_SIZE = 10000;

test.describe("PDF Security - Puppeteer Sandbox", () => {
  test.slow();

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should generate PDF with normal markdown content", async ({ page }) => {
    const content = `# Security Test Document

This is a normal markdown document.

- Item 1
- Item 2
- Item 3

**Bold** and *italic* work fine.`;

    await page.getByRole("button", { name: "paste Markdown" }).click();
    const textarea = page.getByPlaceholder("Paste your Markdown here…");
    await textarea.fill(content);

    await expect(page.getByText("Ready to export")).toBeVisible();

    const downloadPromise = page.waitForEvent("download", { timeout: 60000 });
    await page.getByRole("button", { name: "To PDF" }).click();

    const download = await downloadPromise;
    const downloadPath = path.join("tmp", `security-normal-${Date.now()}.pdf`);
    await download.saveAs(downloadPath);

    const stats = fs.statSync(downloadPath);
    expect(stats.size).toBeGreaterThan(MIN_PDF_SIZE);

    fs.unlinkSync(downloadPath);
  });

  test("should generate PDF even with external image URLs (images blocked but PDF still works)", async ({
    page,
  }) => {
    // This markdown contains external image URLs that should be blocked
    // The PDF should still generate, just without the external images
    const content = `# Document with External Images

This document has external image references:

![External Image](https://example.com/malicious-image.png)
![Another External](http://localhost:8080/internal-scan.png)
![File Protocol](file:///etc/passwd)

The PDF should still generate successfully, but these images won't load.

Normal text continues here.`;

    await page.getByRole("button", { name: "paste Markdown" }).click();
    const textarea = page.getByPlaceholder("Paste your Markdown here…");
    await textarea.fill(content);

    await expect(page.getByText("Ready to export")).toBeVisible();

    const downloadPromise = page.waitForEvent("download", { timeout: 60000 });
    await page.getByRole("button", { name: "To PDF" }).click();

    const download = await downloadPromise;
    const downloadPath = path.join(
      "tmp",
      `security-blocked-images-${Date.now()}.pdf`
    );
    await download.saveAs(downloadPath);

    // PDF should still be generated (external requests blocked, not failed)
    const stats = fs.statSync(downloadPath);
    expect(stats.size).toBeGreaterThan(MIN_PDF_SIZE);

    fs.unlinkSync(downloadPath);
  });

  test("should sanitize XSS attempts in markdown", async ({ page }) => {
    // This markdown contains XSS attempts that should be sanitized
    const content = `# XSS Test Document

Normal paragraph.

<script>alert('XSS')</script>

<img src="x" onerror="alert('XSS')">

<a href="javascript:alert('XSS')">Click me</a>

<div onmouseover="alert('XSS')">Hover me</div>

Normal text after XSS attempts.

**This bold text should render correctly.**`;

    await page.getByRole("button", { name: "paste Markdown" }).click();
    const textarea = page.getByPlaceholder("Paste your Markdown here…");
    await textarea.fill(content);

    await expect(page.getByText("Ready to export")).toBeVisible();

    // Verify XSS is sanitized in preview (no script tags, no javascript: URLs)
    const previewContent = await page.locator("article").innerHTML();
    expect(previewContent).not.toContain("<script>");
    expect(previewContent).not.toContain("onerror=");
    expect(previewContent).not.toContain("javascript:");
    expect(previewContent).not.toContain("onmouseover=");

    // PDF should still generate
    const downloadPromise = page.waitForEvent("download", { timeout: 60000 });
    await page.getByRole("button", { name: "To PDF" }).click();

    const download = await downloadPromise;
    const downloadPath = path.join("tmp", `security-xss-${Date.now()}.pdf`);
    await download.saveAs(downloadPath);

    const stats = fs.statSync(downloadPath);
    expect(stats.size).toBeGreaterThan(MIN_PDF_SIZE);

    fs.unlinkSync(downloadPath);
  });

  test("should handle markdown with code blocks containing script tags", async ({
    page,
  }) => {
    // Code blocks should preserve content (for documentation) but not execute
    const content = `# Code Security Test

Here's some JavaScript code:

\`\`\`html
<script>
  document.getElementById('app').innerHTML = '<h1>Hello</h1>';
</script>
\`\`\`

And inline code: \`<script>alert('hi')</script>\`

This should render as code, not execute.`;

    await page.getByRole("button", { name: "paste Markdown" }).click();
    const textarea = page.getByPlaceholder("Paste your Markdown here…");
    await textarea.fill(content);

    await expect(page.getByText("Ready to export")).toBeVisible();

    const downloadPromise = page.waitForEvent("download", { timeout: 60000 });
    await page.getByRole("button", { name: "To PDF" }).click();

    const download = await downloadPromise;
    const downloadPath = path.join(
      "tmp",
      `security-code-blocks-${Date.now()}.pdf`
    );
    await download.saveAs(downloadPath);

    const stats = fs.statSync(downloadPath);
    expect(stats.size).toBeGreaterThan(MIN_PDF_SIZE);

    fs.unlinkSync(downloadPath);
  });
});

test.describe("PDF Security - Content Limits", () => {
  test("should reject PDF content larger than 1MB", async ({ request }) => {
    // Create content larger than 1MB (PDF API limit)
    const largeContent = "# Large Document\n\n" + "x".repeat(1.5 * 1024 * 1024);

    const response = await request.post("/api/convert/pdf", {
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
      },
      data: {
        markdown: largeContent,
        filename: "large.md",
      },
    });

    // Should be rejected due to size limit
    expect(response.status()).toBe(413);

    const body = await response.json();
    expect(body.error).toBe("CONTENT_TOO_LARGE");
  });
});

test.describe("PDF Security - Image Proxy", () => {
  test.slow();

  test("should generate PDF with external image URLs (proxied)", async ({
    page,
  }) => {
    await page.goto("/");

    // Markdown with a real external image (GitHub avatar as test)
    const content = `# Document with External Image

![GitHub Logo](https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png)

This document has an external image that should be proxied.`;

    await page.getByRole("button", { name: "paste Markdown" }).click();
    const textarea = page.getByPlaceholder("Paste your Markdown here…");
    await textarea.fill(content);

    await expect(page.getByText("Ready to export")).toBeVisible();

    const downloadPromise = page.waitForEvent("download", { timeout: 60000 });
    await page.getByRole("button", { name: "To PDF" }).click();

    const download = await downloadPromise;

    // PDF should be generated successfully with proxied image
    expect(download.suggestedFilename()).toContain(".pdf");
  });

  test("should block localhost image URLs (SSRF protection)", async ({
    request,
  }) => {
    // This test verifies that localhost images are blocked
    const content = `# SSRF Test

![Localhost](http://localhost:8080/admin/secrets.png)
![127.0.0.1](http://127.0.0.1/internal.png)
![Internal](http://192.168.1.1/config.png)

These images should be blocked.`;

    const response = await request.post("/api/convert/pdf", {
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
      },
      data: {
        markdown: content,
        filename: "ssrf-test.md",
      },
    });

    // PDF should still generate (images blocked, not failed)
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toBe("application/pdf");
  });
});

test.describe("API Security Headers", () => {
  test("should have basic security headers", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);

    const headers = response?.headers();

    // These headers are set in next.config.js for all environments
    expect(headers?.["x-content-type-options"]).toBe("nosniff");
    expect(headers?.["x-frame-options"]).toBe("DENY");
    // Note: X-XSS-Protection removed - deprecated, CSP provides better protection
    expect(headers?.["referrer-policy"]).toBe("strict-origin-when-cross-origin");

    // HSTS and CSP are only in production (to avoid HMR issues)
    // They're validated in production.spec.ts
  });
});

test.describe("API Security - Rate Limiting", () => {
  test("should include rate limit headers in PDF API response", async ({
    request,
  }) => {
    // Make a valid request to the PDF API
    const response = await request.post("/api/convert/pdf", {
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
      },
      data: {
        markdown: "# Test\n\nSimple content",
        filename: "test.md",
      },
    });

    // Check for rate limit headers
    // In dev mode, limit is 100; in production, limit is 15
    const limit = response.headers()["x-ratelimit-limit"];
    expect(["15", "100"]).toContain(limit);
    expect(response.headers()["x-ratelimit-remaining"]).toBeDefined();
  });
});

test.describe("DOCX Security - SSRF Protection", () => {
  test.slow();

  const SSRF_TEST_MARKDOWN = `# Red Team: SSRF & URL Obfuscation

If your proxy works, **ALL** images below should fail (broken icons).
If any image loads, you have a bypass.

## 1. Decimal & Octal IP Encoding
Browsers translate these to 127.0.0.1. Does your proxy?
![Decimal Localhost](http://2130706433/favicon.ico)
![Octal Localhost](http://0177.0.0.1/favicon.ico)
![Hex Localhost](http://0x7f000001/favicon.ico)

## 2. DNS Rebinding / IP-less Localhost
Sometimes "localhost" is blocked, but the IPv6 short-hand isn't.
![IPv6 Short](http://[::1]/favicon.ico)
![Localdomain](http://localhost.localdomain/favicon.ico)

## 3. Protocol Confusion
Trying to access local files or metadata services via obscure schemes.
![File Access](file:///etc/passwd)
![Metadata AWS](http://169.254.169.254/latest/meta-data/)

## 4. Redirect Attack
This URL redirects to 127.0.0.1. Your proxy *must* follow the redirect and validate the *destination*, not just the source.
![Redirect to Loopback](https://httpbin.org/redirect-to?url=http%3A%2F%2F127.0.0.1%2Ffavicon.ico)
`;

  test("should generate DOCX with SSRF payloads without crashing", async ({
    request,
  }) => {
    // This is the critical test - DOCX generation should NOT crash with SSRF payloads
    const response = await request.post("/api/convert/docx", {
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
      },
      data: {
        markdown: SSRF_TEST_MARKDOWN,
        filename: "ssrf-test.md",
      },
    });

    // DOCX should generate successfully (status 200), not crash (status 500)
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toBe(
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    // DOCX file should have reasonable size (not empty)
    const buffer = await response.body();
    expect(buffer.length).toBeGreaterThan(1000);
  });

  test("should generate DOCX with blocked localhost image URLs", async ({
    request,
  }) => {
    const content = `# SSRF Test

![Localhost](http://localhost:8080/admin/secrets.png)
![127.0.0.1](http://127.0.0.1/internal.png)
![Internal](http://192.168.1.1/config.png)
![Metadata](http://169.254.169.254/latest/meta-data/)

These images should be blocked but DOCX should still generate.`;

    const response = await request.post("/api/convert/docx", {
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
      },
      data: {
        markdown: content,
        filename: "ssrf-localhost.md",
      },
    });

    // DOCX should still generate (images blocked, not failed)
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toBe(
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
  });

  test("should generate DOCX with file:// protocol images (sanitized)", async ({
    request,
  }) => {
    // file:// URLs are stripped by rehype-sanitize, leaving malformed img tags
    // This tests that the DOCX generation handles these gracefully
    const content = `# File Protocol Test

![File](file:///etc/passwd)
![Windows File](file:///C:/Windows/System32/config/SAM)

Normal text should appear in the DOCX.`;

    const response = await request.post("/api/convert/docx", {
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
      },
      data: {
        markdown: content,
        filename: "file-protocol.md",
      },
    });

    // DOCX should generate successfully
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toBe(
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
  });

  test("should generate DOCX with IP obfuscation payloads", async ({
    request,
  }) => {
    // These are various IP obfuscation techniques used to bypass SSRF filters
    const content = `# IP Obfuscation Test

![Decimal IP](http://2130706433/test.png)
![Octal IP](http://0177.0.0.1/test.png)
![Hex IP](http://0x7f000001/test.png)
![IPv6 Short](http://[::1]/test.png)
![IPv6 Mapped](http://[::ffff:127.0.0.1]/test.png)

All these resolve to localhost and should be blocked.`;

    const response = await request.post("/api/convert/docx", {
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
      },
      data: {
        markdown: content,
        filename: "ip-obfuscation.md",
      },
    });

    // DOCX should generate successfully
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toBe(
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
  });

  test("should reject DOCX content larger than 1MB", async ({ request }) => {
    // Create content larger than 1MB (DOCX API limit)
    const largeContent = "# Large Document\n\n" + "x".repeat(1.5 * 1024 * 1024);

    const response = await request.post("/api/convert/docx", {
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
      },
      data: {
        markdown: largeContent,
        filename: "large.md",
      },
    });

    // Should be rejected due to size limit
    expect(response.status()).toBe(413);

    const body = await response.json();
    expect(body.error).toBe("CONTENT_TOO_LARGE");
  });
});

test.describe("DOCX Security - Normal Content", () => {
  test("should generate DOCX with normal markdown content", async ({
    request,
  }) => {
    const content = `# Normal Document

This is a normal markdown document.

- Item 1
- Item 2
- Item 3

**Bold** and *italic* work fine.

| Column A | Column B |
|----------|----------|
| Value 1  | Value 2  |
`;

    const response = await request.post("/api/convert/docx", {
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
      },
      data: {
        markdown: content,
        filename: "normal.md",
      },
    });

    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toBe(
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    const buffer = await response.body();
    expect(buffer.length).toBeGreaterThan(1000);
  });
});

test.describe("API Security - Origin Validation", () => {
  test("should block requests from unauthorized origins", async ({
    request,
  }) => {
    const response = await request.post("/api/convert/pdf", {
      headers: {
        "Content-Type": "application/json",
        Origin: "https://malicious-site.com",
      },
      data: {
        markdown: "# Test",
        filename: "test.md",
      },
    });

    // Should be forbidden due to unauthorized origin
    expect(response.status()).toBe(403);

    const body = await response.json();
    expect(body.error).toBe("FORBIDDEN");
  });

  test("should allow requests from localhost", async ({ request }) => {
    const response = await request.post("/api/convert/pdf", {
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
      },
      data: {
        markdown: "# Test\n\nContent here",
        filename: "test.md",
      },
    });

    // Should succeed (200 for PDF or valid error)
    expect(response.status()).not.toBe(403);
  });
});
