import { mapPostgresError, type AppError } from "@/lib/errors/app-error";
import { createClient } from "@/lib/supabase/server";
import type { WhitelistedApplicationRole } from "@/lib/admin/labels";

export type RoleAssignmentListItem = {
  id: string;
  account_id: string;
  role_code: WhitelistedApplicationRole;
  assignment_status: "active" | "revoked";
  assigned_at: string;
  revoked_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ListRoleAssignmentsParams = {
  role?: WhitelistedApplicationRole | "";
  status?: "active" | "revoked" | "";
  accountId?: string;
};

export async function listRoleAssignments(
  params: ListRoleAssignmentsParams = {},
): Promise<RoleAssignmentListItem[]> {
  const supabase = await createClient();
  let query = supabase
    .from("account_role_assignments")
    .select(
      "id, account_id, role_code, assignment_status, assigned_at, revoked_at, created_at, updated_at",
    )
    .order("assigned_at", { ascending: false });

  if (params.role) {
    query = query.eq("role_code", params.role);
  }
  if (params.status) {
    query = query.eq("assignment_status", params.status);
  }
  if (params.accountId) {
    query = query.eq("account_id", params.accountId);
  }

  const { data } = await query;
  return (data ?? []) as RoleAssignmentListItem[];
}

export type RoleCountByCode = Record<WhitelistedApplicationRole, number>;

export async function countActiveRolesByCode(): Promise<RoleCountByCode> {
  const supabase = await createClient();
  const roles: WhitelistedApplicationRole[] = [
    "redattore",
    "amministratore_applicativo",
  ];

  const results = await Promise.all(
    roles.map(async (role_code) => {
      const { count } = await supabase
        .from("account_role_assignments")
        .select("id", { count: "exact", head: true })
        .eq("role_code", role_code)
        .eq("assignment_status", "active");
      return [role_code, count ?? 0] as const;
    }),
  );

  return Object.fromEntries(results) as RoleCountByCode;
}

export async function assignRole(
  accountId: string,
  roleCode: WhitelistedApplicationRole,
): Promise<
  { ok: true; assignmentId: string } | { ok: false; error: AppError }
> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("assign_application_role", {
    p_account_id: accountId,
    p_role_code: roleCode,
  });

  if (error) {
    return { ok: false, error: mapPostgresError(error) };
  }

  if (!data || typeof data !== "string") {
    return {
      ok: false,
      error: { code: "unexpected", message: "Assegnazione ruolo non riuscita." },
    };
  }

  return { ok: true, assignmentId: data };
}

export async function revokeRole(
  assignmentId: string,
): Promise<
  { ok: true; assignmentId: string } | { ok: false; error: AppError }
> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("revoke_application_role", {
    p_assignment_id: assignmentId,
  });

  if (error) {
    return { ok: false, error: mapPostgresError(error) };
  }

  if (!data || typeof data !== "string") {
    return {
      ok: false,
      error: { code: "unexpected", message: "Revoca ruolo non riuscita." },
    };
  }

  return { ok: true, assignmentId: data };
}
