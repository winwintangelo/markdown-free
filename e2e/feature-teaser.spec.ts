import { test, expect, type Page, type APIRequestContext } from "@playwright/test";
import { openMoreFormats } from "./export-helpers";

/**
 * Phase 1.5 vote board (src/lib/feature-teaser.ts, src/components/feature-teaser.tsx,
 * src/app/api/votes/route.ts).
 *
 * - Display rules: the 1st conversion in a browser keeps the thumbs prompt;
 *   from the 2nd the teaser replaces it, at most once per 7 days, and no
 *   prompt at all within 30 minutes of the last one.
 * - The dialog shows the features with NO counts until the vote is recorded.
 *   That is the point of the design, so it has its own test.
 * - Results: tallies, one optional pay question, one optional email.
 *
 * A server started for the suite (E2E_RELAXED_RATE_LIMITS=1) stores nothing
 * and reports what it would have done in x-votes-outcome / x-notify-outcome.
 */

const ORIGIN_HEADERS = { Origin: "http://localhost:3000" };
const COUNT_KEY = "mdfree:conversions";
const SHOWN_AT_KEY = "mdfree:teaser-shown-at";
const PROMPT_KEY = "mdfree:prompt-shown-at";
const DAY_MS = 24 * 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;
/** Longer than MIN_SUBMIT_MS, so the server treats the vote as human. */
const HUMAN_PAUSE_MS = 1700;

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

// Give this browser a history: how many conversions it has made, how long ago
// it last saw the teaser, and how long ago it last saw any prompt.
async function seedHistory(
  page: Page,
  history: { conversions: number; teaserDaysAgo?: number; lastPromptMinutesAgo?: number }
) {
  await page.evaluate(
    ({ countKey, teaserKey, promptKey, conversions, teaserAt, promptAt }) => {
      localStorage.setItem(countKey, String(conversions));
      if (teaserAt !== null) localStorage.setItem(teaserKey, String(teaserAt));
      if (promptAt !== null) localStorage.setItem(promptKey, String(promptAt));
    },
    {
      countKey: COUNT_KEY,
      teaserKey: SHOWN_AT_KEY,
      promptKey: PROMPT_KEY,
      conversions: history.conversions,
      teaserAt: history.teaserDaysAgo === undefined ? null : Date.now() - history.teaserDaysAgo * DAY_MS,
      promptAt:
        history.lastPromptMinutesAgo === undefined ? null : Date.now() - history.lastPromptMinutesAgo * MINUTE_MS,
    }
  );
}

// Move the 30-minute quiet period into the past without waiting for it.
async function endQuietPeriod(page: Page) {
  await page.evaluate(
    ({ promptKey, at }) => localStorage.setItem(promptKey, String(at)),
    { promptKey: PROMPT_KEY, at: Date.now() - 31 * 60 * 1000 }
  );
}

/** Convert twice so the teaser shows, then open the dialog. */
async function openVoteDialog(page: Page) {
  await page.goto("/");
  await seedHistory(page, { conversions: 1 });
  await uploadSample(page);
  await exportTxt(page);
  const teaser = page.getByTestId("feature-teaser");
  await expect(teaser).toBeVisible();
  await teaser.getByRole("button", { name: "See upcoming features" }).click();
  const dialog = page.getByTestId("feature-vote-dialog");
  await expect(dialog).toBeVisible();
  return { teaser, dialog };
}

// True when the server under test is a test target that never stores.
async function serverIsTestTarget(request: APIRequestContext): Promise<boolean> {
  const response = await request.post("/api/votes", {
    headers: ORIGIN_HEADERS,
    data: { features: ["backup"], website: "bot", elapsedMs: 5000 },
  });
  return response.headers()["x-votes-outcome"] === "dropped-honeypot";
}

