import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for production E2E tests
 * Run with: npx playwright test --config=playwright.production.config.ts
 */
export default defineConfig({
  testDir: "./e2e",
  testMatch: "production.spec.ts",
  outputDir: "./tmp/test-results-production",
  fullyParallel: false, // Run sequentially to avoid rate limiting
  forbidOnly: !!process.env.CI,
  retries: 2, // Production may have cold starts
  workers: 1, // Single worker for production
  reporter: [
    ["html", { outputFolder: "./tmp/playwright-report-production" }],
    ["list"],
  ],
  timeout: 60000, // 60s timeout for cold starts
  use: {
    baseURL: "https://www.markdown.free",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    // Longer timeouts for production
    actionTimeout: 30000,
    navigationTimeout: 30000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  // No webServer - we're testing production
});
