import { createHmac } from "node:crypto";
import { expect, test, type Page } from "@playwright/test";
import { loginViaUi } from "./helpers/auth";
import {
  cleanupContents,
  cleanupInboxItems,
  cleanupUsers,
  createConfirmedUser,
  loadStatusEnv,
  provisionActiveAccount,
  rpc,
  rpcService,
} from "./helpers/supabase";

const PASS = "P6E2E!pass9";
const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function decodeBase32(value: string): Buffer {
  let bits = "";
  for (const raw of value.replace(/=+$/g, "").toUpperCase()) {
    const index = BASE32_ALPHABET.indexOf(raw);
    if (index < 0) throw new Error(`Invalid base32 TOTP secret character: ${raw}`);
    bits += index.toString(2).padStart(5, "0");
  }

  const bytes: number[] = [];
  for (let offset = 0; offset + 8 <= bits.length; offset += 8) {
    bytes.push(Number.parseInt(bits.slice(offset, offset + 8), 2));
  }
  return Buffer.from(bytes);
}

function totpCode(secret: string, now = Date.now()): string {
  const counter = BigInt(Math.floor(now / 1000 / 30));
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigUInt64BE(counter);

  const digest = createHmac("sha1", decodeBase32(secret)).update(counterBuffer).digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const binary =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);

  return String(binary % 1_000_000).padStart(6, "0");
}

async function waitForEditorialMfaRedirect(page: Page, timeout: number) {
  await page.waitForURL(
    (url) =>
      url.pathname === "/app/mfa" && url.searchParams.get("next") === "/app/redazione",
    { timeout },
  );
}

