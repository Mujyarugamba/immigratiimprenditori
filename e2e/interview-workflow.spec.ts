import { createHmac } from "node:crypto";
import { expect, test, type Page } from "@playwright/test";
import {
  cleanupContents,
  cleanupUsers,
  createConfirmedUser,
  loadStatusEnv,
  provisionActiveAccount,
  psql,
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

async function enterEditorialWithMfa(page: Page, email: string) {
  await page.goto("/accedi?next=%2Fapp%2Fredazione");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(PASS);
  await page.getByRole("button", { name: "Accedi" }).click();

  await page.waitForURL(
    (url) =>
      url.pathname === "/app/mfa" && url.searchParams.get("next") === "/app/redazione",
    { timeout: 45_000 },
  );

  await page.getByRole("button", { name: "Aggiungi autenticatore" }).click();

  const secretCode = page.locator("code");
  const alert = page.locator('p[role="alert"]').first();
  await Promise.race([
    secretCode.waitFor({ state: "visible", timeout: 30_000 }),
    alert.waitFor({ state: "visible", timeout: 30_000 }).then(async () => {
      const message = (await alert.textContent())?.trim() || "errore MFA sconosciuto";
      throw new Error(`MFA enrollment UI error: ${message}`);
    }),
  ]);

  const secret = (await secretCode.textContent())?.trim() ?? "";
  expect(secret.length).toBeGreaterThan(10);

  await page.locator("#mfa-enroll-code").fill(totpCode(secret));
  await page.getByRole("button", { name: "Verifica e attiva" }).click();
  await expect(page).toHaveURL(/\/app\/redazione$/, { timeout: 45_000 });
  await expect(page.getByRole("heading", { name: "Scrivania redazionale" })).toBeVisible({
    timeout: 30_000,
  });
}

async function saveConsent(page: Page, label: "Pubblicazione" | "Citazioni") {
  const select = page.getByLabel(label);
  await select.selectOption("granted");
  await select.locator("xpath=ancestor::form").getByRole("button", { name: "Salva" }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "Consenso aggiornato." }),
  ).toBeVisible({ timeout: 30_000 });
}

test.describe("Interview workflow authenticated E2E", () => {
  const users: string[] = [];
  const contents: string[] = [];

  test.afterEach(() => {
    try {
      cleanupContents(contents.splice(0));
      cleanupUsers(users.splice(0));
    } catch {
      /* best-effort cleanup; the local stack is discarded after CI */
    }
  });

  test("editor completes the guarded interview workflow through the UI", async ({ page }) => {
    const env = loadStatusEnv();
    const stamp = Date.now();
    const email = `p6-interview-${stamp}@example.invalid`;
    const uid = await createConfirmedUser(env, email, PASS);
    users.push(uid);

    const { accountId } = await provisionActiveAccount(env, uid, email, PASS);
    await rpcService(env, "assign_application_role", {
      p_account_id: accountId,
      p_role_code: "redattore",
    });

    await enterEditorialWithMfa(page, email);

    await page.goto("/app/redazione/contenuti/nuovo");
    await expect(page.getByRole("heading", { name: "Nuovo contenuto editoriale" })).toBeVisible({
      timeout: 30_000,
    });

    const title = `P6 Interview Workflow ${stamp}`;
    await page.locator('select[name="type_code"]').selectOption("interview");
    await page.getByRole("textbox", { name: "Titolo", exact: true }).fill(title);
    await page
      .locator("#body")
      .fill("Intervista E2E locale ed effimera usata esclusivamente per verificare il workflow redazionale.");
    await page.getByRole("button", { name: "Crea contenuto" }).click();
    await page.waitForURL(/\/app\/redazione\/contenuti\/[0-9a-f-]{36}/i, {
      timeout: 45_000,
    });

    const match = page.url().match(/contenuti\/([0-9a-f-]{36})/i);
    expect(match?.[1]).toBeTruthy();
    const contentId = match![1];
    contents.push(contentId);

    // Generic content creation intentionally does not imply an external contact.
    // Initialize only the local workflow fixture, then exercise every subsequent
    // state mutation through the real browser/server-action path.
    psql(
      `INSERT INTO public.content_interview_workflow (content_id) VALUES ('${contentId}');`,
    );
    await page.reload();

    await expect(page.getByRole("heading", { name: "Workflow e consensi" })).toBeVisible();
    await expect(page.getByText("Candidato", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: "Registra contatto effettuato" }).click();
    await expect(
      page.getByRole("status").filter({
        hasText: "Contatto registrato. Nessun messaggio è stato inviato dal sistema.",
      }),
    ).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText("Contattato", { exact: true })).toBeVisible();

    await saveConsent(page, "Pubblicazione");
    await expect(page.getByText("Concesso", { exact: true }).first()).toBeVisible();

    await saveConsent(page, "Citazioni");
    await expect(page.getByText("Concesso", { exact: true })).toHaveCount(2);

    await page.getByRole("button", { name: "Registra intervista svolta" }).click();
    await expect(
      page.getByRole("status").filter({ hasText: "Intervista registrata come svolta." }),
    ).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText("Intervistato", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: "Avvia fact-check" }).click();
    await expect(
      page.getByRole("status").filter({ hasText: "Fact-check avviato." }),
    ).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText("Fact-check", { exact: true })).toBeVisible();

    const approve = page.getByRole("button", { name: "Approva workflow intervista" });
    await expect(approve).toBeEnabled();
    await approve.click();
    await expect(
      page.getByRole("status").filter({
        hasText: "Workflow intervista approvato. La pubblicazione del contenuto resta separata.",
      }),
    ).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText("Approvato", { exact: true })).toBeVisible();

    // Approval of the interview workflow must never publish the content itself.
    await expect(page.getByText("unpublished · private", { exact: true })).toBeVisible();
  });
});
