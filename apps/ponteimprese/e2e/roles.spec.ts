import { expect, test } from "@playwright/test";
import { loginViaUi } from "./helpers/auth";
import {
  cleanupUsers,
  createConfirmedUser,
  loadStatusEnv,
  provisionActiveAccount,
  rpc,
  rpcService,
} from "./helpers/supabase";

const PASS = "P6E2E!pass9";

test.describe("Red / Adm / negative authorization", () => {
  const created: string[] = [];

  test.afterEach(() => {
    try {
      cleanupUsers(created.splice(0));
    } catch {
      /* best-effort */
    }
  });

  test("ordinary denied Red and Adm", async ({ page }) => {
    const env = loadStatusEnv();
    const stamp = Date.now();
    const email = `p6ord-${stamp}@gmail.com`;
    const uid = await createConfirmedUser(env, email, PASS);
    created.push(uid);
    await provisionActiveAccount(env, uid, email, PASS);

    await loginViaUi(page, email, PASS);

    await expect(page.getByRole("link", { name: "Redazione" })).toHaveCount(0);
    await expect(
      page.getByRole("link", { name: "Amministrazione" }),
    ).toHaveCount(0);

    await page.goto("/app/redazione");
    await expect(page).toHaveURL(/\/app\/forbidden/);
    await page.goto("/app/amministrazione");
    await expect(page).toHaveURL(/\/app\/forbidden/);
  });

  test("Red-only can access redazione, Adm denied", async ({ page }) => {
    const env = loadStatusEnv();
    const stamp = Date.now();
    const email = `p6red-${stamp}@gmail.com`;
    const uid = await createConfirmedUser(env, email, PASS);
    created.push(uid);
    const { accountId } = await provisionActiveAccount(env, uid, email, PASS);
    await rpcService(env, "assign_application_role", {
      p_account_id: accountId,
      p_role_code: "redattore",
    });

    await loginViaUi(page, email, PASS);

    await page.goto("/app/redazione");
    await expect(
      page.getByRole("heading", { name: /Dashboard Redazione/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Contenuti" }).first(),
    ).toBeVisible();

    await page.goto("/app/amministrazione");
    await expect(page).toHaveURL(/\/app\/forbidden/);
  });

  test("Adm-only can access amministrazione, Red denied", async ({ page }) => {
    const env = loadStatusEnv();
    const stamp = Date.now();
    const email = `p6adm-${stamp}@gmail.com`;
    const uid = await createConfirmedUser(env, email, PASS);
    created.push(uid);
    const { accountId } = await provisionActiveAccount(env, uid, email, PASS);
    await rpcService(env, "assign_application_role", {
      p_account_id: accountId,
      p_role_code: "amministratore_applicativo",
    });

    await loginViaUi(page, email, PASS);

    await page.goto("/app/amministrazione");
    await expect(
      page.getByRole("heading", { name: /Dashboard Amministrazione/i }),
    ).toBeVisible();

    await page.goto("/app/redazione");
    await expect(page).toHaveURL(/\/app\/forbidden/);
  });

  test("Red+Adm sees both workspaces", async ({ page }) => {
    const env = loadStatusEnv();
    const stamp = Date.now();
    const email = `p6both-${stamp}@gmail.com`;
    const uid = await createConfirmedUser(env, email, PASS);
    created.push(uid);
    const { accountId } = await provisionActiveAccount(env, uid, email, PASS);
    await rpcService(env, "assign_application_role", {
      p_account_id: accountId,
      p_role_code: "redattore",
    });
    await rpcService(env, "assign_application_role", {
      p_account_id: accountId,
      p_role_code: "amministratore_applicativo",
    });

    await loginViaUi(page, email, PASS);

    await expect(page.getByRole("link", { name: "Redazione" })).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Amministrazione" }),
    ).toBeVisible();

    await page.goto("/app/redazione");
    await expect(
      page.getByRole("heading", { name: /Dashboard Redazione/i }),
    ).toBeVisible();
    await page.goto("/app/amministrazione");
    await expect(
      page.getByRole("heading", { name: /Dashboard Amministrazione/i }),
    ).toBeVisible();
  });

  test("self-elevate denied via RPC for Adm", async () => {
    const env = loadStatusEnv();
    const stamp = Date.now();
    const email = `p6self-${stamp}@gmail.com`;
    const uid = await createConfirmedUser(env, email, PASS);
    created.push(uid);
    const { token, accountId } = await provisionActiveAccount(
      env,
      uid,
      email,
      PASS,
    );
    await rpcService(env, "assign_application_role", {
      p_account_id: accountId,
      p_role_code: "amministratore_applicativo",
    });

    let denied = false;
    try {
      await rpc(env, token, "assign_application_role", {
        p_account_id: accountId,
        p_role_code: "redattore",
      });
    } catch {
      denied = true;
    }
    expect(denied).toBe(true);
  });
});