test.describe("Feature teaser — when it shows", () => {
  test("one prompt per sitting: the 1st conversion asks, the next ones stay quiet", async ({ page }) => {
    await stubAnalytics(page);
    await page.goto("/");
    await uploadSample(page);

    await exportTxt(page);
    await expect(page.getByText("How's your experience?")).toBeVisible();
    await expect(page.getByTestId("feature-teaser")).toHaveCount(0);

    await exportTxt(page);
    await exportTxt(page);
    await expect(page.getByText("How's your experience?")).toHaveCount(0);
    await expect(page.getByTestId("feature-teaser")).toHaveCount(0);

    expect(await page.evaluate((key) => localStorage.getItem(key), COUNT_KEY)).toBe("3");
    expect((await getEvents(page)).filter((e) => e.name === "feature_teaser_shown")).toHaveLength(0);
  });

  test("after the quiet period the teaser takes the slot, and stays until dismissed", async ({ page }) => {
    await stubAnalytics(page);
    await page.goto("/");
    await seedHistory(page, { conversions: 1 });
    await uploadSample(page);

    await exportTxt(page);
    const teaser = page.getByTestId("feature-teaser");
    await expect(teaser).toBeVisible();
    await expect(teaser).toContainText("Help choose what we build next");
    await expect(page.getByText("How's your experience?")).toHaveCount(0);

    await exportTxt(page);
    await expect(teaser).toBeVisible();

    await teaser.getByRole("button", { name: "Dismiss" }).first().click();
    await exportTxt(page);
    await expect(page.getByTestId("feature-teaser")).toHaveCount(0);
    await expect(page.getByText("How's your experience?")).toHaveCount(0);

    const shown = (await getEvents(page)).filter((e) => e.name === "feature_teaser_shown");
    expect(shown).toHaveLength(1);
    expect(shown[0].data).toEqual({ trigger: "post_conversion", locale: "en" });
  });

  test("?probe=teaser forces it on the first conversion, for manual testing", async ({ page }) => {
    await page.goto("/?probe=teaser");
    // Fresh browser, and a prompt was shown seconds ago: both rules would
    // normally suppress the teaser.
    await seedHistory(page, { conversions: 0, lastPromptMinutesAgo: 1 });
    await uploadSample(page);
    await exportTxt(page);

    await expect(page.getByTestId("feature-teaser")).toBeVisible();
    await expect(page.getByText("How's your experience?")).toHaveCount(0);
  });

  test("the teaser returns once the last one is more than 7 days old", async ({ page }) => {
    await page.goto("/");
    await seedHistory(page, { conversions: 5, teaserDaysAgo: 8 });
    await uploadSample(page);
    await exportTxt(page);
    await expect(page.getByTestId("feature-teaser")).toBeVisible();
  });

  test("a teaser shown 6 days ago keeps the thumbs prompt", async ({ page }) => {
    await page.goto("/");
    await seedHistory(page, { conversions: 5, teaserDaysAgo: 6 });
    await uploadSample(page);
    await exportTxt(page);
    await expect(page.getByText("How's your experience?")).toBeVisible();
    await expect(page.getByTestId("feature-teaser")).toHaveCount(0);
  });

  test("a prompt shown 29 minutes ago still blocks the next one", async ({ page }) => {
    await page.goto("/");
    await seedHistory(page, { conversions: 5, teaserDaysAgo: 1, lastPromptMinutesAgo: 29 });
    await uploadSample(page);
    await exportTxt(page);
    await expect(page.getByText("How's your experience?")).toHaveCount(0);
    await expect(page.getByTestId("feature-teaser")).toHaveCount(0);
  });

  test("a prompt shown 31 minutes ago lets the next one through", async ({ page }) => {
    await page.goto("/");
    await seedHistory(page, { conversions: 5, teaserDaysAgo: 1, lastPromptMinutesAgo: 31 });
    await uploadSample(page);
    await exportTxt(page);
    await expect(page.getByText("How's your experience?")).toBeVisible();
  });

  test("after a vote, a later conversion gets the thumbs prompt, not the teaser", async ({ page }) => {
    const { dialog } = await openVoteDialog(page);
    await dialog.getByRole("button", { name: "Share a document with a link" }).click();
    await page.waitForTimeout(HUMAN_PAUSE_MS);
    await dialog.getByRole("button", { name: "Count my vote" }).click();
    await expect(dialog).toContainText("your vote is counted");
    await dialog.getByRole("button", { name: "Just count my vote" }).click();

    await exportTxt(page);
    await expect(page.getByText("How's your experience?")).toHaveCount(0);

    await endQuietPeriod(page);
    await exportTxt(page);
    await expect(page.getByText("How's your experience?")).toBeVisible();
    await expect(page.getByTestId("feature-teaser")).toHaveCount(0);
  });
});

