import { expect, test } from "@playwright/test";

const PRODUCTION_ORIGIN = "https://immigratiimprenditori.it";

const staticSeoPages = [
  "/chi-siamo",
  "/dati-e-fonti",
  "/glossario",
  "/contribuisci",
  "/sostieni",
  "/privacy",
  "/cookie",
  "/termini",
  "/politica-editoriale",
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

  const h1Count = html.match(/<h1(?:\s|>)/gi)?.length ?? 0;
  expect(h1Count, `${path} must expose exactly one H1`).toBe(1);

  const jsonLdCount = (html.match(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>/gi) ?? []).length;
  expect(jsonLdCount, `${path} must retain global structured data`).toBeGreaterThanOrEqual(2);

  const robots = tags(html, "meta").find(
    (tag) => attribute(tag, "name")?.toLowerCase() === "robots",
  );
  if (robots) {
    expect(attribute(robots, "content") ?? "", `${path} public robots metadata`).not.toMatch(/noindex/i);
  }
}

test("homepage keeps the global SEO foundation", async ({ request }) => {
  const response = await request.get("/", { timeout: 30_000 });
  expect(response.ok()).toBeTruthy();
  const html = await response.text();

  const titles = html.match(/<title>[\s\S]*?<\/title>/gi) ?? [];
  expect(titles).toHaveLength(1);
  const descriptions = tags(html, "meta").filter(
    (tag) => attribute(tag, "name")?.toLowerCase() === "description",
  );
  expect(descriptions).toHaveLength(1);
  expect(html.match(/<h1(?:\s|>)/gi)?.length ?? 0).toBe(1);
  expect(html.match(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>/gi)?.length ?? 0).toBeGreaterThanOrEqual(2);
});

test("static public core pages publish complete canonical SEO metadata", async ({ request }) => {
  for (const path of staticSeoPages) {
    const response = await request.get(path, { timeout: 30_000 });
    expect(response.ok(), `${path} did not return 2xx`).toBeTruthy();
    assertSeoDocument(await response.text(), path);
  }
});
