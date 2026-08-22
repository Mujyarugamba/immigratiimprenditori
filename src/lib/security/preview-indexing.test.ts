import assert from "node:assert/strict";
import test from "node:test";
import robots from "../../app/robots";

const originalNetlify = process.env.NETLIFY;
const originalContext = process.env.CONTEXT;

function restoreEnv() {
  if (originalNetlify === undefined) delete process.env.NETLIFY;
  else process.env.NETLIFY = originalNetlify;

  if (originalContext === undefined) delete process.env.CONTEXT;
  else process.env.CONTEXT = originalContext;
}

test.afterEach(restoreEnv);

test("Netlify deploy previews disallow crawler indexing", () => {
  process.env.NETLIFY = "true";
  process.env.CONTEXT = "deploy-preview";

  const result = robots();
  assert.deepEqual(result.rules, [{ userAgent: "*", disallow: "/" }]);
  assert.equal(result.sitemap, undefined);
  assert.equal(result.host, undefined);
});

test("Netlify production keeps public crawl rules and sitemaps", () => {
  process.env.NETLIFY = "true";
  process.env.CONTEXT = "production";

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
