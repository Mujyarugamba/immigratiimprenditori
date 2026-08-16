import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  SELF_DELETE_CONFIRM_PHRASE,
  SELF_DELETE_USER_COPY,
  parseSelfDeletePreflight,
  selfDeleteBlockerMessage,
} from "./self-delete";

describe("M3 self-delete contract", () => {
  it("requires strong confirmation phrase CANCELLA", () => {
    assert.equal(SELF_DELETE_CONFIRM_PHRASE, "CANCELLA");
  });

  it("exposes privacy link and human copy without DB jargon", () => {
    assert.equal(SELF_DELETE_USER_COPY.privacyHref, "/privacy");
    assert.match(SELF_DELETE_USER_COPY.summary, /profilo|account/i);
    assert.doesNotMatch(
      SELF_DELETE_USER_COPY.summary,
      /M2|subject_ref|RPC|tombstone|soft-close/i,
    );
  });

  it("after M4, orphan managers do not block self-delete", () => {
    const p = parseSelfDeletePreflight({
      account_id: "11111111-1111-1111-1111-111111111111",
      account_status: "active",
      can_proceed: true,
      blockers: [],
      orphan_business_ids: ["22222222-2222-2222-2222-222222222222"],
      orphan_organization_ids: [],
      last_business_ids: ["22222222-2222-2222-2222-222222222222"],
      sole_organization_ids: [],
      m4_required: false,
      m4_cases_will_open: true,
    });
    assert.ok(p);
    assert.equal(p.can_proceed, true);
    assert.equal(p.m4_cases_will_open, true);
    assert.equal(selfDeleteBlockerMessage(p), null);
  });

  it("messages last admin as the only hard blocker", () => {
    const p = parseSelfDeletePreflight({
      account_id: "11111111-1111-1111-1111-111111111111",
      account_status: "active",
      can_proceed: false,
      blockers: ["last_application_admin"],
      orphan_business_ids: [],
      orphan_organization_ids: [],
      last_business_ids: [],
      sole_organization_ids: [],
      m4_required: false,
      m4_cases_will_open: false,
    });
    assert.ok(p);
    assert.equal(selfDeleteBlockerMessage(p), SELF_DELETE_USER_COPY.blockedLastAdmin);
  });
});
