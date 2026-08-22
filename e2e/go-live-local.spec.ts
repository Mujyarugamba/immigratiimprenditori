import { expect, test } from "@playwright/test";
import {
  cleanupUsers,
  createConfirmedUser,
  loadStatusEnv,
  provisionActiveAccount,
  psql,
} from "./helpers/supabase";

const PASS = "P6E2E!pass9";

test.describe("Go-live local surfaces", () => {
  const users: string[] = [];

  test.afterEach(() => {
    try {
      cleanupUsers(users.splice(0));
    } catch {
      /* local stack is discarded after CI */
    }
  });

  test("Observatory, Atlas, routes and stories render as real public surfaces", async ({ page }) => {
    const pages = [
      ["/osservatorio", /Osservatorio/i],
      ["/atlante", /Atlante dell.imprenditoria migrante/i],
      ["/atlante/rotte", /Rotte imprenditoriali/i],
      ["/storie", /Storie e voci/i],
    ] as const;

    for (const [path, heading] of pages) {
      const response = await page.goto(path, { waitUntil: "domcontentloaded" });
      expect(response?.ok(), `${path} did not return 2xx`).toBeTruthy();
      await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
      await expect(page.getByText(/Impossibile caricare/i)).toHaveCount(0);
    }

    await page.goto("/osservatorio");
    expect(await page.locator('a[href^="/osservatorio/"]').count()).toBeGreaterThan(0);

    await page.goto("/storie");
    await expect(page.getByRole("link", { name: /Partecipa/i })).toBeVisible();
  });

  test("public author profile is evidence-gated and renderable", async ({ page }) => {
    const env = loadStatusEnv();
    const stamp = Date.now();
    const email = `go-live-author-${stamp}@example.invalid`;
    const slug = `ci-research-author-${stamp}`;
    const uid = await createConfirmedUser(env, email, PASS);
    users.push(uid);

    await provisionActiveAccount(env, uid, email, PASS);
    psql(`
      update public.profiles
      set display_name = 'CI Research Author',
          slug = '${slug}',
          bio = 'Profilo locale effimero usato esclusivamente per il gate E2E.',
          role_description = 'Ricercatore',
          is_public = true,
          is_active = true,
          deleted_at = null,
          published_at = now()
      where id = '${uid}';
    `);

    const response = await page.goto(`/contributori/${slug}`);
    expect(response?.ok()).toBeTruthy();
    await expect(page.getByRole("heading", { level: 1, name: "CI Research Author" })).toBeVisible();
    await expect(page.getByText("Ricercatore", { exact: true })).toBeVisible();
    await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(2);
  });

  test("Open Data exposes a valid XLSX archive", async ({ request }) => {
    const response = await request.get("/api/open-data/indicators.xlsx");
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain(
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    const body = await response.body();
    expect(body.length).toBeGreaterThan(500);
    expect(body.subarray(0, 2).toString("ascii")).toBe("PK");
    expect(body.includes(Buffer.from("xl/worksheets/sheet1.xml"))).toBeTruthy();
  });

  test("privacy analytics endpoint aggregates a page view without cookies", async ({ request }) => {
    const path = `/ci-analytics-${Date.now()}`;
    const response = await request.post("/api/analytics/page-view", {
      data: { path, locale: "it" },
      headers: { origin: "http://127.0.0.1:3000" },
    });
    expect(response.status()).toBe(204);
    expect(response.headers()["set-cookie"]).toBeUndefined();

    const result = psql(`
      select view_count
      from public.site_analytics_daily
      where path = '${path}' and locale = 'it';
    `);
    expect(result).toMatch(/\b1\b/);
    psql(`delete from public.site_analytics_daily where path = '${path}';`);
  });

  test("core homepage remains usable under simulated high-latency delivery", async ({ page }) => {
    let sameOriginRequests = 0;
    await page.route("**/*", async (route) => {
      const url = new URL(route.request().url());
      if (url.hostname === "127.0.0.1" || url.hostname === "localhost") {
        sameOriginRequests += 1;
        await new Promise((resolve) => setTimeout(resolve, 120));
      }
      await route.continue();
    });

    await page.setViewportSize({ width: 390, height: 844 });
    const started = Date.now();
    const response = await page.goto("/", {
      waitUntil: "domcontentloaded",
      timeout: 30_000,
    });
    const elapsed = Date.now() - started;

    expect(response?.ok()).toBeTruthy();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("link", { name: /Esplora l.Osservatorio/i })).toBeVisible();
    expect(elapsed, "homepage DOMContentLoaded exceeded slow-network budget").toBeLessThan(15_000);
    expect(sameOriginRequests, "homepage request count exceeded go-live budget").toBeLessThanOrEqual(45);

    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);
  });
});
