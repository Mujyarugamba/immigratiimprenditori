import { expect, test } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { loginViaUi } from "./helpers/auth";
import {
  cleanupBusinesses,
  cleanupUsers,
  createConfirmedUser,
  loadStatusEnv,
  provisionActiveAccount,
  rpc,
  rpcService,
} from "./helpers/supabase";

const PASS = "P6E2E!pass9";

test.describe("Persona / Business CTX-ACT", () => {
  const users: string[] = [];
  const businesses: string[] = [];

  test.afterEach(() => {
    try {
      cleanupBusinesses(businesses.splice(0));
      cleanupUsers(users.splice(0));
    } catch {
      /* best-effort */
    }
  });

  test("profile visible; CTX without ACT cannot edit; bootstrap + ACT can edit", async ({
    page,
  }) => {
    const env = loadStatusEnv();
    const stamp = Date.now();
    const email = `p6biz-${stamp}@gmail.com`;
    const uid = await createConfirmedUser(env, email, PASS);
    users.push(uid);
    const { token } = await provisionActiveAccount(env, uid, email, PASS);

    const client = createClient(env.API_URL, env.ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const bizId = crypto.randomUUID();
    businesses.push(bizId);
    const { error: bizErr } = await client.from("businesses").insert({
      id: bizId,
      legal_name: `P6 Biz ${stamp}`,
      public_name: `P6 Biz Pub ${stamp}`,
    });
    expect(bizErr).toBeFalsy();

    const { data: mem, error: memErr } = await client
      .from("business_memberships")
      .insert({
        person_id: uid,
        business_id: bizId,
        role_id: "founder",
        editorial_status: "declared",
        relation_status: "active",
      })
      .select("id")
      .single();
    expect(memErr).toBeFalsy();
    expect(mem?.id).toBeTruthy();

    const actBefore = await rpc(env, token, "access_can_act_for_business", {
      p_business_id: bizId,
    });
    expect(actBefore).toBe(false);

    // RLS deny often returns success with 0 rows (no error).
    const { data: noEditRows } = await client
      .from("businesses")
      .update({ summary: "should-fail" })
      .eq("id", bizId)
      .select("id");
    expect(noEditRows?.length ?? 0).toBe(0);

    let bootstrapDenied = false;
    try {
      await rpc(env, token, "access_bootstrap_business_grant", {
        p_membership_id: mem!.id,
      });
    } catch {
      bootstrapDenied = true;
    }
    expect(bootstrapDenied).toBe(true);

    await rpcService(env, "access_bootstrap_business_grant", {
      p_membership_id: mem!.id,
    });
    const actAfter = await rpc(env, token, "access_can_act_for_business", {
      p_business_id: bizId,
    });
    expect(actAfter).toBe(true);

    const { data: edited, error: editErr } = await client
      .from("businesses")
      .update({ summary: "edited-with-act" })
      .eq("id", bizId)
      .select("summary");
    expect(editErr).toBeFalsy();
    expect(edited?.[0]?.summary).toBe("edited-with-act");

    await loginViaUi(page, email, PASS);

    await page.goto("/app/profilo");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    await page.goto(`/app/imprese/${bizId}`);
    await expect(
      page.getByRole("heading", { name: /P6 Biz/i }),
    ).toBeVisible();
    await expect(page.getByText("edited-with-act").first()).toBeVisible();

    await page.goto("/app/imprese");
    await expect(
      page.getByRole("link", { name: /P6 Biz/i }).first(),
    ).toBeVisible();
  });
});
