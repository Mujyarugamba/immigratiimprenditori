import { provisionAccountForAuthUser } from "@/lib/access/provision-account";
import { createClient } from "@/lib/supabase/server";

/**
 * Ensure the current auth user has an Account row.
 * Uses service-role RPC only when missing; safe to call on every login.
 */
export async function ensureAccountProvisioned(authUserId: string): Promise<{
  accountId: string | null;
  provisionedNow: boolean;
  errorMessage?: string;
}> {
  const supabase = await createClient();
  const existing = await supabase
    .from("accounts")
    .select("id")
    .eq("auth_user_id", authUserId)
    .maybeSingle();

  if (existing.data?.id) {
    return { accountId: existing.data.id, provisionedNow: false };
  }

  const result = await provisionAccountForAuthUser(authUserId);
  if (result.ok) {
    return { accountId: result.accountId, provisionedNow: true };
  }

  if (result.alreadyExists) {
    const again = await supabase
      .from("accounts")
      .select("id")
      .eq("auth_user_id", authUserId)
      .maybeSingle();
    return {
      accountId: again.data?.id ?? null,
      provisionedNow: false,
    };
  }

  return {
    accountId: null,
    provisionedNow: false,
    errorMessage: result.error.message,
  };
}
