import { test, expect, type Page } from "@playwright/test";
import { openMoreFormats } from "./export-helpers";

/**
 * Usage signals (src/lib/usage-signals.ts): how heavily a browser converts,
 * counted in localStorage and reported only as ranges.
 *
 * - `usage_profile` once per browser per day, at its first conversion.
 * - `doc_profile` once per document per tab, at its first conversion.
 * - `upload_error` for a too-large file carries its size range.
 */

const DAY_MS = 24 * 60 * 60 * 1000;
const WHEN_VALUES = ["work_hours", "off_hours", "weekend"];

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

async function eventsNamed(page: Page, name: string): Promise<TrackedEvent[]> {
  const all = await page.evaluate(() => (window as unknown as { __events: TrackedEvent[] }).__events);
  return all.filter((e) => e.name === name);
}

async function upload(page: Page, name: string, markdown: string) {
  await page.locator('input[type="file"]').setInputFiles({
    name,
    mimeType: "text/markdown",
    buffer: Buffer.from(markdown),
  });
  await expect(page.getByRole("heading", { name: markdown.split("\n")[0].replace(/^# /, "") })).toBeVisible({
    timeout: 15000,
  });
}

// TXT export is client-side, so each call is one quick successful conversion.
async function exportTxt(page: Page) {
  const downloadPromise = page.waitForEvent("download");
  await openMoreFormats(page);
  await page.getByRole("button", { name: /TXT/ }).click();
  await downloadPromise;
}

test.describe("Usage signals", () => {
  test.beforeEach(async ({ page }) => {
    await stubAnalytics(page);
  });

  test("a first conversion reports one usage profile and one document profile", async ({ page }) => {
    await page.goto("/");
    await upload(page, "notes.md", "# Notes\n\nA short document.");
    await exportTxt(page);

    const profiles = await eventsNamed(page, "usage_profile");
    expect(profiles).toHaveLength(1);
    const { when, ...rest } = profiles[0].data ?? {};
    expect(rest).toEqual({ uses: "1", days: "1", formats: "1", since: "today" });
    expect(WHEN_VALUES).toContain(when);

    const docs = await eventsNamed(page, "doc_profile");
    expect(docs).toHaveLength(1);
    expect(docs[0].data).toEqual({ source: "file", size: "0-10kb", images: "0", again: "no", docs: "1" });
  });

  test("more conversions the same day report nothing new for the same document", async ({ page }) => {
    await page.goto("/");
    await upload(page, "notes.md", "# Notes\n\nA short document.");
    await exportTxt(page);
    await exportTxt(page);

    expect(await eventsNamed(page, "usage_profile")).toHaveLength(1);
    expect(await eventsNamed(page, "doc_profile")).toHaveLength(1);
    const log = await page.evaluate(() => JSON.parse(localStorage.getItem("mdfree:usage-log") ?? "[]"));
    expect(log).toHaveLength(2);
  });

  test("the profile counts the last 30 days only", async ({ page }) => {
    await page.goto("/");
    // Yesterday: one PDF. 31 days ago: one Word export, outside the window.
    await page.evaluate((dayMs) => {
      const now = Date.now();
      localStorage.setItem(
        "mdfree:usage-log",
        JSON.stringify([
          [now - 31 * dayMs, "docx"],
          [now - dayMs, "pdf"],
        ])
      );
      localStorage.setItem("mdfree:usage-first-at", String(now - 40 * dayMs));
      localStorage.setItem("mdfree:usage-profile-day", "an earlier day");
    }, DAY_MS);
    await upload(page, "notes.md", "# Notes\n\nA short document.");
    await exportTxt(page);

    const [profile] = await eventsNamed(page, "usage_profile");
    expect(profile.data).toMatchObject({ uses: "2", days: "2-3", formats: "2", since: "30d+" });
  });

  test("a heavy week shows in the ranges", async ({ page }) => {
    await page.goto("/");
    await page.evaluate((dayMs) => {
      const now = Date.now();
      localStorage.setItem(
        "mdfree:usage-log",
        JSON.stringify([
          [now - 3 * dayMs, "pdf"],
          [now - 2 * dayMs, "docx"],
          [now - 2 * dayMs + 60_000, "png"],
          [now - dayMs, "docx"],
        ])
      );
      localStorage.setItem("mdfree:usage-first-at", String(now - 10 * dayMs));
    }, DAY_MS);
    await upload(page, "notes.md", "# Notes\n\nA short document.");
    await exportTxt(page);

    const [profile] = await eventsNamed(page, "usage_profile");
    expect(profile.data).toMatchObject({ uses: "5-9", days: "4-7", formats: "3+", since: "7-29d" });
  });

  test("a browser that converted before the counter existed keeps its start date", async ({ page }) => {
    await page.goto("/");
    // The teaser window started at this browser's first conversion, 12 days ago.
    await page.evaluate((dayMs) => {
      localStorage.setItem("mdfree:teaser-first-at", String(Date.now() - 12 * dayMs));
    }, DAY_MS);
    await upload(page, "notes.md", "# Notes\n\nA short document.");
    await exportTxt(page);

    const [profile] = await eventsNamed(page, "usage_profile");
    expect(profile.data).toMatchObject({ uses: "1", since: "7-29d" });
  });

  test("a second document in the same tab counts as the second", async ({ page }) => {
    await page.goto("/");
    await upload(page, "first.md", "# First\n\nOne.");
    await exportTxt(page);
    await upload(page, "second.md", "# Second\n\nTwo.");
    await exportTxt(page);

    const docs = await eventsNamed(page, "doc_profile");
    expect(docs.map((d) => d.data?.docs)).toEqual(["1", "2"]);
  });

  test("the same file converted on a later day is recognised, by name only", async ({ page, context }) => {
    await page.goto("/");
    await upload(page, "report.md", "# Report\n\nVersion one.");
    await exportTxt(page);
    expect((await eventsNamed(page, "doc_profile"))[0].data?.again).toBe("no");

    // The stored fingerprint holds a hash, never the file name.
    const stored = await page.evaluate(() => localStorage.getItem("mdfree:docs-seen") ?? "");
    expect(stored).not.toContain("report");

    // Pretend that conversion happened yesterday, then come back in a new tab
    // with an edited version of the same file.
    await page.evaluate((dayMs) => {
      const seen = JSON.parse(localStorage.getItem("mdfree:docs-seen") ?? "{}");
      for (const key of Object.keys(seen)) seen[key] -= dayMs;
      localStorage.setItem("mdfree:docs-seen", JSON.stringify(seen));
    }, DAY_MS);
    const later = await context.newPage();
    await stubAnalytics(later);
    await later.goto("/");
    await upload(later, "report.md", "# Report\n\nVersion two, edited.");
    await exportTxt(later);
    await upload(later, "other.md", "# Other\n\nA new file.");
    await exportTxt(later);

    const docs = await eventsNamed(later, "doc_profile");
    expect(docs.map((d) => d.data?.again)).toEqual(["yes", "no"]);
    expect(docs[0].data?.docs).toBe("1");
  });

  test("images are counted in ranges", async ({ page }) => {
    await page.goto("/");
    const images = Array.from({ length: 21 }, (_, i) => `![figure ${i}](figure-${i}.png)`).join("\n\n");
    await upload(page, "figures.md", `# Figures\n\n${images}`);
    await exportTxt(page);

    const [doc] = await eventsNamed(page, "doc_profile");
    expect(doc.data?.images).toBe("21+");
  });

  test("a file too large to upload reports its size range", async ({ page }) => {
    await page.goto("/");
    await page.locator('input[type="file"]').setInputFiles({
      name: "big.md",
      mimeType: "text/markdown",
      buffer: Buffer.alloc(Math.round(1.5 * 1024 * 1024), "a"),
    });

    await expect
      .poll(async () => (await eventsNamed(page, "upload_error"))[0]?.data)
      .toEqual({ source: "file", reason: "too_large", category: "user_error", uses: "0", size: "1-2mb" });
  });
});
