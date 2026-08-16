import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

export async function loginViaUi(page: Page, email: string, password: string) {
  await page.goto("/accedi");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Accedi" }).click();
  await expect(page).toHaveURL(/\/app/, { timeout: 45_000 });
  await expect(page.getByText("Area riservata", { exact: true })).toBeVisible({
    timeout: 30_000,
  });
}
