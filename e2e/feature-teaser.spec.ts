import { test, expect, type Page, type APIRequestContext } from "@playwright/test";
import { openMoreFormats } from "./export-helpers";

/**
 * Phase 1.5 coming-features teaser (src/lib/feature-teaser.ts,
 * src/components/feature-teaser.tsx, src/app/api/notify/route.ts).
 *
 * - Display rules: the 1st conversion in a browser keeps the thumbs prompt;
 *   from the 2nd, the teaser replaces it at most once per 7 days.
 * - Chips: the email row appears after the first tap; voting sends analytics
 *   only; "Notify me" POSTs to /api/notify and the address never reaches
 *   analytics.
 * - /api/notify: validation errors are explicit; bot drops answer exactly like
 *   a stored signup.
 *
 * A server started for the suite (E2E_RELAXED_RATE_LIMITS=1) never stores a
 * signup and reports what it would have done in the x-notify-outcome header.
 * Tests that reach the store path skip themselves against any other server,
 * so a configured local .env cannot write test rows to Supabase.
 */

const ORIGIN_HEADERS = { Origin: "http://localhost:3000" };
const COUNT_KEY = "mdfree:conversions";
const SHOWN_AT_KEY = "mdfree:teaser-shown-at";
const DAY_MS = 24 * 60 * 60 * 1000;

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

function getEvents(page: Page): Promise<TrackedEvent[]> {
  return page.evaluate(() => (window as unknown as { __events: TrackedEvent[] }).__events);
}

async function uploadSample(page: Page) {
  await page.locator('input[type="file"]').setInputFiles({
    name: "sample.md",
    mimeType: "text/markdown",
    buffer: Buffer.from("# Hello\n\nThis is a test."),
  });
  await expect(page.getByRole("heading", { name: "Hello" })).toBeVisible({ timeout: 15000 });
}

// TXT export is client-side, so each call is one quick successful conversion.
async function exportTxt(page: Page) {
  const downloadPromise = page.waitForEvent("download");
  await openMoreFormats(page);
  await page.getByRole("button", { name: /TXT/ }).click();
  await downloadPromise;
}

// Pretend this browser already converted once, so the next conversion is its
// 2nd. `shownDaysAgo` places the last teaser that many days back.
async function seedHistory(page: Page, conversions: number, shownDaysAgo?: number) {
  await page.evaluate(
    ({ countKey, shownKey, conversions, shownAt }) => {
      localStorage.setItem(countKey, String(conversions));
      if (shownAt !== null) localStorage.setItem(shownKey, String(shownAt));
    },
    {
      countKey: COUNT_KEY,
      shownKey: SHOWN_AT_KEY,
      conversions,
      shownAt: shownDaysAgo === undefined ? null : Date.now() - shownDaysAgo * DAY_MS,
    }
  );
}

async function openTeaserOnSecondConversion(page: Page) {
  await page.goto("/");
  await seedHistory(page, 1);
  await uploadSample(page);
  await exportTxt(page);
  const teaser = page.getByTestId("feature-teaser");
  await expect(teaser).toBeVisible();
  await teaser.getByRole("button", { name: "See what's coming" }).click();
  await expect(teaser.getByRole("heading", { name: "Which of these would you use?" })).toBeVisible();
  return teaser;
}

// True when the server under test is a test target that never stores signups.
async function serverIsTestTarget(request: APIRequestContext): Promise<boolean> {
  const response = await request.post("/api/notify", {
    headers: ORIGIN_HEADERS,
    data: { email: "probe@example.com", features: ["backup"], locale: "en", website: "bot", elapsedMs: 5000 },
  });
  return response.headers()["x-notify-outcome"] === "dropped-honeypot";
}

