import { expect, test } from "@playwright/test";

const ORIGIN = "http://127.0.0.1:3000";
const discoveryPages = [
  "/",
  "/chi-siamo",
  "/osservatorio",
  "/atlante",
  "/storie",
  "/eventi",
  "/open-data",
  "/contribuisci",
  "/en",
  "/ar",
] as const;

test("public internal links resolve against the local go-live stack", async ({ page, request }) => {
  const discovered = new Map<string, string>();

  for (const sourcePath of discoveryPages) {
    const sourceResponse = await page.goto(sourcePath, { waitUntil: "domcontentloaded" });
    expect(sourceResponse?.ok(), `${sourcePath} did not return 2xx during link discovery`).toBeTruthy();

    const hrefs = await page.locator("a[href]").evaluateAll((anchors) =>
      anchors
        .map((anchor) => anchor.getAttribute("href")?.trim() ?? "")
        .filter(Boolean),
    );

    for (const rawHref of hrefs) {
      if (rawHref.startsWith("#")) continue;
      if (/^(?:mailto:|tel:|javascript:|data:)/i.test(rawHref)) continue;

      let url: URL;
      try {
        url = new URL(rawHref, `${ORIGIN}${sourcePath}`);
      } catch {
        throw new Error(`${sourcePath} exposes an invalid href: ${JSON.stringify(rawHref)}`);
      }

      if (url.origin !== ORIGIN) continue;
      url.hash = "";
      const target = `${url.pathname}${url.search}`;
      if (!discovered.has(target)) discovered.set(target, sourcePath);
    }
  }

  expect(discovered.size, "too few public internal links were discovered").toBeGreaterThan(15);

  for (const [target, sourcePath] of discovered) {
    const response = await request.get(target, { maxRedirects: 5, timeout: 15_000 });
    expect(
      response.status(),
      `${sourcePath} links to ${target}, which resolved with HTTP ${response.status()}`,
    ).toBeLessThan(400);
  }
});
