import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const sql = readFileSync(
  join(
    process.cwd(),
    "supabase/migrations/20260822172000_harden_content_publication_gate.sql",
  ),
  "utf8",
);

test("database publication gate requires editor/admin and editorial ownership", () => {
  assert.match(sql, /access_is_editor\(\)/);
  assert.match(sql, /access_is_application_admin\(\)/);
  assert.match(sql, /owned_by_editorial\s+is\s+distinct\s+from\s+true/i);
  assert.match(sql, /CONTENT_PUBLICATION_REQUIRES_EDITOR/);
  assert.match(sql, /CONTENT_PUBLICATION_REQUIRES_EDITORIAL_OWNERSHIP/);
});

test("database publication gate has no service-role publication bypass", () => {
  assert.doesNotMatch(sql, /auth\.role\(\).*service_role/is);
  assert.match(sql, /before insert or update on public\.contents/i);
});
