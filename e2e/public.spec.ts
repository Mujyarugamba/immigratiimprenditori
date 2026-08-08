import { expect, test } from "@playwright/test";

const PUBLIC_ROUTES = [
  "/",
  "/persone",
  "/imprese",
  "/opportunita",
  "/mercati",
  "/servizi",
  "/eventi",
  "/collaborazioni",
  "/osservatorio",
  "/contenuti",
] as const;

test.describe("public experience", () => {
  for (const path of PUBLIC_ROUTES) {
    test(`loads ${path}`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.ok()).toBeTruthy();
      await expect(page.locator("h1").first()).toBeVisible();
      const h1Count = await page.locator("h1").count();
      expect(h1Count).toBe(1);
    });
  }

  test("missing public detail shows generic not-found UX", async ({
    page,
    request,
  }) => {
    const api = await request.get("/contenuti/this-slug-does-not-exist-p6-e2e");
    // App Router may surface 404; accept either status or not-found body.
    const status = api.status();
    expect([200, 404]).toContain(status);

    await page.goto("/contenuti/this-slug-does-not-exist-p6-e2e");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      /non trov|non disponibil/i,
    );
  });

  test("unknown content slug is not shown as a public article", async ({
    page,
  }) => {
    await page.goto("/contenuti/p6-private-draft-never-exists");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      /non trov|non disponibil/i,
    );
    await expect(page.locator("article")).toHaveCount(0);
  });
});
