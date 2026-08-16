import { expect, test } from "@playwright/test";
import {
  cleanupUsers,
  createConfirmedUser,
  loadStatusEnv,
  provisionActiveAccount,
  type LocalEnv,
} from "./helpers/supabase";

const PASS = "P73E2E!pass9";

async function publishPersonProfile(
  env: LocalEnv,
  token: string,
  uid: string,
  slug: string,
  displayName: string,
) {
  const res = await fetch(`${env.API_URL}/rest/v1/profiles?id=eq.${uid}`, {
    method: "PATCH",
    headers: {
      apikey: env.ANON_KEY,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      display_name: displayName,
      slug,
      bio: "Bio pubblica di test P7.3",
      city: "Milano",
      country: "Italia",
      is_public: true,
      website: "https://example.com",
    }),
  });
  if (!res.ok) {
    throw new Error(`publish profile failed: ${await res.text()}`);
  }

  // Unshared professional phone (must not appear for anon).
  const contactRes = await fetch(`${env.API_URL}/rest/v1/person_contact_channels`, {
    method: "POST",
    headers: {
      apikey: env.ANON_KEY,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify({
      person_id: uid,
      phone: "+390212345678",
      share_phone_with_network: false,
      share_contact_email_with_network: false,
    }),
  });
  if (!contactRes.ok) {
    throw new Error(`upsert contact failed: ${await contactRes.text()}`);
  }
}

async function unpublishPersonProfile(
  env: LocalEnv,
  token: string,
  uid: string,
) {
  const res = await fetch(`${env.API_URL}/rest/v1/profiles?id=eq.${uid}`, {
    method: "PATCH",
    headers: {
      apikey: env.ANON_KEY,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({ is_public: false }),
  });
  if (!res.ok) {
    throw new Error(`unpublish profile failed: ${await res.text()}`);
  }
}

test.describe("public person profiles", () => {
  const created: string[] = [];

  test.afterEach(() => {
    try {
      cleanupUsers(created.splice(0));
    } catch {
      /* best-effort */
    }
  });

  test("public slug renders person without private data", async ({ page }) => {
    const env = loadStatusEnv();
    const stamp = Date.now();
    const email = `p73pub-${stamp}@gmail.com`;
    const slug = `p73-persona-${stamp}`;
    const displayName = `Persona Pubblica ${stamp}`;
    const uid = await createConfirmedUser(env, email, PASS);
    created.push(uid);
    const { token } = await provisionActiveAccount(env, uid, email, PASS);
    await publishPersonProfile(env, token, uid, slug, displayName);

    const res = await page.goto(`/persone/${slug}`);
    expect(res?.ok()).toBeTruthy();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      displayName,
    );
    await expect(page.getByText("Bio pubblica di test P7.3")).toBeVisible();
    await expect(page.getByText("Milano")).toBeVisible();
    await expect(page.getByRole("link", { name: /example\.com/i })).toBeVisible();
    await expect(page.locator("body")).not.toContainText("+390212345678");
    await expect(page.locator("body")).not.toContainText(email);
    await expect(page.locator("body")).not.toContainText(uid);
  });

  test("private or missing slug shows not-found UX", async ({ page }) => {
    const env = loadStatusEnv();
    const stamp = Date.now();
    const email = `p73priv-${stamp}@gmail.com`;
    const slug = `p73-privata-${stamp}`;
    const uid = await createConfirmedUser(env, email, PASS);
    created.push(uid);
    const { token } = await provisionActiveAccount(env, uid, email, PASS);
    await publishPersonProfile(env, token, uid, slug, `Privata ${stamp}`);
    await unpublishPersonProfile(env, token, uid);

    await page.goto(`/persone/${slug}`);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      /non trov|non disponibil/i,
    );

    await page.goto("/persone/this-slug-does-not-exist-p73-e2e");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      /non trov|non disponibil/i,
    );
  });

  test("person page renders on mobile viewport", async ({ page }) => {
    const env = loadStatusEnv();
    const stamp = Date.now();
    const email = `p73mob-${stamp}@gmail.com`;
    const slug = `p73-mobile-${stamp}`;
    const displayName = `Mobile Persona ${stamp}`;
    const uid = await createConfirmedUser(env, email, PASS);
    created.push(uid);
    const { token } = await provisionActiveAccount(env, uid, email, PASS);
    await publishPersonProfile(env, token, uid, slug, displayName);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/persone/${slug}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      displayName,
    );
    await expect(page.getByRole("link", { name: /Persone/i }).first()).toBeVisible();
  });
});
