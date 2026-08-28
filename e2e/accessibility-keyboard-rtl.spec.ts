import { expect, test, type Locator, type Page } from "@playwright/test";

async function tabUntilFocused(page: Page, target: Locator, maxTabs = 30) {
  for (let index = 0; index < maxTabs; index += 1) {
    await page.keyboard.press("Tab");
    if (await target.evaluate((element) => element === document.activeElement)) return;
  }
  throw new Error(`Keyboard focus did not reach target within ${maxTabs} Tab presses.`);
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

test("core search and authentication controls are keyboard reachable", async ({ page }) => {
  await page.goto("/cerca", { waitUntil: "domcontentloaded" });

  const search = page.getByLabel("Cerca nel Centro Studi", { exact: true });
  const kind = page.getByLabel("Tipo di risultato", { exact: true });
  const year = page.getByLabel("Anno", { exact: true });
  const searchSubmit = page.getByRole("button", { name: "Cerca", exact: true });

  for (const control of [search, kind, year, searchSubmit]) {
    await tabUntilFocused(page, control);
    await expect(control).toBeFocused();
  }

  await page.goto("/accedi", { waitUntil: "domcontentloaded" });

  const email = page.getByLabel("Email", { exact: true });
  const password = page.getByLabel("Password", { exact: true });
  const loginSubmit = page.getByRole("button", { name: "Accedi", exact: true });

  for (const control of [email, password, loginSubmit]) {
    await tabUntilFocused(page, control);
    await expect(control).toBeFocused();
  }
});

test("contribution form remains keyboard reachable through privacy and submit", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto("/contribuisci", { waitUntil: "domcontentloaded" });

  const controls = [
    page.getByLabel("Tipo di proposta", { exact: true }),
    page.getByLabel("Testo della proposta", { exact: true }),
    page.getByLabel("Nome e cognome", { exact: true }),
    page.getByLabel("Email", { exact: true }),
    page.locator('input[name="consent_contact"]'),
    page.locator('input[name="consent_publication"]'),
    page.getByRole("button", { name: "Invia alla redazione", exact: true }),
  ];

  for (const control of controls) {
    await tabUntilFocused(page, control, 35);
    await expect(control).toBeFocused();
    const box = await control.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.y + box!.height).toBeGreaterThanOrEqual(0);
    expect(box!.y).toBeLessThanOrEqual(568);
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
