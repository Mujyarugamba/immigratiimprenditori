import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const sql = readFileSync(
  join(
    process.cwd(),
    "supabase/migrations/20260822213000_hybrid_editorial_review_governance.sql",
  ),
  "utf8",
);

test("hybrid governance keeps ordinary content same-editor eligible and classifies sensitive content", () => {
  assert.match(sql, /force_secondary_review boolean not null default false/i);
  for (const code of [
    "research_report",
    "data_note",
    "interview",
    "testimony",
    "policy_brief",
    "institutional_page",
    "regulation_compliance",
    "stories",
  ]) {
    assert.match(sql, new RegExp(`['\"]${code}['\"]`));
  }
  assert.match(sql, /if not public\.content_requires_secondary_review\(new\) then\s+return new;/i);
});

test("secondary review is version-bound and forbids self approval", () => {
  assert.match(sql, /basis_fingerprint/);
  assert.match(sql, /EDITORIAL_REVIEW_SELF_APPROVAL_FORBIDDEN/);
  assert.match(sql, /approved_by_account_id\s+<>\s+requested_by_account_id/i);
  assert.match(sql, /EDITORIAL_REVIEW_STALE/);
  assert.match(sql, /status\s*=\s*'approved'/i);
});

test("database gates cover sensitive content, Observatory indicators and substantive corrections", () => {
  assert.match(sql, /CONTENT_PUBLICATION_REQUIRES_SECONDARY_REVIEW/);
  assert.match(sql, /OBSERVATORY_PUBLICATION_REQUIRES_SECONDARY_REVIEW/);
  assert.match(sql, /SUBSTANTIVE_CORRECTION_REQUIRES_SECONDARY_REVIEW/);
  assert.match(sql, /correction_kind not in \('substantive', 'retraction'\)/i);
  assert.match(sql, /before insert or update on public\.contents/i);
  assert.match(sql, /before insert or update on public\.observatory_indicators/i);
  assert.match(sql, /before insert or update on public\.content_corrections/i);
});

test("hybrid gate exposes no service-role bypass and keeps review ledger private", () => {
  assert.doesNotMatch(sql, /auth\.role\(\)[\s\S]*service_role/i);
  assert.match(sql, /revoke all on public\.editorial_secondary_reviews from public, anon/i);
  assert.match(sql, /revoke delete on public\.editorial_secondary_reviews from authenticated/i);
});
