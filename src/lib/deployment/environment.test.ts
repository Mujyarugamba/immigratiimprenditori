import assert from "node:assert/strict";
import { test } from "node:test";
import { resolveDeploymentEnvironment } from "./environment";

test("Vercel preview is automatically read-only", () => {
  const mode = resolveDeploymentEnvironment({ VERCEL: "1", VERCEL_ENV: "preview" });
  assert.equal(mode.isVercelPreview, true);
  assert.equal(mode.isHostedPreview, true);
  assert.equal(mode.isHostedProduction, false);
  assert.equal(mode.isReadOnlyPreview, true);
});

test("Vercel production remains writable unless explicitly overridden", () => {
  const mode = resolveDeploymentEnvironment({ VERCEL: "1", VERCEL_ENV: "production" });
  assert.equal(mode.isVercelPreview, false);
  assert.equal(mode.isVercelProduction, true);
  assert.equal(mode.isHostedProduction, true);
  assert.equal(mode.isReadOnlyPreview, false);
});

test("Netlify deploy-preview and branch deploy are automatically read-only", () => {
  for (const context of ["deploy-preview", "branch-deploy"]) {
    const mode = resolveDeploymentEnvironment({ NETLIFY: "true", CONTEXT: context });
    assert.equal(mode.isNetlifyPreview, true);
    assert.equal(mode.isHostedPreview, true);
    assert.equal(mode.isReadOnlyPreview, true);
  }
});

test("Netlify production is detected separately from preview", () => {
  const mode = resolveDeploymentEnvironment({ NETLIFY: "true", CONTEXT: "production" });
  assert.equal(mode.isNetlifyPreview, false);
  assert.equal(mode.isNetlifyProduction, true);
  assert.equal(mode.isHostedProduction, true);
  assert.equal(mode.isReadOnlyPreview, false);
});

test("explicit preview read-only flag fails closed outside hosted providers", () => {
  const mode = resolveDeploymentEnvironment({ NEXT_PUBLIC_PREVIEW_READ_ONLY: "true" });
  assert.equal(mode.isHostedPreview, false);
  assert.equal(mode.isHostedProduction, false);
  assert.equal(mode.isReadOnlyPreview, true);
});
