import { expect, test } from "@playwright/test";

test("homepage renders the institutional editorial surface", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/Immigrati Imprenditori/i);
  await expect(page.locator("#contenuto")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  await page.keyboard.press("Tab");
  const skipLink = page.getByRole("link", { name: "Vai al contenuto" });
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toHaveAttribute("href", "#contenuto");

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

  await expect(page.getByRole("heading", { level: 1, name: "Partecipa al Centro Studi" })).toBeVisible();
  await expect(page.getByLabel(/Tipo di proposta/i)).toBeVisible();
  await expect(page.getByLabel(/Nome e cognome/i)).toBeVisible();
  await expect(page.getByLabel(/Email/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /Invia alla redazione/i })).toBeVisible();
  await expect(page.locator('input[name="website"]')).toBeHidden();
  await expect(page.getByText(/non comporta pubblicazione automatica/i)).toBeVisible();
});

test("support page remains fail-closed while online payments are disabled", async ({ page }) => {
  await page.goto("/sostieni");

  await expect(page.getByRole("heading", { level: 1 })).toContainText(/Sostieni/i);
  await expect(page.getByText(/pagamenti online/i)).toBeVisible();
  await expect(page.locator('a[href^="https://"][href*="checkout"]')).toHaveCount(0);
});

test("localized shells expose LTR and RTL directions", async ({ page }) => {
  await page.goto("/en");
  await expect(page.locator('[data-platform-locale="en"]')).toHaveAttribute("dir", "ltr");
  await expect(page.getByRole("link", { name: "Skip to content" })).toHaveAttribute("href", "#contenuto");

  await page.goto("/ar");
  await expect(page.locator('[data-platform-locale="ar"]')).toHaveAttribute("dir", "rtl");
  await expect(page.getByRole("link", { name: "الانتقال إلى المحتوى" })).toHaveAttribute("href", "#contenuto");
});
