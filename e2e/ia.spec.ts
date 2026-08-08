import { expect, test } from "@playwright/test";

test.describe("public IA", () => {
  test("home expresses platform identity without Osservatorio as hero identity", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Persone. Imprese. Opportunità. Mercati internazionali.",
    );
    await expect(page.locator("h1").first()).not.toContainText("Osservatorio");

    // Primary ecosystems must be reachable (header or CTA links on home).
    for (const href of [
      "/persone",
      "/imprese",
      "/opportunita",
      "/mercati",
      "/servizi",
    ]) {
      await expect(page.locator(`a[href="${href}"]`).first()).toBeAttached();
      await page.goto(href);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await page.goto("/");
    }
  });

  test("transversal layers are reachable", async ({ page }) => {
    await page.goto("/");
    for (const href of [
      "/eventi",
      "/contenuti",
      "/osservatorio",
      "/organizzazioni",
    ]) {
      await expect(page.locator(`a[href="${href}"]`).first()).toBeAttached();
      await page.goto(href);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    }
  });
});
