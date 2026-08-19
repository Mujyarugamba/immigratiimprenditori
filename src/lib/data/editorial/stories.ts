import { createClient } from "@/lib/supabase/server";

const STORY_TYPES = ["interview", "business_story", "personal_story", "testimony"] as const;

export type EditorialStoryListItem = {
  id: string;
  title: string;
  slug: string;
  type_code: string;
  editorial_status: string;
  publication_status: string;
  visibility_status: string;
  is_featured: boolean;
  updated_at: string;
};

export async function listEditorialStories(): Promise<EditorialStoryListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contents")
    .select(
      "id, title, slug, type_code, editorial_status, publication_status, visibility_status, is_featured, updated_at",
    )
    .eq("owned_by_editorial", true)
    .in("type_code", [...STORY_TYPES])
    .order("is_featured", { ascending: false })
    .order("updated_at", { ascending: false });

  if (error) return [];
  return (data ?? []) as EditorialStoryListItem[];
}
