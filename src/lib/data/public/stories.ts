import { createClient } from "@/lib/supabase/server";
import {
  paginated,
  parsePageParams,
  param,
  type PaginatedResult,
} from "@/lib/data/public/paging";
import type { PublicContentListItem } from "@/lib/data/public/contents";

export const STORY_CONTENT_TYPES = [
  "interview",
  "business_story",
  "testimony",
  "personal_story",
] as const;

const LIST_SELECT =
  "id, slug, title, abstract, type_code, primary_category_code, language_id, is_featured, published_at";

export async function listPublicStories(
  searchParams: Record<string, string | string[] | undefined> = {},
): Promise<PaginatedResult<PublicContentListItem>> {
  const { page, pageSize, from, to } = parsePageParams(searchParams, 9);
  const q = param(searchParams, "q");
  const tipo = param(searchParams, "tipo");
  const supabase = await createClient();

  let query = supabase
    .from("contents")
    .select(LIST_SELECT, { count: "exact" })
    .in("type_code", [...STORY_CONTENT_TYPES])
    .order("is_featured", { ascending: false })
    .order("published_at", { ascending: false, nullsFirst: false })
    .range(from, to);

  if (q) query = query.or(`title.ilike.%${q}%,abstract.ilike.%${q}%`);
  if (tipo && STORY_CONTENT_TYPES.includes(tipo as (typeof STORY_CONTENT_TYPES)[number])) {
    query = query.eq("type_code", tipo);
  }

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);
  return paginated(
    (data ?? []) as PublicContentListItem[],
    count ?? 0,
    page,
    pageSize,
  );
}

export function isStoryContentType(typeCode: string) {
  return STORY_CONTENT_TYPES.includes(
    typeCode as (typeof STORY_CONTENT_TYPES)[number],
  );
}