test.describe("Authenticated editorial UI", () => {
  const users: string[] = [];
  const contents: string[] = [];
  const inboxItems: string[] = [];

  test.afterEach(() => {
    try {
      cleanupInboxItems(inboxItems.splice(0));
      cleanupContents(contents.splice(0));
      cleanupUsers(users.splice(0));
    } catch {
      /* best-effort cleanup; the local stack is discarded after CI */
    }
  });

  test("contributor can log in, see own proposal, and cannot enter redazione", async ({
    page,
  }) => {
    const env = loadStatusEnv();
    const stamp = Date.now();
    const email = `p6contrib-${stamp}@example.invalid`;
    const uid = await createConfirmedUser(env, email, PASS);
    users.push(uid);

    const { token, accountId } = await provisionActiveAccount(env, uid, email, PASS);
    await rpcService(env, "assign_application_role", {
      p_account_id: accountId,
      p_role_code: "contributore",
    });

    const title = `P6 E2E Proposal ${stamp}`;
    const inboxId = await rpc(env, token, "submit_editorial_contribution", {
      p_submission_kind: "story",
      p_submitter_name: "P6 Contributor",
      p_submitter_email: email,
      p_contribution_text:
        "Proposta E2E locale ed effimera per verificare login, RLS e separazione dei ruoli.",
      p_title: title,
      p_submitter_phone: null,
      p_organization_name: null,
      p_origin_country_code: "IT",
      p_destination_country_code: "FR",
      p_original_url: null,
      p_consent_contact: true,
      p_consent_publication: false,
      p_origin_country_label: "Italia",
      p_destination_country_label: "Francia",
    });
    expect(typeof inboxId).toBe("string");
    inboxItems.push(inboxId as string);

    await loginViaUi(page, email, PASS, "/app/contributore");
    await expect(page.getByRole("heading", { name: "Spazio contributore" })).toBeVisible();
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
    await expect(page.getByText("Ricevuta", { exact: true })).toBeVisible();

    await page.goto("/app/redazione");
    await expect(page).toHaveURL(/\/accedi\?error=role/, { timeout: 30_000 });
    await expect(page.getByRole("heading", { name: "Accesso redazione" })).toBeVisible();
    await expect(
      page.getByRole("alert").filter({
        hasText: "Questo account non dispone del ruolo richiesto per questa area.",
      }),
    ).toBeVisible();
  });

  test("editor must complete TOTP MFA before creating and publishing content", async ({ page }) => {
    const env = loadStatusEnv();
    const stamp = Date.now();
    const email = `p6editor-${stamp}@example.invalid`;
    const uid = await createConfirmedUser(env, email, PASS);
    users.push(uid);

    const { accountId } = await provisionActiveAccount(env, uid, email, PASS);
    await rpcService(env, "assign_application_role", {
      p_account_id: accountId,
      p_role_code: "redattore",
    });

    await page.goto("/accedi?next=%2Fapp%2Fredazione");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(PASS);
    await page.getByRole("button", { name: "Accedi" }).click();

    await waitForEditorialMfaRedirect(page, 45_000);
    await expect(page.getByRole("heading", { name: "Verifica in due passaggi" })).toBeVisible();

    // Server-side guard: a direct redazione request at AAL1 must return to MFA,
    // not expose the privileged area and not misclassify the assigned role.
    await page.goto("/app/redazione");
    await waitForEditorialMfaRedirect(page, 30_000);

    await page.getByRole("button", { name: "Aggiungi autenticatore" }).click();
    const secret = (await page.locator("code").textContent())?.trim() ?? "";
    expect(secret.length).toBeGreaterThan(10);

    await page.locator("#mfa-enroll-code").fill(totpCode(secret));
    await page.getByRole("button", { name: "Verifica e attiva" }).click();
    await expect(page).toHaveURL(/\/app\/redazione$/, { timeout: 45_000 });

    await page.goto("/app/redazione/contenuti/nuovo");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    const title = `P6 E2E Content ${stamp}`;
    await page.locator('select[name="type_code"]').selectOption({ index: 1 });
    await page.getByRole("textbox", { name: "Titolo", exact: true }).fill(title);
    await page.locator("#body").fill("Corpo editoriale E2E P6 con pubblicazione verificata dal browser dopo MFA AAL2.");
    await page.getByRole("button", { name: "Crea contenuto" }).click();
    await page.waitForURL(/\/app\/redazione\/contenuti\/[0-9a-f-]{36}/i, {
      timeout: 45_000,
    });

    const url = page.url();
    const match = url.match(/contenuti\/([0-9a-f-]{36})/i);
    expect(match?.[1]).toBeTruthy();
    contents.push(match![1]);

    const slug = await page.locator('input[name="slug"]').inputValue();
    expect(slug).toBeTruthy();

    await page.locator('select[name="editorial_status"]').selectOption("ready");
    await page.getByRole("button", { name: "Salva modifiche" }).click();
    await expect(
      page.getByRole("status").filter({ hasText: "Contenuto aggiornato." }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Pubblica", exact: true }).click();
    await expect(
      page.getByRole("status").filter({ hasText: "Contenuto pubblicato." }),
    ).toBeVisible({ timeout: 30_000 });

    await page.goto(`/contenuti/${slug}`);
    await expect(page.getByRole("heading", { name: title })).toBeVisible({
      timeout: 30_000,
    });
  });

  test("repeated invalid password attempts are blocked before Auth", async ({ page }) => {
    const email = `p6-login-limit-${Date.now()}@example.invalid`;

    // Netlify supplies this header in production. Setting it explicitly here
    // makes the local browser exercise the same email+IP bucket deterministically.
    await page.setExtraHTTPHeaders({
      "x-nf-client-connection-ip": "203.0.113.42",
    });

    for (let attempt = 1; attempt <= 8; attempt += 1) {
      await page.goto("/accedi");
      await page.getByLabel("Email").fill(email);
      await page.getByLabel("Password").fill(`wrong-${attempt}`);
      await page.getByRole("button", { name: "Accedi" }).click();
      await expect(page).toHaveURL(/\/accedi\?error=credentials/, { timeout: 30_000 });
    }

    await page.goto("/accedi");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill("wrong-9");
    await page.getByRole("button", { name: "Accedi" }).click();

    await expect(page).toHaveURL(/\/accedi\?error=rate/, { timeout: 30_000 });
    await expect(
      page.getByRole("alert").filter({
        hasText: "Troppi tentativi di accesso. Riprova più tardi.",
      }),
    ).toBeVisible();
  });
});
