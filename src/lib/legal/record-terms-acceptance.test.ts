import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildSignupTermsAcceptancePayload,
  parseTermsAcceptedFromForm,
  TERMS_ACCEPTANCE_METADATA_KEY,
  TERMS_ACCEPTANCE_REQUIRED_MESSAGE,
  termsVersionFromUserMetadata,
  signupTermsMetadata,
} from "@/lib/legal/record-terms-acceptance";
import { TERMS_OF_USE_VERSION } from "@/lib/legal/versions";

describe("M1 terms acceptance signup contract", () => {
  it("requires checkbox server-side (manipulated client cannot skip)", () => {
    const empty = new FormData();
    assert.equal(parseTermsAcceptedFromForm(empty), false);

    const off = new FormData();
    off.set("accept_terms", "off");
    assert.equal(parseTermsAcceptedFromForm(off), false);

    const on = new FormData();
    on.set("accept_terms", "on");
    assert.equal(parseTermsAcceptedFromForm(on), true);
  });

  it("uses versions.ts as sole version source of truth", () => {
    assert.ok(TERMS_OF_USE_VERSION.length >= 10);
    assert.match(TERMS_OF_USE_VERSION, /^\d{4}-\d{2}-\d{2}$/);
    const payload = buildSignupTermsAcceptancePayload(
      "11111111-1111-1111-1111-111111111111",
    );
    assert.equal(payload.document_version, TERMS_OF_USE_VERSION);
    assert.equal(payload.document_kind, "terms_of_use");
    assert.equal(payload.acceptance_channel, "signup");
    assert.equal(
      Object.prototype.hasOwnProperty.call(payload, "accepted_at"),
      false,
    );
  });

  it("insert payload never includes accepted_at or privacy consent fields", () => {
    const payload = buildSignupTermsAcceptancePayload(
      "22222222-2222-2222-2222-222222222222",
    );
    const keys = Object.keys(payload).sort();
    assert.deepEqual(keys, [
      "acceptance_channel",
      "account_id",
      "document_kind",
      "document_version",
    ]);
    assert.equal("privacy_accepted" in payload, false);
    assert.equal(JSON.stringify(payload).includes("privacy"), false);
  });

  it("signup metadata carries terms version intent (not Privacy consent)", () => {
    const meta = signupTermsMetadata();
    assert.equal(meta[TERMS_ACCEPTANCE_METADATA_KEY], TERMS_OF_USE_VERSION);
    assert.equal("privacy_accepted" in meta, false);
    assert.equal(TERMS_ACCEPTANCE_REQUIRED_MESSAGE.includes("Privacy"), false);
  });

  it("treats unique violation as idempotent success", async () => {
    const { recordSignupTermsAcceptance } = await import(
      "@/lib/legal/record-terms-acceptance"
    );
    const supabase = {
      from() {
        return {
          insert: async () => ({
            error: { code: "23505", message: "duplicate key value" },
          }),
        };
      },
    };
    const result = await recordSignupTermsAcceptance(
      supabase as never,
      "33333333-3333-3333-3333-333333333333",
    );
    assert.equal(result.ok, true);
  });

  it("does not hide non-unique insert errors", async () => {
    const { recordSignupTermsAcceptance } = await import(
      "@/lib/legal/record-terms-acceptance"
    );
    const supabase = {
      from() {
        return {
          insert: async () => ({
            error: { code: "42501", message: "permission denied" },
          }),
        };
      },
    };
    const result = await recordSignupTermsAcceptance(
      supabase as never,
      "44444444-4444-4444-4444-444444444444",
    );
    assert.equal(result.ok, false);
    if (result.ok) throw new Error("unreachable");
    assert.equal(result.message.includes("terms_acceptances"), false);
    assert.equal(result.message.includes("42501"), false);
  });
});
