import { test, expect, type APIRequestContext } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

/**
 * End-to-end tests for the "notify me" store: the route, the Supabase table
 * and the anti-spam checks, against a REAL project.
 *
 * These tests write rows, so they never run in the normal suite. Run them
 * yourself:
 *
 *   npm run build && npm run start          # NOT with E2E_RELAXED_RATE_LIMITS
 *   npm run test:notify-store
 *
 * The spec reads SUPABASE_URL and SUPABASE_SECRET_KEY from `.env` the same
 * way the scripts in scripts/ do, then verifies each row through Supabase's
 * REST API and deletes everything it created. Every address it uses starts
 * with `e2e-live-`.
 *
 * Each test sends its own X-Forwarded-For address, so the per-IP budgets in
 * src/middleware.ts stay separate and a rerun starts clean.
 */

// Same manual loader as scripts/umami-report.mjs (no dotenv dependency).
function loadEnvFile() {
  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    if (!line || line.trimStart().startsWith("#")) continue;
    const [key, ...rest] = line.split("=");
    if (!key || rest.length === 0) continue;
    const name = key.trim();
    if (!process.env[name]) process.env[name] = rest.join("=").trim();
  }
}
loadEnvFile();

const LIVE = process.env.NOTIFY_LIVE === "1";
const SUPABASE_URL = (process.env.SUPABASE_URL ?? "").replace(/\/+$/, "").replace(/\/rest\/v1$/, "");
const SECRET_KEY = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const PUBLISHABLE_KEY =
  process.env.SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const EMAIL_PREFIX = "e2e-live-";
const ORIGIN = "http://localhost:3000";

function secretHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    apikey: SECRET_KEY,
    "Content-Type": "application/json",
    // Supabase refuses a secret key from a browser-like client ("Forbidden use
    // of secret API key in browser"), and Playwright's request context sends a
    // Chrome user agent by default. The server's own calls are plain fetch.
    "User-Agent": "markdown-free-e2e",
  };
  if (SECRET_KEY.startsWith("eyJ")) headers.Authorization = `Bearer ${SECRET_KEY}`;
  return headers;
}

type Row = {
  email: string;
  features: string[];
  locale: string;
  created_at: string;
  updated_at: string;
  unsubscribed_at: string | null;
};

async function rowsFor(request: APIRequestContext, email: string): Promise<Row[]> {
  const response = await request.get(
    `${SUPABASE_URL}/rest/v1/notify_signups?select=*&email=eq.${encodeURIComponent(email)}`,
    { headers: secretHeaders() }
  );
  expect(response.ok(), `reading ${email} from Supabase`).toBeTruthy();
  return (await response.json()) as Row[];
}

async function deleteTestRows(request: APIRequestContext) {
  await request.delete(`${SUPABASE_URL}/rest/v1/notify_signups?email=like.${EMAIL_PREFIX}*`, {
    headers: { ...secretHeaders(), Prefer: "return=minimal" },
  });
}

// The per-IP counters live in memory for an hour and the server usually keeps
// running between runs, so every run gets its own block of addresses.
const RUN = Math.floor(Math.random() * 65536);
const ip = (host: number) => `10.${(RUN >> 8) & 255}.${RUN & 255}.${host}`;

let addressCounter = 0;
function freshEmail(): string {
  addressCounter += 1;
  return `${EMAIL_PREFIX}${Date.now()}-${addressCounter}@example.com`;
}

function signup(
  request: APIRequestContext,
  fields: {
    email: string;
    features?: string[];
    locale?: string;
    website?: string;
    elapsedMs?: number;
    ip: string;
  }
) {
  const { ip, ...body } = fields;
  return request.post("/api/notify", {
    headers: { Origin: ORIGIN, "Content-Type": "application/json", "X-Forwarded-For": ip },
    data: {
      features: ["backup"],
      locale: "en",
      website: "",
      elapsedMs: 5000,
      ...body,
    },
  });
}

