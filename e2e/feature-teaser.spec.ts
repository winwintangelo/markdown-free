import { readFileSync } from "node:fs";
import path from "node:path";
import { test, expect, devices, type Page, type APIRequestContext } from "@playwright/test";
import { openMoreFormats } from "./export-helpers";

/**
 * Feedback v2 (src/lib/feature-teaser.ts, src/components/feature-teaser.tsx,
 * limit-prompt.tsx, paid-layout-prompt.tsx, suggest-link.tsx, and the routes
 * /api/votes, /api/ideas, /api/notify).
 *
 * - When a prompt shows: the invitation takes every prompt slot for 7 days,
 *   one prompt per 30 minutes, a voter is never asked again.
 * - The invitation test: two arms fixed per browser, control and card.
 * - The board: one choice, no counts before the vote, optional follow-ups.
 * - The 1 MB size question, on desktop and on a phone.
 * - The paid path, off by default and on with `?paid=1` (localhost only).
 * - The suggestion link.
 * - Every path's analytics events, and that typed text and addresses never
 *   reach analytics.
 *
 * A server started for the suite (E2E_RELAXED_RATE_LIMITS=1) stores nothing
 * and reports what it would have done in x-votes-outcome / x-ideas-outcome /
 * x-notify-outcome.
 */

const ORIGIN_HEADERS = { Origin: "http://localhost:3000" };
const COUNT_KEY = "mdfree:conversions";
const SHOWN_AT_KEY = "mdfree:teaser-shown-at";
const PROMPT_KEY = "mdfree:prompt-shown-at";
const ANSWERED_KEY = "mdfree:teaser-answered";
const ARM_KEY = "mdfree:invite-arm";
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

async function exportWord(page: Page) {
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: /To Word/i }).first().click();
  await download;
}

