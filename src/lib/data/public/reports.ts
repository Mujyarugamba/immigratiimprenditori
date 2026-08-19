import { createClient } from "@/lib/supabase/server";
import type { PublicContentListItem } from "@/lib/data/public/contents";

const REPORT_TYPES = ["research_report", "data_note", "policy_brief"] as const;
const LIST_SELECT =
  "id, slug, title, abstract, type_code, primary_category_code, language_id, is_featured, published_at";

export async function listPublicReports(limit = 40): Promise<PublicContentListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contents")
    .select(LIST_SELECT)
    .in("type_code", [...REPORT_TYPES])
    .order("is_featured", { ascending: false })
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? []) as PublicContentListItem[];
}
