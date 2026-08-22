import { createClient } from "@/lib/supabase/server";
import type { PublicContentListItem } from "@/lib/data/public/contents";

const LIST_SELECT =
  "id, slug, title, abstract, type_code, primary_category_code, language_id, is_featured, published_at, cover_url";

export async function listPublishedContentsByTypes(
  typeCodes: readonly string[],
  limit = 100,
): Promise<PublicContentListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contents")
    .select(LIST_SELECT)
    .in("type_code", [...typeCodes])
    .eq("editorial_status", "ready")
    .eq("publication_status", "published")
    .eq("visibility_status", "public")
    .is("archived_at", null)
    .order("is_featured", { ascending: false })
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? []) as PublicContentListItem[];
}

export const RESEARCH_CONTENT_TYPES = [
  "analysis",
  "article",
  "insight",
  "data_note",
  "policy_brief",
  "report",
  "research",
  "research_report",
  "working_paper",
  "dossier",
] as const;

export const VOICE_CONTENT_TYPES = [
  "interview",
  "business_story",
  "testimony",
  "personal_story",
  "video",
  "podcast",
] as const;
