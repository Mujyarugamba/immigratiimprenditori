"use server";

import { redirect } from "next/navigation";
import { getApplicationSession } from "@/lib/session/get-application-session";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type DeletePreflight = {
  can_proceed?: boolean;
  blockers?: string[];
};

export async function deleteOwnAccountAction(formData: FormData): Promise<void> {
  const confirmation = String(formData.get("confirmation") ?? "").trim();
  if (confirmation !== "ELIMINA") {
    redirect("/app/account?error=confirmation");
  }

  const session = await getApplicationSession();
  if (!session?.authUserId || !session.accountId) {
    redirect("/accedi?next=/app/account");
  }

  const supabase = await createClient();
  const { data: preflightData, error: preflightError } = await supabase.rpc(
    "access_self_delete_preflight",
  );
  const preflight = preflightData as DeletePreflight | null;

  if (preflightError || !preflight?.can_proceed) {
    redirect("/app/account?error=blocked");
  }

  const { error: closeError } = await supabase.rpc("access_self_close_account");
  if (closeError) {
    redirect("/app/account?error=blocked");
  }

  const admin = createAdminClient();
  const { error: authDeleteError } = await admin.auth.admin.deleteUser(
    session.authUserId,
  );

  await supabase.auth.signOut();

  if (authDeleteError) {
    redirect("/privacy?account=cleanup");
  }

  redirect("/privacy?account=deleted");
}
