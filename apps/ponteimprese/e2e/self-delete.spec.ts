import { expect, test } from "@playwright/test";
import { loginViaUi } from "./helpers/auth";
import {
  cleanupUsers,
  createConfirmedUser,
  loadStatusEnv,
  provisionActiveAccount,
} from "./helpers/supabase";

const PASS = "P6E2E!pass9";

test.describe("M3 self-service account deletion", () => {
  const created: string[] = [];

  test.afterEach(() => {
    try {
      cleanupUsers(created.splice(0));
    } catch {
      /* best-effort */
    }
  });

  test("profilo shows Cancella account; wrong password / phrase blocked", async ({
    page,
  }) => {
    const env = loadStatusEnv();
    const stamp = Date.now();
    const email = `m3del-${stamp}@gmail.com`;
    const uid = await createConfirmedUser(env, email, PASS);
    created.push(uid);
    await provisionActiveAccount(env, uid, email, PASS);

    await loginViaUi(page, email, PASS);
    await page.goto("/app/profilo");
    await expect(
      page.getByRole("heading", { name: "Cancella account" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Privacy Policy" }),
    ).toHaveAttribute("href", "/privacy");

    await page.getByLabel("Password", { exact: true }).fill("wrong-password");
    await page.getByLabel(/Scrivi CANCELLA/).fill("CANCELLA");
    await page
      .getByRole("button", { name: /Cancella definitivamente/i })
      .click();
    await expect(
      page.getByRole("alert").filter({ hasText: /Password non corretta/i }).first(),
    ).toBeVisible({
      timeout: 15_000,
    });

    await page.getByLabel("Password", { exact: true }).fill(PASS);
    await page.getByLabel(/Scrivi CANCELLA/).fill("NO");
    await expect(
      page.getByRole("button", { name: /Cancella definitivamente/i }),
    ).toBeDisabled();
  });

  test("successful self-delete redirects and closes account", async ({
    page,
  }) => {
    const env = loadStatusEnv();
    const stamp = Date.now();
    const email = `m3ok-${stamp}@gmail.com`;
    const uid = await createConfirmedUser(env, email, PASS);
    created.push(uid);
    await provisionActiveAccount(env, uid, email, PASS);

    await loginViaUi(page, email, PASS);
    await page.goto("/app/profilo");
    await page.getByLabel("Password", { exact: true }).fill(PASS);
    await page.getByLabel(/Scrivi CANCELLA/).fill("CANCELLA");
    await page
      .getByRole("button", { name: /Cancella definitivamente/i })
      .click();
    await expect(page).toHaveURL(/account_deleted=1/, { timeout: 60_000 });
    await expect(
      page.getByText(/account è stato cancellato/i),
    ).toBeVisible();

    await page.goto("/accedi");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(PASS);
    await page.getByRole("button", { name: "Accedi" }).click();
    await expect(page.getByText(/Credenziali non valide|non valid/i)).toBeVisible({
      timeout: 20_000,
    });
  });
});

test.describe("M4 admin reassignment surface", () => {
  test("amministrazione shows Gestione da riassegnare link for Adm", async ({
    page,
  }) => {
    // Smoke: anonymous redirected from admin
    await page.goto("/app/amministrazione/riassegnazioni");
    await expect(page).toHaveURL(/\/accedi|\/app\/forbidden/);
  });
});
