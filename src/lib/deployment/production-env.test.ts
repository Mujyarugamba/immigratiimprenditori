import assert from "node:assert/strict";
import { test } from "node:test";
import { validateHostedProductionEnv } from "./production-env";

const valid = {
  NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test",
  NEXT_PUBLIC_SITE_URL: "https://www.immigratiimprenditori.it",
  SUPABASE_SERVICE_ROLE_KEY: "service-role-test",
};

test("hosted production environment accepts complete HTTPS config", () => {
  assert.deepEqual(validateHostedProductionEnv(valid), { ok: true });
});

test("hosted production environment reports every missing required variable", () => {
  const result = validateHostedProductionEnv({});
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.match(result.error, /NEXT_PUBLIC_SUPABASE_URL/);
    assert.match(result.error, /NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY/);
    assert.match(result.error, /NEXT_PUBLIC_SITE_URL/);
    assert.match(result.error, /SUPABASE_SERVICE_ROLE_KEY/);
  }
});

test("hosted production rejects non-HTTPS Supabase endpoints", () => {
  const result = validateHostedProductionEnv({
    ...valid,
    NEXT_PUBLIC_SUPABASE_URL: "http://project.supabase.co",
  });
  assert.deepEqual(result, { ok: false, error: "Production Supabase URL must use HTTPS." });
});

test("hosted production rejects malformed Supabase endpoints", () => {
  const result = validateHostedProductionEnv({
    ...valid,
    NEXT_PUBLIC_SUPABASE_URL: "not-a-url",
  });
  assert.deepEqual(result, {
    ok: false,
    error: "Production Supabase URL is not a valid absolute HTTPS URL.",
  });
});

test("hosted production rejects non-HTTPS site origins", () => {
  const result = validateHostedProductionEnv({
    ...valid,
    NEXT_PUBLIC_SITE_URL: "http://www.immigratiimprenditori.it",
  });
  assert.deepEqual(result, { ok: false, error: "Production site URL must use HTTPS." });
});

test("hosted production rejects malformed site origins", () => {
  const result = validateHostedProductionEnv({
    ...valid,
    NEXT_PUBLIC_SITE_URL: "not-a-url",
  });
  assert.deepEqual(result, {
    ok: false,
    error: "Production site URL is not a valid absolute HTTPS URL.",
  });
});
