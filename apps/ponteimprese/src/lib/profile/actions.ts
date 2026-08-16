"use server";

import { revalidatePath } from "next/cache";
import { updateOwnPersona } from "@/lib/data/authenticated/persona";
import { upsertOwnPersonContact } from "@/lib/data/authenticated/person-contact";
import { pickProfileSelfUpdate } from "@/lib/profile/whitelist";
import { isValidProfileSlug } from "@/lib/profile/slug";
import { slugify } from "@/lib/editorial/slug";
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
      message: "Completa il profilo per modificare il profilo.",
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
      message: "L'indirizzo del profilo è obbligatorio.",
      fieldErrors: { slug: "Obbligatorio" },
    };
  }

  // Align with existing editorial slugify + DB normalize_profile_slug.
  const normalizedSlug = slugify(patch.slug);
  if (!normalizedSlug || !isValidProfileSlug(normalizedSlug)) {
    return {
      ok: false,
      message: "L'indirizzo contiene caratteri non consentiti.",
      fieldErrors: {
        slug: "Usa lettere, numeri e trattini.",
      },
    };
  }
  patch.slug = normalizedSlug;

  const contactEmailRaw = String(formData.get("contact_email") ?? "").trim();
  if (contactEmailRaw && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmailRaw)) {
    return {
      ok: false,
      message: "Email professionale non valida.",
      fieldErrors: { contact_email: "Formato non valido" },
    };
  }

  const result = await updateOwnPersona(session.personId, patch);
  if (!result.ok) {
    const err = result.error as AppError;
    if (err.code === "conflict") {
      return {
        ok: false,
        message: "Questo indirizzo è già utilizzato. Scegline un altro.",
        fieldErrors: {
          slug: "Questo indirizzo è già utilizzato.",
        },
      };
    }
    return { ok: false, message: toUserMessage(err) };
  }

  const contactResult = await upsertOwnPersonContact(session.personId, {
    phone: String(formData.get("phone") ?? ""),
    contact_email: contactEmailRaw,
    share_phone_with_network:
      formData.get("share_phone_with_network") === "true" ||
      formData.get("share_phone_with_network") === "on",
    share_contact_email_with_network:
      formData.get("share_contact_email_with_network") === "true" ||
      formData.get("share_contact_email_with_network") === "on",
  });
  if (!contactResult.ok) {
    return { ok: false, message: toUserMessage(contactResult.error) };
  }

  revalidatePath("/app/profilo");
  revalidatePath("/app");
  if (patch.slug) {
    revalidatePath(`/persone/${patch.slug}`);
  }
  return { ok: true, message: "Profilo aggiornato." };
}