test.describe("Vote board — the dialog", () => {
  test("the vote screen shows no counts, no bars and no pay question", async ({ page }) => {
    await stubAnalytics(page);
    const { dialog } = await openVoteDialog(page);

    await expect(dialog.getByRole("heading", { name: "What should we build next?" })).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Save & restore my documents" })).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Share a document with a link" })).toBeVisible();

    // The whole point of the design: nothing about how others voted
    await expect(dialog).not.toContainText("What everyone is asking for");
    await expect(dialog).not.toContainText("+1 you");
    await expect(dialog).not.toContainText("would you consider paying");
    await expect(dialog.locator(".vote-bar")).toHaveCount(0);
    await expect(page.locator("#notify-email")).toHaveCount(0);

    expect((await getEvents(page)).filter((e) => e.name === "feature_teaser_opened")).toHaveLength(1);
  });

  test("Count my vote is disabled until something is picked", async ({ page }) => {
    const { dialog } = await openVoteDialog(page);
    const submit = dialog.getByRole("button", { name: "Count my vote" });
    await expect(submit).toBeDisabled();

    const row = dialog.getByRole("button", { name: "Professional document templates" });
    await expect(row).toHaveAttribute("aria-pressed", "false");
    await row.click();
    await expect(row).toHaveAttribute("aria-pressed", "true");
    await expect(submit).toBeEnabled();
    await expect(dialog).toContainText("1 selected");

    await row.click();
    await expect(submit).toBeDisabled();
  });

  test("voting posts the picks and reveals the tallies", async ({ page }) => {
    await stubAnalytics(page);
    const { dialog } = await openVoteDialog(page);

    await dialog.getByRole("button", { name: "Save & restore my documents" }).click();
    await dialog.getByRole("button", { name: "Editable equations in Word" }).click();
    await page.waitForTimeout(HUMAN_PAUSE_MS);

    const responsePromise = page.waitForResponse((r) => r.url().includes("/api/votes"));
    await dialog.getByRole("button", { name: "Count my vote" }).click();
    const response = await responsePromise;

    const body = response.request().postDataJSON() as Record<string, unknown>;
    expect(body.features).toEqual(["backup", "equations"]);
    expect(body.website).toBe("");
    expect(body.elapsedMs as number).toBeGreaterThanOrEqual(1500);
    expect(response.status()).toBe(200);

    await expect(dialog).toContainText("your vote is counted");
    await expect(dialog).toContainText("What everyone is asking for");
    await expect(dialog.getByText("+1 you")).toHaveCount(2);
    await expect(dialog.locator(".vote-bar")).toHaveCount(6);
    await expect(dialog).toContainText("Votes counted for 2 features");

    const names = (await getEvents(page)).map((e) => e.name);
    expect(names).toContain("feature_vote_backup");
    expect(names).toContain("feature_vote_equations");
    expect(names).not.toContain("feature_vote_share");
    const submitted = (await getEvents(page)).find((e) => e.name === "feature_vote_submitted");
    expect(submitted?.data).toEqual({ picks: "2", premium_picks: "1" });
  });

  test("the pay question is answered on the results page, in one tap", async ({ page }) => {
    await stubAnalytics(page);
    const { dialog } = await openVoteDialog(page);
    await dialog.getByRole("button", { name: "Professional document templates" }).click();
    await page.waitForTimeout(HUMAN_PAUSE_MS);
    await dialog.getByRole("button", { name: "Count my vote" }).click();
    await expect(dialog).toContainText("would you consider paying");

    const chip = dialog.getByRole("button", { name: "Maybe, depends on price" });
    const responsePromise = page.waitForResponse((r) => r.url().includes("/api/votes"));
    await chip.click();
    const response = await responsePromise;

    expect(response.request().postDataJSON()).toEqual({ pay: "maybe" });
    await expect(chip).toHaveAttribute("aria-pressed", "true");
    expect((await getEvents(page)).map((e) => e.name)).toContain("pay_intent_maybe");
  });

  test("the email is optional, sent to /api/notify, and never reaches analytics", async ({ page }) => {
    await stubAnalytics(page);
    const analyticsPayloads: string[] = [];
    page.on("request", (req) => {
      const url = req.url();
      if (url.includes("/ingest/api/send") || url.includes("/_vercel/insights")) {
        analyticsPayloads.push(req.postData() || "");
      }
    });

    const { dialog } = await openVoteDialog(page);
    await dialog.getByRole("button", { name: "Combine multiple AI chats into one document" }).click();
    await page.waitForTimeout(HUMAN_PAUSE_MS);
    await dialog.getByRole("button", { name: "Count my vote" }).click();
    await expect(dialog).toContainText("Want to know when your picks launch?");

    const address = "E2E-Vote-Marker@Example.com";
    await page.locator("#notify-email").fill(address);
    const responsePromise = page.waitForResponse((r) => r.url().includes("/api/notify"));
    await dialog.getByRole("button", { name: "Notify me" }).click();
    const response = await responsePromise;

    expect(response.request().postDataJSON()).toMatchObject({
      email: address,
      features: ["merge"],
      locale: "en",
    });
    expect(response.headers()["x-notify-outcome"]).toBe("test-mode");
    await expect(dialog).toContainText("One email per feature");

    const events = await getEvents(page);
    expect(events.map((e) => e.name)).toContain("feature_notify_submitted");
    const serialized = JSON.stringify(events) + analyticsPayloads.join("\n");
    expect(serialized.toLowerCase()).not.toContain(address.toLowerCase());
  });

  test("a malformed email is rejected in the browser", async ({ page }) => {
    let notifyCalls = 0;
    page.on("request", (req) => {
      if (req.url().includes("/api/notify")) notifyCalls += 1;
    });

    const { dialog } = await openVoteDialog(page);
    await dialog.getByRole("button", { name: "Share a document with a link" }).click();
    await page.waitForTimeout(HUMAN_PAUSE_MS);
    await dialog.getByRole("button", { name: "Count my vote" }).click();

    await page.locator("#notify-email").fill("someone@nowhere");
    await dialog.getByRole("button", { name: "Notify me" }).click();
    await expect(dialog.getByRole("alert")).toHaveText("Check the email address.");
    expect(notifyCalls).toBe(0);
  });

  test("Escape and the backdrop close the dialog, the teaser stays", async ({ page }) => {
    const { teaser, dialog } = await openVoteDialog(page);
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(teaser).toBeVisible();

    await teaser.getByRole("button", { name: "See upcoming features" }).click();
    await expect(page.getByTestId("feature-vote-dialog")).toBeVisible();
    await page.mouse.click(12, 12);
    await expect(page.getByTestId("feature-vote-dialog")).toHaveCount(0);
    await expect(teaser).toBeVisible();
  });

  test("the honeypot field is hidden from people but present for bots", async ({ page }) => {
    const { dialog } = await openVoteDialog(page);
    await dialog.getByRole("button", { name: "Share a document with a link" }).click();
    await page.waitForTimeout(HUMAN_PAUSE_MS);
    await dialog.getByRole("button", { name: "Count my vote" }).click();

    const honeypot = dialog.locator('input[name="mf-extra"]');
    await expect(honeypot).toHaveCount(1);
    await expect(honeypot).toHaveAttribute("tabindex", "-1");
    await expect(honeypot).toHaveAttribute("aria-hidden", "true");
    await expect(honeypot).not.toBeInViewport();
  });

  test("zh-Hans shows the localized board", async ({ page }) => {
    await page.goto("/zh-Hans");
    await seedHistory(page, { conversions: 1 });
    await uploadSample(page);
    await exportTxt(page);

    const teaser = page.getByTestId("feature-teaser");
    await expect(teaser).toContainText("帮我们决定接下来做什么");
    await teaser.getByRole("button", { name: "查看即将推出的功能" }).click();

    const dialog = page.getByTestId("feature-vote-dialog");
    await expect(dialog.getByRole("heading", { name: "接下来我们该做什么？" })).toBeVisible();
    await expect(dialog.getByRole("button", { name: "保存并随时打开我的文档" })).toBeVisible();
    await expect(dialog).not.toContainText("大家都在要什么");
  });
});

