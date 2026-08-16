import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { ponteImpreseMigrationsDir } from "@/lib/app-paths";
import { PROFILE_SELF_EDITABLE_FIELDS } from "@/types/business";
import { PUBLIC_PERSON_SELECT } from "@/lib/data/public/people";

describe("L1.1b person contact contract", () => {
  it("profiles self whitelist no longer includes phone", () => {
    assert.equal(
      (PROFILE_SELF_EDITABLE_FIELDS as readonly string[]).includes("phone"),
      false,
    );
  });

  it("public person select never includes phone or contact_email", () => {
    assert.equal(PUBLIC_PERSON_SELECT.includes("phone"), false);
    assert.equal(PUBLIC_PERSON_SELECT.includes("contact_email"), false);
  });

  it("migration creates network RPC and clears legacy phone", () => {
    const sql = readFileSync(
      join(
        ponteImpreseMigrationsDir(),
        "20260814100000_create_person_contact_channels.sql",
      ),
      "utf8",
    );
    assert.match(sql, /person_contact_channels/);
    assert.match(sql, /person_contact_network_get/);
    assert.match(sql, /person_has_shared_network_contact/);
    assert.match(sql, /share_phone_with_network boolean not null default false/);
    assert.match(sql, /set phone = null/);
  });

  it("follow-up migration forces legacy profiles.phone null", () => {
    const sql = readFileSync(
      join(
        ponteImpreseMigrationsDir(),
        "20260814110000_harden_legacy_profiles_phone.sql",
      ),
      "utf8",
    );
    assert.match(sql, /profiles_phone_must_be_null_chk/);
    assert.match(sql, /check \(phone is null\)/i);
  });
});
