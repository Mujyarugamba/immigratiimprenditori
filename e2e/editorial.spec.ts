import { expect, test } from "@playwright/test";
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
    await expect(page.getByRole("alert")).toContainText(
      "Questo account non dispone del ruolo richiesto per questa area.",
    );
  });

  test("editor can log in, create a ready draft, publish it, and open the public page", async ({
    page,
  }) => {
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

    await loginViaUi(page, email, PASS);

    await page.goto("/app/redazione/contenuti/nuovo");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    const title = `P6 E2E Content ${stamp}`;
    await page.locator('select[name="type_code"]').selectOption({ index: 1 });
    await page.getByRole("textbox", { name: "Titolo", exact: true }).fill(title);
    await page.locator("#body").fill("Corpo editoriale E2E P6 con pubblicazione verificata dal browser.");
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
    await expect(page.getByRole("status")).toContainText("Contenuto aggiornato.");

    await page.getByRole("button", { name: "Pubblica", exact: true }).click();
    await expect(page.getByRole("status")).toContainText("Contenuto pubblicato.", {
      timeout: 30_000,
    });

    await page.goto(`/contenuti/${slug}`);
    await expect(page.getByRole("heading", { name: title })).toBeVisible({
      timeout: 30_000,
    });
  });
});
