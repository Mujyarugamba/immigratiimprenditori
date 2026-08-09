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
      "/cultura",
      "/contenuti",
      "/osservatorio",
      "/organizzazioni",
    ]) {
      await expect(page.locator(`a[href="${href}"]`).first()).toBeAttached();
      await page.goto(href);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    }
  });

  test("Cultura hub is transversal and not a sixth ecosystem", async ({
    page,
  }) => {
    await page.goto("/cultura");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      /Cultura,\s*incontri,\s*relazioni/i,
    );
    await expect(page.getByRole("heading", { level: 1 })).not.toContainText(
      "Persone. Imprese. Opportunità. Mercati internazionali.",
    );
    await expect(page.locator('a[href="/eventi?tipo=cultural"]').first()).toBeAttached();
    await expect(page.locator('a[href="/registrati"]').first()).toBeAttached();

    // C4 V2 sections (data-driven; empty states allowed)
    await expect(page.getByRole("heading", { name: /Eventi culturali/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Occasioni culturali/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Collaborazioni culturali/i })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Professionisti culturali/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Organizzazioni culturali/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Imprese culturali/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Servizi culturali/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Contenuti culturali/i }),
    ).toBeVisible();

    // Empty-state copy must not use deferred “Presto: classificati” language
    await expect(page.getByText(/Presto:\s*attori culturali classificati/i)).toHaveCount(0);
    await expect(page.locator("body")).not.toContainText("runtime error");
  });

  test("Cultura hub sections render on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/cultura");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Organizzazioni culturali/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Entra nella rete/i }).first(),
    ).toBeVisible();
  });
});
