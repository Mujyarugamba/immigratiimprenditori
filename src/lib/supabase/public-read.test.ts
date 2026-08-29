import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { createPublicReadClient } from "./public-read";

const SOURCE = fs.readFileSync(
  path.join(process.cwd(), "src/lib/supabase/public-read.ts"),
  "utf8",
);

test("public-read client source stays cookie-free and service-role-free", () => {
  assert.equal(/cookies\s*\(/.test(SOURCE), false);
  assert.doesNotMatch(SOURCE, /next\/headers/);
  assert.doesNotMatch(SOURCE, /SUPABASE_SERVICE_ROLE/);
  assert.doesNotMatch(SOURCE, /service_role/);
  assert.doesNotMatch(SOURCE, /getSupabaseServiceRoleKey/);
  assert.match(SOURCE, /persistSession:\s*false/);
  assert.match(SOURCE, /autoRefreshToken:\s*false/);
  assert.match(SOURCE, /detectSessionInUrl:\s*false/);
  assert.match(SOURCE, /createClient/);
  assert.match(SOURCE, /@supabase\/supabase-js/);
});

test("createPublicReadClient fails closed without public env", () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  try {
    assert.throws(
      () => createPublicReadClient(),
      /Missing environment variable: NEXT_PUBLIC_SUPABASE_URL/,
    );
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    assert.throws(
      () => createPublicReadClient(),
      /Missing environment variable: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY/,
    );
  } finally {
    if (url === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    else process.env.NEXT_PUBLIC_SUPABASE_URL = url;
    if (key === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    else process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = key;
  }
});

test("createPublicReadClient constructs a supabase-js client from public env", () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_test";

  try {
    const client = createPublicReadClient();
    assert.equal(typeof client.from, "function");
    assert.equal(typeof client.auth.getSession, "function");
  } finally {
    if (url === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    else process.env.NEXT_PUBLIC_SUPABASE_URL = url;
    if (key === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    else process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = key;
  }
});
