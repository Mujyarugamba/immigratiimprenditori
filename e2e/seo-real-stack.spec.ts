import { expect, test } from "@playwright/test";

const PRODUCTION_ORIGIN = "https://immigratiimprenditori.it";

const dataBackedSeoPages = [
  "/osservatorio",
  "/atlante",
  "/contenuti",
  "/ricerca",
  "/storie",
  "/eventi",
  "/fonti",
  "/open-data",
  "/esplora",
] as const;

function tags(html: string, tagName: string) {
  return html.match(new RegExp(`<${tagName}\\b[^>]*>`, "gi")) ?? [];
}

function attribute(tag: string, name: string) {
  const match = tag.match(new RegExp(`\\b${name}=["']([^"']*)["']`, "i"));
  return match?.[1] ?? null;
}

function assertSeoDocument(html: string, path: string) {
  const titles = html.match(/<title>[\s\S]*?<\/title>/gi) ?? [];
  expect(titles, `${path} must expose exactly one title`).toHaveLength(1);
  expect(titles[0].replace(/<\/?title>/gi, "").trim(), `${path} title must not be empty`).not.toBe("");

  const descriptions = tags(html, "meta").filter(
    (tag) => attribute(tag, "name")?.toLowerCase() === "description",
  );
  expect(descriptions, `${path} must expose exactly one meta description`).toHaveLength(1);
  expect(attribute(descriptions[0], "content")?.trim(), `${path} description must not be empty`).toBeTruthy();

  const canonicals = tags(html, "link").filter(
    (tag) => attribute(tag, "rel")?.toLowerCase() === "canonical",
  );
  expect(canonicals, `${path} must expose exactly one canonical`).toHaveLength(1);
  expect(attribute(canonicals[0], "href"), `${path} canonical must target production`).toBe(
    `${PRODUCTION_ORIGIN}${path}`,
  );

  expect(html.match(/<h1(?:\s|>)/gi)?.length ?? 0, `${path} must expose one H1`).toBe(1);
  expect(
    html.match(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>/gi)?.length ?? 0,
    `${path} must retain global structured data`,
  ).toBeGreaterThanOrEqual(2);
  expect(html, `${path} must not render a load error`).not.toContain("Impossibile caricare");
}

test("data-backed public core pages publish complete canonical SEO metadata", async ({ request }) => {
  for (const path of dataBackedSeoPages) {
    const response = await request.get(path, { timeout: 30_000 });
    expect(response.ok(), `${path} did not return 2xx`).toBeTruthy();
    assertSeoDocument(await response.text(), path);
  }
});
