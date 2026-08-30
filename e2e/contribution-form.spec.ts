import { expect, test } from "@playwright/test";
import { psql } from "./helpers/supabase";

test("public contribution form writes one private editorial submission", async ({ page }) => {
  const stamp = Date.now();
  const email = `ci-public-form-${stamp}@example.invalid`;
  const title = `CI Public Form ${stamp}`;

  try {
    const response = await page.goto("/contribuisci", { waitUntil: "domcontentloaded" });
    expect(response?.ok()).toBeTruthy();

    await page.locator('select[name="submission_kind"]').selectOption("research");
    await page.locator('input[name="title"]').fill(title);
    await page
      .locator('textarea[name="contribution_text"]')
      .fill("Invio E2E locale ed effimero per verificare il modulo pubblico e la Inbox redazionale privata.");
    await page.locator('input[name="submitter_name"]').fill("CI Public Form");
    await page.locator('input[name="submitter_email"]').fill(email);
    await page.locator('input[name="organization_name"]').fill("Centro Studi CI");
    await page.locator('input[name="consent_contact"]').check();

    await page.getByRole("button", { name: /Invia alla redazione/i }).click();

    await expect(page).toHaveURL(/\/contribuisci\?inviato=1$/, { timeout: 30_000 });
    await expect(page.getByRole("status")).toContainText("Proposta ricevuta");

    const submission = psql(`
      select count(*)
      from public.editorial_submissions
      where submitter_email = '${email}';
    `);
    expect(submission).toMatch(/\b1\b/);

    const privateInbox = psql(`
      select count(*)
      from public.editorial_inbox_items i
      join public.editorial_submissions s on s.inbox_item_id = i.id
      where s.submitter_email = '${email}';
    `);
    expect(privateInbox).toMatch(/\b1\b/);
  } finally {
    psql(`
      delete from public.editorial_inbox_items
      where id in (
        select inbox_item_id
        from public.editorial_submissions
        where submitter_email = '${email}'
      );
    `);
  }
});
