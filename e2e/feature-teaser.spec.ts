import { readFileSync } from "node:fs";
import path from "node:path";
import { test, expect, devices, type Page, type APIRequestContext } from "@playwright/test";
import { openMoreFormats } from "./export-helpers";

/**
 * Feedback v2 (src/lib/feature-teaser.ts, limit-prompt.tsx,
 * paid-layout-prompt.tsx, suggest-link.tsx, and the routes /api/votes,
 * /api/ideas, /api/notify).
 *
 * - When a prompt shows: one prompt per 30 minutes; the vote invitation is
 *   retired (2026-10-29), so a fresh browser gets the thumbs prompt.
 * - The 1 MB size question, on desktop and on a phone.
 * - The heavy-user page-layout question.
 * - The suggestion link.
 * - Every path's analytics events, and that typed text and addresses never
 *   reach analytics.
 * - /api/votes still answers a page loaded before the board was retired.
 *
 * A server started for the suite (E2E_RELAXED_RATE_LIMITS=1) stores nothing
 * and reports what it would have done in x-votes-outcome / x-ideas-outcome /
 * x-notify-outcome.
 */

const ORIGIN_HEADERS = { Origin: "http://localhost:3000" };
const COUNT_KEY = "mdfree:conversions";
const PROMPT_KEY = "mdfree:prompt-shown-at";
const DAY_MS = 24 * 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;
/** Longer than MIN_SUBMIT_MS, so the server treats a submission as human. */
const HUMAN_PAUSE_MS = 1700;

const EN = JSON.parse(readFileSync(path.join(__dirname, "../src/i18n/dictionaries/en.json"), "utf8"));
const FT = EN.featureTeaser;
const FEATURE_LABELS: Record<string, string> = FT.features;
/** The thumbs prompt, which takes the slot when no other prompt is due. */
const THUMBS_QUESTION: string = EN.postConvertFeedback.question;

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

async function eventNames(page: Page): Promise<string[]> {
  return (await getEvents(page)).map((e) => e.name);
}

