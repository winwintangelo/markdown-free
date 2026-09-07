import { test, expect, type Page } from "@playwright/test";
import { openMoreFormats } from "./export-helpers";

/**
 * Feedback goes to the first-party endpoint, never to analytics.
 *
 * Build plan Phase −1: the post-convert comment (and the feedback modal's
 * message + email) used to be attached to Umami events. Now they POST to
 * /api/feedback, which forwards to the owner's inbox (Resend) and analytics
 * only ever sees counts.
 *
 * The endpoint tests send an Origin header because the production middleware
 * rejects origin-less POSTs (same as the filename spec).
 */

const ORIGIN_HEADERS = { Origin: "http://localhost:3000" };

// Helper: load a small file and export TXT (client-side, no server involved),
// which surfaces the post-convert feedback prompt.
async function uploadAndExportTxt(page: Page) {
  await page.locator('input[type="file"]').setInputFiles({
    name: "sample.md",
    mimeType: "text/markdown",
    buffer: Buffer.from("# Hello\n\nThis is a test."),
  });
  await expect(page.getByText("Ready to export (uploaded file)")).toBeVisible({ timeout: 15000 });
  const downloadPromise = page.waitForEvent("download");
  await openMoreFormats(page);
  await page.getByRole("button", { name: /To TXT/i }).click();
  await downloadPromise;
}

test.describe("POST /api/feedback", () => {
  test("accepts a message and reports whether it was delivered", async ({ request }) => {
    const response = await request.post("/api/feedback", {
      headers: ORIGIN_HEADERS,
      data: { message: "e2e: feedback endpoint smoke test", email: "e2e@example.com", source: "modal" },
    });
    // Without RESEND_API_KEY / FEEDBACK_TO_EMAIL the endpoint accepts the
    // message and reports delivered:false; with them configured it delivers.
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.ok).toBe(true);
    expect(typeof body.delivered).toBe("boolean");
  });

  test("rejects an empty message", async ({ request }) => {
    const response = await request.post("/api/feedback", {
      headers: ORIGIN_HEADERS,
      data: { message: "   ", source: "modal" },
    });
    expect(response.status()).toBe(400);
    expect((await response.json()).error).toBe("EMPTY_MESSAGE");
  });

  test("rejects an oversized message", async ({ request }) => {
    const response = await request.post("/api/feedback", {
      headers: ORIGIN_HEADERS,
      data: { message: "x".repeat(2001), source: "modal" },
    });
    expect(response.status()).toBe(413);
    expect((await response.json()).error).toBe("MESSAGE_TOO_LONG");
  });

  test("rejects a malformed reply email", async ({ request }) => {
    const response = await request.post("/api/feedback", {
      headers: ORIGIN_HEADERS,
      data: { message: "hello", email: "not-an-email", source: "modal" },
    });
    expect(response.status()).toBe(400);
    expect((await response.json()).error).toBe("INVALID_EMAIL");
  });

  test("rejects a non-JSON body", async ({ request }) => {
    const response = await request.post("/api/feedback", {
      headers: { ...ORIGIN_HEADERS, "Content-Type": "application/json" },
      data: "not json",
    });
    expect(response.status()).toBe(400);
  });
});

test.describe("Post-convert comment routing", () => {
  test("a comment is POSTed to /api/feedback and is absent from analytics payloads", async ({
    page,
  }) => {
    const feedbackPosts: Array<Record<string, unknown>> = [];
    const analyticsPayloads: string[] = [];

    await page.route("**/api/feedback", async (route) => {
      feedbackPosts.push(route.request().postDataJSON());
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, delivered: true }),
      });
    });
    page.on("request", (req) => {
      const url = req.url();
      if (url.includes("/ingest/api/send") || url.includes("/_vercel/insights")) {
        analyticsPayloads.push(req.postData() || "");
      }
    });

    await page.goto("/");
    await uploadAndExportTxt(page);

    await page.getByRole("button", { name: /Bad/i }).click();
    await page.getByRole("button", { name: /Too slow/i }).click();
    const comment = "SECRET-COMMENT-e2e-marker";
    await page.locator("textarea").fill(comment);
    await page.getByRole("button", { name: /Send/i }).click();
    await expect(page.getByText(/Thanks for your feedback/i)).toBeVisible();

    await expect.poll(() => feedbackPosts.length).toBe(1);
    expect(feedbackPosts[0]).toMatchObject({
      message: comment,
      source: "post_convert",
      format: "txt",
    });
    expect(feedbackPosts[0].categories).toEqual(["too_slow"]);

    // Analytics may or may not be loaded in this environment; whatever it
    // sent must not contain the comment.
    for (const payload of analyticsPayloads) {
      expect(payload).not.toContain(comment);
    }
  });

  test("no comment → nothing is POSTed to /api/feedback", async ({ page }) => {
    let feedbackPosts = 0;
    await page.route("**/api/feedback", async (route) => {
      feedbackPosts += 1;
      await route.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' });
    });

    await page.goto("/");
    await uploadAndExportTxt(page);
    await page.getByRole("button", { name: /Bad/i }).click();
    await page.getByRole("button", { name: /Send/i }).click();
    await expect(page.getByText(/Thanks for your feedback/i)).toBeVisible();

    // Give any stray request a moment to appear
    await page.waitForTimeout(500);
    expect(feedbackPosts).toBe(0);
  });
});
