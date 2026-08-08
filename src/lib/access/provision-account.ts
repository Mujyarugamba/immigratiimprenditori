import { mapPostgresError, type AppError } from "@/lib/errors/app-error";
import { createAdminClient } from "@/lib/supabase/admin";

export type ProvisionResult =
  | { ok: true; accountId: string }
  | { ok: false; error: AppError; alreadyExists?: boolean };

/**
 * Server-only Account provisioning via access_provision_account (service_role).
 * Idempotent for callers: if Account already exists, returns conflict (alreadyExists).
 */
export async function provisionAccountForAuthUser(
  authUserId: string,
): Promise<ProvisionResult> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.rpc("access_provision_account", {
      p_auth_user_id: authUserId,
    });

    if (error) {
      const mapped = mapPostgresError(error);
      const alreadyExists =
        mapped.code === "conflict" ||
        (error.message ?? "").toLowerCase().includes("already exists");
      return { ok: false, error: mapped, alreadyExists };
    }

    if (!data || typeof data !== "string") {
      return {
        ok: false,
        error: {
          code: "unexpected",
          message: "Provisioning Account non riuscito.",
        },
      };
    }

    return { ok: true, accountId: data };
  } catch (cause) {
    return {
      ok: false,
      error: {
        code: "unexpected",
        message: "Provisioning Account non riuscito.",
        cause,
      },
    };
  }
}
