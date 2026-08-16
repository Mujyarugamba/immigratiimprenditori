import { pickBusinessActUpdate } from "@/lib/business/whitelist";
import { mapPostgresError, type AppError } from "@/lib/errors/app-error";
import { createClient } from "@/lib/supabase/server";
import {
  BUSINESS_ACT_EDITABLE_FIELDS,
  type BusinessActUpdate,
  type BusinessListItem,
  type BusinessRow,
} from "@/types/business";

export { pickBusinessActUpdate };

const BUSINESS_SELECT =
  "id, legal_name, public_name, summary, description, organization_form, size_band, founding_year, substantial_status, editorial_status, publication_status, administrative_status, is_archived, deleted_at";

type MembershipJoinRow = {
  id: string;
  role_id: string;
  relation_status: string;
  business_id: string;
  businesses: BusinessRow | BusinessRow[] | null;
  business_membership_management_authorizations:
    | {
        id: string;
        authorization_status: string;
      }
    | {
        id: string;
        authorization_status: string;
      }[]
    | null;
};

function asOne<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

/**
 * List Impresa in contesto (CTX) for the current Persona via self memberships.
 * ACT is derived from management authorization status, not from role_id.
 */
export async function listMyBusinesses(
  personId: string,
): Promise<BusinessListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("business_memberships")
    .select(
      `
      id,
      role_id,
      relation_status,
      business_id,
      businesses ( ${BUSINESS_SELECT} ),
      business_membership_management_authorizations ( id, authorization_status )
    `,
    )
    .eq("person_id", personId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  const items: BusinessListItem[] = [];
  for (const row of data as unknown as MembershipJoinRow[]) {
    const business = asOne(row.businesses);
    if (!business || business.deleted_at) continue;
    const auth = asOne(row.business_membership_management_authorizations);
    const isMember = row.relation_status === "active";
    const grantStatus =
      auth?.authorization_status === "granted"
        ? "granted"
        : auth?.authorization_status === "revoked"
          ? "revoked"
          : "none";
    const canManage = isMember && grantStatus === "granted";

    items.push({
      business: {
        id: business.id,
        legal_name: business.legal_name,
        public_name: business.public_name,
        summary: business.summary,
        publication_status: business.publication_status,
        editorial_status: business.editorial_status,
        substantial_status: business.substantial_status,
      },
      membershipId: row.id,
      roleId: row.role_id,
      relationStatus: row.relation_status,
      isMember,
      canManage,
      grantStatus,
      authorizationId: auth?.id ?? null,
    });
  }
  return items;
}

export async function getBusinessById(
  businessId: string,
): Promise<BusinessRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("businesses")
    .select(BUSINESS_SELECT)
    .eq("id", businessId)
    .maybeSingle();
  if (error || !data) return null;
  return data as BusinessRow;
}

export async function getBusinessCapabilitiesFromDb(businessId: string) {
  const supabase = await createClient();
  const [ctx, act] = await Promise.all([
    supabase.rpc("access_has_active_business_membership", {
      p_business_id: businessId,
    }),
    supabase.rpc("access_can_act_for_business", {
      p_business_id: businessId,
    }),
  ]);
  return {
    isMember: Boolean(ctx.data),
    canManage: Boolean(act.data),
  };
}

export async function updateBusinessAsManager(
  businessId: string,
  patch: BusinessActUpdate,
): Promise<{ ok: true } | { ok: false; error: AppError }> {
  const allowed: BusinessActUpdate = {};
  for (const key of BUSINESS_ACT_EDITABLE_FIELDS) {
    if (key in patch) {
      (allowed as Record<string, unknown>)[key] =
        patch[key as keyof BusinessActUpdate];
    }
  }
  if (Object.keys(allowed).length === 0) {
    return {
      ok: false,
      error: {
        code: "validation",
        message: "Nessun campo modificabile fornito.",
      },
    };
  }

  // Defense in depth: never accept id/ownership-like keys from client payloads.
  const supabase = await createClient();
  const { error } = await supabase
    .from("businesses")
    .update(allowed)
    .eq("id", businessId);

  if (error) {
    return { ok: false, error: mapPostgresError(error) };
  }
  return { ok: true };
}

export type CreateBusinessInput = {
  legal_name: string;
  public_name: string;
  summary?: string | null;
  role_id?: string;
};

/**
 * Create Impresa + self membership.
 * INSERT ≠ grant: creator gets CTX only until Adm bootstrap.
 */
export async function createBusinessWithSelfMembership(
  personId: string,
  input: CreateBusinessInput,
): Promise<
  | { ok: true; businessId: string; membershipId: string }
  | { ok: false; error: AppError }
> {
  const legal = input.legal_name.trim();
  const pub = input.public_name.trim();
  if (!legal || !pub) {
    return {
      ok: false,
      error: {
        code: "validation",
        message: "Nome legale e nome pubblico sono obbligatori.",
      },
    };
  }

  // Client UUID: INSERT is allowed (Acc+Per) but RETURNING/SELECT is not until
  // CTX membership exists (default publication_status=unpublished).
  const businessId = crypto.randomUUID();
  const supabase = await createClient();
  const { error: bErr } = await supabase.from("businesses").insert({
    id: businessId,
    legal_name: legal,
    public_name: pub,
    summary: input.summary?.trim() || null,
  });

  if (bErr) {
    return { ok: false, error: mapPostgresError(bErr) };
  }

  const roleId = input.role_id?.trim() || "founder";
  const { data: membership, error: mErr } = await supabase
    .from("business_memberships")
    .insert({
      person_id: personId,
      business_id: businessId,
      role_id: roleId,
      editorial_status: "declared",
      relation_status: "active",
    })
    .select("id")
    .single();

  if (mErr || !membership) {
    return {
      ok: false,
      error: mapPostgresError(mErr ?? {
        message: "Membership non creata dopo insert Impresa.",
      }),
    };
  }

  return {
    ok: true,
    businessId,
    membershipId: membership.id,
  };
}
