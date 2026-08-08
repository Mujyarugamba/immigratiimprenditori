import { createClient } from "@/lib/supabase/server";
import {
  paginated,
  parsePageParams,
  param,
  type PaginatedResult,
} from "@/lib/data/public/paging";

const LIST_SELECT =
  "id, code, name, market_kind, substantial_status, summary";

export type PublicMarketListItem = {
  id: string;
  code: string;
  name: string;
  market_kind: string;
  substantial_status: string;
  summary: string | null;
};

export type PublicMarketDetail = PublicMarketListItem & {
  description: string | null;
  editorial_status: string;
};

export async function listPublicMarkets(
  searchParams: Record<string, string | string[] | undefined> = {},
): Promise<PaginatedResult<PublicMarketListItem>> {
  const { page, pageSize, from, to } = parsePageParams(searchParams);
  const q = param(searchParams, "q");
  const tipo = param(searchParams, "tipo");
  const supabase = await createClient();

  let query = supabase
    .from("international_markets")
    .select(LIST_SELECT, { count: "exact" })
    .order("name", { ascending: true })
    .range(from, to);

  if (q) {
    query = query.or(`name.ilike.%${q}%,summary.ilike.%${q}%,code.ilike.%${q}%`);
  }
  if (tipo) {
    query = query.eq("market_kind", tipo);
  }

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);
  return paginated(
    (data ?? []) as PublicMarketListItem[],
    count ?? 0,
    page,
    pageSize,
  );
}

export async function getPublicMarketByCode(
  code: string,
): Promise<PublicMarketDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("international_markets")
    .select(
      "id, code, name, market_kind, substantial_status, summary, description, editorial_status",
    )
    .eq("code", code)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return data as PublicMarketDetail;
}

export async function listHomeMarkets(limit = 3) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("international_markets")
    .select(LIST_SELECT)
    .order("name", { ascending: true })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as PublicMarketListItem[];
}
