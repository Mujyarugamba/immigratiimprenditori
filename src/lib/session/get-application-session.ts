import { createClient } from "@/lib/supabase/server";
import {
  isAccountStatus,
  isPersonAssociationStatus,
  type ApplicationSession,
  type Viewer,
} from "@/types/access";

type HelperRow = {
  account_id: string | null;
  person_id: string | null;
  is_active: boolean | null;
  is_editor: boolean | null;
  is_admin: boolean | null;
  is_contributor: boolean | null;
};

/**
 * Resolve Auth → Account → Persona → roles for the current request.
 * Uses Access helpers via RPC-style SQL through supabase.rpc where available,
 * falling back to parallel rpc calls.
 */
export async function getApplicationSession(): Promise<ApplicationSession | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const [
    accountIdRes,
    personIdRes,
    activeRes,
    editorRes,
    adminRes,
    contributorRes,
    accountRowRes,
  ] = await Promise.all([
    supabase.rpc("access_current_account_id"),
    supabase.rpc("access_current_person_id"),
    supabase.rpc("access_is_active_account"),
    supabase.rpc("access_is_editor"),
    supabase.rpc("access_is_application_admin"),
    supabase.rpc("access_is_contributor"),
    supabase
      .from("accounts")
      .select("id, account_status, person_id, person_association_status")
      .eq("auth_user_id", user.id)
      .maybeSingle(),
  ]);

  // Prefer helper outputs; fill gaps from accounts row (same RLS self SELECT).
  const accountId =
    (accountIdRes.data as string | null) ?? accountRowRes.data?.id ?? null;
  const associationRaw = accountRowRes.data?.person_association_status ?? null;
  const personAssociationStatus = isPersonAssociationStatus(associationRaw)
    ? associationRaw
    : null;
  const accountPersonId = accountRowRes.data?.person_id ?? null;
  // Access helper is authoritative for operational Persona (excludes contested).
  const personId = (personIdRes.data as string | null) ?? null;
  const statusRaw = accountRowRes.data?.account_status ?? null;
  const accountStatus = isAccountStatus(statusRaw) ? statusRaw : null;

  return {
    authUserId: user.id,
    email: user.email ?? null,
    accountId,
    accountStatus,
    personId,
    accountPersonId,
    personAssociationStatus,
    isActiveAccount: Boolean(activeRes.data),
    isEditor: Boolean(editorRes.data),
    isApplicationAdmin: Boolean(adminRes.data),
    isContributor: Boolean(contributorRes.data),
  };
}

export async function getViewer(): Promise<Viewer> {
  const session = await getApplicationSession();
  if (!session) {
    return { kind: "anonymous" };
  }
  return { kind: "authenticated", session };
}

/** Narrow helper for tests / UI without hitting the network. */
export function buildSessionFromParts(
  parts: Omit<ApplicationSession, "isActiveAccount" | "isContributor"> & {
    isActiveAccount?: boolean;
    isContributor?: boolean;
  },
): ApplicationSession {
  return {
    ...parts,
    accountPersonId: parts.accountPersonId ?? parts.personId ?? null,
    personAssociationStatus: parts.personAssociationStatus ?? null,
    isActiveAccount:
      parts.isActiveAccount ??
      (parts.accountStatus === "active" && parts.personId != null),
    isContributor: parts.isContributor ?? false,
  };
}

// Silence unused type in some tooling contexts
export type { HelperRow };
