import { createPublicClient } from "@/lib/supabase/public";

export type PublicSitemapEntry = {
  path: string;
  lastModified: string | null;
};

export async function listPublicContentSitemapEntries(): Promise<PublicSitemapEntry[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("contents")
    .select("slug,published_at,updated_at")
    .eq("publication_status", "published")
    .eq("visibility_status", "public")
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(5000);

  if (error) throw new Error(error.message);

  return (data ?? [])
    .filter((row) => Boolean(row.slug))
    .map((row) => ({
      path: `/contenuti/${encodeURIComponent(row.slug)}`,
      lastModified: row.updated_at ?? row.published_at ?? null,
    }));
}

export async function listPublicEventSitemapEntries(): Promise<PublicSitemapEntry[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("events")
    .select("id,published_at,updated_at")
    .eq("publication_status", "published")
    .eq("visibility_status", "public")
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(5000);

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    path: `/eventi/${encodeURIComponent(row.id)}`,
    lastModified: row.updated_at ?? row.published_at ?? null,
  }));
}

export async function listPublicIndicatorSitemapEntries(): Promise<PublicSitemapEntry[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("observatory_indicators")
    .select("slug,published_at,updated_at")
    .eq("publication_status", "published")
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(5000);

  if (error) throw new Error(error.message);

  return (data ?? [])
    .filter((row) => Boolean(row.slug))
    .map((row) => ({
      path: `/osservatorio/${encodeURIComponent(row.slug)}`,
      lastModified: row.updated_at ?? row.published_at ?? null,
    }));
}
