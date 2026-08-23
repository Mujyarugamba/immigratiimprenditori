import { defineConfig, devices } from "@playwright/test";

const baseURL = "http://127.0.0.1:3000";
const unavailableSupabaseURL = "http://127.0.0.1:9";

export default defineConfig({
  testDir: "e2e",
  testMatch: ["public-smoke.spec.ts", "seo-smoke.spec.ts"],
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 10_000 },
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
    timeout: 60_000,
    env: {
      // Public-shell CI intentionally runs without a database. Use a local
      // closed endpoint so fallback behavior is deterministic and does not
      // depend on DNS/network latency to an invented external Supabase host.
      NEXT_PUBLIC_SUPABASE_URL: unavailableSupabaseURL,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "ci-placeholder-key",
      NEXT_PUBLIC_SITE_URL: "https://preview.example.invalid",
    },
  },
});
