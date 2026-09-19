import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  testMatch: ["app.spec.ts", "i18n.spec.ts", "filename.spec.ts", "multilingual.spec.ts", "security.spec.ts", "word-pages.spec.ts", "share.spec.ts", "mobile.spec.ts", "clipboard.spec.ts", "related-tools.spec.ts", "image-export.spec.ts", "img-proxy.spec.ts", "comparison-inline.spec.ts", "feedback.spec.ts", "static-rendering.spec.ts", "fidelity.spec.ts", "intent-pages.spec.ts", "server-formats.spec.ts", "broken-input.spec.ts", "multilingual-exports.spec.ts", "feature-teaser.spec.ts"], // Local tests (use production config for production.spec.ts)
  outputDir: "./tmp/test-results",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 3,
  reporter: [["html", { outputFolder: "./tmp/playwright-report" }]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      // Safari's canvas area limit is the binding constraint for image export
      // (spec 5.9: WebKit is mandatory for the PNG/JPG suite)
      name: "webkit-image",
      use: { ...devices["Desktop Safari"] },
      testMatch: "image-export.spec.ts",
    },
  ],
  webServer: {
    // CI (and any authoritative run) tests the PRODUCTION build: `next dev` compiles
    // routes on demand and produces false timeouts under parallel workers. CI runs
    // `npm run build` first (see .github/workflows/ci.yml). Locally, start
    // `E2E_RELAXED_RATE_LIMITS=1 npm run start` yourself and Playwright reuses it
    // (the flag lifts the per-IP API budgets the parallel suite would trip;
    // origin validation stays strict — see src/middleware.ts).
    command: process.env.CI ? "E2E_RELAXED_RATE_LIMITS=1 npm run start" : "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});

