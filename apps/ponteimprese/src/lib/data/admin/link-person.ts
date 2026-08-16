import { mapPostgresError, type AppError } from "@/lib/errors/app-error";
import { createClient } from "@/lib/supabase/server";

/**
 * Adm/Svc Persona link via access_link_person.
 * Adm may link an administrated Account to an existing Persona (verified).
 */
export async function linkPersonToAccount(params: {
  accountId: string;
  personId: string;
}): Promise<{ ok: true; accountId: string } | { ok: false; error: AppError }> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("access_link_person", {
    p_account_id: params.accountId,
    p_person_id: params.personId,
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
