import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

export async function loginViaUi(
  page: Page,
  email: string,
  password: string,
  next = "/app/redazione",
) {
  await page.goto(`/accedi?next=${encodeURIComponent(next)}`);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Accedi" }).click();
  await expect(page).toHaveURL(new RegExp(next.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), {
    timeout: 45_000,
  });
}
