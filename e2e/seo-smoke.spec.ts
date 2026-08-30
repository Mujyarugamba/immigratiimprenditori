import { expect, test } from "@playwright/test";

const PRODUCTION_ORIGIN = "https://www.immigratiimprenditori.it";
const LEGACY_APEX_ORIGIN = "https://immigratiimprenditori.it";

// Source-gate vocabulary retained for the invariant contract:
// canonical must target production; global structured data must remain present and valid.
const staticSeoPages = [
  "/",
  "/osservatorio",
  "/contenuti",
  "/ricerca",
  "/pubblicazioni",
  "/bibliografia",
  "/storie",
  "/cultura",
  "/eventi",
  "/esplora",
  "/esplora/dati",
  "/esplora/mappa",
  "/esplora/territori",
  "/esplora/settori",
  "/esplora/autori",
  "/atlante",
  "/relazioni",
  "/timeline",
  "/open-data",
  "/open-data/api",
  "/fonti",
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

const socialSeoPages = [
  "/osservatorio",
  "/contenuti",
  "/storie",
  "/cultura",
  "/eventi",
  "/esplora",
  "/esplora/dati",
  "/esplora/mappa",
  "/esplora/territori",
  "/esplora/settori",
  "/esplora/autori",
  "/ricerca",
  "/pubblicazioni",
  "/bibliografia",
  "/atlante",
  "/relazioni",
  "/timeline",
  "/open-data",
  "/open-data/api",
  "/fonti",
  "/dati-e-fonti",
  "/glossario",
  "/chi-siamo",
  "/contribuisci",
  "/sostieni",
  "/privacy",
  "/cookie",
  "/termini",
  "/politica-editoriale",
  "/en/osservatorio",
  "/fr/contenuti",
  "/es/storie",
  "/de/eventi",
  "/ar/esplora",
  "/zh/cultura",
  "/en/ricerca",
  "/fr/open-data",
  "/es/fonti",
  "/de/dati-e-fonti",
  "/ar/glossario",
  "/en/esplora/dati",
  "/fr/esplora/territori",
  "/es/esplora/settori",
  "/de/esplora/autori",
  "/en/chi-siamo",
  "/fr/contribuisci",
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

function matchingMeta(html: string, attributeName: "name" | "property", value: string) {
  return tags(html, "meta").filter(
    (tag) => attribute(tag, attributeName)?.toLowerCase() === value.toLowerCase(),
  );
}

function assertSingleMetaContent(
  html: string,
  path: string,
  attributeName: "name" | "property",
  value: string,
) {
  const matches = matchingMeta(html, attributeName, value);
  expect(matches, `${path} must expose exactly one ${value} meta tag`).toHaveLength(1);
  const content = attribute(matches[0], "content")?.trim();
  expect(content, `${path} ${value} content must not be empty`).toBeTruthy();
  return content!;
}

function assertPageSocialMetadata(html: string, path: string) {
  const pageDescription = assertSingleMetaContent(html, path, "name", "description");
  assertSingleMetaContent(html, path, "property", "og:title");
  expect(assertSingleMetaContent(html, path, "property", "og:description")).toBe(
    pageDescription,
  );
  const openGraphUrl = assertSingleMetaContent(html, path, "property", "og:url");
  assertCanonical(openGraphUrl, path);

  const openGraphImage = new URL(
    assertSingleMetaContent(html, path, "property", "og:image"),
    `${PRODUCTION_ORIGIN}/`,
  );
  expect(openGraphImage.origin, `${path} og:image origin`).toBe(PRODUCTION_ORIGIN);
  expect(openGraphImage.pathname, `${path} og:image pathname`).toBe(
    "/logo-immigrati-imprenditori.png",
  );

  expect(assertSingleMetaContent(html, path, "name", "twitter:card")).toBe(
    "summary_large_image",
  );
  assertSingleMetaContent(html, path, "name", "twitter:title");
  expect(assertSingleMetaContent(html, path, "name", "twitter:description")).toBe(
    pageDescription,
  );
  const twitterImage = new URL(
    assertSingleMetaContent(html, path, "name", "twitter:image"),
    `${PRODUCTION_ORIGIN}/`,
  );
  expect(twitterImage.origin, `${path} twitter:image origin`).toBe(PRODUCTION_ORIGIN);
  expect(twitterImage.pathname, `${path} twitter:image pathname`).toBe(
    "/logo-immigrati-imprenditori.png",
  );
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
  expect(html, `${path} must not expose the legacy apex origin`).not.toContain(LEGACY_APEX_ORIGIN);

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

  const h1Count = html.match(/<h1(?:\s|>)/gi)?.length ?? 0;
  expect(h1Count, `${path} must expose exactly one H1`).toBe(1);

  assertGlobalStructuredData(html, path);

  const robots = tags(html, "meta").find(
    (tag) => attribute(tag, "name")?.toLowerCase() === "robots",
  );
  if (robots) {
    expect(attribute(robots, "content") ?? "", `${path} public robots metadata`).not.toMatch(/noindex/i);
  }
}

test("all public core pages publish complete canonical SEO metadata", async ({ request }) => {
  for (const path of staticSeoPages) {
    const response = await request.get(path, { timeout: 30_000 });
    expect(response.ok(), `${path} did not return 2xx`).toBeTruthy();
    assertSeoDocument(await response.text(), path);
  }
});

test("core Italian and localized sections publish page-specific social metadata", async ({ request }) => {
  for (const path of socialSeoPages) {
    const response = await request.get(path, { timeout: 30_000 });
    expect(response.ok(), `${path} did not return 2xx`).toBeTruthy();
    const html = await response.text();
    assertSeoDocument(html, path);
    assertPageSocialMetadata(html, path);
  }
});
