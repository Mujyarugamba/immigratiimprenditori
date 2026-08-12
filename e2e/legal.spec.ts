import { expect, test } from "@playwright/test";

const LEGAL = [
  { path: "/privacy", heading: /Informativa sul trattamento|Privacy/i },
  { path: "/cookie", heading: /Cookie/i },
  { path: "/termini", heading: /Condizioni di utilizzo|Termini/i },
  { path: "/dati-e-fonti", heading: /Osservatorio|fonti/i },
] as const;

test.describe("L1.4 public legal surfaces", () => {
  for (const doc of LEGAL) {
    test(`${doc.path} loads without internal markers`, async ({ page }) => {
      await page.goto(doc.path);
      await expect(page.locator("main")).toBeVisible();
      const body = await page.locator("main").innerText();
      expect(body).not.toMatch(/TASK TECNICO|VERIFICA TECNICA RICHIESTA|Revisione Claude|Decision Table/i);
      expect(body).toMatch(/AIPEL|97342380157|04222160964|info@immigratiimprenditori\.it/);
      expect(body).toMatch(/18 anni|Case A|legge italiana|fonti/i);
    });
  }

  test("footer legal links navigate", async ({ page }) => {
    await page.goto("/");
    const footer = page.getByRole("navigation", { name: "Documenti legali" });
    await expect(footer.getByRole("link", { name: "Privacy" })).toHaveAttribute(
      "href",
      "/privacy",
    );
    await expect(footer.getByRole("link", { name: "Cookie" })).toHaveAttribute(
      "href",
      "/cookie",
    );
    await expect(footer.getByRole("link", { name: "Termini" })).toHaveAttribute(
      "href",
      "/termini",
    );
    await expect(
      footer.getByRole("link", { name: "Dati e fonti" }),
    ).toHaveAttribute("href", "/dati-e-fonti");
    await footer.getByRole("link", { name: "Privacy" }).click();
    await expect(page).toHaveURL(/\/privacy/);
  });
});

test.describe("L1.4 signup legal UX", () => {
  test("registrati shows Terms acceptance and Privacy informative link", async ({
    page,
  }) => {
    await page.goto("/registrati");
    await expect(
      page.getByRole("link", { name: /Termini/i }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Privacy/i }).first(),
    ).toBeVisible();
    await expect(
      page.getByText(/Accetto i Termini/i),
    ).toBeVisible();
    await expect(
      page.getByText(/non è un consenso/i),
    ).toBeVisible();
  });
});