test.describe("Feature teaser — when it shows", () => {
  test("1st conversion keeps the thumbs prompt; 2nd shows the teaser, which stays until dismissed", async ({
    page,
  }) => {
    await stubAnalytics(page);
    await page.goto("/");
    await uploadSample(page);

    await exportTxt(page);
    await expect(page.getByText("How's your experience?")).toBeVisible();
    await expect(page.getByTestId("feature-teaser")).toHaveCount(0);

    await exportTxt(page);
    const teaser = page.getByTestId("feature-teaser");
    await expect(teaser).toBeVisible();
    await expect(teaser).toContainText("More features are coming soon");
    await expect(page.getByText("How's your experience?")).toHaveCount(0);

    // Exporting another format right away keeps the teaser (shown once)
    await exportTxt(page);
    await expect(teaser).toBeVisible();

    // Dismissed, and within the 7-day cooldown: the thumbs prompt comes back
    await teaser.getByRole("button", { name: "Dismiss" }).click();
    await exportTxt(page);
    await expect(page.getByText("How's your experience?")).toBeVisible();
    await expect(page.getByTestId("feature-teaser")).toHaveCount(0);

    const events = await getEvents(page);
    const shown = events.filter((e) => e.name === "feature_teaser_shown");
    expect(shown).toHaveLength(1);
    expect(shown[0].data).toEqual({ trigger: "post_conversion", locale: "en" });
    expect(await page.evaluate((key) => localStorage.getItem(key), COUNT_KEY)).toBe("4");
  });

  test("after a vote, the next conversion shows the thumbs prompt", async ({ page }) => {
    const teaser = await openTeaserOnSecondConversion(page);
    await teaser.getByRole("button", { name: "Better formatting controls" }).click();
    await teaser.getByRole("button", { name: "Just count my vote, no email" }).click();
    await expect(teaser).toContainText("Thanks. Your vote is counted.");

    // Export again during the thanks line
    await exportTxt(page);
    await expect(page.getByText("How's your experience?")).toBeVisible();
    await expect(page.getByTestId("feature-teaser")).toHaveCount(0);
  });

  test("the teaser returns once the last one is more than 7 days old", async ({ page }) => {
    await page.goto("/");
    await seedHistory(page, 5, 8);
    await uploadSample(page);
    await exportTxt(page);
    await expect(page.getByTestId("feature-teaser")).toBeVisible();
  });

  test("a teaser shown 6 days ago keeps the thumbs prompt", async ({ page }) => {
    await page.goto("/");
    await seedHistory(page, 5, 6);
    await uploadSample(page);
    await exportTxt(page);
    await expect(page.getByText("How's your experience?")).toBeVisible();
    await expect(page.getByTestId("feature-teaser")).toHaveCount(0);
  });

  test("dismissing the teaser removes it", async ({ page }) => {
    await page.goto("/");
    await seedHistory(page, 1);
    await uploadSample(page);
    await exportTxt(page);
    const teaser = page.getByTestId("feature-teaser");
    await teaser.getByRole("button", { name: "Dismiss" }).click();
    await expect(teaser).toHaveCount(0);
  });
});

