import { createClient } from "@/lib/supabase/server";
import {
  paginated,
  parsePageParams,
  param,
  type PaginatedResult,
} from "@/lib/data/public/paging";

const LIST_SELECT =
  "id, code, slug, title, description, value_nature, unit_code, periodicity, updated_at";

export type PublicIndicatorListItem = {
  id: string;
  code: string;
  slug: string;
  title: string;
  description: string;
  value_nature: string;
  unit_code: string;
  periodicity: string;
  updated_at: string;
};

export type PublicStatisticalSource = {
  id: string;
  name: string;
  producer_name: string;
  publication_title: string;
  url: string | null;
  external_identifier: string | null;
  edition_label: string | null;
  source_published_on: string | null;
  license_note: string | null;
  methodology_note: string | null;
};

export type PublicIndicatorValue = {
  id: string;
  numeric_value: number;
  period_start: string;
  period_end: string;
  status: string;
  quality_code: string;
  territory_level: string | null;
  territory_code: string | null;
  territory_label: string | null;
  country_code: string | null;
  country_label: string | null;
  methodology_note: string | null;
  published_at: string | null;
  revised_at: string | null;
  sector_name: string | null;
  source: PublicStatisticalSource | null;
};

export type PublicIndicatorDetail = PublicIndicatorListItem & {
  purpose_text: string;
  methodology_summary: string;
  publication_status: string;
  published_at: string | null;
  values: PublicIndicatorValue[];
};

type ValueRow = {
  id: string;
  numeric_value: number;
  period_start: string;
  period_end: string;
  status: string;
  quality_code: string;
  territory_level: string | null;
  territory_code: string | null;
  territory_label: string | null;
  country_code: string | null;
  country_label: string | null;
  methodology_note: string | null;
  published_at: string | null;
  revised_at: string | null;
  business_sectors:
    | { name: string }
    | { name: string }[]
    | null;
  observatory_statistical_sources:
    | PublicStatisticalSource
    | PublicStatisticalSource[]
    | null;
};

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

function mapIndicatorValues(rows: ValueRow[] | null | undefined): PublicIndicatorValue[] {
  return (rows ?? [])
    .map((v) => ({
      id: v.id,
      numeric_value: Number(v.numeric_value),
      period_start: v.period_start,
      period_end: v.period_end,
      status: v.status,
      quality_code: v.quality_code,
      territory_level: v.territory_level,
      territory_code: v.territory_code,
      territory_label: v.territory_label,
      country_code: v.country_code,
      country_label: v.country_label,
      methodology_note: v.methodology_note,
      published_at: v.published_at,
      revised_at: v.revised_at,
      sector_name: firstRelation(v.business_sectors)?.name ?? null,
      source: firstRelation(v.observatory_statistical_sources),
    }))
    .sort(
      (a, b) =>
        new Date(b.period_start).getTime() -
        new Date(a.period_start).getTime(),
    );
}

export async function listPublicIndicators(
  searchParams: Record<string, string | string[] | undefined> = {},
): Promise<PaginatedResult<PublicIndicatorListItem>> {
  const { page, pageSize, from, to } = parsePageParams(searchParams);
  const q = param(searchParams, "q");
  const supabase = await createClient();

  let query = supabase
    .from("observatory_indicators")
    .select(LIST_SELECT, { count: "exact" })
    .order("title", { ascending: true })
    .range(from, to);

  if (q) {
    query = query.or(
      `title.ilike.%${q}%,description.ilike.%${q}%,code.ilike.%${q}%`,
    );
  }

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);
  return paginated(
    (data ?? []) as PublicIndicatorListItem[],
    count ?? 0,
    page,
    pageSize,
  );
}

export async function getPublicIndicatorBySlug(
  slug: string,
): Promise<PublicIndicatorDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("observatory_indicators")
    .select(
      `
      id, code, slug, title, description, value_nature, unit_code, periodicity,
      purpose_text, methodology_summary, publication_status, published_at, updated_at,
      observatory_indicator_values (
        id, numeric_value, period_start, period_end, status, quality_code,
        territory_level, territory_code, territory_label,
        country_code, country_label, methodology_note, published_at, revised_at,
        business_sectors ( name ),
        observatory_statistical_sources (
          id, name, producer_name, publication_title, url,
          external_identifier, edition_label, source_published_on,
          license_note, methodology_note
        )
      )
    `,
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  return {
    id: data.id,
    code: data.code,
    slug: data.slug,
    title: data.title,
    description: data.description,
    value_nature: data.value_nature,
    unit_code: data.unit_code,
    periodicity: data.periodicity,
    purpose_text: data.purpose_text,
    methodology_summary: data.methodology_summary,
    publication_status: data.publication_status,
    published_at: data.published_at,
    updated_at: data.updated_at,
    values: mapIndicatorValues(
      data.observatory_indicator_values as unknown as ValueRow[],
    ),
  };
}

export async function listHomeIndicators(limit = 3) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("observatory_indicators")
    .select(LIST_SELECT)
    .order("title", { ascending: true })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as PublicIndicatorListItem[];
}
