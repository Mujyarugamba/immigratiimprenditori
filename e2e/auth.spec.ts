import { expect, test } from "@playwright/test";
import { loginViaUi } from "./helpers/auth";
import {
  cleanupUsers,
  createConfirmedUser,
  loadStatusEnv,
  provisionActiveAccount,
  psql,
} from "./helpers/supabase";
import { TERMS_OF_USE_VERSION } from "../src/lib/legal/versions";

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

  test("signup requires Terms checkbox; Privacy is informational", async ({
    page,
  }) => {
    await page.goto("/registrati");
    await expect(
      page.getByRole("link", { name: "Termini d’Uso" }),
    ).toHaveAttribute("href", "/termini");
    await expect(
      page.getByRole("link", { name: "Privacy Policy" }),
    ).toHaveAttribute("href", "/privacy");
    const checkbox = page.getByRole("checkbox", {
      name: /Accetto i Termini d’Uso/i,
    });
    await expect(checkbox).toBeVisible();
    await expect(checkbox).not.toBeChecked();

    const stamp = Date.now();
    const email = `m1signup-${stamp}@gmail.com`;
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(PASS);
    await page.getByRole("button", { name: "Crea account" }).click();
    await expect(
      page.getByText("Per creare l’account devi accettare i Termini d’Uso."),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/registrati/);

    await page.goto("/termini");
    await expect(
      page.getByRole("heading", { name: /Termini/i }).first(),
    ).toBeVisible();
    await page.goto("/privacy");
    await expect(
      page.getByRole("heading", { name: /Privacy/i }).first(),
    ).toBeVisible();
  });

  test("signup with Terms creates acceptance ledger row", async ({ page }) => {
    const env = loadStatusEnv();
    const stamp = Date.now();
    const email = `m1ok-${stamp}@gmail.com`;

    await page.goto("/registrati");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(PASS);
    await page.getByRole("checkbox", { name: /Accetto i Termini d’Uso/i }).check();
    await page.getByRole("button", { name: "Crea account" }).click();

    // Local Auth often returns a session immediately; otherwise email-confirm message.
    const onboarding = page.waitForURL(/\/app\/onboarding/, { timeout: 45_000 });
    const confirmMsg = page.getByText(/Controlla la email/i);
    await Promise.race([
      onboarding.then(() => "session" as const),
      confirmMsg.waitFor({ state: "visible", timeout: 45_000 }).then(() => "email" as const),
    ]);

    const uidMatch = psql(
      `select id::text from auth.users where email='${email}' limit 1`,
    ).match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
    expect(uidMatch?.[0]).toBeTruthy();
    const uid = uidMatch![0];
    created.push(uid);

    // If email confirm path: confirm + login to finish ledger write.
    const hasSessionPath = page.url().includes("/app");
    if (!hasSessionPath) {
      // Admin-confirm then login (local).
      await fetch(`${env.API_URL}/auth/v1/admin/users/${uid}`, {
        method: "PUT",
        headers: {
          apikey: env.SERVICE_ROLE_KEY,
          Authorization: `Bearer ${env.SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email_confirm: true }),
      });
      await page.goto("/accedi");
      await page.getByLabel("Email").fill(email);
      await page.getByLabel("Password").fill(PASS);
      await page.getByRole("button", { name: "Accedi" }).click();
      await expect(page).toHaveURL(/\/app/, { timeout: 45_000 });
    }

    const row = psql(
      `select document_kind || '|' || document_version || '|' || acceptance_channel || '|' || (accepted_at is not null)::text
       from public.terms_acceptances ta
       join public.accounts a on a.id = ta.account_id
       where a.auth_user_id = '${uid}'::uuid`,
    );
    expect(row).toContain(
      `terms_of_use|${TERMS_OF_USE_VERSION}|signup|t`,
    );
    const privacyCols = psql(
      `select count(*)::text from information_schema.columns
       where table_name='terms_acceptances' and column_name ilike '%privacy%'`,
    );
    expect(privacyCols).toMatch(/\b0\b/);
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
