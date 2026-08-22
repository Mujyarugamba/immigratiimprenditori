import { expect, test } from "@playwright/test";

const corePublicPages = ["/", "/contribuisci", "/sostieni"] as const;

test("homepage renders the institutional editorial surface", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/Immigrati Imprenditori/i);
  await expect(page.locator("#contenuto")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(page.locator("img:not([alt])")).toHaveCount(0);

  await page.keyboard.press("Tab");
  const skipLink = page.getByRole("link", { name: "Vai al contenuto" });
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toHaveAttribute("href", "#contenuto-principale");

  const hero = page.locator(".home-hero");
  if (await hero.count()) {
    await expect(hero).toBeVisible();
    const backgroundImage = await hero.evaluate(
      (element) => getComputedStyle(element).backgroundImage,
    );
    expect(backgroundImage).toBe("none");
  }
});

test("contribution page exposes the reviewed intake flow without submitting", async ({ page }) => {
  await page.goto("/contribuisci");

  await expect(page.getByRole("heading", { level: 1, name: "Partecipa al Centro Studi" })).toHaveCount(1);
  await expect(page.getByLabel(/Tipo di proposta/i)).toBeVisible();
  await expect(page.getByLabel(/Nome e cognome/i)).toBeVisible();
  await expect(page.getByLabel(/Email/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /Invia alla redazione/i })).toBeVisible();
  await expect(page.locator('input[name="website"]')).toBeHidden();
  await expect(page.getByText(/non comporta pubblicazione automatica/i)).toBeVisible();
});

test("support page remains fail-closed while online payments are disabled", async ({ page }) => {
  await page.goto("/sostieni");

  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(page.getByText(/pagamenti online/i)).toBeVisible();
  await expect(page.locator('a[href^="https://"][href*="checkout"]')).toHaveCount(0);
});

test("localized shells expose correct document and content directions", async ({ page }) => {
  await page.goto("/en");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  await expect(page.locator('[data-platform-locale="en"]')).toHaveAttribute("dir", "ltr");
  await expect(page.getByRole("link", { name: "Skip to content", exact: true })).toHaveAttribute("href", "#contenuto-principale");

  await page.goto("/ar");
  await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.locator('[data-platform-locale="ar"]')).toHaveAttribute("dir", "rtl");
  await expect(page.getByRole("link", { name: "الانتقال إلى المحتوى", exact: true })).toHaveAttribute("href", "#contenuto-principale");
});

test("core public pages do not overflow mobile or tablet viewports", async ({ page }) => {
  for (const width of [390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    for (const path of corePublicPages) {
      await page.goto(path);
      const dimensions = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
      }));
      expect(
        dimensions.scrollWidth,
        `${path} overflows horizontally at ${width}px`,
      ).toBeLessThanOrEqual(dimensions.clientWidth + 1);
    }
  }
});

test("institutional and language navigation remains reachable on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await expect(page.getByRole("link", { name: "Cerca", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Chi siamo", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Accedi", exact: true })).toBeVisible();
  await expect(page.getByRole("combobox", { name: "Lingua", exact: true })).toBeVisible();
});
