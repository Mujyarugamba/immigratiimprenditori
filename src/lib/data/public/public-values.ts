import type { SupabaseClient } from "@supabase/supabase-js";

export const PUBLIC_VALUE_STATUSES = ["provisional", "final", "revised"] as const;
export type PublicValueStatus = (typeof PUBLIC_VALUE_STATUSES)[number];

export const PUBLIC_VALUE_DEFAULT_LIMIT = 500;
export const PUBLIC_VALUE_MAX_LIMIT = 1000;
export const PUBLIC_MAP_DEFAULT_LIMIT = 2000;
export const PUBLIC_MAP_MAX_LIMIT = 5000;

export type PublicValueFilters = {
  indicatorId?: string;
  indicatorSlug?: string;
  indicatorCode?: string;
  territoryCode?: string;
  year?: number | string;
  status?: PublicValueStatus | readonly PublicValueStatus[];
  sectorId?: number | string;
  categoryCode?: string;
};

export type PublicValuePageInput = {
  limit?: number;
  offset?: number;
};

export type PublicValuePage = {
  limit: number;
  offset: number;
  total: number;
  hasMore: boolean;
};

export type JoinedPublicValueRow = {
  id: string;
  indicator_id: string;
  numeric_value: number;
  methodology_note: string | null;
  period_start: string;
  period_end: string;
  status: PublicValueStatus;
  quality_code: string;
  territory_level: string | null;
  territory_code: string | null;
  territory_label: string | null;
  business_sector_id: number | null;
  country_code: string | null;
  country_label: string | null;
  observatory_indicators: {
    id: string;
    code: string;
    slug: string;
    title: string;
    description: string;
    unit_code: string;
  };
};

const VALUE_SELECT = `
  id,
  indicator_id,
  numeric_value,
  methodology_note,
  period_start,
  period_end,
  status,
  quality_code,
  territory_level,
  territory_code,
  territory_label,
  business_sector_id,
  country_code,
  country_label,
  observatory_indicators!inner (
    id,
    code,
    slug,
    title,
    description,
    unit_code
  )
`;

export function isPublicValueStatus(value: string): value is PublicValueStatus {
  return (PUBLIC_VALUE_STATUSES as readonly string[]).includes(value);
}

export function resolvePublicValueStatuses(
  status?: PublicValueStatus | readonly PublicValueStatus[],
): PublicValueStatus[] {
  if (status == null) return [...PUBLIC_VALUE_STATUSES];
  const list = (Array.isArray(status) ? status : [status]).map((item) => item.trim());
  if (list.length === 0) {
    throw new Error("Public value status filter must not be empty.");
  }
  for (const item of list) {
    if (!isPublicValueStatus(item)) {
      throw new Error(`Unsupported public value status: ${item}`);
    }
  }
  return [...new Set(list)] as PublicValueStatus[];
}

export function resolveExplicitPage(
  input: PublicValuePageInput = {},
  bounds: { defaultLimit: number; maxLimit: number } = {
    defaultLimit: PUBLIC_VALUE_DEFAULT_LIMIT,
    maxLimit: PUBLIC_VALUE_MAX_LIMIT,
  },
): { limit: number; offset: number } {
  const requestedLimit =
    input.limit == null ? bounds.defaultLimit : Number(input.limit);
  if (!Number.isInteger(requestedLimit) || requestedLimit < 1) {
    throw new Error("Public value page limit must be a positive integer.");
  }
  const requestedOffset = input.offset == null ? 0 : Number(input.offset);
  if (!Number.isInteger(requestedOffset) || requestedOffset < 0) {
    throw new Error("Public value page offset must be a non-negative integer.");
  }

  return {
    limit: Math.min(requestedLimit, bounds.maxLimit),
    offset: requestedOffset,
  };
}

export function publicValueYearRange(year: number | string): { start: string; endExclusive: string } {
  const parsed = typeof year === "number" ? year : Number.parseInt(String(year).trim(), 10);
  if (!Number.isInteger(parsed) || parsed < 1000 || parsed > 9999) {
    throw new Error(`Invalid public value year: ${year}`);
  }
  return {
    start: `${parsed}-01-01`,
    endExclusive: `${parsed + 1}-01-01`,
  };
}

export function toPublicValuePage(
  itemCount: number,
  total: number,
  limit: number,
  offset: number,
): PublicValuePage {
  return {
    limit,
    offset,
    total,
    hasMore: offset + itemCount < total,
  };
}

