import { createClient } from "@/lib/supabase/server";

export type EditorialContentMedia = {
  id: string;
  content_id: string;
  media_kind: "video" | "audio" | "image" | "document";
  provider: "youtube" | "vimeo" | "external" | null;
  external_id: string | null;
  url: string | null;
  title: string | null;
  caption: string | null;
  rights_note: string | null;
  is_primary: boolean;
  sort_order: number;
  created_at: string;
};

const SELECT =
  "id, content_id, media_kind, provider, external_id, url, title, caption, rights_note, is_primary, sort_order, created_at";

export async function listEditorialContentMedia(
  contentId: string,
): Promise<EditorialContentMedia[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("content_media")
    .select(SELECT)
    .eq("content_id", contentId)
    .order("is_primary", { ascending: false })
    .order("sort_order", { ascending: true });

  if (error) return [];
  return (data ?? []) as EditorialContentMedia[];
}
