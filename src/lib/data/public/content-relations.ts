import { createClient } from "@/lib/supabase/server";

export type RelatedContentLink = {
  href: string;
  title: string;
};

export async function listRelatedContents(contentId: string): Promise<RelatedContentLink[]> {
  const supabase = await createClient();
  const [outgoing, incoming] = await Promise.all([
    supabase
      .from("content_relations")
      .select("target_content_id")
      .eq("source_content_id", contentId)
      .order("sort_order", { ascending: true })
      .limit(8),
    supabase
      .from("content_relations")
      .select("source_content_id")
      .eq("target_content_id", contentId)
      .order("sort_order", { ascending: true })
      .limit(8),
  ]);

  const ids = [
    ...(outgoing.data ?? []).map((row) => row.target_content_id),
    ...(incoming.data ?? []).map((row) => row.source_content_id),
  ];
  const uniqueIds = [...new Set(ids)].filter((id) => id !== contentId).slice(0, 8);
  if (uniqueIds.length === 0) return [];

  const { data, error } = await supabase
    .from("contents")
    .select("id, slug, title")
    .in("id", uniqueIds);
  if (error || !data) return [];

  const byId = new Map(data.map((row) => [row.id, row]));
  return uniqueIds.flatMap((id) => {
    const row = byId.get(id);
    return row ? [{ href: `/contenuti/${row.slug}`, title: row.title }] : [];
  });
}
