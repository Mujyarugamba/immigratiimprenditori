import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { ApplicationSession } from "../../types/access";
import {
  destinationForAccountState,
  navFlags,
  needsInitialOnboarding,
  requireActiveAccount,
  requireApplicationAdmin,
  requireAuthenticated,
  requireEditor,
  requireOperationalAccount,
} from "./guards";

function session(
  overrides: Partial<ApplicationSession> = {},
): ApplicationSession {
  return {
    authUserId: "auth-1",
    email: "u@example.com",
    accountId: "acc-1",
    accountStatus: "active",
    personId: "person-1",
    accountPersonId: "person-1",
    personAssociationStatus: "declared",
    isActiveAccount: true,
    isEditor: false,
    isApplicationAdmin: false,
    ...overrides,
  };
}

describe("requireAuthenticated", () => {
  it("1. public / null session → unauthenticated redirect", () => {
    const r = requireAuthenticated(null, "/app");
    assert.equal(r.ok, false);
    if (!r.ok) {
      assert.match(r.redirectTo, /^\/accedi\?next=/);
      assert.equal(r.reason, "unauthenticated");
    }
  });

  it("2. authenticated without Account still passes auth guard", () => {
    const r = requireAuthenticated(
      session({ accountId: null, accountStatus: null, personId: null }),
    );
    assert.equal(r.ok, true);
  });
});

describe("account states", () => {
  it("3. registered without Persona → onboarding", () => {
    const s = session({
      accountStatus: "registered",
      personId: null,
      isActiveAccount: false,
    });
    const r = requireOperationalAccount(s);
    assert.equal(r.ok, false);
    if (!r.ok) assert.equal(r.redirectTo, "/app/onboarding");
  });

  it("4. active with Persona → ok", () => {
    assert.equal(requireOperationalAccount(session()).ok, true);
    assert.equal(requireActiveAccount(session()).ok, true);
  });

  it("5. limited with Persona → operational ok", () => {
    const s = session({
      accountStatus: "limited",
      isActiveAccount: false,
    });
    assert.equal(requireOperationalAccount(s).ok, true);
  });

  it("6. suspended → status page", () => {
    const s = session({
      accountStatus: "suspended",
      isActiveAccount: false,
    });
    const r = requireOperationalAccount(s);
    assert.equal(r.ok, false);
    if (!r.ok) assert.equal(r.redirectTo, "/app/stato/sospeso");
    assert.equal(destinationForAccountState(s), "/app/stato/sospeso");
  });

  it("7. disabled → status page", () => {
    const s = session({
      accountStatus: "disabled",
      isActiveAccount: false,
    });
    const r = requireOperationalAccount(s);
    assert.equal(r.ok, false);
    if (!r.ok) assert.equal(r.redirectTo, "/app/stato/disabilitato");
  });

  it("8. closed → status page", () => {
    const s = session({
      accountStatus: "closed",
      isActiveAccount: false,
    });
    const r = requireOperationalAccount(s);
    assert.equal(r.ok, false);
    if (!r.ok) assert.equal(r.redirectTo, "/app/stato/chiuso");
  });
});

