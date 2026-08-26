import { createPublicReadClient } from "@/lib/supabase/public-read";
import {
  fetchJoinedPublicIndicatorValues,
  PUBLIC_MAP_DEFAULT_LIMIT,
  PUBLIC_MAP_MAX_LIMIT,
  type PublicValueFilters,
  type PublicValuePage,
  type PublicValuePageInput,
} from "@/lib/data/public/public-values";

export type PublicMapValue = {
  id: string;
  indicator_slug: string;
  indicator_title: string;
  unit_code: string;
  numeric_value: number;
  period_start: string;
  territory_code: string;
  territory_label: string;
  category_code: string | null;
  category_label: string | null;
};

export type PublicMapValuesResult = {
  items: PublicMapValue[];
} & PublicValuePage;

export async function queryPublicMapValues(
  filters: PublicValueFilters = {},
  page: PublicValuePageInput = {},
): Promise<PublicMapValuesResult> {
  const { rows, page: resolved } = await fetchJoinedPublicIndicatorValues({
    client: createPublicReadClient(),
    filters,
    page,
    requireTerritoryCode: true,
    bounds: {
      defaultLimit: PUBLIC_MAP_DEFAULT_LIMIT,
      maxLimit: PUBLIC_MAP_MAX_LIMIT,
    },
    order: [
      { column: "territory_label", ascending: true },
      { column: "territory_code", ascending: true },
      { column: "id", ascending: true },
    ],
  });

  return {
    items: rows.map((row) => {
      const indicator = row.observatory_indicators;
      const territoryCode = row.territory_code;
      const territoryLabel = row.territory_label;
      if (!territoryCode || !territoryLabel) {
        throw new Error("Public map value is missing territory coordinates.");
      }
      return {
        id: row.id,
        indicator_slug: indicator.slug,
        indicator_title: indicator.title,
        unit_code: indicator.unit_code,
        numeric_value: Number(row.numeric_value),
        period_start: row.period_start,
        territory_code: territoryCode,
        territory_label: territoryLabel,
        category_code: row.country_code,
        category_label: row.country_label,
      };
    }),
    ...resolved,
  };
}
