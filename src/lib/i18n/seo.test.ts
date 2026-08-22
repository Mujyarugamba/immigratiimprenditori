import assert from "node:assert/strict";
import test from "node:test";
import robots from "../../app/robots";
import { absoluteLocalizedUrl, languageAlternates } from "./seo";

test("localized SEO URLs keep Italian unprefixed and expose seven-language alternates", () => {
  assert.equal(
    absoluteLocalizedUrl("it", "/osservatorio"),
    "https://immigratiimprenditori.it/osservatorio",
  );
  assert.equal(
    absoluteLocalizedUrl("en", "/osservatorio"),
    "https://immigratiimprenditori.it/en/osservatorio",
  );

  const alternates = languageAlternates("/fonti");
  assert.deepEqual(Object.keys(alternates).sort(), [
    "ar",
    "de",
    "en",
    "es",
    "fr",
    "it",
    "x-default",
    "zh",
  ]);
  assert.equal(alternates.it, "https://immigratiimprenditori.it/fonti");
  assert.equal(alternates.en, "https://immigratiimprenditori.it/en/fonti");
  assert.equal(alternates.ar, "https://immigratiimprenditori.it/ar/fonti");
  assert.equal(alternates["x-default"], "https://immigratiimprenditori.it/fonti");
});

test("Netlify previews are globally noindex while production remains crawlable", () => {
  const previousNetlify = process.env.NETLIFY;
  const previousContext = process.env.CONTEXT;

  try {
    process.env.NETLIFY = "true";
    process.env.CONTEXT = "deploy-preview";
    assert.deepEqual(robots(), {
      rules: [{ userAgent: "*", disallow: "/" }],
    });

    process.env.CONTEXT = "production";
    const production = robots();
    assert.deepEqual(production.rules, [
      { userAgent: "*", allow: "/", disallow: ["/app/", "/accedi"] },
    ]);
    assert.deepEqual(production.sitemap, [
      "https://immigratiimprenditori.it/sitemap.xml",
      "https://immigratiimprenditori.it/sitemap-contributors.xml",
    ]);
    assert.equal(production.host, "https://immigratiimprenditori.it");
  } finally {
    if (previousNetlify === undefined) delete process.env.NETLIFY;
    else process.env.NETLIFY = previousNetlify;
    if (previousContext === undefined) delete process.env.CONTEXT;
    else process.env.CONTEXT = previousContext;
  }
});