test.describe("Feature teaser — chips", () => {
  test("opening shows two chip rows and focuses the first chip; the email row appears after a tap", async ({
    page,
  }) => {
    await stubAnalytics(page);
    const teaser = await openTeaserOnSecondConversion(page);

    await expect(teaser.getByText("Premium", { exact: true })).toBeVisible();
    await expect(teaser.getByText("Free", { exact: true })).toBeVisible();
    const backup = teaser.getByRole("button", { name: "Back up your work" });
    await expect(backup).toBeFocused();
    await expect(backup).toHaveAttribute("aria-pressed", "false");
    await expect(page.locator("#notify-email")).toHaveCount(0);

    await backup.click();
    await expect(backup).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("#notify-email")).toBeVisible();

    // Tapping again deselects
    await backup.click();
    await expect(backup).toHaveAttribute("aria-pressed", "false");

    const events = await getEvents(page);
    expect(events.filter((e) => e.name === "feature_teaser_opened")).toHaveLength(1);
  });

  test("the honeypot field is hidden from people but present for bots", async ({ page }) => {
    const teaser = await openTeaserOnSecondConversion(page);
    await teaser.getByRole("button", { name: "Back up your work" }).click();

    const honeypot = teaser.locator('input[name="mf-extra"]');
    await expect(honeypot).toHaveCount(1);
    await expect(honeypot).toHaveAttribute("tabindex", "-1");
    await expect(honeypot).toHaveAttribute("aria-hidden", "true");
    await expect(honeypot).not.toBeInViewport();

    // Tab from the email field reaches the submit button, not the honeypot
    await page.locator("#notify-email").focus();
    await page.keyboard.press("Tab");
    await expect(teaser.getByRole("button", { name: "Notify me" })).toBeFocused();
  });

  test("voting without an email sends analytics per feature and never calls /api/notify", async ({ page }) => {
    let notifyCalls = 0;
    page.on("request", (req) => {
      if (req.url().includes("/api/notify")) notifyCalls += 1;
    });
    await stubAnalytics(page);
    const teaser = await openTeaserOnSecondConversion(page);

    await teaser.getByRole("button", { name: "Back up your work" }).click();
    await teaser.getByRole("button", { name: "Share as a link" }).click();
    await teaser.getByRole("button", { name: "Just count my vote, no email" }).click();
    await expect(teaser).toContainText("Thanks. Your vote is counted.");

    const names = (await getEvents(page)).map((e) => e.name);
    expect(names).toContain("feature_interest_backup");
    expect(names).toContain("feature_interest_share");
    expect(names).not.toContain("feature_interest_templates");
    const submitted = (await getEvents(page)).find((e) => e.name === "feature_interest_submitted");
    expect(submitted?.data).toEqual({ picks: "2", premium_picks: "1", with_email: "no" });
    expect(notifyCalls).toBe(0);

    // The thanks line clears itself
    await expect(teaser).toHaveCount(0, { timeout: 6000 });
  });

  test("Notify me with no email or a malformed one shows an error and sends nothing", async ({ page }) => {
    let notifyCalls = 0;
    page.on("request", (req) => {
      if (req.url().includes("/api/notify")) notifyCalls += 1;
    });
    const teaser = await openTeaserOnSecondConversion(page);
    await teaser.getByRole("button", { name: "Professionally designed templates" }).click();

    await teaser.getByRole("button", { name: "Notify me" }).click();
    await expect(teaser.getByRole("alert")).toHaveText(
      "Enter your email so we can notify you, or just count your vote."
    );

    const email = page.locator("#notify-email");
    await email.fill("someone@nowhere");
    await teaser.getByRole("button", { name: "Notify me" }).click();
    await expect(teaser.getByRole("alert")).toHaveText("Check the email address.");
    await expect(email).toHaveAttribute("aria-invalid", "true");

    // Typing clears the error
    await email.fill("someone@example.com");
    await expect(teaser.getByRole("alert")).toHaveCount(0);
    expect(notifyCalls).toBe(0);
  });

  test("Notify me POSTs the picks and the email; analytics never sees the address", async ({ page, request }) => {
    test.skip(!(await serverIsTestTarget(request)), "needs a server started with E2E_RELAXED_RATE_LIMITS=1");

    await stubAnalytics(page);
    const analyticsPayloads: string[] = [];
    page.on("request", (req) => {
      const url = req.url();
      if (url.includes("/ingest/api/send") || url.includes("/_vercel/insights")) {
        analyticsPayloads.push(req.postData() || "");
      }
    });

    const teaser = await openTeaserOnSecondConversion(page);
    await teaser.getByRole("button", { name: "Professionally designed templates" }).click();
    await teaser.getByRole("button", { name: "Editable equations in Word" }).click();
    const address = "E2E-Notify-Marker@Example.com";
    await page.locator("#notify-email").fill(address);
    // A person takes longer than the 1.5 s bot threshold
    await page.waitForTimeout(1700);

    const responsePromise = page.waitForResponse((r) => r.url().includes("/api/notify"));
    await teaser.getByRole("button", { name: "Notify me" }).click();
    const response = await responsePromise;

    const body = response.request().postDataJSON() as Record<string, unknown>;
    expect(body).toMatchObject({
      email: address,
      features: ["templates", "equations"],
      locale: "en",
      website: "",
    });
    expect(body.elapsedMs as number).toBeGreaterThanOrEqual(1500);
    expect(response.status()).toBe(200);
    expect(response.headers()["x-notify-outcome"]).toBe("test-mode");
    await expect(teaser).toContainText("Thanks. We'll email you when your picks are ready.");

    const events = await getEvents(page);
    const submitted = events.find((e) => e.name === "feature_interest_submitted");
    expect(submitted?.data).toEqual({ picks: "2", premium_picks: "1", with_email: "yes" });
    const serialized = JSON.stringify(events) + analyticsPayloads.join("\n");
    expect(serialized.toLowerCase()).not.toContain(address.toLowerCase());
  });

  test("zh-Hans shows the localized teaser and chips", async ({ page }) => {
    await page.goto("/zh-Hans");
    await seedHistory(page, 1);
    await uploadSample(page);
    await exportTxt(page);

    const teaser = page.getByTestId("feature-teaser");
    await expect(teaser).toContainText("更多功能即将推出");
    await teaser.getByRole("button", { name: "看看有什么" }).click();
    await expect(teaser.getByRole("heading", { name: "你会用到哪些？" })).toBeVisible();
    await expect(teaser.getByRole("button", { name: "备份你的作品" })).toBeVisible();
    await expect(teaser.getByText("高级版", { exact: true })).toBeVisible();
  });
});

