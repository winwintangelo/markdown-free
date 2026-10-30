import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

/**
 * PDF reliability (src/lib/export-pdf.ts, src/app/api/convert/pdf/route.ts).
 *
 * In production a slow document used to run past the function's time limit,
 * and the platform answered with a plain-text 504 that the client logged as
 * "unknown". Now:
 * - a transient failure (dropped connection, platform 5xx, a quick timeout) is
 *   retried once, and `convert_retry` records whether the retry saved it;
 * - a failure a retry can't fix (too large, rate limited) is not retried;
 * - every failure reaches analytics with its own code.
 * The route's time budget and the image deadline are covered in
 * e2e/img-proxy.spec.ts and by hand against production.
 */

const EN = JSON.parse(fs.readFileSync(path.join(process.cwd(), "src/i18n/dictionaries/en.json"), "utf-8"));
const PLATFORM_TIMEOUT = "An error occurred with your deployment\n\nFUNCTION_INVOCATION_TIMEOUT\n\niad1::abcde-1\n";

type TrackedEvent = { name: string; data?: Record<string, string> };

function stubAnalytics(page: Page) {
  return page.addInitScript(() => {
    (window as unknown as { __events: unknown[] }).__events = [];
    (window as unknown as { umami: unknown }).umami = {
      track: (name: string, data?: Record<string, string>) =>
        (window as unknown as { __events: unknown[] }).__events.push({ name, data }),
    };
  });
}

function eventsNamed(page: Page, name: string): Promise<TrackedEvent[]> {
  return page.evaluate(
    (n) => (window as unknown as { __events: TrackedEvent[] }).__events.filter((e) => e.name === n),
    name
  );
}

async function loadSample(page: Page) {
  await page.goto("/");
  await page.locator('input[type="file"]').setInputFiles({
    name: "sample.md",
    mimeType: "text/markdown",
    buffer: Buffer.from("# Hello\n\nThis is a test."),
  });
  await expect(page.getByRole("heading", { name: "Hello" })).toBeVisible({ timeout: 15000 });
}

/**
 * Answer the PDF route's POSTs from `answers` in order (a function each); once
 * they run out, let requests through to the real route. Returns a call counter.
 */
async function scriptPdfRoute(
  page: Page,
  answers: ((route: import("@playwright/test").Route) => Promise<void>)[]
) {
  const calls = { count: 0 };
  await page.route("**/api/convert/pdf", async (route) => {
    if (route.request().method() !== "POST") return route.continue();
    const answer = answers[calls.count++];
    return answer ? answer(route) : route.continue();
  });
  return calls;
}

const clickPdf = (page: Page) => page.getByRole("button", { name: /To PDF/i }).first().click();

test.beforeEach(async ({ page }) => {
  await stubAnalytics(page);
});

test.describe("PDF export — one retry for transient failures", () => {
  test("a platform 504 is retried and the PDF downloads", async ({ page }) => {
    const calls = await scriptPdfRoute(page, [
      (r) => r.fulfill({ status: 504, contentType: "text/plain; charset=utf-8", body: PLATFORM_TIMEOUT }),
    ]);
    await loadSample(page);
    const download = page.waitForEvent("download", { timeout: 30000 });
    await clickPdf(page);
    expect((await download).suggestedFilename()).toMatch(/\.pdf$/);

    expect(calls.count).toBe(2);
    await expect(page.getByTestId("export-error")).toHaveCount(0);
    expect((await eventsNamed(page, "convert_retry")).map((e) => e.data)).toEqual([
      { format: "pdf", error_code: "gateway_timeout", outcome: "recovered" },
    ]);
    expect(await eventsNamed(page, "convert_success")).toHaveLength(1);
    expect(await eventsNamed(page, "convert_error")).toHaveLength(0);
  });

  test("a dropped connection is retried", async ({ page }) => {
    const calls = await scriptPdfRoute(page, [(r) => r.abort("connectionreset")]);
    await loadSample(page);
    const download = page.waitForEvent("download", { timeout: 30000 });
    await clickPdf(page);
    await download;

    expect(calls.count).toBe(2);
    expect((await eventsNamed(page, "convert_retry")).map((e) => e.data?.error_code)).toEqual(["network_error"]);
  });

  test("a quick route timeout (a cold start) is retried", async ({ page }) => {
    const calls = await scriptPdfRoute(page, [
      (r) =>
        r.fulfill({
          status: 504,
          contentType: "application/json",
          body: JSON.stringify({ error: "GENERATION_TIMEOUT", message: "PDF generation timed out." }),
        }),
    ]);
    await loadSample(page);
    const download = page.waitForEvent("download", { timeout: 30000 });
    await clickPdf(page);
    await download;

    expect(calls.count).toBe(2);
    expect((await eventsNamed(page, "convert_retry")).map((e) => e.data)).toEqual([
      { format: "pdf", error_code: "pdf_timeout", outcome: "recovered" },
    ]);
  });

  test("two platform timeouts show the timeout message and log both", async ({ page }) => {
    const timeout = (r: import("@playwright/test").Route) =>
      r.fulfill({ status: 504, contentType: "text/plain; charset=utf-8", body: PLATFORM_TIMEOUT });
    const calls = await scriptPdfRoute(page, [timeout, timeout]);
    await loadSample(page);
    await clickPdf(page);

    const banner = page.getByTestId("export-error");
    await expect(banner).toBeVisible({ timeout: 15000 });
    await expect(banner).toContainText(EN.errors.timeout.replace("{format}", "PDF"));
    await expect(banner).not.toContainText("FUNCTION_INVOCATION_TIMEOUT");
    expect(calls.count).toBe(2);
    expect((await eventsNamed(page, "convert_retry")).map((e) => e.data?.outcome)).toEqual(["failed"]);
    expect((await eventsNamed(page, "convert_error")).map((e) => e.data?.error_code)).toEqual(["gateway_timeout"]);
  });
});

test.describe("PDF export — failures a retry can't fix", () => {
  test("a document over the size limit is not retried and is logged as too_large", async ({ page }) => {
    const tooLarge = (r: import("@playwright/test").Route) =>
      r.fulfill({
        status: 413,
        contentType: "application/json",
        body: JSON.stringify({ error: "CONTENT_TOO_LARGE", message: "Content exceeds maximum size of 1MB." }),
      });
    const calls = await scriptPdfRoute(page, [tooLarge, tooLarge]);
    await loadSample(page);
    await clickPdf(page);

    await expect(page.getByTestId("export-error")).toContainText(EN.errors.contentTooLarge);
    expect(calls.count).toBe(1);
    expect(await eventsNamed(page, "convert_retry")).toHaveLength(0);
    expect((await eventsNamed(page, "convert_error")).map((e) => e.data?.error_code)).toEqual(["too_large"]);
  });

  test("a rate-limited request is not retried and is logged as rate_limited", async ({ page }) => {
    const limited = (r: import("@playwright/test").Route) =>
      r.fulfill({
        status: 429,
        contentType: "application/json",
        body: JSON.stringify({ error: "RATE_LIMITED", message: "Too many requests." }),
      });
    const calls = await scriptPdfRoute(page, [limited, limited]);
    await loadSample(page);
    await clickPdf(page);

    await expect(page.getByTestId("export-error")).toContainText(EN.errors.rateLimited);
    expect(calls.count).toBe(1);
    expect((await eventsNamed(page, "convert_error")).map((e) => e.data?.error_code)).toEqual(["rate_limited"]);
  });
});
