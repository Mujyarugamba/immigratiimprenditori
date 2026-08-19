"use server";

import { revalidatePath } from "next/cache";
import { getApplicationSession } from "@/lib/session/get-application-session";
import { createClient } from "@/lib/supabase/server";

const GEO_RELATIONS = new Set(["focus", "origin", "destination", "context"]);
const SECTOR_RELATIONS = new Set(["focus", "related"]);

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

async function requireEditorialContent(contentId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("contents")
    .select("id, slug")
    .eq("id", contentId)
    .eq("owned_by_editorial", true)
    .maybeSingle();
  if (!data) throw new Error("Contenuto editoriale non trovato.");
  return { supabase, content: data };
}

function revalidateContent(contentId: string, slug: string) {
  revalidatePath(`/app/redazione/contenuti/${contentId}`);
  revalidatePath(`/contenuti/${slug}`);
  revalidatePath(`/storie/${slug}`);
  revalidatePath("/storie");
}

export async function addContentGeographyAction(formData: FormData) {
  await requireEditorialSession();
  const contentId = value(formData, "content_id");
  const relationKind = value(formData, "relation_kind") ?? "focus";
  const countryCode = value(formData, "country_code")?.toUpperCase() ?? null;

  if (
    !contentId ||
    !countryCode ||
    !/^[A-Z]{2}$/.test(countryCode) ||
    !GEO_RELATIONS.has(relationKind)
  ) {
    throw new Error("Geografia non valida. Usa il codice ISO a due lettere, es. IT o US.");
  }

  const { supabase, content } = await requireEditorialContent(contentId);
  const { error } = await supabase.from("content_geographies").insert({
    content_id: contentId,
    country_code: countryCode,
    territory_id: null,
    relation_kind: relationKind,
    sort_order: 0,
  });
  if (error) throw new Error("Impossibile aggiungere la geografia.");
  revalidateContent(contentId, content.slug as string);
}

export async function deleteContentGeographyAction(formData: FormData) {
  await requireEditorialSession();
  const id = value(formData, "id");
  const contentId = value(formData, "content_id");
  if (!id || !contentId) throw new Error("Geografia non valida.");

  const { supabase, content } = await requireEditorialContent(contentId);
  const { error } = await supabase
    .from("content_geographies")
    .delete()
    .eq("id", id)
    .eq("content_id", contentId);
  if (error) throw new Error("Impossibile eliminare la geografia.");
  revalidateContent(contentId, content.slug as string);
}

export async function addContentSectorAction(formData: FormData) {
  await requireEditorialSession();
  const contentId = value(formData, "content_id");
  const relationKind = value(formData, "relation_kind") ?? "focus";
  const sectorId = Number.parseInt(String(formData.get("business_sector_id") ?? ""), 10);

  if (
    !contentId ||
    !Number.isFinite(sectorId) ||
    sectorId <= 0 ||
    !SECTOR_RELATIONS.has(relationKind)
  ) {
    throw new Error("Settore non valido.");
  }

  const { supabase, content } = await requireEditorialContent(contentId);
  const { error } = await supabase.from("content_sectors").insert({
    content_id: contentId,
    business_sector_id: sectorId,
    relation_kind: relationKind,
    sort_order: 0,
  });
  if (error) throw new Error("Impossibile aggiungere il settore.");
  revalidateContent(contentId, content.slug as string);
}

export async function deleteContentSectorAction(formData: FormData) {
  await requireEditorialSession();
  const id = value(formData, "id");
  const contentId = value(formData, "content_id");
  if (!id || !contentId) throw new Error("Settore non valido.");

  const { supabase, content } = await requireEditorialContent(contentId);
  const { error } = await supabase
    .from("content_sectors")
    .delete()
    .eq("id", id)
    .eq("content_id", contentId);
  if (error) throw new Error("Impossibile eliminare il settore.");
  revalidateContent(contentId, content.slug as string);
}
