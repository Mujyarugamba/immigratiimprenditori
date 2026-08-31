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

function workflowStatusBadge(page: Page) {
  return page
    .locator('section[aria-labelledby="interview-workflow-title"] > div')
    .first()
    .locator("span");
}

async function browserFutureLocalDateTime(page: Page, hoursAhead: number) {
  return page.evaluate((hours) => {
    const date = new Date(Date.now() + hours * 60 * 60 * 1000);
    date.setSeconds(0, 0);
    const pad = (value: number) => String(value).padStart(2, "0");
    const local = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    return {
      local,
      epochSeconds: Math.floor(new Date(local).getTime() / 1000),
    };
  }, hoursAhead);
}

function workflowSeed(contentId: string) {
  return psql(
    `COPY (SELECT workflow_status || '|' || source_origin FROM public.content_interview_workflow WHERE content_id = '${contentId}') TO STDOUT;`,
  ).trim();
}

function scheduledEpochSeconds(contentId: string) {
  const out = psql(
    `COPY (SELECT floor(extract(epoch from scheduled_for))::bigint FROM public.content_interview_workflow WHERE content_id = '${contentId}') TO STDOUT;`,
  ).trim();
  return Number(out);
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

    await expect
      .poll(() => workflowSeed(contentId), { timeout: 30_000 })
      .toBe("candidate|editorial");
    await expect(page.getByRole("heading", { name: "Workflow e consensi" })).toBeVisible();
    await expect(workflowStatusBadge(page)).toHaveText("Candidato");

    const lockedType = page.locator('select[name="type_code"]');
    await expect(lockedType).toBeDisabled();
    await expect(
      page.getByText(
        "Il tipo Intervista resta bloccato per preservare workflow, consensi e audit già associati.",
      ),
    ).toBeVisible();

    // The disabled select is paired with a hidden type_code so ordinary edits
    // remain possible without detaching the workflow.
    await page.getByLabel("Sottotitolo").fill("Modifica consentita con tipo Intervista bloccato");
    await page.getByRole("button", { name: "Salva modifiche" }).click();
    await expect(
      page.getByRole("status").filter({ hasText: "Contenuto aggiornato." }),
    ).toBeVisible({ timeout: 30_000 });
    await expect(lockedType).toBeDisabled();
    expect(workflowSeed(contentId)).toBe("candidate|editorial");

    await page.getByRole("button", { name: "Registra contatto effettuato" }).click();
    await expect(
      page.getByRole("status").filter({
        hasText: "Contatto registrato. Nessun messaggio è stato inviato dal sistema.",
      }),
    ).toBeVisible({ timeout: 30_000 });
    await expect(workflowStatusBadge(page)).toHaveText("Contattato");

    const firstSchedule = await browserFutureLocalDateTime(page, 2);
    await page.getByLabel("Data e ora concordate").fill(firstSchedule.local);
    await page.getByRole("button", { name: "Registra programmazione" }).click();
    await expect(
      page.getByRole("status").filter({ hasText: "Intervista programmata." }),
    ).toBeVisible({ timeout: 30_000 });
    await expect(workflowStatusBadge(page)).toHaveText("Programmato");
    await expect
      .poll(() => scheduledEpochSeconds(contentId), { timeout: 30_000 })
      .toBe(firstSchedule.epochSeconds);

    const secondSchedule = await browserFutureLocalDateTime(page, 4);
    await page.getByLabel("Data e ora concordate").fill(secondSchedule.local);
    await page.getByRole("button", { name: "Ripianifica" }).click();
    await expect
      .poll(() => scheduledEpochSeconds(contentId), { timeout: 30_000 })
      .toBe(secondSchedule.epochSeconds);
    expect(secondSchedule.epochSeconds).toBeGreaterThan(firstSchedule.epochSeconds);
    await expect(workflowStatusBadge(page)).toHaveText("Programmato");

    await saveConsent(page, "Pubblicazione");
    await expect(page.getByLabel("Pubblicazione")).toHaveValue("granted");

    await saveConsent(page, "Citazioni");
    await expect(page.getByLabel("Citazioni")).toHaveValue("granted");

    await page.getByRole("button", { name: "Registra intervista svolta" }).click();
    await expect(
      page.getByRole("status").filter({ hasText: "Intervista registrata come svolta." }),
    ).toBeVisible({ timeout: 30_000 });
    await expect(workflowStatusBadge(page)).toHaveText("Intervistato");

    await page.getByRole("button", { name: "Avvia fact-check" }).click();
    await expect(
      page.getByRole("status").filter({ hasText: "Fact-check avviato." }),
    ).toBeVisible({ timeout: 30_000 });
    await expect(workflowStatusBadge(page)).toHaveText("Fact-check");

    const approve = page.getByRole("button", { name: "Approva workflow intervista" });
    await expect(approve).toBeEnabled();
    await approve.click();
    await expect(
      page.getByRole("status").filter({
        hasText: "Workflow intervista approvato. La pubblicazione del contenuto resta separata.",
      }),
    ).toBeVisible({ timeout: 30_000 });
    await expect(workflowStatusBadge(page)).toHaveText("Approvato");

    await expect(page.getByText("unpublished · private", { exact: true })).toBeVisible();

    await page.goto("/app/redazione/contenuti/nuovo");
    await expect(page.getByRole("heading", { name: "Nuovo contenuto editoriale" })).toBeVisible({
      timeout: 30_000,
    });

    const createType = page.locator('select[name="type_code"]');
    const nonInterviewType = await createType.locator("option").evaluateAll((options) =>
      options
        .map((option) => (option as HTMLOptionElement).value)
        .find((value) => value && value !== "interview") ?? "",
    );
    expect(nonInterviewType).not.toBe("");
    await createType.selectOption(nonInterviewType);

    const conversionTitle = `P6 Interview Conversion ${stamp}`;
    await page.getByRole("textbox", { name: "Titolo", exact: true }).fill(conversionTitle);
    await page
      .locator("#body")
      .fill("Contenuto E2E locale creato con un tipo diverso e poi convertito in intervista.");
    await page.getByRole("button", { name: "Crea contenuto" }).click();
    await page.waitForURL(/\/app\/redazione\/contenuti\/[0-9a-f-]{36}/i, {
      timeout: 45_000,
    });

    const convertedMatch = page.url().match(/contenuti\/([0-9a-f-]{36})/i);
    expect(convertedMatch?.[1]).toBeTruthy();
    const convertedId = convertedMatch![1];
    contents.push(convertedId);

    expect(workflowSeed(convertedId)).toBe("");
    await expect(page.getByRole("heading", { name: "Workflow e consensi" })).toHaveCount(0);

    await page.locator('select[name="type_code"]').selectOption("interview");
    await page.getByRole("button", { name: "Salva modifiche" }).click();
    await expect(
      page.getByRole("status").filter({ hasText: "Contenuto aggiornato." }),
    ).toBeVisible({ timeout: 30_000 });
    await expect
      .poll(() => workflowSeed(convertedId), { timeout: 30_000 })
      .toBe("candidate|editorial");
    await expect(page.getByRole("heading", { name: "Workflow e consensi" })).toBeVisible({
      timeout: 30_000,
    });
    await expect(workflowStatusBadge(page)).toHaveText("Candidato");
    await expect(page.locator('select[name="type_code"]')).toBeDisabled();
  });
});
