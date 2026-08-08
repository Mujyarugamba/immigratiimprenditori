import { createClient } from "@/lib/supabase/server";
import { isAccountStatus, type AccountStatus } from "@/types/access";

export type AccountRow = {
  id: string;
  auth_user_id: string;
  person_id: string | null;
  account_status: AccountStatus | null;
};

export async function getAccountByAuthUserId(
  authUserId: string,
): Promise<AccountRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("accounts")
    .select("id, auth_user_id, person_id, account_status")
    .eq("auth_user_id", authUserId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    auth_user_id: data.auth_user_id,
    person_id: data.person_id,
    account_status: isAccountStatus(data.account_status)
      ? data.account_status
      : null,
  };
}
