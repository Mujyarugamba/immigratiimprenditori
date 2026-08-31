import { expect, test, type Locator, type Page } from "@playwright/test";

async function tabUntilFocused(page: Page, target: Locator, maxTabs = 30) {
  for (let index = 0; index < maxTabs; index += 1) {
    await page.keyboard.press("Tab");
    if (await target.evaluate((element) => element === document.activeElement)) return;
  }
  throw new Error(`Keyboard focus did not reach target within ${maxTabs} Tab presses.`);
}

async function expectFocusedInViewport(target: Locator) {
  await expect(target).toBeFocused();
  await expect
    .poll(
      () =>
        target.evaluate((element) => {
          const { top, bottom } = element.getBoundingClientRect();
          return bottom > 0 && top < window.innerHeight;
        }),
      {
        message: "focused control should be brought into the viewport by native keyboard scrolling",
        timeout: 2_000,
        intervals: [50, 100, 150, 250],
      },
    )
    .toBe(true);
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

function parseRgb(color: string): [number, number, number] {
  const match = color.match(/^rgba?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)/i);
  if (!match) throw new Error(`Unsupported computed color: ${color}`);
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function relativeLuminance([red, green, blue]: [number, number, number]) {
  const channels = [red, green, blue].map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrastRatio(foreground: string, background: string) {
  const foregroundLuminance = relativeLuminance(parseRgb(foreground));
  const backgroundLuminance = relativeLuminance(parseRgb(background));
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);
  return (lighter + 0.05) / (darker + 0.05);
}

test("core search and authentication controls are keyboard reachable", async ({ page }) => {
  await page.goto("/cerca", { waitUntil: "domcontentloaded" });

  const search = page.locator("#site-search");
  const kind = page.locator("#search-kind");
  const year = page.locator("#search-year");
  const searchSubmit = page.locator('form[method="get"] button[type="submit"]');

  for (const control of [search, kind, year, searchSubmit]) {
    await expect(control).toHaveCount(1);
    await tabUntilFocused(page, control);
    await expectFocusedInViewport(control);
  }

  await page.goto("/accedi", { waitUntil: "domcontentloaded" });

  const email = page.locator("#email");
  const password = page.locator("#password");
  const loginSubmit = page.locator('#login-form button[type="submit"]');

  for (const control of [email, password, loginSubmit]) {
    await expect(control).toHaveCount(1);
    await tabUntilFocused(page, control);
    await expectFocusedInViewport(control);
  }

  const loginColors = await loginSubmit.evaluate((element) => {
    const styles = getComputedStyle(element);
    return { foreground: styles.color, background: styles.backgroundColor };
  });
  expect(
    contrastRatio(loginColors.foreground, loginColors.background),
    `login submit contrast ${loginColors.foreground} on ${loginColors.background} should meet WCAG AA for normal text`,
  ).toBeGreaterThanOrEqual(4.5);
});

test("contribution form remains keyboard reachable through privacy and submit", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto("/contribuisci", { waitUntil: "domcontentloaded" });

  const controls = [
    page.locator('[name="submission_kind"]'),
    page.locator('[name="contribution_text"]'),
    page.locator('[name="submitter_name"]'),
    page.locator('[name="submitter_email"]'),
    page.locator('[name="consent_contact"]'),
    page.locator('[name="consent_publication"]'),
    page.locator('#modulo-partecipazione button[type="submit"]'),
  ];

  for (const control of controls) {
    await expect(control).toHaveCount(1);
    await tabUntilFocused(page, control, 35);
    await expectFocusedInViewport(control);
  }
});

test("Arabic core surfaces keep RTL direction and reflow at 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 });

  for (const path of ["/ar", "/ar/osservatorio", "/ar/contribuisci"] as const) {
    const response = await page.goto(path, { waitUntil: "domcontentloaded" });
    expect(response?.ok(), `${path} did not return 2xx`).toBeTruthy();
    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expectNoHorizontalDocumentOverflow(page, `${path} at 320px RTL`);
  }
});
