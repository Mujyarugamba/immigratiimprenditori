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

test("hosted and explicitly read-only previews are noindex while writable production is crawlable", () => {
  const previous = {
    NETLIFY: process.env.NETLIFY,
    CONTEXT: process.env.CONTEXT,
    VERCEL: process.env.VERCEL,
    VERCEL_ENV: process.env.VERCEL_ENV,
    NEXT_PUBLIC_PREVIEW_READ_ONLY: process.env.NEXT_PUBLIC_PREVIEW_READ_ONLY,
  };

  try {
    delete process.env.NEXT_PUBLIC_PREVIEW_READ_ONLY;
    delete process.env.VERCEL;
    delete process.env.VERCEL_ENV;
    process.env.NETLIFY = "true";
    process.env.CONTEXT = "deploy-preview";
    assert.deepEqual(robots(), {
      rules: [{ userAgent: "*", disallow: "/" }],
    });

    delete process.env.NETLIFY;
    delete process.env.CONTEXT;
    process.env.VERCEL = "1";
    process.env.VERCEL_ENV = "preview";
    assert.deepEqual(robots(), {
      rules: [{ userAgent: "*", disallow: "/" }],
    });

    process.env.VERCEL_ENV = "production";
    delete process.env.NEXT_PUBLIC_PREVIEW_READ_ONLY;
    const production = robots();
    assert.deepEqual(production.rules, [
      { userAgent: "*", allow: "/", disallow: ["/app/", "/accedi"] },
    ]);
    assert.deepEqual(production.sitemap, [
      "https://immigratiimprenditori.it/sitemap.xml",
      "https://immigratiimprenditori.it/sitemap-contributors.xml",
    ]);
    assert.equal(production.host, "https://immigratiimprenditori.it");

    process.env.NEXT_PUBLIC_PREVIEW_READ_ONLY = "true";
    assert.deepEqual(robots(), {
      rules: [{ userAgent: "*", disallow: "/" }],
    });
  } finally {
    for (const [name, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
});
