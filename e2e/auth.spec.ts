import { expect, test } from "@playwright/test";
import { loginViaUi } from "./helpers/auth";
import {
  cleanupUsers,
  createConfirmedUser,
  loadStatusEnv,
  provisionActiveAccount,
} from "./helpers/supabase";

const PASS = "P6E2E!pass9";

test.describe("auth + onboarding", () => {
  const created: string[] = [];

  test.afterEach(() => {
    try {
      cleanupUsers(created.splice(0));
    } catch {
      /* best-effort */
    }
  });

  test("anonymous visitor can open home and auth pages", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.goto("/accedi");
    await expect(page.getByLabel("Email")).toBeVisible();
    await page.goto("/registrati");
    await expect(page.getByLabel("Email")).toBeVisible();
  });

  test("private /app redirects unauthenticated users to login", async ({
    page,
  }) => {
    await page.goto("/app");
    await expect(page).toHaveURL(/\/accedi/);
  });

  test("login, session restore, logout", async ({ page }) => {
    const env = loadStatusEnv();
    const stamp = Date.now();
    const email = `p6auth-${stamp}@gmail.com`;
    const uid = await createConfirmedUser(env, email, PASS);
    created.push(uid);
    await provisionActiveAccount(env, uid, email, PASS);

    await loginViaUi(page, email, PASS);

    await page.reload();
    await expect(page).toHaveURL(/\/app/);
    await expect(page.getByText("Area riservata")).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: "Area riservata" }),
    ).toBeVisible();
    await expect(
      page
        .getByRole("navigation", { name: "Area riservata" })
        .getByRole("link", { name: "Completa il profilo" }),
    ).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
    await expect(page.getByText(/Panoramica del tuo spazio personale/)).toBeVisible();
    await expect(page.getByText(/\(CTX\)|\(ACT\)|access_current_person_id/)).toHaveCount(
      0,
    );

    await page.goto("/app/onboarding");
    await expect(page).toHaveURL(/\/app\/?$/, { timeout: 30_000 });

    await page.goto("/app/profilo");
    await expect(page.getByRole("heading", { name: "Il mio profilo" })).toBeVisible();
    await expect(page.getByText(/access_current_person_id|Persona id/)).toHaveCount(
      0,
    );

    await page.getByRole("button", { name: "Esci" }).click();
    await page.goto("/app");
    await expect(page).toHaveURL(/\/accedi/);
  });

  test("registered account without persona can reach app shell", async ({
    page,
  }) => {
    const env = loadStatusEnv();
    const stamp = Date.now();
    const email = `p6reg-${stamp}@gmail.com`;
    const uid = await createConfirmedUser(env, email, PASS);
    created.push(uid);
    await rpcProvisionOnly(env, uid);

    await page.goto("/accedi");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(PASS);
    await page.getByRole("button", { name: "Accedi" }).click();
    await expect(page).toHaveURL(/\/app/, { timeout: 45_000 });
    await expect(
      page
        .getByRole("navigation", { name: "Area riservata" })
        .getByRole("link", { name: "Completa il profilo" }),
    ).toBeVisible();
    await page
      .getByRole("navigation", { name: "Area riservata" })
      .getByRole("link", { name: "Completa il profilo" })
      .click();
    await expect(page).toHaveURL(/\/app\/onboarding/);
    await expect(
      page.getByRole("heading", { name: "Completa il profilo" }),
    ).toBeVisible();
  });
});

async function rpcProvisionOnly(
  env: ReturnType<typeof loadStatusEnv>,
  uid: string,
) {
  const res = await fetch(`${env.API_URL}/rest/v1/rpc/access_provision_account`, {
    method: "POST",
    headers: {
      apikey: env.SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ p_auth_user_id: uid }),
  });
  if (!res.ok) throw new Error(`provision: ${await res.text()}`);
}
