import { expect, test } from "@playwright/test";
import { loginViaUi } from "./helpers/auth";
import {
  assertUuids,
  cleanupUsers,
  createConfirmedUser,
  loadStatusEnv,
  provisionActiveAccount,
  psql,
  rpcService,
} from "./helpers/supabase";

const PASS = "P6E2E!pass9";

function insertFixtureOpportunity(title: string): string {
  const sql = `
    INSERT INTO public.opportunities (
      title, summary, origin, substantial_status,
      editorial_status, publication_status, visibility_level
    ) VALUES (
      ${psqlLiteral(title)},
      'Fixture D1-B.2 review-only',
      'internal',
      'announced',
      'in_review',
      'unpublished',
      'private'
    )
    RETURNING id;
  `;
  const out = psql(sql);
  const match = out.match(
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i,
  );
  if (!match) throw new Error(`fixture insert failed: ${out}`);
  assertUuids([match[0]]);
  return match[0];
}

function psqlLiteral(value: string) {
  return `'${value.replace(/'/g, "''")}'`;
}

function cleanupOpportunities(ids: string[]) {
  if (!ids.length) return;
  assertUuids(ids);
  const list = ids.map((id) => `'${id}'`).join(",");
  psql(`DELETE FROM public.opportunities WHERE id IN (${list});`);
}

test.describe("Redazione opportunità (D1-B.2)", () => {
  const users: string[] = [];
  const opportunities: string[] = [];

  test.afterEach(() => {
    try {
      cleanupOpportunities(opportunities.splice(0));
      cleanupUsers(users.splice(0));
    } catch {
      /* best-effort */
    }
  });

  test("editor can open queue; ordinary denied; public excludes draft fixture", async ({
    page,
  }) => {
    const env = loadStatusEnv();
    const stamp = Date.now();
    const editorEmail = `d1b2-ed-${stamp}@gmail.com`;
    const ordinaryEmail = `d1b2-ord-${stamp}@gmail.com`;
    const fixtureTitle = `D1B2 Fixture Opp ${stamp}`;

    const editorUid = await createConfirmedUser(env, editorEmail, PASS);
    users.push(editorUid);
    const { accountId: editorAccount } = await provisionActiveAccount(
      env,
      editorUid,
      editorEmail,
      PASS,
    );
    await rpcService(env, "assign_application_role", {
      p_account_id: editorAccount,
      p_role_code: "redattore",
    });

    const ordinaryUid = await createConfirmedUser(env, ordinaryEmail, PASS);
    users.push(ordinaryUid);
    await provisionActiveAccount(env, ordinaryUid, ordinaryEmail, PASS);

    const oppId = insertFixtureOpportunity(fixtureTitle);
    opportunities.push(oppId);

    await loginViaUi(page, ordinaryEmail, PASS);
    await page.goto("/app/redazione/opportunita");
    await expect(page).toHaveURL(/\/app\/forbidden/);

    await page.getByRole("button", { name: "Esci" }).click();
    await page.goto("/accedi");
    await loginViaUi(page, editorEmail, PASS);
    await page.goto("/app/redazione/opportunita");
    await expect(page.getByRole("heading", { name: /Opportunità/i })).toBeVisible();
    await expect(page.getByText(fixtureTitle)).toBeVisible();

    await page.goto("/opportunita");
    await expect(page.getByText(fixtureTitle)).toHaveCount(0);
  });

  test("editor publish path on fixture then withdraw (not Production pilot)", async ({
    page,
  }) => {
    const env = loadStatusEnv();
    const stamp = Date.now();
    const email = `d1b3-pub-${stamp}@gmail.com`;
    const fixtureTitle = `D1B3 Publish Fixture ${stamp}`;

    const uid = await createConfirmedUser(env, email, PASS);
    users.push(uid);
    const { accountId } = await provisionActiveAccount(env, uid, email, PASS);
    await rpcService(env, "assign_application_role", {
      p_account_id: accountId,
      p_role_code: "redattore",
    });

    const oppId = insertFixtureOpportunity(fixtureTitle);
    opportunities.push(oppId);

    await loginViaUi(page, email, PASS);
    await page.goto(`/app/redazione/opportunita/${oppId}`);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      fixtureTitle,
    );

    await page.getByRole("button", { name: /Pubblica/i }).click();
    await expect(page.getByText(/pubblicat/i)).toBeVisible({ timeout: 30_000 });

    await page.goto("/opportunita");
    await expect(page.getByText(fixtureTitle)).toBeVisible();

    await page.goto(`/opportunita/${oppId}`);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      fixtureTitle,
    );

    await page.goto(`/app/redazione/opportunita/${oppId}`);
    await page.getByRole("button", { name: /Ritira/i }).click();
    await expect(page.getByText(/ritirat/i)).toBeVisible({ timeout: 30_000 });

    await page.goto("/opportunita");
    await expect(page.getByText(fixtureTitle)).toHaveCount(0);
  });

  test("editor can exclude fixture; public still hides review-only", async ({
    page,
  }) => {
    const env = loadStatusEnv();
    const stamp = Date.now();
    const email = `d1b3-rej-${stamp}@gmail.com`;
    const fixtureTitle = `D1B3 Reject Fixture ${stamp}`;

    const uid = await createConfirmedUser(env, email, PASS);
    users.push(uid);
    const { accountId } = await provisionActiveAccount(env, uid, email, PASS);
    await rpcService(env, "assign_application_role", {
      p_account_id: accountId,
      p_role_code: "redattore",
    });

    const oppId = insertFixtureOpportunity(fixtureTitle);
    opportunities.push(oppId);

    await loginViaUi(page, email, PASS);
    await page.goto(`/app/redazione/opportunita/${oppId}`);
    await page.getByRole("button", { name: /Escludi dalla coda/i }).click();
    await expect(page.getByText(/esclusa/i)).toBeVisible({ timeout: 30_000 });

    await page.goto("/app/redazione/opportunita?stato=excluded");
    await expect(page.getByText(fixtureTitle)).toBeVisible();

    await page.goto("/app/redazione/opportunita?stato=review");
    await expect(page.getByText(fixtureTitle)).toHaveCount(0);

    await page.goto("/opportunita");
    await expect(page.getByText(fixtureTitle)).toHaveCount(0);
  });
});
