import { createPublicReadClient } from "@/lib/supabase/public-read";
import {
  PUBLIC_VALUE_MAX_LIMIT,
  fetchJoinedPublicIndicatorValues,
  type JoinedPublicValueRow,
  type PublicValueFilters,
} from "@/lib/data/public/public-values";

export function publicExportFilters(searchParams: URLSearchParams): PublicValueFilters {
  return {
    indicatorSlug: searchParams.get("indicatore")?.trim() || undefined,
    territoryCode: searchParams.get("territorio")?.trim() || undefined,
    year: searchParams.get("anno")?.trim() || undefined,
    sectorId: searchParams.get("settore")?.trim() || undefined,
    categoryCode: searchParams.get("categoria")?.trim() || undefined,
  };
}

/**
 * Explicit export path: exhaust every matching public page, including the
 * unfiltered dataset, without reusing the UI snapshot or applying a silent cap.
 */
export async function collectPublicExportRows(
  filters: PublicValueFilters,
): Promise<JoinedPublicValueRow[]> {
  const client = createPublicReadClient();
  const rows: JoinedPublicValueRow[] = [];
  for (let offset = 0; ; offset += PUBLIC_VALUE_MAX_LIMIT) {
    const result = await fetchJoinedPublicIndicatorValues({
      client,
      filters,
      page: { limit: PUBLIC_VALUE_MAX_LIMIT, offset },
      bounds: {
        defaultLimit: PUBLIC_VALUE_MAX_LIMIT,
        maxLimit: PUBLIC_VALUE_MAX_LIMIT,
      },
    });
    rows.push(...result.rows);
    if (!result.page.hasMore) return rows;
  }
}
