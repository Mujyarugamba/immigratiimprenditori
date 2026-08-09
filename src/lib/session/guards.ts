import type { AccountStatus, ApplicationSession } from "@/types/access";

export type GuardResult =
  | { ok: true }
  | { ok: false; redirectTo: string; reason: string };

/** Where to send a user based on Account lifecycle (UX only; RLS remains authority). */
export function destinationForAccountState(
  session: ApplicationSession,
): string {
  if (!session.accountId || !session.accountStatus) {
    return "/app/onboarding";
  }

  switch (session.accountStatus as AccountStatus) {
    case "registered":
    case "limited":
      if (!session.personId) {
        return "/app/onboarding";
      }
      return "/app";
    case "active":
      return "/app";
    case "suspended":
      return "/app/stato/sospeso";
    case "disabled":
      return "/app/stato/disabilitato";
    case "closed":
      return "/app/stato/chiuso";
    default:
      return "/app/onboarding";
  }
}

export function requireAuthenticated(
  session: ApplicationSession | null,
  nextPath = "/app",
): GuardResult {
  if (!session) {
    const q = encodeURIComponent(nextPath);
    return {
      ok: false,
      redirectTo: `/accedi?next=${q}`,
      reason: "unauthenticated",
    };
  }
  return { ok: true };
}

export function requireOperationalAccount(
  session: ApplicationSession | null,
  nextPath = "/app",
): GuardResult {
  const auth = requireAuthenticated(session, nextPath);
  if (!auth.ok || !session) {
    return auth;
  }

  if (!session.accountId || !session.accountStatus) {
    return {
      ok: false,
      redirectTo: "/app/onboarding",
      reason: "missing_account",
    };
  }

  if (session.accountStatus === "suspended") {
    return {
      ok: false,
      redirectTo: "/app/stato/sospeso",
      reason: "suspended",
    };
  }
  if (session.accountStatus === "disabled") {
    return {
      ok: false,
      redirectTo: "/app/stato/disabilitato",
      reason: "disabled",
    };
  }
  if (session.accountStatus === "closed") {
    return {
      ok: false,
      redirectTo: "/app/stato/chiuso",
      reason: "closed",
    };
  }

  if (session.personAssociationStatus === "contested") {
    return {
      ok: false,
      redirectTo: "/app/profilo",
      reason: "association_contested",
    };
  }

  if (
    (session.accountStatus === "registered" ||
      session.accountStatus === "limited") &&
    !session.personId
  ) {
    return {
      ok: false,
      redirectTo: "/app/onboarding",
      reason: "needs_onboarding",
    };
  }

  if (!session.personId) {
    return {
      ok: false,
      redirectTo: "/app/onboarding",
      reason: "missing_persona",
    };
  }

  return { ok: true };
}

/** Active Account with linked Persona (isActiveAccount helper true). */
export function requireActiveAccount(
  session: ApplicationSession | null,
  nextPath = "/app",
): GuardResult {
  const base = requireOperationalAccount(session, nextPath);
  if (!base.ok || !session) {
    return base;
  }
  if (!session.isActiveAccount) {
    return {
      ok: false,
      redirectTo: destinationForAccountState(session),
      reason: "not_active",
    };
  }
  return { ok: true };
}

export function requireEditor(session: ApplicationSession | null): GuardResult {
  const base = requireActiveAccount(session, "/app/redazione");
  if (!base.ok || !session) {
    return base;
  }
  if (!session.isEditor) {
    return { ok: false, redirectTo: "/app/forbidden", reason: "not_editor" };
  }
  return { ok: true };
}

export function requireApplicationAdmin(
  session: ApplicationSession | null,
): GuardResult {
  const base = requireActiveAccount(session, "/app/amministrazione");
  if (!base.ok || !session) {
    return base;
  }
  if (!session.isApplicationAdmin) {
    return { ok: false, redirectTo: "/app/forbidden", reason: "not_admin" };
  }
  return { ok: true };
}

function isTerminalAccountStatus(
  status: AccountStatus | string | null | undefined,
): boolean {
  return (
    status === "suspended" || status === "disabled" || status === "closed"
  );
}

/**
 * Initial onboarding still required for the reserved area.
 * Authoritative completion = access_is_active_account() → session.isActiveAccount.
 * Contested / terminal accounts use other destinations (profilo / stato).
 */
export function needsInitialOnboarding(
  session: ApplicationSession | null,
): boolean {
  if (!session) return false;
  if (session.personAssociationStatus === "contested") return false;
  if (isTerminalAccountStatus(session.accountStatus)) return false;
  return !session.isActiveAccount;
}

/** Navigation visibility — never combine Adm and Red into a single flag. */
export function navFlags(session: ApplicationSession | null) {
  const contested = session?.personAssociationStatus === "contested";
  return {
    showApp: session != null,
    showOnboarding: needsInitialOnboarding(session),
    showBusinesses: Boolean(session?.personId && !contested),
    showEditor: Boolean(session?.isEditor),
    showAdmin: Boolean(session?.isApplicationAdmin),
  };
}