test.describe("Notify signups — live Supabase", () => {
  test.skip(!LIVE, "set NOTIFY_LIVE=1 (npm run test:notify-store) to run against a real project");

  test.beforeAll(async ({ request }) => {
    if (!SUPABASE_URL || !SECRET_KEY) {
      throw new Error("SUPABASE_URL and SUPABASE_SECRET_KEY must be set in .env or the shell");
    }
    const health = await request.get("/api/health");
    const body = await health.json();
    if (body.store === "skipped") {
      throw new Error("the server runs with E2E_RELAXED_RATE_LIMITS=1 and never stores; restart it without that flag");
    }
    if (body.store !== "ok") {
      throw new Error(`the server reports store: "${body.store}" — check its SUPABASE_* variables`);
    }
    await deleteTestRows(request);
  });

  test.afterAll(async ({ request }) => {
    await deleteTestRows(request);
  });

  test("stores a signup, then merges a second one into the same row", async ({ request }) => {
    const email = freshEmail();

    const first = await signup(request, { email, features: ["backup", "share"], locale: "en", ip: ip(11) });
    expect(first.status()).toBe(200);
    expect(await first.json()).toEqual({ ok: true });

    const [stored] = await rowsFor(request, email);
    expect(stored).toBeTruthy();
    expect(stored.features).toEqual(["backup", "share"]);
    expect(stored.locale).toBe("en");
    expect(stored.unsubscribed_at).toBeNull();

    const second = await signup(request, { email, features: ["templates"], locale: "ja", ip: ip(11) });
    expect(second.status()).toBe(200);

    const rows = await rowsFor(request, email);
    expect(rows, "a second signup must not create a second row").toHaveLength(1);
    // The function merges and sorts the features, and takes the newer locale
    expect(rows[0].features).toEqual(["backup", "share", "templates"]);
    expect(rows[0].locale).toBe("ja");
    expect(rows[0].created_at).toBe(stored.created_at);
    expect(new Date(rows[0].updated_at).getTime()).toBeGreaterThanOrEqual(new Date(stored.updated_at).getTime());
  });

  test("stores the address in lowercase", async ({ request }) => {
    const email = freshEmail();
    const mixedCase = email.toUpperCase().replace("@EXAMPLE.COM", "@Example.com");

    const response = await signup(request, { email: mixedCase, ip: ip(12) });
    expect(response.status()).toBe(200);

    expect(await rowsFor(request, mixedCase.toLowerCase())).toHaveLength(1);
    expect(await rowsFor(request, mixedCase)).toHaveLength(0);
  });

  test("a honeypot submission answers ok and stores nothing", async ({ request }) => {
    const email = freshEmail();
    const response = await signup(request, { email, website: "https://spam.example", ip: ip(13) });

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(await rowsFor(request, email)).toHaveLength(0);
  });

  test("a submission sent too fast answers ok and stores nothing", async ({ request }) => {
    const email = freshEmail();
    const response = await signup(request, { email, elapsedMs: 200, ip: ip(14) });

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(await rowsFor(request, email)).toHaveLength(0);
  });

  test("a rejected signup stores nothing", async ({ request }) => {
    const email = freshEmail();

    const badFeature = await signup(request, { email, features: ["backup", "free-pizza"], ip: ip(15) });
    expect(badFeature.status()).toBe(400);
    expect((await badFeature.json()).error).toBe("INVALID_FEATURES");

    const badEmail = await signup(request, { email: "not-an-email", ip: ip(15) });
    expect(badEmail.status()).toBe(400);

    expect(await rowsFor(request, email)).toHaveLength(0);
  });

  test("an unknown locale falls back to en instead of failing", async ({ request }) => {
    const email = freshEmail();
    const response = await signup(request, { email, locale: "xx", ip: ip(16) });

    expect(response.status()).toBe(200);
    const [stored] = await rowsFor(request, email);
    expect(stored.locale).toBe("en");
  });

  test("the per-IP budget returns 429 after 10 signups in an hour", async ({ request }) => {
    const address = ip(20);
    // Honeypot submissions: the budget is spent in middleware, before the
    // route, so this fills the hour without writing 10 rows.
    for (let i = 0; i < 10; i += 1) {
      const response = await signup(request, { email: freshEmail(), website: "bot", ip: address });
      expect(response.status(), `request ${i + 1} of 10`).toBe(200);
    }

    const blocked = await signup(request, { email: freshEmail(), website: "bot", ip: address });
    expect(blocked.status()).toBe(429);
    expect((await blocked.json()).error).toBe("RATE_LIMITED");
    expect(blocked.headers()["retry-after"]).toBe("3600");
  });

  test("the database refuses bad input even if the route is bypassed", async ({ request }) => {
    const rpc = (body: Record<string, unknown>) =>
      request.post(`${SUPABASE_URL}/rest/v1/rpc/notify_signup`, { headers: secretHeaders(), data: body });

    const unknownFeature = await rpc({
      p_email: freshEmail(),
      p_features: ["backup", "free-pizza"],
      p_locale: "en",
    });
    expect(unknownFeature.ok(), "the features check constraint must reject an unknown key").toBeFalsy();

    const badLocale = await rpc({ p_email: freshEmail(), p_features: ["backup"], p_locale: "xx" });
    expect(badLocale.ok(), "the locale check constraint must reject an unlisted locale").toBeFalsy();

    const noFeatures = await rpc({ p_email: freshEmail(), p_features: [], p_locale: "en" });
    expect(noFeatures.ok(), "the cardinality check must reject an empty feature list").toBeFalsy();
  });

  test("the publishable key can neither read nor write the list", async ({ request }) => {
    test.skip(!PUBLISHABLE_KEY, "add SUPABASE_PUBLISHABLE_KEY to .env to run this check");

    const headers = { apikey: PUBLISHABLE_KEY, "Content-Type": "application/json" };

    const read = await request.get(`${SUPABASE_URL}/rest/v1/notify_signups?select=*`, { headers });
    expect(read.ok(), "row-level security must block a public read").toBeFalsy();

    const write = await request.post(`${SUPABASE_URL}/rest/v1/rpc/notify_signup`, {
      headers,
      data: { p_email: freshEmail(), p_features: ["backup"], p_locale: "en" },
    });
    expect(write.ok(), "the public key must not be able to run notify_signup").toBeFalsy();
  });

  test("the health check reports the store as ok", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.status()).toBe(200);
    expect(await response.json()).toMatchObject({ status: "ok", store: "ok" });
  });
});
