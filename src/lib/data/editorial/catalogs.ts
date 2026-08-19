import { createClient } from "@/lib/supabase/server";

export type CatalogOption = { code: string; label: string };

export async function listActiveContentTypes(): Promise<CatalogOption[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("content_types")
    .select("code, name_it")
    .eq("is_active", true)
    .order("sort_order");
  return (data ?? []).map((r) => ({ code: r.code, label: r.name_it }));
}

export async function listActiveContentCategories(): Promise<CatalogOption[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("content_categories")
    .select("code, name_it")
    .eq("is_active", true)
    .order("sort_order");
  return (data ?? []).map((r) => ({ code: r.code, label: r.name_it }));
}

export async function listActiveLanguages(): Promise<
  { id: number; code: string; label: string }[]
> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("languages")
    .select("id, code, native_name")
    .eq("is_active", true)
    .order("sort_order");
  return (data ?? []).map((r) => ({
    id: Number(r.id),
    code: r.code,
    label: r.native_name,
  }));
}

export async function listActiveBusinessSectors(): Promise<
  { id: number; slug: string; label: string }[]
> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("business_sectors")
    .select("id, slug, name")
    .eq("is_active", true)
    .order("sort_order");
  return (data ?? []).map((r) => ({
    id: Number(r.id),
    slug: r.slug,
    label: r.name,
  }));
}

export async function getDefaultLanguageId(): Promise<number | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("languages")
    .select("id")
    .eq("code", "it")
    .eq("is_active", true)
    .maybeSingle();
  return data ? Number(data.id) : null;
}

/** Ponte-owned after SPLIT-3; retained only for compile-time compatibility. */
export async function listActiveOrganizationTypes(): Promise<CatalogOption[]> {
  return [];
}

/** Ponte-owned after SPLIT-3; retained only for compile-time compatibility. */
export async function listActiveOrganizationScopes(): Promise<CatalogOption[]> {
  return [];
}

export async function listActiveEventTypes(): Promise<CatalogOption[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("event_types")
    .select("code, name_it")
    .eq("is_active", true)
    .order("sort_order");
  return (data ?? []).map((r) => ({ code: r.code, label: r.name_it }));
}
