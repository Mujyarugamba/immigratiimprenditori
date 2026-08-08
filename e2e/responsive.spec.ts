import { expect, test } from "@playwright/test";

test.describe("responsive smoke", () => {
  test("home header and main remain usable on narrow viewport", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth + 2;
    });
    expect(overflow).toBeFalsy();
  });

  test("public list usable on tablet", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/imprese");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});