test.describe("Vote board — the funnel events", () => {
  const DWELL = /^(0-5s|5-15s|15-60s|60s\+)$/;

  test("dismissing the row without opening it records one dismissal", async ({ page }) => {
    await stubAnalytics(page);
    await page.goto("/");
    await seedHistory(page, { conversions: 1 });
    await uploadSample(page);
    await exportTxt(page);

    const teaser = page.getByTestId("feature-teaser");
    await expect(teaser).toBeVisible();
    await teaser.getByRole("button", { name: "Dismiss" }).click();
    await expect(teaser).toHaveCount(0);

    const events = await getEvents(page);
    const names = events.map((e) => e.name);
    expect(names).toContain("feature_teaser_shown");
    expect(names).not.toContain("feature_teaser_opened");
    expect(names).not.toContain("feature_teaser_completed");

    const dismissed = events.filter((e) => e.name === "feature_teaser_dismissed");
    expect(dismissed).toHaveLength(1);
    expect(dismissed[0].data).toMatchObject({ stage: "teaser", how: "close" });
    expect(dismissed[0].data?.dwell).toMatch(DWELL);
  });

  test("closing the vote screen is not the end — the teaser stays, the dismissal waits", async ({
    page,
  }) => {
    await stubAnalytics(page);
    const { teaser, dialog } = await openVoteDialog(page);
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);

    let events = await getEvents(page);
    const closed = events.filter((e) => e.name === "feature_teaser_closed");
    expect(closed).toHaveLength(1);
    expect(closed[0].data).toEqual({ how: "escape", voted: "no" });
    expect(events.map((e) => e.name)).not.toContain("feature_teaser_dismissed");

    // Now end it for good: one dismissal, and it remembers they got as far as
    // the vote screen.
    await teaser.getByRole("button", { name: "Dismiss" }).click();
    events = await getEvents(page);
    const dismissed = events.filter((e) => e.name === "feature_teaser_dismissed");
    expect(dismissed).toHaveLength(1);
    expect(dismissed[0].data).toMatchObject({ stage: "vote", how: "close" });
  });

  test("a second conversion under an open teaser is not an ending", async ({ page }) => {
    await stubAnalytics(page);
    await page.goto("/");
    await seedHistory(page, { conversions: 1 });
    await uploadSample(page);
    await exportTxt(page);

    const teaser = page.getByTestId("feature-teaser");
    await expect(teaser).toBeVisible();

    // People export a second format straight away. The teaser stays up, so it
    // has not ended: a dismissal here would count someone who never left.
    await exportTxt(page);
    await exportTxt(page);
    await expect(teaser).toBeVisible();

    const events = await getEvents(page);
    expect(events.filter((e) => e.name === "feature_teaser_shown")).toHaveLength(1);
    expect(events.map((e) => e.name)).not.toContain("feature_teaser_dismissed");
    expect(events.map((e) => e.name)).not.toContain("feature_teaser_completed");
  });

  test("a vote plus a pay answer completes the funnel, once", async ({ page }) => {
    await stubAnalytics(page);
    const { dialog } = await openVoteDialog(page);
    await dialog.getByRole("button", { name: "Professional document templates" }).click();
    await page.waitForTimeout(HUMAN_PAUSE_MS);
    await dialog.getByRole("button", { name: "Count my vote" }).click();
    await expect(dialog).toContainText("What everyone is asking for");
    await dialog.getByRole("button", { name: "Maybe, depends on price" }).click();
    await dialog.getByRole("button", { name: "Just count my vote" }).click();
    await expect(page.getByTestId("feature-teaser")).toHaveCount(0);

    const events = await getEvents(page);
    const completed = events.filter((e) => e.name === "feature_teaser_completed");
    expect(completed).toHaveLength(1);
    expect(completed[0].data).toMatchObject({
      picks: "1",
      premium_picks: "1",
      pay: "maybe",
      notified: "no",
    });
    expect(completed[0].data?.dwell).toMatch(DWELL);
    expect(events.map((e) => e.name)).not.toContain("feature_teaser_dismissed");
  });

  test("reopening after a vote returns to the results, so one browser cannot vote twice", async ({
    page,
  }) => {
    let voteCalls = 0;
    page.on("request", (req) => {
      if (req.url().includes("/api/votes") && req.method() === "POST") voteCalls += 1;
    });

    const { teaser, dialog } = await openVoteDialog(page);
    await dialog.getByRole("button", { name: "Save & restore my documents" }).click();
    await page.waitForTimeout(HUMAN_PAUSE_MS);
    await dialog.getByRole("button", { name: "Count my vote" }).click();
    await expect(dialog).toContainText("What everyone is asking for");
    expect(voteCalls).toBe(1);

    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await teaser.getByRole("button", { name: "See upcoming features" }).click();

    const reopened = page.getByTestId("feature-vote-dialog");
    await expect(reopened).toContainText("What everyone is asking for");
    // exact, or it also matches "Just count my vote" on the results screen.
    await expect(reopened.getByRole("button", { name: "Count my vote", exact: true })).toHaveCount(0);
    expect(voteCalls).toBe(1);
  });
});

