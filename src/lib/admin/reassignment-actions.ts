"use server";

import { revalidatePath } from "next/cache";
import { toUserMessage, type AppError } from "@/lib/errors/app-error";
import { getApplicationSession } from "@/lib/session/get-application-session";
import { requireApplicationAdmin } from "@/lib/session/guards";
import { createClient } from "@/lib/supabase/server";

export type FormActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
};

async function requireAdminSession() {
  const session = await getApplicationSession();
  const guard = requireApplicationAdmin(session);
  if (!guard.ok || !session?.accountId) {
    return {
      ok: false as const,
      message: "Solo Amministratore applicativo può eseguire l'operazione.",
    };
  }
  return { ok: true as const, session };
}

export async function resolveBusinessReassignmentAction(
  _prev: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const gate = await requireAdminSession();
  if (!gate.ok) return { ok: false, message: gate.message };

  const caseId = String(formData.get("case_id") ?? "").trim();
  const membershipId = String(formData.get("membership_id") ?? "").trim();
  if (!caseId || !membershipId) {
    return {
      ok: false,
      message: "Identificativo caso e collegamento impresa obbligatori.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("access_resolve_business_reassignment", {
    p_case_id: caseId,
    p_membership_id: membershipId,
  });
  if (error) {
    return {
      ok: false,
      message: toUserMessage({
        code: "forbidden",
        message: error.message,
      } as AppError),
    };
  }

  revalidatePath("/app/amministrazione/riassegnazioni");
  return { ok: true, message: "Gestione impresa riassegnata." };
}

export async function resolveOrganizationReassignmentAction(
  _prev: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const gate = await requireAdminSession();
  if (!gate.ok) return { ok: false, message: gate.message };

  const caseId = String(formData.get("case_id") ?? "").trim();
  const personId = String(formData.get("new_owner_person_id") ?? "").trim();
  if (!caseId || !personId) {
    return {
      ok: false,
      message: "Identificativo caso e profilo obbligatori.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc(
    "access_resolve_organization_reassignment",
    {
      p_case_id: caseId,
      p_new_owner_person_id: personId,
    },
  );
  if (error) {
    return {
      ok: false,
      message: toUserMessage({
        code: "forbidden",
        message: error.message,
      } as AppError),
    };
  }

  revalidatePath("/app/amministrazione/riassegnazioni");
  return { ok: true, message: "Titolare organizzazione aggiornato." };
}