// Give this browser a history: how many conversions it has made, how long ago
// it last saw the invitation, and how long ago it last saw any prompt.
async function seedHistory(
  page: Page,
  history: { conversions: number; teaserDaysAgo?: number; lastPromptMinutesAgo?: number; answered?: boolean }
) {
  await page.evaluate(
    ({ keys, conversions, teaserAt, promptAt, answered }) => {
      localStorage.setItem(keys.count, String(conversions));
      if (teaserAt !== null) localStorage.setItem(keys.teaser, String(teaserAt));
      if (promptAt !== null) localStorage.setItem(keys.prompt, String(promptAt));
      if (answered) localStorage.setItem(keys.answered, "1");
    },
    {
      keys: { count: COUNT_KEY, teaser: SHOWN_AT_KEY, prompt: PROMPT_KEY, answered: ANSWERED_KEY },
      conversions: history.conversions,
      teaserAt: history.teaserDaysAgo === undefined ? null : Date.now() - history.teaserDaysAgo * DAY_MS,
      promptAt:
        history.lastPromptMinutesAgo === undefined ? null : Date.now() - history.lastPromptMinutesAgo * MINUTE_MS,
      answered: history.answered ?? false,
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

/** Convert once so the invitation shows, then open the board. */
async function openVoteDialog(page: Page, url = "/") {
  await page.goto(url);
  await uploadSample(page);
  await exportTxt(page);
  const teaser = page.getByTestId("feature-teaser");
  await expect(teaser).toBeVisible();
  await teaser.getByTestId("feature-teaser-open").click();
  const dialog = page.getByTestId("feature-vote-dialog");
  await expect(dialog).toBeVisible();
  return { teaser, dialog };
}

async function vote(page: Page, choice: string, otherText?: string) {
  const dialog = page.getByTestId("feature-vote-dialog");
  await dialog.locator(`[data-choice="${choice}"]`).click();
  if (otherText !== undefined) await dialog.locator("#vote-other-text").fill(otherText);
  await page.waitForTimeout(HUMAN_PAUSE_MS);
  const request = page.waitForRequest((r) => r.url().endsWith("/api/votes") && r.method() === "POST");
  const response = page.waitForResponse((r) => r.url().endsWith("/api/votes"));
  await dialog.getByTestId("vote-save").click();
  return { request: await request, response: await response, dialog };
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
  test("a fresh browser gets the invitation on its first conversion, assigned to one arm", async ({ page }) => {
    await page.goto("/");
    await uploadSample(page);
    await exportTxt(page);

    const teaser = page.getByTestId("feature-teaser");
    await expect(teaser).toBeVisible();
    await expect(page.getByText(THUMBS_QUESTION)).toHaveCount(0);

    const arm = await page.evaluate((key) => localStorage.getItem(key), ARM_KEY);
    expect(["control", "card"]).toContain(arm);
    await expect(teaser).toHaveAttribute("data-arm", arm!);

    const names = await eventNames(page);
    expect(names).toContain("invite_assigned");
    expect(names).toContain(`invite_assigned_${arm}`);
    const [rendered] = await eventsNamed(page, "invite_rendered");
    expect(rendered.data).toEqual({ arm, format: "txt", locale: "en", nth: "1" });
    expect(names).toContain(`invite_rendered_${arm}`);
  });

  test("one prompt per sitting: the next conversions stay quiet, the invitation stays", async ({ page }) => {
    await page.goto("/");
    await uploadSample(page);
    await exportTxt(page);
    await exportTxt(page);
    await exportTxt(page);

    await expect(page.getByTestId("feature-teaser")).toHaveCount(1);
    expect(await eventsNamed(page, "invite_rendered")).toHaveLength(1);
    expect(await eventNames(page)).not.toContain("invite_dismissed");
    // The arm is assigned once per browser, not per conversion.
    expect(await eventsNamed(page, "invite_assigned")).toHaveLength(1);
  });

  test("the invitation returns on the next slot after ×, tagged as a repeat", async ({ page }) => {
    await page.goto("/?arm=control");
    await uploadSample(page);
    await exportTxt(page);
    await page.getByTestId("feature-teaser").getByRole("button", { name: FT.dismiss }).click();
    await expect(page.getByTestId("feature-teaser")).toHaveCount(0);

    const [dismissed] = await eventsNamed(page, "invite_dismissed");
    expect(dismissed.data).toMatchObject({ arm: "control", how: "close", stage: "teaser" });
    expect(await eventNames(page)).toContain("invite_dismissed_control");

    await endQuietPeriod(page);
    await exportTxt(page);
    await expect(page.getByTestId("feature-teaser")).toBeVisible();
    const rendered = await eventsNamed(page, "invite_rendered");
    expect(rendered.map((e) => e.data?.nth)).toEqual(["1", "2"]);
  });

  test("?probe=teaser forces it, for manual testing", async ({ page }) => {
    await page.goto("/?probe=teaser");
    await seedHistory(page, { conversions: 3, lastPromptMinutesAgo: 1, answered: true });
    await uploadSample(page);
    await exportTxt(page);
    await expect(page.getByTestId("feature-teaser")).toBeVisible();
  });

  test("after 7 days the thumbs prompt takes the slot back", async ({ page }) => {
    await page.goto("/");
    await seedHistory(page, { conversions: 3, teaserDaysAgo: 8 });
    await uploadSample(page);
    await exportTxt(page);
    await expect(page.getByText(THUMBS_QUESTION)).toBeVisible();
    await expect(page.getByTestId("feature-teaser")).toHaveCount(0);
  });

  test("a prompt shown 29 minutes ago still blocks the next one", async ({ page }) => {
    await page.goto("/");
    await seedHistory(page, { conversions: 2, teaserDaysAgo: 1, lastPromptMinutesAgo: 29 });
    await uploadSample(page);
    await exportTxt(page);
    await expect(page.getByTestId("feature-teaser")).toHaveCount(0);
    await expect(page.getByText(THUMBS_QUESTION)).toHaveCount(0);
  });

  test("a voter gets the thumbs prompt, window or no window", async ({ page }) => {
    await page.goto("/");
    await seedHistory(page, { conversions: 2, teaserDaysAgo: 1, answered: true });
    await uploadSample(page);
    await exportTxt(page);
    await expect(page.getByText(THUMBS_QUESTION)).toBeVisible();
    await expect(page.getByTestId("feature-teaser")).toHaveCount(0);
  });

  test("a Word export under an open invitation is not an ending", async ({ page }) => {
    await page.goto("/");
    await uploadSample(page);
    await exportTxt(page);
    const teaser = page.getByTestId("feature-teaser");
    await expect(teaser).toBeVisible();
    await exportWord(page);
    await expect(teaser).toBeVisible();
    expect(await eventsNamed(page, "invite_rendered")).toHaveLength(1);
    expect(await eventNames(page)).not.toContain("invite_dismissed");
  });
});

test.describe("The invitation test (control vs card)", () => {
  test("control shows the one-line teaser", async ({ page }) => {
    await page.goto("/?arm=control");
    await uploadSample(page);
    await exportTxt(page);
    const teaser = page.getByTestId("feature-teaser");
    await expect(teaser).toHaveAttribute("data-arm", "control");
    await expect(teaser).toContainText(FT.control.teaser);
    await expect(teaser.getByTestId("feature-teaser-open")).toHaveText(FT.control.cta);
  });

  test("card asks about Word after a Word export, and in general otherwise", async ({ page }) => {
    await page.goto("/?arm=card");
    await uploadSample(page);
    await exportWord(page);
    const teaser = page.getByTestId("feature-teaser");
    await expect(teaser).toHaveAttribute("data-arm", "card");
    await expect(teaser).toContainText(FT.card.word);
    await expect(teaser.getByTestId("feature-teaser-open")).toHaveText(FT.card.cta);
    const [rendered] = await eventsNamed(page, "invite_rendered");
    expect(rendered.data).toMatchObject({ arm: "card", format: "docx" });

    await teaser.getByRole("button", { name: FT.dismiss }).click();
    await endQuietPeriod(page);
    await exportTxt(page);
    await expect(page.getByTestId("feature-teaser")).toContainText(FT.card.other);
  });

  test("a browser keeps its arm", async ({ page }) => {
    await page.goto("/");
    await page.evaluate((key) => localStorage.setItem(key, "card"), ARM_KEY);
    await uploadSample(page);
    await exportTxt(page);
    await expect(page.getByTestId("feature-teaser")).toHaveAttribute("data-arm", "card");
    // Already assigned, so no second assignment event.
    expect(await eventNames(page)).not.toContain("invite_assigned");
  });

  test("a view counts only once the invitation is on screen for a second", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 420 });
    await page.goto("/?arm=card");
    await uploadSample(page);
    await page.evaluate(() => window.scrollTo(0, 0));
    await exportTxt(page);
    const teaser = page.getByTestId("feature-teaser");
    await expect(teaser).toBeAttached();
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(teaser).not.toBeInViewport({ ratio: 0.5 });
    await page.waitForTimeout(1500);
    expect(await eventNames(page)).not.toContain("invite_viewed");

    await teaser.scrollIntoViewIfNeeded();
    await expect.poll(() => eventNames(page), { timeout: 5000 }).toContain("invite_viewed");
    const viewed = await eventsNamed(page, "invite_viewed");
    expect(viewed).toHaveLength(1);
    expect(viewed[0].data).toEqual({ arm: "card", format: "txt", nth: "1" });
    expect(await eventNames(page)).toContain("invite_viewed_card");
  });
});