type OrderSpec = { column: string; ascending: boolean; foreignTable?: string };

type PublicValuesBuilder = {
  eq: (column: string, value: string | number) => PublicValuesBuilder;
  in: (column: string, values: readonly string[]) => PublicValuesBuilder;
  not: (column: string, operator: string, value: null) => PublicValuesBuilder;
  gte: (column: string, value: string) => PublicValuesBuilder;
  lt: (column: string, value: string) => PublicValuesBuilder;
  order: (
    column: string,
    options: { ascending: boolean; foreignTable?: string },
  ) => PublicValuesBuilder;
  range: (
    from: number,
    to: number,
  ) => Promise<{
    data: unknown;
    error: { message: string } | null;
    count: number | null;
  }>;
};

export async function fetchJoinedPublicIndicatorValues(options: {
  client: SupabaseClient;
  filters?: PublicValueFilters;
  page?: PublicValuePageInput;
  requireTerritoryCode?: boolean;
  bounds?: { defaultLimit: number; maxLimit: number };
  order?: OrderSpec[];
}): Promise<{ rows: JoinedPublicValueRow[]; page: PublicValuePage }> {
  const filters = options.filters ?? {};
  const statuses = resolvePublicValueStatuses(filters.status);
  const { limit, offset } = resolveExplicitPage(options.page, options.bounds);
  const supabase = options.client;

  let query = supabase
    .from("observatory_indicator_values")
    .select(VALUE_SELECT, { count: "exact" })
    .in("status", statuses)
    .not("published_at", "is", null)
    .eq("observatory_indicators.publication_status", "published")
    .in("observatory_indicators.operational_status", ["active", "deprecated"]) as unknown as PublicValuesBuilder;

  if (filters.indicatorId?.trim()) {
    query = query.eq("indicator_id", filters.indicatorId.trim());
  }
  if (filters.indicatorSlug?.trim()) {
    query = query.eq("observatory_indicators.slug", filters.indicatorSlug.trim());
  }
  if (filters.indicatorCode?.trim()) {
    query = query.eq("observatory_indicators.code", filters.indicatorCode.trim());
  }
  if (filters.territoryCode?.trim()) {
    query = query.eq("territory_code", filters.territoryCode.trim());
  }
  if (filters.categoryCode?.trim()) {
    query = query.eq("country_code", filters.categoryCode.trim());
  }
  if (filters.sectorId != null && String(filters.sectorId).trim() !== "") {
    const sectorId = Number(filters.sectorId);
    if (!Number.isInteger(sectorId)) {
      throw new Error(`Invalid public value sector id: ${filters.sectorId}`);
    }
    query = query.eq("business_sector_id", sectorId);
  }
  if (filters.year != null && String(filters.year).trim() !== "") {
    const range = publicValueYearRange(filters.year);
    query = query.gte("period_start", range.start).lt("period_start", range.endExclusive);
  }
  if (options.requireTerritoryCode) {
    query = query.not("territory_code", "is", null).not("territory_label", "is", null);
  }

  const order = options.order ?? [
    { column: "period_start", ascending: false },
    { column: "indicator_id", ascending: true },
    { column: "id", ascending: true },
  ];
  for (const spec of order) {
    query = query.order(spec.column, {
      ascending: spec.ascending,
      ...(spec.foreignTable ? { foreignTable: spec.foreignTable } : {}),
    });
  }

  const { data, error, count } = await query.range(offset, offset + limit - 1);
  if (error) {
    throw new Error(error.message);
  }

  const rows = ((data ?? []) as unknown as JoinedPublicValueRow[]).map((row) => {
    const indicator = publishedIndicatorOf(row);
    return { ...row, observatory_indicators: indicator };
  });
  const total = count ?? 0;
  return { rows, page: toPublicValuePage(rows.length, total, limit, offset) };
}

export function publishedIndicatorOf(
  row: Pick<JoinedPublicValueRow, "observatory_indicators">,
): JoinedPublicValueRow["observatory_indicators"] {
  const raw = row.observatory_indicators as
    | JoinedPublicValueRow["observatory_indicators"]
    | JoinedPublicValueRow["observatory_indicators"][]
    | null
    | undefined;
  const indicator = Array.isArray(raw) ? raw[0] : raw;
  if (!indicator?.id) {
    throw new Error("Public value is missing its published indicator.");
  }
  return indicator;
}
