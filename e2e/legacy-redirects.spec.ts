import { expect, test } from "@playwright/test";

const permanentLegacyRedirects = [
  ["/notizie-e-guide", "/contenuti"],
  ["/rotte", "/atlante/rotte"],
  ["/rotte/esempio-rotta", "/atlante/rotte/esempio-rotta"],
] as const;

test("legacy public aliases use permanent redirects to their canonical routes", async ({ request }) => {
  for (const [source, destination] of permanentLegacyRedirects) {
    const response = await request.get(source, { maxRedirects: 0 });
    expect(response.status(), `${source} must return a permanent redirect`).toBe(308);

    const location = response.headers().location;
    expect(location, `${source} must expose a Location header`).toBeTruthy();
    const resolved = new URL(location!, "http://localhost");
    expect(resolved.pathname, `${source} redirect destination`).toBe(destination);
  }
});
