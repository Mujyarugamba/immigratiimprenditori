"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDefaultLanguageId } from "@/lib/data/editorial/catalogs";
import { createEditorialContent } from "@/lib/data/editorial/contents";
import type { FormActionState } from "@/lib/editorial/actions";
import { slugify } from "@/lib/editorial/slug";
import { toUserMessage } from "@/lib/errors/app-error";
import { getApplicationSession } from "@/lib/session/get-application-session";
import { createClient } from "@/lib/supabase/server";

async function requireEditorSession() {
  const session = await getApplicationSession();
  if (!session?.isActiveAccount || (!session.isEditor && !session.isApplicationAdmin)) {
    return { ok: false as const, message: "Accesso riservato ai redattori." };
  }
  return { ok: true as const, session };
}

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function optionalStr(formData: FormData, key: string): string | null {
  const value = str(formData, key);
  return value || null;
}

export async function createEditorialContentFromInboxAction(
  _prev: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const gate = await requireEditorSession();
  if (!gate.ok) return { ok: false, message: gate.message };

  const inboxId = str(formData, "inbox_id");
  if (!inboxId) return { ok: false, message: "Arrivo Inbox non valido." };

  const supabase = await createClient();
  const { data: inbox, error: inboxError } = await supabase
    .from("editorial_inbox_items")
    .select("id, linked_content_id, original_url, source_label")
    .eq("id", inboxId)
    .maybeSingle();

  if (inboxError || !inbox) {
    return { ok: false, message: "Arrivo Inbox non trovato." };
  }
  if (inbox.linked_content_id) {
    redirect(`/app/redazione/contenuti/${inbox.linked_content_id}`);
  }

  const title = str(formData, "title");
  const body = str(formData, "body");
  const typeCode = str(formData, "type_code");
  let slug = str(formData, "slug");

  if (!title) {
    return { ok: false, message: "Il titolo è obbligatorio.", fieldErrors: { title: "Obbligatorio" } };
  }
  if (!body) {
    return { ok: false, message: "Il corpo è obbligatorio.", fieldErrors: { body: "Obbligatorio" } };
  }
  if (!typeCode) {
    return { ok: false, message: "Seleziona un tipo.", fieldErrors: { type_code: "Obbligatorio" } };
  }

  if (!slug) slug = slugify(title);
  if (!slug) {
    return { ok: false, message: "Lo slug è obbligatorio.", fieldErrors: { slug: "Obbligatorio" } };
  }

  const languageRaw = str(formData, "language_id");
  let languageId = languageRaw ? Number(languageRaw) : NaN;
  if (!Number.isFinite(languageId)) {
    const fallback = await getDefaultLanguageId();
    if (!fallback) return { ok: false, message: "Lingua predefinita non disponibile." };
    languageId = fallback;
  }

  const result = await createEditorialContent({
    type_code: typeCode,
    language_id: languageId,
    title,
    slug,
    body,
    subtitle: optionalStr(formData, "subtitle"),
    abstract: optionalStr(formData, "abstract"),
    primary_category_code: optionalStr(formData, "primary_category_code"),
    cover_url: optionalStr(formData, "cover_url"),
    source_url: inbox.original_url,
    source_label: inbox.source_label,
  });

  if (!result.ok) {
    return {
      ok: false,
      message: toUserMessage(result.error),
      fieldErrors: result.error.fieldErrors,
    };
  }

  const { error: linkError } = await supabase
    .from("editorial_inbox_items")
    .update({
      linked_content_id: result.id,
      status: "draft_created",
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", inboxId)
    .is("linked_content_id", null);

  if (linkError) {
    return {
      ok: false,
      message: `Bozza ${result.id} creata, ma il collegamento con l'Inbox non è riuscito.`,
    };
  }

  revalidatePath("/app/redazione/inbox");
  revalidatePath(`/app/redazione/inbox/${inboxId}`);
  revalidatePath("/app/redazione/contenuti");
  redirect(`/app/redazione/contenuti/${result.id}`);
}
