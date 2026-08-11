import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import {
  assertNoInternalLegalMarkers,
  loadPublicLegalMarkdown,
} from "@/lib/legal/load-public-document";
import { TERMS_OF_USE_VERSION } from "@/lib/legal/versions";
import { PUBLIC_PERSON_SELECT } from "@/lib/data/public/people";
import { PROFILE_SELF_EDITABLE_FIELDS } from "@/types/business";

describe("L1.3 legal public surfaces", () => {
  it("public legal markdown strips internal review markers", () => {
    for (const id of ["privacy", "cookie", "termini", "datiEFonti"] as const) {
      const md = loadPublicLegalMarkdown(id);
      assert.ok(md.length > 200, id);
      assert.equal(assertNoInternalLegalMarkers(md), true, id);
      assert.equal(/\[TASK TECNICO/i.test(md), false, id);
      assert.equal(/DOCUMENTO DA REVISIONARE/i.test(md), false, id);
      assert.equal(/Decision Table/i.test(md), false, id);
    }
  });

  it("termini include Italian law and forum rules", () => {
    const md = loadPublicLegalMarkdown("termini");
    assert.match(md, /legge italiana/i);
    assert.match(md, /Foro di Milano/);
    assert.match(md, /consumatore/i);
  });

  it("disclaimer does not claim operational import already executed", () => {
    const md = loadPublicLegalMarkdown("datiEFonti");
    assert.match(md, /non è ancora eseguito/i);
  });

  it("terms acceptance migration is present and scoped", () => {
    const sql = readFileSync(
      join(
        process.cwd(),
        "supabase/migrations/20260815100000_create_terms_acceptances.sql",
      ),
      "utf8",
    );
    assert.match(sql, /create table public\.terms_acceptances/);
    assert.match(sql, /document_kind = 'terms_of_use'/);
    assert.match(sql, /access_current_account_id/);
    assert.match(sql, /on delete restrict/i);
    assert.match(
      sql,
      /grant insert \(\s*account_id,\s*document_kind,\s*document_version,\s*acceptance_channel\s*\)/i,
    );
    assert.equal(/on delete cascade/i.test(sql), false);
    assert.equal(/legal_retention_archive/i.test(sql), false);
    assert.equal(/access_self_delete/i.test(sql), false);
    assert.equal(/privacy_accepted/i.test(sql), false);
  });

  it("terms version constant is non-empty", () => {
    assert.ok(TERMS_OF_USE_VERSION.length > 0);
  });

  it("L1.1b contact contract still holds (auth email ≠ contact)", () => {
    assert.equal(
      (PROFILE_SELF_EDITABLE_FIELDS as readonly string[]).includes("phone"),
      false,
    );
    assert.equal(PUBLIC_PERSON_SELECT.includes("phone"), false);
    assert.equal(PUBLIC_PERSON_SELECT.includes("contact_email"), false);
  });
});