async function eventsNamed(page: Page, name: string): Promise<TrackedEvent[]> {
  return (await getEvents(page)).filter((e) => e.name === name);
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

// Give this browser a history: how many conversions it has made and how long
// ago it last saw any prompt.
async function seedHistory(page: Page, history: { conversions: number; lastPromptMinutesAgo?: number }) {
  await page.evaluate(
    ({ keys, conversions, promptAt }) => {
      localStorage.setItem(keys.count, String(conversions));
      if (promptAt !== null) localStorage.setItem(keys.prompt, String(promptAt));
    },
    {
      keys: { count: COUNT_KEY, prompt: PROMPT_KEY },
      conversions: history.conversions,
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

// A heavy user: 2 conversions yesterday; the next one makes 3 on 2 days.
async function seedHeavyUse(page: Page) {
  await page.evaluate((dayMs) => {
    const now = Date.now();
    localStorage.setItem(
      "mdfree:usage-log",
      JSON.stringify([
        [now - dayMs, "pdf"],
        [now - dayMs + 60_000, "docx"],
      ])
    );
  }, DAY_MS);
}

// True when the server under test is a test target that never stores.
async function serverIsTestTarget(request: APIRequestContext): Promise<boolean> {
  const response = await request.post("/api/votes", {
    headers: ORIGIN_HEADERS,
    data: { choice: "share", website: "", elapsedMs: 5000 },
  });
  return response.headers()["x-votes-outcome"] === "test-mode";
}

test.beforeEach(async ({ page }) => {
  await stubAnalytics(page);
});

test.describe("When a prompt shows", () => {
  test("a fresh browser gets the thumbs prompt on its first conversion; the invitation is gone", async ({ page }) => {
    // The old manual-testing switches must not bring the invitation back.
    await page.goto("/?probe=teaser&arm=card");
    await uploadSample(page);
    await exportTxt(page);

    await expect(page.getByText(THUMBS_QUESTION)).toBeVisible();
    await expect(page.getByTestId("feature-teaser")).toHaveCount(0);
    const names = await eventNames(page);
    expect(names.filter((name) => name.startsWith("invite_") || name.startsWith("vote_"))).toEqual([]);
    expect(await page.evaluate(() => localStorage.getItem("mdfree:invite-arm"))).toBeNull();
  });

  test("one prompt per sitting: the next conversion stays quiet, the one after 30 minutes asks again", async ({ page }) => {
    await page.goto("/");
    await uploadSample(page);
    await exportTxt(page);
    await expect(page.getByText(THUMBS_QUESTION)).toBeVisible();

    await exportTxt(page);
    await expect(page.getByText(THUMBS_QUESTION)).toHaveCount(0);

    await endQuietPeriod(page);
    await exportTxt(page);
    await expect(page.getByText(THUMBS_QUESTION)).toBeVisible();
  });

  test("a prompt shown 29 minutes ago still blocks the next one", async ({ page }) => {
    await page.goto("/");
    await seedHistory(page, { conversions: 2, lastPromptMinutesAgo: 29 });
    await uploadSample(page);
    await exportTxt(page);
    await expect(page.getByText(THUMBS_QUESTION)).toHaveCount(0);
  });
});

test.describe("A file over 1 MB", () => {
  const bigFile = {
    name: "big.md",
    mimeType: "text/markdown",
    buffer: Buffer.alloc(Math.round(1.5 * 1024 * 1024), "a"),
  };

  test("desktop: the large-file card asks about paying, under the error, and clicks stay inside it", async ({ page }) => {
    await page.goto("/");
    await page.locator('input[type="file"]').setInputFiles(bigFile);
    const prompt = page.getByTestId("limit-prompt");
    await expect(prompt).toBeVisible();
    await expect(prompt).toContainText(EN.limitPrompt.lead);
    await expect(prompt).toContainText(EN.limitPrompt.body);
    await expect(prompt).toContainText(EN.limitPrompt.question);
    await expect(prompt).toContainText(EN.limitPrompt.reassurance);
    await expect(prompt.getByTestId("limit-updates"), "email waits for an answer").toHaveCount(0);

    const [shown] = await eventsNamed(page, "limit_prompt_shown");
    expect(shown.data).toEqual({ detected: "1-2mb", where: "desktop", uses: "0" });

    // A click inside the card must not bubble to the upload card and open the picker.
    let pickerOpened = false;
    page.on("filechooser", () => {
      pickerOpened = true;
    });
    await prompt.getByTestId("limit-pay").getByRole("radio", { name: EN.limitPrompt.answers.yes }).click();
    await page.waitForTimeout(300);
    expect(pickerOpened).toBe(false);

    const [answered] = await eventsNamed(page, "limit_pay");
    expect(answered.data).toEqual({ answer: "yes", detected: "1-2mb", where: "desktop", uses: "0" });
    expect(await eventNames(page)).toContain("limit_pay_yes");

    const form = prompt.getByTestId("limit-updates");
    await expect(form).toContainText(EN.limitPrompt.emailAsk);
    await form.locator("#limit-updates-email").fill("big@example.com");
    await page.waitForTimeout(HUMAN_PAUSE_MS);
    const request = page.waitForRequest((r) => r.url().endsWith("/api/notify"));
    await form.getByRole("button", { name: FT.getUpdates }).click();
    expect((await request).postDataJSON()).toMatchObject({ email: "big@example.com", features: ["large"] });
    await expect(prompt).toContainText(EN.limitPrompt.done);
    expect(await eventNames(page)).toContain("updates_signup_limit");
    expect(pickerOpened).toBe(false);
  });

  test("a no gets a thank-you and no email form; changing to maybe offers it", async ({ page }) => {
    await page.goto("/");
    await page.locator('input[type="file"]').setInputFiles(bigFile);
    const prompt = page.getByTestId("limit-prompt");
    const answers = prompt.getByTestId("limit-pay");

    await answers.getByRole("radio", { name: EN.limitPrompt.answers.no }).click();
    await expect(prompt).toContainText(EN.limitPrompt.thanksNo);
    await expect(prompt.getByTestId("limit-updates")).toHaveCount(0);

    await answers.getByRole("radio", { name: EN.limitPrompt.answers.maybe }).click();
    await expect(prompt.getByTestId("limit-updates")).toBeVisible();
    await expect(prompt).not.toContainText(EN.limitPrompt.thanksNo);

    const names = await eventNames(page);
    expect(names).toContain("limit_pay_no");
    expect(names).toContain("limit_pay_maybe");
    // No other paid question for a visitor who isn't a heavy user
    expect(names).not.toContain("paid_prompt_shown");
  });

  test("the card speaks the page's language", async ({ page }) => {
    await page.goto("/zh-Hans");
    await page.locator('input[type="file"]').setInputFiles(bigFile);
    const prompt = page.getByTestId("limit-prompt");
    await expect(prompt).toContainText("需要转换更大的文件？");
    await expect(prompt.getByRole("radio", { name: "愿意" })).toBeVisible();
  });
});

test.describe("A file over 1 MB on a phone", () => {
  // defaultBrowserType would force a new worker; the rest of the device is enough.
  const { defaultBrowserType: _browser, ...pixel } = devices["Pixel 7"];
  void _browser;
  test.use(pixel);

  test("the error shows (it used to fail silently), with the size question", async ({ page }) => {
    await page.goto("/");
    await page.locator('input[type="file"]').setInputFiles({
      name: "big.md",
      mimeType: "text/markdown",
      buffer: Buffer.alloc(Math.round(2.5 * 1024 * 1024), "a"),
    });
    const box = page.getByTestId("mobile-upload-error");
    await expect(box).toBeVisible();
    await expect(box.getByRole("alert")).toHaveText(EN.errors.tooLarge);
    await expect(box.getByTestId("limit-prompt")).toBeVisible();
    // Exactly one: the desktop card is hidden on a phone and must not count too.
    const shown = await eventsNamed(page, "limit_prompt_shown");
    expect(shown).toHaveLength(1);
    expect(shown[0].data).toMatchObject({ detected: "2-5mb", where: "mobile" });
  });
});

test.describe("The heavy-user question", () => {
  test("a heavy user gets the page-layout question once", async ({ page }) => {
    await page.goto("/");
    await seedHistory(page, { conversions: 2 });
    await seedHeavyUse(page);
    await uploadSample(page);
    await exportTxt(page);

    const prompt = page.getByTestId("paid-layout-prompt");
    await expect(prompt).toBeVisible();
    await expect(prompt).toContainText(EN.paidInterest.layoutLead);
    await expect(page.getByText(THUMBS_QUESTION)).toHaveCount(0);
    expect(await eventNames(page)).toContain("paid_prompt_shown_repeat");

    await prompt.getByRole("button", { name: EN.paidInterest.layoutCta }).click();
    await prompt.getByTestId("paid-needs").locator('[data-value="margins"]').click();
    await prompt.getByTestId("paid-answers-repeat").locator('[data-value="unsure"]').click();
    let names = await eventNames(page);
    expect(names).toContain("paid_prompt_opened");
    expect(names).toContain("paid_need_margins");
    expect(names).toContain("paid_interest_unsure");

    await prompt.getByRole("button", { name: FT.dismiss }).click();
    await expect(prompt).toHaveCount(0);
    names = await eventNames(page);
    expect(names).toContain("paid_prompt_dismissed");

    await endQuietPeriod(page);
    await exportTxt(page);
    await expect(page.getByText(THUMBS_QUESTION)).toBeVisible();
    await expect(page.getByTestId("paid-layout-prompt")).toHaveCount(0);
  });

  test("a visitor who isn't a heavy user gets the thumbs prompt", async ({ page }) => {
    await page.goto("/");
    await seedHistory(page, { conversions: 2 });
    await uploadSample(page);
    await exportTxt(page);
    await expect(page.getByText(THUMBS_QUESTION)).toBeVisible();
    await expect(page.getByTestId("paid-layout-prompt")).toHaveCount(0);
  });
});

test.describe("Suggest an improvement", () => {
  test("the link opens a private box; the text never reaches analytics", async ({ page }) => {
    await page.goto("/");
    await uploadSample(page);
    await page.getByTestId("suggest-link").click();
    expect(await eventsNamed(page, "suggest_opened")).toEqual([{ name: "suggest_opened", data: { where: "desktop" } }]);

    const form = page.getByTestId("suggest-form");
    await form.locator("#suggest-form-text").fill("Dark mode for the preview");
    await page.waitForTimeout(HUMAN_PAUSE_MS);
    const request = page.waitForRequest((r) => r.url().endsWith("/api/ideas"));
    await form.getByRole("button", { name: FT.send }).click();
    expect((await request).postDataJSON()).toMatchObject({
      kind: "suggestion",
      feature: null,
      text: "Dark mode for the preview",
    });
    await expect(page.getByText(EN.suggest.done)).toBeVisible();
    expect(await eventNames(page)).toContain("idea_sent_suggestion");
    expect(JSON.stringify(await getEvents(page))).not.toContain("Dark mode");
  });
});

// The board is retired, but a page loaded before 2026-10-29 can still post a vote.
test.describe("POST /api/votes", () => {
  test("accepts each choice", async ({ request }) => {
    test.skip(!(await serverIsTestTarget(request)), "needs a test server that stores nothing");
    for (const choice of [...Object.keys(FEATURE_LABELS), "other", "nothing"]) {
      const response = await request.post("/api/votes", {
        headers: ORIGIN_HEADERS,
        data: { choice, website: "", elapsedMs: 5000 },
      });
      expect(response.status(), choice).toBe(200);
      expect(response.headers()["x-votes-outcome"]).toBe("test-mode");
    }
  });

  test("still accepts the old multi-pick call during a rollout", async ({ request }) => {
    test.skip(!(await serverIsTestTarget(request)), "needs a test server that stores nothing");
    const response = await request.post("/api/votes", {
      headers: ORIGIN_HEADERS,
      data: { features: ["backup", "share"], website: "", elapsedMs: 5000 },
    });
    expect(response.status()).toBe(200);
  });

  test("still accepts a retired choice from a page loaded before it left the board", async ({ request }) => {
    test.skip(!(await serverIsTestTarget(request)), "needs a test server that stores nothing");
    const response = await request.post("/api/votes", {
      headers: ORIGIN_HEADERS,
      data: { choice: "equations", website: "", elapsedMs: 5000 },
    });
    expect(response.status()).toBe(200);
    expect(response.headers()["x-votes-outcome"]).toBe("test-mode");
  });

  test("rejects an unknown choice, an empty call and bad JSON", async ({ request }) => {
    const unknown = await request.post("/api/votes", { headers: ORIGIN_HEADERS, data: { choice: "free-pizza" } });
    expect(unknown.status()).toBe(400);
    expect((await unknown.json()).error).toBe("INVALID_CHOICE");
    const empty = await request.post("/api/votes", { headers: ORIGIN_HEADERS, data: {} });
    expect(empty.status()).toBe(400);
    const notJson = await request.post("/api/votes", {
      headers: { ...ORIGIN_HEADERS, "Content-Type": "application/json" },
      data: "not json",
    });
    expect(notJson.status()).toBe(400);
  });

  test("rejects a POST from another site", async ({ request }) => {
    const response = await request.post("/api/votes", {
      headers: { Origin: "https://evil.example" },
      data: { choice: "share", elapsedMs: 5000 },
    });
    expect(response.status()).toBe(403);
  });

  test("bot drops answer exactly like an accepted vote", async ({ request }) => {
    const honeypot = await request.post("/api/votes", {
      headers: ORIGIN_HEADERS,
      data: { choice: "share", website: "http://spam.example", elapsedMs: 5000 },
    });
    expect(honeypot.status()).toBe(200);
    expect((await honeypot.json()).ok).toBe(true);
    const fast = await request.post("/api/votes", {
      headers: ORIGIN_HEADERS,
      data: { choice: "share", website: "", elapsedMs: 100 },
    });
    expect(fast.status()).toBe(200);
    expect((await fast.json()).ok).toBe(true);
  });
});

test.describe("POST /api/ideas", () => {
  const good = { kind: "suggestion", text: "Dark mode", locale: "en", website: "", elapsedMs: 5000 };

  test("accepts a suggestion and a workaround with its feature", async ({ request }) => {
    test.skip(!(await serverIsTestTarget(request)), "needs a test server that stores nothing");
    const suggestion = await request.post("/api/ideas", { headers: ORIGIN_HEADERS, data: good });
    expect(suggestion.status()).toBe(200);
    expect(suggestion.headers()["x-ideas-outcome"]).toBe("test-mode");
    const workaround = await request.post("/api/ideas", {
      headers: ORIGIN_HEADERS,
      data: { ...good, kind: "workaround", feature: "formatting" },
    });
    expect(workaround.status()).toBe(200);
  });

  test("rejects bad input", async ({ request }) => {
    const cases: [Record<string, unknown>, string][] = [
      [{ ...good, kind: "spam" }, "INVALID_KIND"],
      [{ ...good, text: "   " }, "EMPTY_TEXT"],
      [{ ...good, text: "x".repeat(201) }, "TEXT_TOO_LONG"],
      [{ ...good, kind: "workaround", feature: "free-pizza" }, "INVALID_FEATURE"],
    ];
    for (const [data, error] of cases) {
      const response = await request.post("/api/ideas", { headers: ORIGIN_HEADERS, data });
      expect(response.status(), error).toBe(400);
      expect((await response.json()).error).toBe(error);
    }
    const tooBig = await request.post("/api/ideas", {
      headers: { ...ORIGIN_HEADERS, "Content-Type": "application/json" },
      data: JSON.stringify({ ...good, text: "x".repeat(3000) }),
    });
    expect(tooBig.status()).toBe(413);
  });

  test("drops bots silently and blocks other sites", async ({ request }) => {
    const honeypot = await request.post("/api/ideas", { headers: ORIGIN_HEADERS, data: { ...good, website: "x" } });
    expect(honeypot.status()).toBe(200);
    const fast = await request.post("/api/ideas", { headers: ORIGIN_HEADERS, data: { ...good, elapsedMs: 50 } });
    expect(fast.status()).toBe(200);
    const foreign = await request.post("/api/ideas", { headers: { Origin: "https://evil.example" }, data: good });
    expect(foreign.status()).toBe(403);
  });
});

test.describe("POST /api/notify", () => {
  test("accepts the new features and refuses the non-features", async ({ request }) => {
    const base = { email: "x@example.com", locale: "en", website: "", elapsedMs: 5000 };
    const large = await request.post("/api/notify", { headers: ORIGIN_HEADERS, data: { ...base, features: ["large"] } });
    expect(large.status()).toBe(200);
    const other = await request.post("/api/notify", { headers: ORIGIN_HEADERS, data: { ...base, features: ["other"] } });
    expect(other.status()).toBe(400);
    const retired = await request.post("/api/notify", { headers: ORIGIN_HEADERS, data: { ...base, features: ["backup"] } });
    expect(retired.status()).toBe(400);
  });
});
