import { createPublicReadClient } from "@/lib/supabase/public-read";
import {
  PUBLIC_VALUE_MAX_LIMIT,
  fetchJoinedPublicIndicatorValues,
  type PublicValueFilters,
  type PublicValuePage,
  type PublicValuePageInput,
  type PublicValueStatus,
} from "@/lib/data/public/public-values";

export type CanonicalPublicExportRecord = {
  id: string;
  indicator_id: string;
  indicator_code: string;
  indicator_slug: string;
  indicator_title: string;
  indicator_description: string;
  unit_code: string;
  numeric_value: number;
  methodology_note: string | null;
  period_start: string;
  period_end: string;
  status: PublicValueStatus;
  quality_code: string;
  territory_level: string | null;
  territory_code: string | null;
  territory_label: string | null;
  category_code: string | null;
  category_label: string | null;
  business_sector_id: number | null;
};

export type CanonicalPublicExportPage = {
  records: CanonicalPublicExportRecord[];
} & PublicValuePage;

export function publicExportFilters(searchParams: URLSearchParams): PublicValueFilters {
  return {
    indicatorSlug: searchParams.get("indicatore")?.trim() || undefined,
    territoryCode: searchParams.get("territorio")?.trim() || undefined,
    year: searchParams.get("anno")?.trim() || undefined,
    sectorId: searchParams.get("settore")?.trim() || undefined,
    categoryCode: searchParams.get("categoria")?.trim() || undefined,
  };
}

export async function queryCanonicalPublicExportPage(
  filters: PublicValueFilters = {},
  page: PublicValuePageInput = {},
): Promise<CanonicalPublicExportPage> {
  const { rows, page: resolved } = await fetchJoinedPublicIndicatorValues({
    client: createPublicReadClient(),
    filters,
    page,
    order: [
      { column: "period_start", ascending: false },
      { column: "indicator_id", ascending: true },
      { column: "id", ascending: true },
    ],
  });

  return {
    records: rows.map((row) => {
      const indicator = row.observatory_indicators;
      return {
        id: row.id,
        indicator_id: row.indicator_id,
        indicator_code: indicator.code,
        indicator_slug: indicator.slug,
        indicator_title: indicator.title,
        indicator_description: indicator.description,
        unit_code: indicator.unit_code,
        numeric_value: Number(row.numeric_value),
        methodology_note: row.methodology_note,
        period_start: row.period_start,
        period_end: row.period_end,
        status: row.status,
        quality_code: row.quality_code,
        territory_level: row.territory_level,
        territory_code: row.territory_code,
        territory_label: row.territory_label,
        category_code: row.country_code,
        category_label: row.country_label,
        business_sector_id: row.business_sector_id,
      };
    }),
    ...resolved,
  };
}

/** Explicit full-export path: paginate until exact total is exhausted. */
export async function collectCanonicalPublicExportRecords(
  filters: PublicValueFilters = {},
): Promise<CanonicalPublicExportRecord[]> {
  const records: CanonicalPublicExportRecord[] = [];
  for (let offset = 0; ; offset += PUBLIC_VALUE_MAX_LIMIT) {
    const page = await queryCanonicalPublicExportPage(filters, {
      limit: PUBLIC_VALUE_MAX_LIMIT,
      offset,
    });
    records.push(...page.records);
    if (!page.hasMore) return records;
  }
}
