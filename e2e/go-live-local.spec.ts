import { expect, test } from "@playwright/test";
import { psql } from "./helpers/supabase";

test.describe("Go-live local surfaces", () => {
  test("Observatory, Atlas, routes and stories render as real public surfaces", async ({ page }) => {
    const pages = [
      ["/osservatorio", /Ricerche e dati/i],
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

    await page.goto("/atlante");
    expect(
      await page.locator('a[href^="/atlante/"]:not([href="/atlante/rotte"])').count(),
      "Atlas must expose at least one navigable evidence-backed country",
    ).toBeGreaterThan(0);

    await page.goto("/atlante/rotte");
    expect(
      await page.locator('a[href^="/atlante/rotte/"]').count(),
      "Routes must expose at least one navigable evidence-backed origin-destination route",
    ).toBeGreaterThan(0);

    await page.goto("/storie");
    await expect(
      page.getByRole("main").getByRole("link", { name: /Partecipa/i }).first(),
    ).toBeVisible();

    // Pre-go-live may legitimately contain zero real stories: outreach starts only
    // after the site is online. If stories already exist, their public links must
    // still use the canonical content route. The post-go-live editorial gate is
    // tracked separately and must never be satisfied with fabricated content.
    const storyLinks = page.locator('article a[href^="/contenuti/"]');
    const storyCount = await storyLinks.count();
    for (let index = 0; index < storyCount; index += 1) {
      await expect(storyLinks.nth(index)).toHaveAttribute("href", /^\/contenuti\//);
    }
  });

  test("public author profile is evidence-gated and renderable", async ({ page }) => {
    const stamp = Date.now();
    const slug = `ci-research-author-${stamp}`;
    psql(`
      insert into public.author_profiles (
        slug, display_name, profile_kind, bio, affiliation, orcid, website_url, is_public
      ) values (
        '${slug}',
        'CI Research Author',
        'person',
        'Profilo locale effimero usato esclusivamente per il gate E2E.',
        'CI Research Institute',
        '0000-0002-1825-0097',
        'https://example.invalid/author',
        true
      );
    `);

    try {
      const response = await page.goto(`/autori/${slug}`);
      expect(response?.ok()).toBeTruthy();
      await expect(
        page.getByRole("heading", { level: 1, name: "CI Research Author" }),
      ).toBeVisible();
      await expect(page.getByText("CI Research Institute", { exact: true })).toBeVisible();
      await expect(page.getByText("0000-0002-1825-0097", { exact: false })).toBeVisible();
      await expect(page.getByRole("heading", { level: 2, name: "Pubblicazioni e contributi" })).toBeVisible();

      const structuredDataTypes = await page.locator('script[type="application/ld+json"]').evaluateAll(
        (scripts) => scripts.flatMap((script) => {
          try {
            const parsed = JSON.parse(script.textContent ?? "{}");
            if (Array.isArray(parsed?.["@graph"])) {
              return parsed["@graph"].map((item: { "@type"?: string }) => item?.["@type"]).filter(Boolean);
            }
            return parsed?.["@type"] ? [parsed["@type"]] : [];
          } catch {
            return [];
          }
        }),
      );
      expect(structuredDataTypes).toContain("Person");
      expect(structuredDataTypes).toContain("BreadcrumbList");

      await page.goto("/esplora/autori");
      await expect(page.getByRole("link", { name: "CI Research Author" })).toHaveAttribute(
        "href",
        `/autori/${slug}`,
      );
    } finally {
      psql(`delete from public.author_profiles where slug = '${slug}';`);
    }
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

  test("privacy analytics endpoint aggregates a page view without cookies", async ({ page }) => {
    const path = `/ci-analytics-${Date.now()}`;
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const beforeCookies = await page.context().cookies();

    const status = await page.evaluate(async (analyticsPath) => {
      const response = await fetch("/api/analytics/page-view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: analyticsPath, locale: "it" }),
        credentials: "same-origin",
      });
      return response.status;
    }, path);

    expect(status).toBe(204);
    const afterCookies = await page.context().cookies();
    expect(afterCookies).toEqual(beforeCookies);

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
