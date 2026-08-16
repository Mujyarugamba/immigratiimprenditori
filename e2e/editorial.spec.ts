import { expect, test } from "@playwright/test";
import { loginViaUi } from "./helpers/auth";
import {
  cleanupContents,
  cleanupUsers,
  createConfirmedUser,
  loadStatusEnv,
  provisionActiveAccount,
  rpcService,
} from "./helpers/supabase";

const PASS = "P6E2E!pass9";

test.describe("Red editorial UI", () => {
  const users: string[] = [];
  const contents: string[] = [];

  test.afterEach(() => {
    try {
      cleanupContents(contents.splice(0));
      cleanupUsers(users.splice(0));
    } catch {
      /* best-effort */
    }
  });

  test("Red can open contenuti and create draft", async ({ page }) => {
    const env = loadStatusEnv();
    const stamp = Date.now();
    const email = `p6ed-${stamp}@gmail.com`;
    const uid = await createConfirmedUser(env, email, PASS);
    users.push(uid);
    const { accountId } = await provisionActiveAccount(env, uid, email, PASS);
    await rpcService(env, "assign_application_role", {
      p_account_id: accountId,
      p_role_code: "redattore",
    });

    await loginViaUi(page, email, PASS);

    await page.goto("/app/redazione/contenuti/nuovo");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    const title = `P6 E2E Content ${stamp}`;
    await page.locator('select[name="type_code"]').selectOption({ index: 1 });
    await page.getByRole("textbox", { name: "Titolo", exact: true }).fill(title);
    await page.locator("#body").fill("Corpo editoriale E2E P6.");
    await page.getByRole("button", { name: "Crea contenuto" }).click();
    await page.waitForURL(/\/app\/redazione\/contenuti\/[0-9a-f-]{36}/i, {
      timeout: 45_000,
    });

    const url = page.url();
    const match = url.match(/contenuti\/([0-9a-f-]{36})/i);
    if (match) contents.push(match[1]);

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator('input[name="title"]')).toHaveValue(title);

    await page.goto("/app/redazione/osservatorio");
    await expect(
      page.getByRole("heading", { name: /Osservatorio/i }),
    ).toBeVisible();

    await page.goto("/app/redazione/organizzazioni");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});
