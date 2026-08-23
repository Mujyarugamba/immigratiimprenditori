import { defineConfig, devices } from "@playwright/test";

const baseURL = "http://127.0.0.1:3000";
const unavailableSupabaseURL = "http://127.0.0.1:54329";

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
  webServer: [
    {
      command: "node scripts/ci/supabase-unavailable-stub.mjs",
      url: `${unavailableSupabaseURL}/__health`,
      reuseExistingServer: true,
      timeout: 30_000,
    },
    {
      command: "npm run start -- -p 3000",
      url: baseURL,
      reuseExistingServer: false,
      timeout: 60_000,
      env: {
        // Public-shell CI intentionally runs without a database. The local
        // stub returns 503 immediately so fallback behavior is deterministic
        // without waiting on a closed or black-holed network endpoint.
        NEXT_PUBLIC_SUPABASE_URL: unavailableSupabaseURL,
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "ci-placeholder-key",
        NEXT_PUBLIC_SITE_URL: "https://preview.example.invalid",
      },
    },
  ],
});