test.describe("POST /api/votes", () => {
  test("rejects an unknown feature", async ({ request }) => {
    const response = await request.post("/api/votes", {
      headers: ORIGIN_HEADERS,
      data: { features: ["backup", "free-pizza"], elapsedMs: 5000 },
    });
    expect(response.status()).toBe(400);
    expect((await response.json()).error).toBe("INVALID_FEATURES");
  });

  test("rejects an unknown pay answer", async ({ request }) => {
    const response = await request.post("/api/votes", {
      headers: ORIGIN_HEADERS,
      data: { pay: "later" },
    });
    expect(response.status()).toBe(400);
    expect((await response.json()).error).toBe("INVALID_PAY");
  });

  test("rejects an empty call", async ({ request }) => {
    const response = await request.post("/api/votes", {
      headers: ORIGIN_HEADERS,
      data: { features: [] },
    });
    expect(response.status()).toBe(400);
    expect((await response.json()).error).toBe("NOTHING_TO_RECORD");
  });

  test("rejects a non-JSON body and an oversized body", async ({ request }) => {
    const notJson = await request.post("/api/votes", {
      headers: { ...ORIGIN_HEADERS, "Content-Type": "application/json" },
      data: "not json",
    });
    expect(notJson.status()).toBe(400);
    expect((await notJson.json()).error).toBe("INVALID_JSON");

    const oversized = await request.post("/api/votes", {
      headers: ORIGIN_HEADERS,
      data: { features: ["backup"], elapsedMs: 5000, website: "x".repeat(2000) },
    });
    expect(oversized.status()).toBe(413);
  });

  test("rejects a POST from another site", async ({ request }) => {
    const response = await request.post("/api/votes", {
      headers: { Origin: "https://malicious-site.com" },
      data: { features: ["backup"], elapsedMs: 5000 },
    });
    expect(response.status()).toBe(403);
  });

  test("bot drops answer exactly like an accepted vote", async ({ request }) => {
    test.skip(!(await serverIsTestTarget(request)), "needs a server started with E2E_RELAXED_RATE_LIMITS=1");

    const cases: Array<[string, Record<string, unknown>]> = [
      ["dropped-honeypot", { features: ["backup"], elapsedMs: 5000, website: "https://spam.example" }],
      ["dropped-fast", { features: ["backup"], elapsedMs: 200 }],
      ["dropped-fast", { features: ["backup"] }],
      ["test-mode", { features: ["backup"], elapsedMs: 5000 }],
      ["test-mode", { pay: "yes" }],
    ];
    for (const [outcome, data] of cases) {
      const response = await request.post("/api/votes", { headers: ORIGIN_HEADERS, data });
      expect(response.status(), outcome).toBe(200);
      expect(await response.json(), outcome).toEqual({ ok: true, tallies: [] });
      expect(response.headers()["x-votes-outcome"]).toBe(outcome);
    }
  });
});
