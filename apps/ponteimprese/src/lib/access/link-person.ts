import { mapPostgresError, type AppError } from "@/lib/errors/app-error";
import { createClient } from "@/lib/supabase/server";

export type LinkPersonResult =
  | { ok: true; accountId: string }
  | { ok: false; error: AppError };

/**
 * Self-service Persona link via access_link_person.
 * Contract: ordinary caller may only link own Account to person_id = auth.uid()
 * (Persona row created by handle_new_user trigger on signup).
 */
export async function linkOwnPerson(params: {
  accountId: string;
  authUserId: string;
}): Promise<LinkPersonResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("access_link_person", {
    p_account_id: params.accountId,
    p_person_id: params.authUserId,
  });

  if (error) {
    return { ok: false, error: mapPostgresError(error) };
  }

  if (!data || typeof data !== "string") {
    return {
      ok: false,
      error: {
        code: "unexpected",
        message: "Collegamento Persona non riuscito.",
      },
    };
  }

  return { ok: true, accountId: data };
}
