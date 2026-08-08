"use server";

import { revalidatePath } from "next/cache";
import { updateOwnPersona } from "@/lib/data/authenticated/persona";
import { pickProfileSelfUpdate } from "@/lib/profile/whitelist";
import { toUserMessage, type AppError } from "@/lib/errors/app-error";
import { getApplicationSession } from "@/lib/session/get-application-session";

export type FormActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
};

export async function updateProfileAction(
  _prev: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const session = await getApplicationSession();
  if (!session) {
    return { ok: false, message: "Sessione scaduta. Accedi di nuovo." };
  }
  if (session.personAssociationStatus === "contested") {
    return {
      ok: false,
      message: "Associazione Persona contestata: modifica non disponibile.",
    };
  }
  if (!session.personId || !session.isActiveAccount) {
    return {
      ok: false,
      message: "Account non operativo per modificare il profilo.",
    };
  }

  const raw = Object.fromEntries(formData.entries());
  const patch = pickProfileSelfUpdate(raw);

  if (!patch.display_name?.trim()) {
    return {
      ok: false,
      message: "Il nome visualizzato è obbligatorio.",
      fieldErrors: { display_name: "Obbligatorio" },
    };
  }
  if (!patch.slug?.trim()) {
    return {
      ok: false,
      message: "Lo slug è obbligatorio.",
      fieldErrors: { slug: "Obbligatorio" },
    };
  }

  const result = await updateOwnPersona(session.personId, patch);
  if (!result.ok) {
    return { ok: false, message: toUserMessage(result.error as AppError) };
  }

  revalidatePath("/app/profilo");
  revalidatePath("/app");
  return { ok: true, message: "Profilo aggiornato." };
}
