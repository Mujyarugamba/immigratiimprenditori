"use server";

import { revalidatePath } from "next/cache";
import { getApplicationSession } from "@/lib/session/get-application-session";
import { createClient } from "@/lib/supabase/server";
import { safeHttpsUrl } from "@/lib/public/story-media";

const MEDIA_KINDS = new Set(["video", "audio", "image", "document"]);
const PROVIDERS = new Set(["youtube", "vimeo", "external"]);
const YOUTUBE_ID = /^[A-Za-z0-9_-]{6,32}$/;

function value(formData: FormData, key: string) {
  const raw = String(formData.get(key) ?? "").trim();
  return raw || null;
}

async function requireEditorialSession() {
  const session = await getApplicationSession();
  if (
    !session?.isActiveAccount ||
    (!session.isEditor && !session.isApplicationAdmin)
  ) {
    throw new Error("Accesso redazionale richiesto.");
  }
}

export async function addContentMediaAction(formData: FormData) {
  await requireEditorialSession();

  const contentId = value(formData, "content_id");
  const mediaKind = value(formData, "media_kind");
  const provider = value(formData, "provider");
  const externalId = value(formData, "external_id");
  const rawUrl = value(formData, "url");
  const title = value(formData, "title");
  const caption = value(formData, "caption");
  const rightsNote = value(formData, "rights_note");
  const isPrimary = formData.get("is_primary") === "on";
  const sortRaw = Number.parseInt(String(formData.get("sort_order") ?? "0"), 10);
  const sortOrder = Number.isFinite(sortRaw) && sortRaw >= 0 ? sortRaw : 0;

  if (!contentId || !mediaKind || !MEDIA_KINDS.has(mediaKind)) {
    throw new Error("Dati media non validi.");
  }
  if (provider && !PROVIDERS.has(provider)) {
    throw new Error("Provider media non valido.");
  }

  let url: string | null = null;
  if (rawUrl) {
    url = safeHttpsUrl(rawUrl);
    if (!url) throw new Error("Il link media deve essere un URL HTTPS valido.");
  }

  if (provider === "youtube") {
    if (!externalId || !YOUTUBE_ID.test(externalId)) {
      throw new Error("Inserisci un ID YouTube valido, non l'URL completo.");
    }
  } else if (!url && !externalId) {
    throw new Error("Inserisci un URL HTTPS o un identificativo esterno.");
  }

  const supabase = await createClient();
  const { data: content } = await supabase
    .from("contents")
    .select("id, slug")
    .eq("id", contentId)
    .eq("owned_by_editorial", true)
    .maybeSingle();

  if (!content) throw new Error("Contenuto editoriale non trovato.");

  if (isPrimary) {
    const { error: demoteError } = await supabase
      .from("content_media")
      .update({ is_primary: false })
      .eq("content_id", contentId)
      .eq("is_primary", true);
    if (demoteError) throw new Error("Impossibile aggiornare il media principale.");
  }

  const { error } = await supabase.from("content_media").insert({
    content_id: contentId,
    media_kind: mediaKind,
    provider,
    external_id: externalId,
    url,
    title,
    caption,
    rights_note: rightsNote,
    is_primary: isPrimary,
    sort_order: sortOrder,
  });

  if (error) throw new Error("Impossibile aggiungere il media.");

  revalidatePath(`/app/redazione/contenuti/${contentId}`);
  revalidatePath(`/contenuti/${content.slug}`);
  revalidatePath(`/storie/${content.slug}`);
}

export async function deleteContentMediaAction(formData: FormData) {
  await requireEditorialSession();

  const id = value(formData, "id");
  const contentId = value(formData, "content_id");
  if (!id || !contentId) throw new Error("Media non valido.");

  const supabase = await createClient();
  const { data: content } = await supabase
    .from("contents")
    .select("id, slug")
    .eq("id", contentId)
    .eq("owned_by_editorial", true)
    .maybeSingle();

  if (!content) throw new Error("Contenuto editoriale non trovato.");

  const { error } = await supabase
    .from("content_media")
    .delete()
    .eq("id", id)
    .eq("content_id", contentId);

  if (error) throw new Error("Impossibile eliminare il media.");

  revalidatePath(`/app/redazione/contenuti/${contentId}`);
  revalidatePath(`/contenuti/${content.slug}`);
  revalidatePath(`/storie/${content.slug}`);
}