describe("Adm ≠ Red", () => {
  it("ordinary → Red denied", () => {
    const s = session({ isEditor: false, isApplicationAdmin: false });
    assert.equal(requireEditor(s).ok, false);
    assert.equal(navFlags(s).showEditor, false);
  });

  it("ordinary → Adm denied", () => {
    const s = session({ isEditor: false, isApplicationAdmin: false });
    assert.equal(requireApplicationAdmin(s).ok, false);
    assert.equal(navFlags(s).showAdmin, false);
  });

  it("9. Red-only → Red allowed, Adm denied", () => {
    const flags = navFlags(session({ isEditor: true, isApplicationAdmin: false }));
    assert.equal(flags.showEditor, true);
    assert.equal(flags.showAdmin, false);
    assert.equal(requireEditor(session({ isEditor: true })).ok, true);
    assert.equal(
      requireApplicationAdmin(session({ isEditor: true })).ok,
      false,
    );
  });

  it("10. Adm-only → Adm allowed, Red denied", () => {
    const flags = navFlags(
      session({ isEditor: false, isApplicationAdmin: true }),
    );
    assert.equal(flags.showEditor, false);
    assert.equal(flags.showAdmin, true);
    assert.equal(requireEditor(session({ isApplicationAdmin: true })).ok, false);
    assert.equal(
      requireApplicationAdmin(session({ isApplicationAdmin: true })).ok,
      true,
    );
  });

  it("11. Red+Adm → entrambi allowed", () => {
    const s = session({ isEditor: true, isApplicationAdmin: true });
    const flags = navFlags(s);
    assert.equal(flags.showEditor, true);
    assert.equal(flags.showAdmin, true);
    assert.equal(requireEditor(s).ok, true);
    assert.equal(requireApplicationAdmin(s).ok, true);
  });

  it("never combines Adm and Red into a single capability flag", () => {
    const flags = navFlags(
      session({ isEditor: true, isApplicationAdmin: true }),
    );
    assert.equal("showEditor" in flags && "showAdmin" in flags, true);
    assert.equal(
      Object.prototype.hasOwnProperty.call(flags, "showEditorOrAdmin"),
      false,
    );
  });
});

describe("session expiry / protected route", () => {
  it("12. expired session (null) blocked from protected route", () => {
    const r = requireActiveAccount(null, "/app/redazione");
    assert.equal(r.ok, false);
    if (!r.ok) assert.match(r.redirectTo, /accedi/);
  });

  it("13. protected Red route denies non-editor", () => {
    const r = requireEditor(session({ isEditor: false }));
    assert.equal(r.ok, false);
    if (!r.ok) assert.equal(r.redirectTo, "/app/forbidden");
  });
});

describe("14. service-only provisioning boundary (nav/session contract)", () => {
  it("does not invent client can_* flags", () => {
    const flags = navFlags(session());
    assert.deepEqual(Object.keys(flags).sort(), [
      "showAdmin",
      "showApp",
      "showBusinesses",
      "showEditor",
      "showOnboarding",
    ]);
  });

  it("5b. contested association → profilo, not onboarding", () => {
    const s = session({
      personId: null,
      accountPersonId: "person-1",
      personAssociationStatus: "contested",
      isActiveAccount: false,
    });
    const r = requireOperationalAccount(s);
    assert.equal(r.ok, false);
    if (!r.ok) {
      assert.equal(r.redirectTo, "/app/profilo");
      assert.equal(r.reason, "association_contested");
    }
  });
});

describe("P7.1 onboarding navigation", () => {
  it("incomplete account sees Completa il profilo entry", () => {
    const s = session({
      accountStatus: "registered",
      personId: null,
      isActiveAccount: false,
    });
    assert.equal(needsInitialOnboarding(s), true);
    assert.equal(navFlags(s).showOnboarding, true);
  });

  it("active account does not see onboarding in sidebar", () => {
    const s = session();
    assert.equal(s.isActiveAccount, true);
    assert.equal(needsInitialOnboarding(s), false);
    assert.equal(navFlags(s).showOnboarding, false);
  });

  it("completed onboarding destination stays /app (no loop)", () => {
    const s = session();
    assert.equal(destinationForAccountState(s), "/app");
    assert.equal(navFlags(s).showOnboarding, false);
    assert.equal(requireActiveAccount(s).ok, true);
  });

  it("contested does not show onboarding nav", () => {
    const s = session({
      personId: null,
      personAssociationStatus: "contested",
      isActiveAccount: false,
    });
    assert.equal(needsInitialOnboarding(s), false);
    assert.equal(navFlags(s).showOnboarding, false);
  });

  it("dashboard and profilo remain reachable when active", () => {
    const s = session();
    assert.equal(navFlags(s).showApp, true);
    assert.equal(requireOperationalAccount(s).ok, true);
    assert.equal(requireActiveAccount(s).ok, true);
  });
});
