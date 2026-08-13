import { createClient } from "@/lib/supabase/server";
import {
  paginated,
  parsePageParams,
  param,
  type PaginatedResult,
} from "@/lib/data/public/paging";
import {
  WB_INDICATOR_CATALOG,
  type WbIndicatorCode,
} from "@/lib/external-data/worldbank/indicators";
import { parseNaturalKey } from "@/lib/external-data/worldbank/apply-indicators";

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

export type PublicMarketSupportResource = {
  id: string;
  indicatorLabel: string;
  indicatorCode: string | null;
  periodYear: string | null;
  summary: string | null;
  valueDisplay: string;
  unit: string | null;
  websiteUrl: string | null;
  sourceLabel: string;
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

/** Public WB (and other) support resources — RLS enforces visibility=public. */
export async function listPublicMarketSupportResources(
  marketId: string,
): Promise<PublicMarketSupportResource[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("international_market_support_resources")
    .select("id, name, summary, website_url, contact_note")
    .eq("market_id", marketId)
    .eq("visibility_status", "public")
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => {
    const nk = parseNaturalKey(row.contact_note as string | null);
    const parts = nk?.split(":") ?? [];
    const indicatorCode = parts[1] ?? null;
    const periodYear = parts[3] ?? null;
    const meta =
      indicatorCode && indicatorCode in WB_INDICATOR_CATALOG
        ? WB_INDICATOR_CATALOG[indicatorCode as WbIndicatorCode]
        : null;
    const summary = (row.summary as string | null) ?? null;
    const valueMatch = summary
      ? /^(.+?) \((\d{4})\): (.+)\.$/.exec(summary.trim())
      : null;
    const rest = valueMatch?.[3] ?? summary ?? "—";
    return {
      id: row.id as string,
      indicatorLabel: meta?.platformLabel ?? (row.name as string),
      indicatorCode,
      periodYear,
      summary,
      valueDisplay: rest,
      unit: meta?.unit ?? null,
      websiteUrl: (row.website_url as string | null) ?? null,
      sourceLabel: nk?.startsWith("worldbank:") ? "World Bank" : "Fonte",
    };
  });
}
