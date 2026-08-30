import { expect, test, type Locator, type Page } from "@playwright/test";

const corePublicPages = ["/", "/contribuisci", "/sostieni"] as const;

const localizedHomes = [
  ["it", "/", "ltr", "Navigazione principale", "Lingua"],
  ["en", "/en", "ltr", "Primary navigation", "Language"],
  ["fr", "/fr", "ltr", "Navigation principale", "Langue"],
  ["es", "/es", "ltr", "Navegación principal", "Idioma"],
  ["de", "/de", "ltr", "Hauptnavigation", "Sprache"],
  ["ar", "/ar", "rtl", "التنقل الرئيسي", "اللغة"],
  ["zh", "/zh", "ltr", "主导航", "语言"],
] as const;

async function tabUntilFocused(page: Page, target: Locator, maxTabs = 12) {
  for (let index = 0; index < maxTabs; index += 1) {
    await page.keyboard.press("Tab");
    if (await target.evaluate((element) => element === document.activeElement)) return;
  }
  throw new Error(`Keyboard focus did not reach target within ${maxTabs} Tab presses.`);
}

async function expectFocusedInViewport(target: Locator, viewportWidth: number) {
  await expect(target).toBeFocused();
  const box = await target.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(-1);
  expect(box!.x + box!.width).toBeLessThanOrEqual(viewportWidth + 1);
}

async function expectNoHorizontalDocumentOverflow(page: Page, label: string) {
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth, `${label} has horizontal document overflow`).toBeLessThanOrEqual(
    dimensions.clientWidth + 1,
  );
}

async function applyWcagTextSpacing(page: Page) {
  await page.addStyleTag({
    content: `
      body, body * {
        line-height: 1.5 !important;
        letter-spacing: 0.12em !important;
        word-spacing: 0.16em !important;
      }
      p { margin-bottom: 2em !important; }
    `,
  });
}

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

  await page.keyboard.press("Enter");
  await expect(page.locator("#contenuto-principale")).toBeFocused();
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

test("contribution server errors are announced and associated with the form", async ({ page }) => {
  await page.goto("/contribuisci?errore=campi", { waitUntil: "domcontentloaded" });
  const alert = page.locator("#submission-form-error");
  await expect(alert).toBeVisible();
  await expect(alert).toHaveAttribute("role", "alert");
  await expect(alert).toContainText(/Controlla i campi obbligatori/i);
  await expect(page.locator("#modulo-partecipazione")).toHaveAttribute(
    "aria-describedby",
    "submission-form-error",
  );
});

test("all seven localized home shells expose language, direction and localized controls", async ({ page }) => {
  for (const [locale, path, direction, primaryNavigation, languageLabel] of localizedHomes) {
    const response = await page.goto(path, { waitUntil: "domcontentloaded" });
    expect(response?.ok(), `${locale} home did not return 2xx`).toBeTruthy();
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await expect(page.locator("html")).toHaveAttribute("dir", direction);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("navigation", { name: primaryNavigation })).toBeVisible();
    await expect(page.getByRole("combobox", { name: languageLabel })).toBeVisible();
  }
});

test("core static surfaces reflow on narrow viewports", async ({ page }) => {
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    for (const path of corePublicPages) {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await expectNoHorizontalDocumentOverflow(page, `${path} at ${width}px`);
    }
  }
});

test("core public surfaces tolerate WCAG text spacing at narrow width", async ({ page }) => {
  const width = 320;
  await page.setViewportSize({ width, height: 844 });

  for (const path of corePublicPages) {
    await page.goto(path, { waitUntil: "domcontentloaded" });
    await applyWcagTextSpacing(page);
    await expectNoHorizontalDocumentOverflow(page, `${path} with WCAG text spacing`);

    const clippedControls = await page.locator("button, select").evaluateAll((elements) =>
      elements
        .filter((element) => {
          const rect = element.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0;
        })
        .filter(
          (element) =>
            element.scrollWidth > element.clientWidth + 1 ||
            element.scrollHeight > element.clientHeight + 1,
        )
        .map((element) => element.textContent?.trim() || element.getAttribute("aria-label") || element.tagName),
    );
    expect(clippedControls, `${path} clips button/select content under text spacing`).toEqual([]);
  }
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

  for (let index = 0; index < 6; index += 1) {
    const link = primaryLinks.nth(index);
    await tabUntilFocused(page, link);
    await expectFocusedInViewport(link, width);
  }
});