test.describe("The vote board", () => {
  test("one choice, no counts, and nothing to save until a choice", async ({ page }) => {
    const { dialog } = await openVoteDialog(page, "/?arm=card");
    await expect(dialog.getByRole("heading", { name: FT.voteTitle })).toBeVisible();
    await expect(dialog.locator("[role=radio]")).toHaveCount(10);
    await expect(dialog.locator(".vote-bar")).toHaveCount(0);
    await expect(dialog.getByText(/^\d+$/)).toHaveCount(0);
    await expect(dialog.getByTestId("vote-paid-line")).toHaveCount(0);

    const save = dialog.getByTestId("vote-save");
    await expect(save).toBeDisabled();
    await dialog.locator('[data-choice="formatting"]').click();
    await dialog.locator('[data-choice="share"]').click();
    await expect(dialog.locator('[aria-checked="true"]')).toHaveCount(1);
    await expect(dialog.locator('[data-choice="share"]')).toHaveAttribute("aria-checked", "true");
    await expect(save).toBeEnabled();

    // "Something else" needs a few words first.
    await dialog.locator('[data-choice="other"]').click();
    await expect(save).toBeDisabled();
    await dialog.locator("#vote-other-text").fill("Batch convert");
    await expect(save).toBeEnabled();

    expect(await eventsNamed(page, "invite_opened")).toHaveLength(1);
    expect(await eventNames(page)).toContain("invite_opened_card");
  });

  test("the features keep their shuffled order in this browser", async ({ page }) => {
    const { dialog } = await openVoteDialog(page);
    const first = await dialog.locator("[data-choice]").evaluateAll((els) => els.map((el) => el.getAttribute("data-choice")));
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("mdfree:board-order") ?? "[]"));
    expect(first.slice(0, 8)).toEqual(stored);
    expect(first.slice(8)).toEqual(["other", "nothing"]);
    expect([...stored].sort()).toEqual(Object.keys(FEATURE_LABELS).sort());

    await dialog.getByRole("button", { name: FT.dismiss }).click();
    await page.getByTestId("feature-teaser-open").click();
    const again = await dialog.locator("[data-choice]").evaluateAll((els) => els.map((el) => el.getAttribute("data-choice")));
    expect(again).toEqual(first);
  });

  test("a vote posts one choice, confirms, and records the funnel", async ({ page }) => {
    await openVoteDialog(page, "/?arm=control");
    const { request, response, dialog } = await vote(page, "templates");
    expect(request.postDataJSON()).toMatchObject({ choice: "templates", website: "" });
    expect(response.headers()["x-votes-outcome"]).toBe("test-mode");

    await expect(dialog).toHaveAttribute("data-phase", "done");
    await expect(dialog.getByRole("heading", { name: FT.savedTitle })).toBeVisible();
    await expect(dialog).toContainText(FEATURE_LABELS.templates);

    const [saved] = await eventsNamed(page, "vote_saved");
    expect(saved.data).toEqual({ arm: "control", choice: "templates", format: "txt", uses: "1" });
    const names = await eventNames(page);
    expect(names).toContain("vote_saved_control");
    const [choice] = await eventsNamed(page, "vote_choice_templates");
    expect(choice.data).toEqual({ arm: "control", uses: "1" });
    expect(await page.evaluate((key) => localStorage.getItem(key), ANSWERED_KEY)).toBe("1");
  });

  test("closing after a vote ends the invitation without a dismissal", async ({ page }) => {
    await openVoteDialog(page);
    const { dialog } = await vote(page, "share");
    await dialog.getByRole("button", { name: FT.done }).click();
    await expect(dialog).toHaveCount(0);
    await expect(page.getByTestId("feature-teaser")).toHaveCount(0);

    const [closed] = await eventsNamed(page, "vote_board_closed");
    expect(closed.data).toMatchObject({ how: "done", voted: "yes" });
    expect(await eventNames(page)).not.toContain("invite_dismissed");
  });

  test("closing before a vote keeps the invitation; × then ends it at the vote stage", async ({ page }) => {
    const { teaser, dialog } = await openVoteDialog(page);
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(teaser).toBeVisible();
    const [closed] = await eventsNamed(page, "vote_board_closed");
    expect(closed.data).toMatchObject({ how: "escape", voted: "no" });
    expect(await eventNames(page)).not.toContain("invite_dismissed");

    await teaser.getByRole("button", { name: FT.dismiss }).click();
    const [dismissed] = await eventsNamed(page, "invite_dismissed");
    expect(dismissed.data).toMatchObject({ how: "close", stage: "vote" });
    expect(dismissed.data?.dwell).toMatch(/^(0-5s|5-15s|15-60s|60s\+)$/);
  });

  test("after a vote the invitation is gone, so one browser votes once", async ({ page }) => {
    await openVoteDialog(page);
    const { dialog } = await vote(page, "merge");
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(page.getByTestId("feature-teaser")).toHaveCount(0);
    expect(await eventsNamed(page, "vote_saved")).toHaveLength(1);
  });

  test("Something else stores the text privately, never in analytics", async ({ page }) => {
    await openVoteDialog(page);
    const ideaRequest = page.waitForRequest((r) => r.url().endsWith("/api/ideas"));
    const ideaResponse = page.waitForResponse((r) => r.url().endsWith("/api/ideas"));
    const { request, dialog } = await vote(page, "other", "Convert a whole folder at once");
    expect(request.postDataJSON()).toMatchObject({ choice: "other" });
    expect((await ideaRequest).postDataJSON()).toMatchObject({
      kind: "other",
      feature: null,
      text: "Convert a whole folder at once",
      locale: "en",
    });
    expect((await ideaResponse).headers()["x-ideas-outcome"]).toBe("test-mode");
    await expect(dialog).toContainText(FT.otherDone);

    await expect.poll(() => eventNames(page)).toContain("idea_sent_other");
    expect(await eventNames(page)).toContain("vote_choice_other");
    expect(JSON.stringify(await getEvents(page))).not.toContain("whole folder");
    // No follow-up forms for "Something else".
    await expect(dialog.getByTestId("vote-updates")).toHaveCount(0);
    await expect(dialog.getByTestId("vote-workaround")).toHaveCount(0);
  });

  test("Nothing missing counts, and asks nothing more", async ({ page }) => {
    await openVoteDialog(page);
    const { dialog } = await vote(page, "nothing");
    await expect(dialog).toHaveAttribute("data-phase", "done");
    expect(await eventNames(page)).toContain("vote_choice_nothing");
    await expect(dialog.getByTestId("vote-updates")).toHaveCount(0);
    await expect(dialog.getByTestId("vote-workaround")).toHaveCount(0);
  });

  test("the updates email goes to /api/notify with the chosen feature, never to analytics", async ({ page }) => {
    await openVoteDialog(page);
    const { dialog } = await vote(page, "equations");
    const form = dialog.getByTestId("vote-updates");
    await expect(form).toContainText(FEATURE_LABELS.equations);
    await form.locator("#vote-updates-email").fill("reader@example.com");
    await page.waitForTimeout(HUMAN_PAUSE_MS);
    const request = page.waitForRequest((r) => r.url().endsWith("/api/notify"));
    const response = page.waitForResponse((r) => r.url().endsWith("/api/notify"));
    await form.getByRole("button", { name: FT.getUpdates }).click();
    expect((await request).postDataJSON()).toMatchObject({
      email: "reader@example.com",
      features: ["equations"],
      locale: "en",
    });
    expect((await response).headers()["x-notify-outcome"]).toBe("test-mode");
    await expect(dialog).toContainText(FT.updatesDone.replace("{feature}", FEATURE_LABELS.equations));

    const [signup] = await eventsNamed(page, "updates_signup");
    expect(signup.data).toMatchObject({ source: "vote", feature: "equations" });
    expect(await eventNames(page)).toContain("updates_signup_vote");
    expect(JSON.stringify(await getEvents(page))).not.toContain("reader@example.com");
  });

  test("a malformed email is rejected in the browser", async ({ page }) => {
    await openVoteDialog(page);
    const { dialog } = await vote(page, "share");
    const form = dialog.getByTestId("vote-updates");
    await form.locator("#vote-updates-email").fill("not-an-email");
    await form.getByRole("button", { name: FT.getUpdates }).click();
    await expect(form.getByRole("alert")).toHaveText(FT.errBad);
    expect(await eventNames(page)).not.toContain("updates_signup");
  });

  test("the workaround answer goes to /api/ideas with the feature, never to analytics", async ({ page }) => {
    await openVoteDialog(page);
    const { dialog } = await vote(page, "formatting");
    const form = dialog.getByTestId("vote-workaround");
    await form.locator("#vote-workaround-text").fill("I fix margins by hand in Word");
    await page.waitForTimeout(HUMAN_PAUSE_MS);
    const request = page.waitForRequest((r) => r.url().endsWith("/api/ideas"));
    await form.getByRole("button", { name: FT.send }).click();
    expect((await request).postDataJSON()).toMatchObject({
      kind: "workaround",
      feature: "formatting",
      text: "I fix margins by hand in Word",
    });
    await expect(dialog).toContainText(FT.todayDone);

    const [sent] = await eventsNamed(page, "idea_sent");
    expect(sent.data).toEqual({ kind: "workaround", feature: "formatting" });
    expect(await eventNames(page)).toContain("idea_sent_workaround");
    expect(JSON.stringify(await getEvents(page))).not.toContain("margins by hand");
  });

  test("results stay folded until asked for", async ({ page }) => {
    await openVoteDialog(page);
    const { dialog } = await vote(page, "share");
    await expect(dialog.getByTestId("vote-results")).toHaveCount(0);
    await dialog.getByTestId("vote-results-toggle").click();
    await expect(dialog.getByTestId("vote-results").locator(".vote-bar")).toHaveCount(8);
    await dialog.getByTestId("vote-results-toggle").click();
    await dialog.getByTestId("vote-results-toggle").click();
    expect(await eventsNamed(page, "vote_results_viewed")).toHaveLength(1);
  });

  test("the honeypot field is hidden from people but present for bots", async ({ page }) => {
    const { dialog } = await openVoteDialog(page);
    const honeypot = dialog.locator('input[name="mf-extra"]');
    await expect(honeypot).toHaveCount(1);
    await expect(honeypot).toHaveAttribute("tabindex", "-1");
    await expect(honeypot).toHaveAttribute("aria-hidden", "true");
    await expect(honeypot).not.toBeInViewport();
  });

  test("zh-Hans shows the localized invitation and board", async ({ page }) => {
    await page.goto("/zh-Hans?arm=card");
    await uploadSample(page);
    await exportTxt(page);
    const teaser = page.getByTestId("feature-teaser");
    await expect(teaser).toContainText("哪项功能能让你下次导出更方便？");
    await teaser.getByRole("button", { name: "选择功能" }).click();
    const dialog = page.getByTestId("feature-vote-dialog");
    await expect(dialog.getByRole("heading", { name: "你最需要哪项改进？" })).toBeVisible();
    await expect(dialog.getByRole("radio", { name: "在此浏览器中恢复最近的文档" })).toBeVisible();
    const [rendered] = await eventsNamed(page, "invite_rendered");
    expect(rendered.data?.locale).toBe("zh-Hans");
  });
});

