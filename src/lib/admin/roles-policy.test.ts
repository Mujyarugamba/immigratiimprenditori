import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { WHITELISTED_APPLICATION_ROLES } from "./labels";

/** Pure policy mirror of assignRoleAction UX + RPC whitelist. */
function canAssignRoleUx(params: {
  actorIsAdmin: boolean;
  actorAccountId: string;
  targetAccountId: string;
  roleCode: string;
}): { ok: boolean; reason?: string } {
  if (!params.actorIsAdmin) {
    return { ok: false, reason: "not_admin" };
  }
  if (
    !(WHITELISTED_APPLICATION_ROLES as readonly string[]).includes(
      params.roleCode,
    )
  ) {
    return { ok: false, reason: "role_not_allowed" };
  }
  if (params.actorAccountId === params.targetAccountId) {
    return { ok: false, reason: "self_elevate" };
  }
  return { ok: true };
}

describe("admin roles policy (Adm ≠ Red, no self-elevate)", () => {
  it("whitelist is exactly redattore + amministratore_applicativo", () => {
    assert.deepEqual([...WHITELISTED_APPLICATION_ROLES].sort(), [
      "amministratore_applicativo",
      "redattore",
    ]);
  });

  it("ordinary cannot assign", () => {
    const r = canAssignRoleUx({
      actorIsAdmin: false,
      actorAccountId: "a1",
      targetAccountId: "a2",
      roleCode: "redattore",
    });
    assert.equal(r.ok, false);
    assert.equal(r.reason, "not_admin");
  });

  it("Adm can assign Red to other account", () => {
    const r = canAssignRoleUx({
      actorIsAdmin: true,
      actorAccountId: "adm",
      targetAccountId: "other",
      roleCode: "redattore",
    });
    assert.equal(r.ok, true);
  });

  it("Adm can assign Adm to other account", () => {
    const r = canAssignRoleUx({
      actorIsAdmin: true,
      actorAccountId: "adm",
      targetAccountId: "other",
      roleCode: "amministratore_applicativo",
    });
    assert.equal(r.ok, true);
  });

  it("self-elevate denied in UX policy", () => {
    const r = canAssignRoleUx({
      actorIsAdmin: true,
      actorAccountId: "adm",
      targetAccountId: "adm",
      roleCode: "redattore",
    });
    assert.equal(r.ok, false);
    assert.equal(r.reason, "self_elevate");
  });

  it("unknown role denied", () => {
    const r = canAssignRoleUx({
      actorIsAdmin: true,
      actorAccountId: "adm",
      targetAccountId: "other",
      roleCode: "superuser",
    });
    assert.equal(r.ok, false);
    assert.equal(r.reason, "role_not_allowed");
  });
});
