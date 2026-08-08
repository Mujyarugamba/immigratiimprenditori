import { mapPostgresError, type AppError } from "@/lib/errors/app-error";
import { createClient } from "@/lib/supabase/server";

/**
 * Adm/Svc first grant. Ordinary users must not call successfully.
 * Uses session client — RPC enforces Adm internally (no service-role bypass).
 */
export async function bootstrapBusinessGrant(
  membershipId: string,
): Promise<{ ok: true; authorizationId: string } | { ok: false; error: AppError }> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("access_bootstrap_business_grant", {
    p_membership_id: membershipId,
  });
  if (error) {
    return { ok: false, error: mapPostgresError(error) };
  }
  if (!data || typeof data !== "string") {
    return {
      ok: false,
      error: { code: "unexpected", message: "Bootstrap grant non riuscito." },
    };
  }
  return { ok: true, authorizationId: data };
}

/** Subsequent grant by ACT/Adm — never self. */
export async function grantBusinessManagement(
  membershipId: string,
): Promise<{ ok: true; authorizationId: string } | { ok: false; error: AppError }> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("grant_business_management", {
    p_membership_id: membershipId,
  });
  if (error) {
    return { ok: false, error: mapPostgresError(error) };
  }
  if (!data || typeof data !== "string") {
    return {
      ok: false,
      error: { code: "unexpected", message: "Grant non riuscito." },
    };
  }
  return { ok: true, authorizationId: data };
}

/** Soft revoke by authorization id (not membership id). */
export async function revokeBusinessManagement(
  authorizationId: string,
): Promise<{ ok: true; authorizationId: string } | { ok: false; error: AppError }> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("revoke_business_management", {
    p_authorization_id: authorizationId,
  });
  if (error) {
    return { ok: false, error: mapPostgresError(error) };
  }
  if (!data || typeof data !== "string") {
    return {
      ok: false,
      error: { code: "unexpected", message: "Revoca non riuscita." },
    };
  }
  return { ok: true, authorizationId: data };
}