test.describe("A file over 1 MB", () => {
  const bigFile = {
    name: "big.md",
    mimeType: "text/markdown",
    buffer: Buffer.alloc(Math.round(1.5 * 1024 * 1024), "a"),
  };

  test("desktop: the large-file card asks about paying, under the error, and clicks stay inside it", async ({ page }) => {
    // No ?paid=1: this card shows in production as built
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
    // The other paid prompts stay behind NEXT_PUBLIC_PAID_INTEREST
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

test.describe("The paid path", () => {
  test("is off by default: no paid line, plain updates after a vote for a candidate feature", async ({ page }) => {
    await openVoteDialog(page);
    await expect(page.getByTestId("vote-paid-line")).toHaveCount(0);
    const { dialog } = await vote(page, "equations");
    await expect(dialog.getByTestId("vote-updates")).toBeVisible();
    await expect(dialog.getByTestId("paid-questions-vote")).toHaveCount(0);
    expect(await eventNames(page)).not.toContain("paid_prompt_shown");
  });

  test("on: the board shows the paid line, and a vote for equations asks about paying", async ({ page }) => {
    await openVoteDialog(page, "/?paid=1");
    await expect(page.getByTestId("vote-paid-line")).toHaveText(FT.paidLine);
    const { dialog } = await vote(page, "equations");
    const questions = dialog.getByTestId("paid-questions-vote");
    await expect(questions).toBeVisible();
    await expect(dialog).toContainText(EN.paidInterest.vote.replace("{feature}", FEATURE_LABELS.equations));
    await expect(dialog.getByTestId("vote-updates")).toHaveCount(0);
    expect(await eventNames(page)).toContain("paid_prompt_shown_vote");

    await questions.getByTestId("paid-answers-vote").locator('[data-value="free"]').click();
    expect(await eventNames(page)).toContain("paid_interest_free");
  });

  test("on: a vote for a feature outside the paid list still gets plain updates", async ({ page }) => {
    await openVoteDialog(page, "/?paid=1");
    const { dialog } = await vote(page, "share");
    await expect(dialog.getByTestId("vote-updates")).toBeVisible();
    await expect(dialog.getByTestId("paid-questions-vote")).toHaveCount(0);
  });

  test("on: a heavy user gets the page-layout question once", async ({ page }) => {
    await page.goto("/?paid=1");
    await seedHistory(page, { conversions: 2, teaserDaysAgo: 2, answered: true });
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

  test("off: a heavy user gets the thumbs prompt", async ({ page }) => {
    await page.goto("/");
    await seedHistory(page, { conversions: 2, teaserDaysAgo: 2, answered: true });
    await seedHeavyUse(page);
    await uploadSample(page);
    await exportTxt(page);
    await expect(page.getByText(THUMBS_QUESTION)).toBeVisible();
    await expect(page.getByTestId("paid-layout-prompt")).toHaveCount(0);
  });

  test("on: never in the same tab as a vote invitation", async ({ page }) => {
    await page.goto("/?paid=1");
    await seedHeavyUse(page);
    await uploadSample(page);
    await exportTxt(page);
    await expect(page.getByTestId("feature-teaser")).toBeVisible();
    // The visitor votes, so the invitation is finished; the next slot comes in the same tab.
    await page.getByTestId("feature-teaser-open").click();
    await vote(page, "share");
    await page.keyboard.press("Escape");
    await endQuietPeriod(page);
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
      data: { ...good, kind: "workaround", feature: "equations" },
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
