import { mapPostgresError, type AppError } from "@/lib/errors/app-error";
import { createClient } from "@/lib/supabase/server";
import type { MembershipListItem } from "@/types/business";

type Row = {
  id: string;
  person_id: string;
  business_id: string;
  role_id: string;
  relation_status: string;
  is_contested: boolean;
  profiles: { display_name: string | null } | { display_name: string | null }[] | null;
  business_membership_management_authorizations:
    | { id: string; authorization_status: string }
    | { id: string; authorization_status: string }[]
    | null;
};

function asOne<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export async function listMembershipsForBusiness(
  businessId: string,
  currentPersonId: string,
): Promise<MembershipListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("business_memberships")
    .select(
      `
      id,
      person_id,
      business_id,
      role_id,
      relation_status,
      is_contested,
      profiles ( display_name ),
      business_membership_management_authorizations ( id, authorization_status )
    `,
    )
    .eq("business_id", businessId)
    .order("created_at", { ascending: true });

  if (error || !data) {
    return [];
  }

  return (data as unknown as Row[]).map((row) => {
    const auth = asOne(row.business_membership_management_authorizations);
    const profile = asOne(row.profiles);
    const grantStatus =
      auth?.authorization_status === "granted"
        ? "granted"
        : auth?.authorization_status === "revoked"
          ? "revoked"
          : "none";
    return {
      id: row.id,
      personId: row.person_id,
      personDisplayName: profile?.display_name ?? null,
      businessId: row.business_id,
      roleId: row.role_id,
      relationStatus: row.relation_status,
      isContested: row.is_contested,
      grantStatus,
      authorizationId: auth?.id ?? null,
      isSelf: row.person_id === currentPersonId,
    };
  });
}

export async function getOwnMembershipForBusiness(
  businessId: string,
  personId: string,
) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("business_memberships")
    .select("id, role_id, relation_status, is_contested")
    .eq("business_id", businessId)
    .eq("person_id", personId)
    .eq("relation_status", "active")
    .maybeSingle();
  return data;
}

/** Self membership create (join). Does not grant management. */
export async function createSelfMembership(input: {
  personId: string;
  businessId: string;
  roleId?: string;
}): Promise<{ ok: true; membershipId: string } | { ok: false; error: AppError }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("business_memberships")
    .insert({
      person_id: input.personId,
      business_id: input.businessId,
      role_id: input.roleId ?? "collaborator",
      editorial_status: "declared",
      relation_status: "active",
    })
    .select("id")
    .single();

  if (error || !data) {
    return { ok: false, error: mapPostgresError(error) };
  }
  return { ok: true, membershipId: data.id };
}

/** Conclude own active membership (self UPDATE under RLS). */
export async function concludeOwnMembership(
  membershipId: string,
  personId: string,
): Promise<{ ok: true } | { ok: false; error: AppError }> {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("business_memberships")
    .update({
      relation_status: "concluded",
      ended_at: today,
      cessation_reason: "Chiusura volontaria dall'area riservata",
    })
    .eq("id", membershipId)
    .eq("person_id", personId)
    .eq("relation_status", "active")
    .select("id")
    .maybeSingle();

  if (error) {
    return { ok: false, error: mapPostgresError(error) };
  }
  if (!data) {
    return {
      ok: false,
      error: {
        code: "not_found",
        message: "Membership non disponibile.",
      },
    };
  }
  return { ok: true };
}
