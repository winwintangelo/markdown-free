import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  testMatch: ["app.spec.ts", "i18n.spec.ts", "filename.spec.ts", "multilingual.spec.ts", "security.spec.ts", "word-pages.spec.ts", "share.spec.ts", "mobile.spec.ts", "clipboard.spec.ts", "related-tools.spec.ts", "image-export.spec.ts", "img-proxy.spec.ts", "comparison-inline.spec.ts"], // Local tests (use production config for production.spec.ts)
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
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});

