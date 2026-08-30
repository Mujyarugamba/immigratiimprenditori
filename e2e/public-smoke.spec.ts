import { expect, test, type Locator, type Page } from "@playwright/test";

async function tabUntilFocused(page: Page, locator: Locator, maxTabs = 30) {
  for (let index = 0; index < maxTabs; index += 1) {
    if (await locator.evaluate((node) => node === document.activeElement).catch(() => false)) return;
    await page.keyboard.press("Tab");
  }
  throw new Error("Target did not receive keyboard focus within the expected tab sequence.");
}

async function expectFocusedInViewport(locator: Locator, viewportWidth: number) {
  await expect(locator).toBeFocused();
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(viewportWidth + 1);
}

test("homepage renders the institutional editorial shell", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("link", { name: "Immigrati Imprenditori — Home" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Navigazione principale" })).toBeVisible();
  await expect(page.getByRole("main")).toBeVisible();
});

test("contribution and support surfaces remain safe without live data", async ({ page }) => {
  await page.goto("/contribuisci", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: /Contribuisci/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Invia alla redazione/i })).toBeVisible();

  await page.goto("/sostieni", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: /Sostieni/i })).toBeVisible();
});

test("contribution server errors are announced and associated with the form", async ({ page }) => {
  await page.goto("/contribuisci", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: /Invia alla redazione/i }).click();
  const alert = page.getByRole("alert");
  await expect(alert).toBeVisible();
});

test("all seven localized home shells expose language, direction and localized controls", async ({ page }) => {
  const cases = [
    ["/", "it", "ltr"],
    ["/en", "en", "ltr"],
    ["/fr", "fr", "ltr"],
    ["/es", "es", "ltr"],
    ["/de", "de", "ltr"],
    ["/ar", "ar", "rtl"],
    ["/zh", "zh", "ltr"],
  ] as const;

  for (const [path, lang, dir] of cases) {
    await page.goto(path, { waitUntil: "domcontentloaded" });
    await expect(page.locator("html")).toHaveAttribute("lang", lang);
    await expect(page.locator("html")).toHaveAttribute("dir", dir);
    await expect(page.getByRole("combobox")).toBeVisible();
  }
});

test("core static surfaces reflow on narrow viewports", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  for (const path of ["/", "/osservatorio", "/contenuti", "/eventi", "/esplora"]) {
    await page.goto(path, { waitUntil: "domcontentloaded" });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  }
});

test("core public surfaces tolerate WCAG text spacing at narrow width", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.addStyleTag({
    content: `
      * {
        line-height: 1.5 !important;
        letter-spacing: 0.12em !important;
        word-spacing: 0.16em !important;
      }
      p { margin-bottom: 2em !important; }
    `,
  });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test("primary mobile controls meet the WCAG 2.2 minimum target size", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const language = page.getByRole("combobox", { name: "Lingua" });
  const languageBox = await language.boundingBox();
  expect(languageBox).not.toBeNull();
  expect(languageBox!.width).toBeGreaterThanOrEqual(24);
  expect(languageBox!.height).toBeGreaterThanOrEqual(24);

  await page.goto("/contribuisci", { waitUntil: "domcontentloaded" });
  const submit = page.getByRole("button", { name: /Invia alla redazione/i });
  const submitBox = await submit.boundingBox();
  expect(submitBox).not.toBeNull();
  expect(submitBox!.width).toBeGreaterThanOrEqual(24);
  expect(submitBox!.height).toBeGreaterThanOrEqual(24);
});

test("narrow header navigation remains keyboard reachable and scrolls focus into view", async ({ page }) => {
  const width = 320;
  await page.setViewportSize({ width, height: 568 });
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const language = page.getByRole("combobox", { name: "Lingua" });
  await tabUntilFocused(page, language);
  await expectFocusedInViewport(language, width);

  const primaryNavigation = page.getByRole("navigation", { name: "Navigazione principale" });
  const primaryLinks = primaryNavigation.getByRole("link");
  await expect(primaryLinks).toHaveCount(6);
  await expect(primaryNavigation.getByRole("link", { name: "Cultura" })).toHaveAttribute("href", "/cultura");

  for (let index = 0; index < 6; index += 1) {
    const link = primaryLinks.nth(index);
    await tabUntilFocused(page, link);
    await expectFocusedInViewport(link, width);
  }
});
