import { expect, test } from "@playwright/test";

const corePublicPages = ["/", "/contribuisci", "/sostieni"] as const;

const localizedHomes = [
  ["it", "/", "ltr"],
  ["en", "/en", "ltr"],
  ["fr", "/fr", "ltr"],
  ["es", "/es", "ltr"],
  ["de", "/de", "ltr"],
  ["ar", "/ar", "rtl"],
  ["zh", "/zh", "ltr"],
] as const;

test("homepage renders the institutional editorial shell", async ({ page }) => {
  const response = await page.goto("/", { waitUntil: "domcontentloaded" });
  expect(response?.ok()).toBeTruthy();
  await expect(page).toHaveTitle(/Immigrati Imprenditori/i);
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(page.locator("img:not([alt])")).toHaveCount(0);

  await page.keyboard.press("Tab");
  const skipLink = page.getByRole("link", { name: "Vai al contenuto" });
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toHaveAttribute("href", "#contenuto-principale");
});

test("contribution and support surfaces remain safe without live data", async ({ page }) => {
  await page.goto("/contribuisci");
  await expect(page.getByRole("heading", { level: 1, name: "Partecipa al Centro Studi" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Invia alla redazione/i })).toBeVisible();
  await expect(page.getByText(/non comporta pubblicazione automatica/i)).toBeVisible();

  await page.goto("/sostieni");
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(page.getByText(/pagamenti online/i)).toBeVisible();
  await expect(page.locator('a[href^="https://"][href*="checkout"]')).toHaveCount(0);
});

test("all seven localized home shells expose language and direction", async ({ page }) => {
  for (const [locale, path, direction] of localizedHomes) {
    const response = await page.goto(path, { waitUntil: "domcontentloaded" });
    expect(response?.ok(), `${locale} home did not return 2xx`).toBeTruthy();
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await expect(page.locator("html")).toHaveAttribute("dir", direction);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  }
});

test("core static surfaces reflow on narrow viewports", async ({ page }) => {
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    for (const path of corePublicPages) {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      const dimensions = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
      }));
      expect(dimensions.scrollWidth, `${path} overflows at ${width}px`).toBeLessThanOrEqual(
        dimensions.clientWidth + 1,
      );
    }
  }
});
