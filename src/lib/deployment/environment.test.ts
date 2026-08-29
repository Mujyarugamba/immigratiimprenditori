import assert from "node:assert/strict";
import { test } from "node:test";
import {
  resolveDeploymentEnvironment,
  shouldValidateHostedProductionEnv,
} from "./environment";

test("Vercel preview is automatically read-only", () => {
  const env = { VERCEL: "1", VERCEL_ENV: "preview" };
  const mode = resolveDeploymentEnvironment(env);
  assert.equal(mode.isVercelPreview, true);
  assert.equal(mode.isHostedPreview, true);
  assert.equal(mode.isHostedProduction, false);
  assert.equal(mode.isReadOnlyPreview, true);
  assert.equal(shouldValidateHostedProductionEnv(env), false);
});

test("Vercel production remains writable unless explicitly overridden", () => {
  const env = { VERCEL: "1", VERCEL_ENV: "production" };
  const mode = resolveDeploymentEnvironment(env);
  assert.equal(mode.isVercelPreview, false);
  assert.equal(mode.isVercelProduction, true);
  assert.equal(mode.isHostedProduction, true);
  assert.equal(mode.isReadOnlyPreview, false);
  assert.equal(shouldValidateHostedProductionEnv(env), true);
});

test("Vercel production environment can be forced into fail-closed Preview mode", () => {
  const env = {
    VERCEL: "1",
    VERCEL_ENV: "production",
    NEXT_PUBLIC_PREVIEW_READ_ONLY: "true",
  };
  const mode = resolveDeploymentEnvironment(env);
  assert.equal(mode.isVercelProduction, true);
  assert.equal(mode.isHostedProduction, true);
  assert.equal(mode.isHostedPreview, false);
  assert.equal(mode.isReadOnlyPreview, true);
  assert.equal(shouldValidateHostedProductionEnv(env), false);
});

test("Netlify deploy-preview and branch deploy are automatically read-only", () => {
  for (const context of ["deploy-preview", "branch-deploy"]) {
    const env = { NETLIFY: "true", CONTEXT: context };
    const mode = resolveDeploymentEnvironment(env);
    assert.equal(mode.isNetlifyPreview, true);
    assert.equal(mode.isHostedPreview, true);
    assert.equal(mode.isReadOnlyPreview, true);
    assert.equal(shouldValidateHostedProductionEnv(env), false);
  }
});

test("Netlify production is detected separately from preview", () => {
  const env = { NETLIFY: "true", CONTEXT: "production" };
  const mode = resolveDeploymentEnvironment(env);
  assert.equal(mode.isNetlifyPreview, false);
  assert.equal(mode.isNetlifyProduction, true);
  assert.equal(mode.isHostedProduction, true);
  assert.equal(mode.isReadOnlyPreview, false);
  assert.equal(shouldValidateHostedProductionEnv(env), true);
});

test("explicit preview read-only flag fails closed outside hosted providers", () => {
  const env = { NEXT_PUBLIC_PREVIEW_READ_ONLY: "true" };
  const mode = resolveDeploymentEnvironment(env);
  assert.equal(mode.isHostedPreview, false);
  assert.equal(mode.isHostedProduction, false);
  assert.equal(mode.isReadOnlyPreview, true);
  assert.equal(shouldValidateHostedProductionEnv(env), false);
});