test.describe("POST /api/notify", () => {
  const valid = { email: "e2e@example.com", features: ["backup"], locale: "en", website: "", elapsedMs: 5000 };

  test("rejects a malformed email", async ({ request }) => {
    const response = await request.post("/api/notify", {
      headers: ORIGIN_HEADERS,
      data: { ...valid, email: "not-an-email" },
    });
    expect(response.status()).toBe(400);
    expect((await response.json()).error).toBe("INVALID_EMAIL");
  });

  test("rejects unknown or missing features", async ({ request }) => {
    for (const features of [["backup", "free-pizza"], [], "backup"]) {
      const response = await request.post("/api/notify", {
        headers: ORIGIN_HEADERS,
        data: { ...valid, features },
      });
      expect(response.status(), JSON.stringify(features)).toBe(400);
      expect((await response.json()).error).toBe("INVALID_FEATURES");
    }
  });

  test("rejects a non-JSON body and an oversized body", async ({ request }) => {
    const notJson = await request.post("/api/notify", {
      headers: { ...ORIGIN_HEADERS, "Content-Type": "application/json" },
      data: "not json",
    });
    expect(notJson.status()).toBe(400);
    expect((await notJson.json()).error).toBe("INVALID_JSON");

    const oversized = await request.post("/api/notify", {
      headers: ORIGIN_HEADERS,
      data: { ...valid, website: "x".repeat(3000) },
    });
    expect(oversized.status()).toBe(413);
  });

  test("rejects a POST from another site", async ({ request }) => {
    const response = await request.post("/api/notify", {
      headers: { Origin: "https://malicious-site.com" },
      data: valid,
    });
    expect(response.status()).toBe(403);
  });

  test("bot drops answer exactly like an accepted signup", async ({ request }) => {
    test.skip(!(await serverIsTestTarget(request)), "needs a server started with E2E_RELAXED_RATE_LIMITS=1");

    const cases: Array<[string, Record<string, unknown>]> = [
      ["dropped-honeypot", { ...valid, website: "https://spam.example" }],
      ["dropped-fast", { ...valid, elapsedMs: 300 }],
      ["dropped-fast", { ...valid, elapsedMs: undefined }],
      ["test-mode", valid],
    ];
    for (const [outcome, data] of cases) {
      const response = await request.post("/api/notify", { headers: ORIGIN_HEADERS, data });
      expect(response.status(), outcome).toBe(200);
      expect(await response.json(), outcome).toEqual({ ok: true });
      expect(response.headers()["x-notify-outcome"]).toBe(outcome);
    }
  });
});
