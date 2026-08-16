import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

describe("L1.3-M2 legal_retention_records migration (unapplied design)", () => {
  const sql = readFileSync(
    join(
      process.cwd(),
      "supabase/migrations/20260816100000_create_legal_retention_records.sql",
    ),
    "utf8",
  );

  it("creates minimized archive without profile dump or misc reasons", () => {
    assert.match(sql, /create table public\.legal_retention_records/);
    assert.match(sql, /on delete set null/i);
    assert.match(sql, /access_is_application_admin/);
    assert.match(sql, /legal_retention_insert_record/);
    assert.match(sql, /legal_retention_dispose_record/);
    assert.match(sql, /terms_acceptance_proof/);
    assert.match(sql, /transaction_evidence/);
    assert.equal(/\bjsonb\b/i.test(sql.replace(/--[^\n]*/g, "")), false);
    assert.equal(/reason_code in \([^)]*'other'/i.test(sql), false);
    assert.equal(/on delete cascade/i.test(sql.replace(/--[^\n]*/g, "")), false);
    assert.equal(/grant insert/i.test(sql.replace(/--[^\n]*/g, "")), false);
    assert.equal(/access_self_delete/i.test(sql), false);
    assert.equal(/create table public\.businesses/i.test(sql), false);
  });
});
