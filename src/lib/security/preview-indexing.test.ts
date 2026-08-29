import assert from "node:assert/strict";
import test from "node:test";
import robots from "../../app/robots";

const originalNetlify = process.env.NETLIFY;
const originalContext = process.env.CONTEXT;
const originalVercel = process.env.VERCEL;
const originalVercelEnv = process.env.VERCEL_ENV;
const originalPreviewReadOnly = process.env.NEXT_PUBLIC_PREVIEW_READ_ONLY;

function restoreEnv() {
  if (originalNetlify === undefined) delete process.env.NETLIFY;
  else process.env.NETLIFY = originalNetlify;

  if (originalContext === undefined) delete process.env.CONTEXT;
  else process.env.CONTEXT = originalContext;

  if (originalVercel === undefined) delete process.env.VERCEL;
  else process.env.VERCEL = originalVercel;

  if (originalVercelEnv === undefined) delete process.env.VERCEL_ENV;
  else process.env.VERCEL_ENV = originalVercelEnv;

  if (originalPreviewReadOnly === undefined) delete process.env.NEXT_PUBLIC_PREVIEW_READ_ONLY;
  else process.env.NEXT_PUBLIC_PREVIEW_READ_ONLY = originalPreviewReadOnly;
}

test.afterEach(restoreEnv);

test("Netlify deploy previews disallow crawler indexing", () => {
  process.env.NETLIFY = "true";
  process.env.CONTEXT = "deploy-preview";
  delete process.env.VERCEL;
  delete process.env.VERCEL_ENV;
  delete process.env.NEXT_PUBLIC_PREVIEW_READ_ONLY;

  const result = robots();
  assert.deepEqual(result.rules, [{ userAgent: "*", disallow: "/" }]);
  assert.equal(result.sitemap, undefined);
  assert.equal(result.host, undefined);
});

test("Vercel previews disallow crawler indexing", () => {
  delete process.env.NETLIFY;
  delete process.env.CONTEXT;
  process.env.VERCEL = "1";
  process.env.VERCEL_ENV = "preview";
  delete process.env.NEXT_PUBLIC_PREVIEW_READ_ONLY;

  const result = robots();
  assert.deepEqual(result.rules, [{ userAgent: "*", disallow: "/" }]);
  assert.equal(result.sitemap, undefined);
  assert.equal(result.host, undefined);
});

test("explicit read-only flag keeps a Vercel production-like Preview project noindex", () => {
  delete process.env.NETLIFY;
  delete process.env.CONTEXT;
  process.env.VERCEL = "1";
  process.env.VERCEL_ENV = "production";
  process.env.NEXT_PUBLIC_PREVIEW_READ_ONLY = "true";

  const result = robots();
  assert.deepEqual(result.rules, [{ userAgent: "*", disallow: "/" }]);
  assert.equal(result.sitemap, undefined);
  assert.equal(result.host, undefined);
});

test("Netlify production keeps public crawl rules and sitemaps", () => {
  process.env.NETLIFY = "true";
  process.env.CONTEXT = "production";
  delete process.env.VERCEL;
  delete process.env.VERCEL_ENV;
  delete process.env.NEXT_PUBLIC_PREVIEW_READ_ONLY;

  const result = robots();
  assert.deepEqual(result.rules, [
    {
      userAgent: "*",
      allow: "/",
      disallow: ["/app/", "/accedi"],
    },
  ]);
  assert.deepEqual(result.sitemap, [
    "https://immigratiimprenditori.it/sitemap.xml",
    "https://immigratiimprenditori.it/sitemap-contributors.xml",
  ]);
  assert.equal(result.host, "https://immigratiimprenditori.it");
});
