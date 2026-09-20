import { test, expect } from "@playwright/test";

/**
 * GET /api/health (src/app/api/health/route.ts).
 *
 * An external monitor polls it; the Supabase read inside also keeps a
 * free-tier project from pausing (docs/supabase-setup.md). The body must stay
 * a bare status: no URL, no key, no address.
 *
 * States: "ok" (store answered), "skipped" (a server started for this suite),
 * "unconfigured" and "error" (both 503, so the monitor alerts).
 */

test.describe("GET /api/health", () => {
  test("reports the store state and leaks nothing", async ({ request }) => {
    const response = await request.get("/api/health");
    const body = await response.json();

    expect(Object.keys(body).sort()).toEqual(["status", "store", "time"]);
    expect(new Date(body.time).toString()).not.toBe("Invalid Date");
    expect(response.headers()["cache-control"]).toContain("no-store");

    if (body.store === "ok" || body.store === "skipped") {
      expect(response.status()).toBe(200);
      expect(body.status).toBe("ok");
    } else {
      // "unconfigured" or "error": the monitor must see a failure
      expect(["unconfigured", "error"]).toContain(body.store);
      expect(response.status()).toBe(503);
      expect(body.status).toBe("degraded");
    }

    const serialized = JSON.stringify(body);
    expect(serialized).not.toContain("supabase");
    expect(serialized).not.toContain("sb_secret");
    expect(serialized).not.toContain("eyJ");
  });

  test("answers a HEAD-style monitor check quickly", async ({ request }) => {
    const started = Date.now();
    const response = await request.get("/api/health");
    expect([200, 503]).toContain(response.status());
    expect(Date.now() - started).toBeLessThan(10000);
  });
});
