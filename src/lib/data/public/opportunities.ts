import { createClient } from "@/lib/supabase/server";
import {
  paginated,
  parsePageParams,
  param,
  type PaginatedResult,
} from "@/lib/data/public/paging";

const LIST_SELECT =
  "id, title, summary, origin, substantial_status, platform_published_at";

export type PublicOpportunityListItem = {
  id: string;
  title: string;
  summary: string | null;
  origin: string;
  substantial_status: string;
  platform_published_at: string | null;
};

export type PublicOpportunityDetail = PublicOpportunityListItem & {
  description: string | null;
  purpose: string | null;
  visibility_level: string;
  publication_status: string;
  editorial_status: string;
};

export async function listPublicOpportunities(
  searchParams: Record<string, string | string[] | undefined> = {},
): Promise<PaginatedResult<PublicOpportunityListItem>> {
  const { page, pageSize, from, to } = parsePageParams(searchParams);
  const q = param(searchParams, "q");
  const origine = param(searchParams, "origine");
  const stato = param(searchParams, "stato");
  const supabase = await createClient();

  let query = supabase
    .from("opportunities")
    .select(LIST_SELECT, { count: "exact" })
    .order("platform_published_at", { ascending: false, nullsFirst: false })
    .range(from, to);

  if (q) {
    query = query.or(`title.ilike.%${q}%,summary.ilike.%${q}%`);
  }
  if (origine) {
    query = query.eq("origin", origine);
  }
  if (stato) {
    query = query.eq("substantial_status", stato);
  }

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);
  return paginated(
    (data ?? []) as PublicOpportunityListItem[],
    count ?? 0,
    page,
    pageSize,
  );
}

export async function getPublicOpportunityById(
  id: string,
): Promise<PublicOpportunityDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("opportunities")
    .select(
      `
      id, title, summary, origin, substantial_status, platform_published_at,
      description, purpose, visibility_level, publication_status, editorial_status
    `,
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  return data as PublicOpportunityDetail;
}

export async function listHomeOpportunities(limit = 3) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("opportunities")
    .select(LIST_SELECT)
    .order("platform_published_at", { ascending: false, nullsFirst: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as PublicOpportunityListItem[];
}
