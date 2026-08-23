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

function assertCanonical(href: string | null, path: string) {
  expect(href, `${path} canonical href must not be empty`).toBeTruthy();
  const actual = new URL(href!);
  const expected = new URL(path, `${PRODUCTION_ORIGIN}/`);
  expect(actual.origin, `${path} canonical origin`).toBe(expected.origin);
  expect(actual.pathname, `${path} canonical pathname`).toBe(expected.pathname);
  expect(actual.search, `${path} canonical must not contain query parameters`).toBe("");
  expect(actual.hash, `${path} canonical must not contain a fragment`).toBe("");
}

function assertGlobalStructuredData(html: string, path: string) {
  const scripts = [
    ...html.matchAll(
      /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
    ),
  ];
  expect(scripts.length, `${path} must expose structured data`).toBeGreaterThanOrEqual(1);

  const documents = scripts.map((match, index) => {
    try {
      return JSON.parse(match[1]);
    } catch (error) {
      throw new Error(`${path} JSON-LD #${index + 1} is invalid: ${String(error)}`);
    }
  });
  const nodes = documents.flatMap((document) =>
    Array.isArray(document?.["@graph"]) ? document["@graph"] : [document],
  );
  const types = nodes.flatMap((node) => {
    const value = node?.["@type"];
    return Array.isArray(value) ? value : value ? [value] : [];
  });
  expect(types, `${path} global JSON-LD must include Organization`).toContain("Organization");
  expect(types, `${path} global JSON-LD must include WebSite`).toContain("WebSite");
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
  assertCanonical(attribute(canonicals[0], "href"), path);

  expect(html.match(/<h1(?:\s|>)/gi)?.length ?? 0, `${path} must expose one H1`).toBe(1);
  assertGlobalStructuredData(html, path);
  expect(html, `${path} must not render a load error`).not.toContain("Impossibile caricare");
}

test("data-backed public core pages publish complete canonical SEO metadata", async ({ request }) => {
  for (const path of dataBackedSeoPages) {
    const response = await request.get(path, { timeout: 30_000 });
    expect(response.ok(), `${path} did not return 2xx`).toBeTruthy();
    assertSeoDocument(await response.text(), path);
  }
});
