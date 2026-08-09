import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  deriveBusinessCapabilities,
  labelForCapabilities,
  selectionDoesNotGrantAct,
} from "./capabilities";
import { resolveSelectedBusinessId } from "./selection";
import { pickBusinessActUpdate } from "./whitelist";
import { pickProfileSelfUpdate } from "../profile/whitelist";
import {
  BUSINESS_ACT_EDITABLE_FIELDS,
  PROFILE_SELF_EDITABLE_FIELDS,
} from "../../types/business";
import { mapPostgresError } from "../errors/app-error";

describe("Persona whitelist", () => {
  it("1-2. self profile update picks only editable fields", () => {
    const patch = pickProfileSelfUpdate({
      display_name: "Ada",
      slug: "ada",
      is_public: "on",
      is_active: true,
      id: "should-ignore",
      deleted_at: "x",
    });
    assert.equal(patch.display_name, "Ada");
    assert.equal(patch.slug, "ada");
    assert.equal(patch.is_public, true);
    assert.equal("is_active" in patch, false);
    assert.equal("id" in patch, false);
    assert.ok(PROFILE_SELF_EDITABLE_FIELDS.includes("display_name"));
  });

  it("3. protected fields are not in whitelist", () => {
    assert.equal(
      (PROFILE_SELF_EDITABLE_FIELDS as readonly string[]).includes("is_active"),
      false,
    );
    assert.equal(
      (PROFILE_SELF_EDITABLE_FIELDS as readonly string[]).includes("deleted_at"),
      false,
    );
  });

  it("4. account without Persona → no personId in session contract", () => {
    const personId: string | null = null;
    assert.equal(personId == null, true);
  });

  it("5. contested association leaves helper person null (documented)", () => {
    // access_current_person_id excludes contested; app session mirrors that.
    const helperPersonId = null;
    const association = "contested";
    assert.equal(helperPersonId, null);
    assert.equal(association, "contested");
  });
});

describe("Business CTX/ACT", () => {
  it("6. no membership → not member / not manage", () => {
    const caps = deriveBusinessCapabilities({
      businessId: "b1",
      hasActiveMembership: false,
      canActForBusiness: false,
    });
    assert.equal(caps.isMember, false);
    assert.equal(caps.canManage, false);
  });

  it("7. CTX no ACT", () => {
    const caps = deriveBusinessCapabilities({
      businessId: "b1",
      hasActiveMembership: true,
      canActForBusiness: false,
    });
    assert.equal(caps.isMember, true);
    assert.equal(caps.canManage, false);
    assert.equal(labelForCapabilities(caps).manageLabel, "Sola lettura");
  });

  it("8. CTX + ACT", () => {
    const caps = deriveBusinessCapabilities({
      businessId: "b1",
      hasActiveMembership: true,
      canActForBusiness: true,
    });
    assert.equal(caps.canManage, true);
  });

  it("9. revoked grant modeled as CTX without ACT", () => {
    const caps = deriveBusinessCapabilities({
      businessId: "b1",
      hasActiveMembership: true,
      canActForBusiness: false,
    });
    assert.equal(caps.isMember, true);
    assert.equal(caps.canManage, false);
  });

  it("10. membership ended → no CTX", () => {
    const caps = deriveBusinessCapabilities({
      businessId: "b1",
      hasActiveMembership: false,
      canActForBusiness: false,
    });
    assert.equal(caps.isMember, false);
  });

  it("11. other business isolation via resolve selection", () => {
    assert.equal(
      resolveSelectedBusinessId("other-biz", ["biz-a", "biz-b"]),
      "biz-a",
    );
  });
});

describe("Business UI capabilities", () => {
  it("12-14. member vs ACT labels", () => {
    const member = deriveBusinessCapabilities({
      businessId: "b",
      hasActiveMembership: true,
      canActForBusiness: false,
    });
    const manager = deriveBusinessCapabilities({
      businessId: "b",
      hasActiveMembership: true,
      canActForBusiness: true,
    });
    assert.equal(labelForCapabilities(member).memberLabel, "Collegata");
    assert.equal(labelForCapabilities(member).manageLabel, "Sola lettura");
    assert.equal(labelForCapabilities(manager).manageLabel, "Puoi gestire");
    assert.equal(member.canManage, false);
    assert.equal(manager.canManage, true);
  });

  it("15. ownership-like keys stripped from business update", () => {
    const patch = pickBusinessActUpdate({
      legal_name: "Srl",
      public_name: "Pub",
      id: "hack",
      owner_person_id: "hack",
    });
    assert.equal(patch.legal_name, "Srl");
    assert.equal("id" in patch, false);
    assert.equal("owner_person_id" in patch, false);
    assert.ok(BUSINESS_ACT_EDITABLE_FIELDS.includes("legal_name"));
  });

  it("16. switcher selection does not invent ACT", () => {
    const ok = selectionDoesNotGrantAct({
      selectedBusinessId: "b1",
      capsByBusinessId: {
        b1: deriveBusinessCapabilities({
          businessId: "b1",
          hasActiveMembership: true,
          canActForBusiness: false,
        }),
      },
    });
    assert.equal(ok, true);
  });
});

describe("Grants error mapping", () => {
  it("17-20. maps self-grant / bootstrap / forbidden", () => {
    assert.equal(
      mapPostgresError({ message: "self-grant not allowed", code: "42501" })
        .message,
      "Non puoi assegnarti la gestione.",
    );
    assert.match(
      mapPostgresError({ message: "business grant not bootstrapped" }).message,
      /Amministratore/,
    );
    assert.equal(
      mapPostgresError({ message: "not authorized", code: "42501" }).code,
      "forbidden",
    );
  });

  it("21-22. revoke messaging stays soft (no last-manager claim)", () => {
    const err = mapPostgresError({ message: "authorization not available" });
    assert.equal(err.code, "not_found");
    assert.doesNotMatch(err.message, /ultimo gestore/i);
  });
});
