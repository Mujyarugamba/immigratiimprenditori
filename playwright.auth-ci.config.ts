import { defineConfig, devices } from "@playwright/test";

const baseURL = "http://127.0.0.1:3000";

export default defineConfig({
  testDir: "e2e",
  testMatch: [
    "contribution-form.spec.ts",
    "editorial.spec.ts",
    "go-live-local.spec.ts",
    "internal-links.spec.ts",
    "public-readonly.spec.ts",
    "seo-smoke.spec.ts",
    "seo-real-stack.spec.ts",
  ],
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  reporter: [["list"]],
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    ...devices["Desktop Chrome"],
    channel: "chrome",
  },
  webServer: {
    command: "npm run start -- -p 3000",
    url: baseURL,
    reuseExistingServer: false,
    timeout: 90_000,
  },
});
