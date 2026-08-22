import { createClient } from "@/lib/supabase/server";

export type ExplorerIndicator = {
  id: string;
  code: string;
  slug: string;
  title: string;
  description: string;
  unit_code: string;
};

export type ExplorerValue = {
  id: string;
  indicator_id: string;
  numeric_value: number;
  period_start: string;
  period_end: string;
  territory_level: string | null;
  territory_code: string | null;
  territory_label: string | null;
  business_sector_id: number | null;
  country_code: string | null;
  country_label: string | null;
  quality_code: string;
};

export type ExplorerSector = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
};

export type ExplorerTerritory = {
  level: string | null;
  code: string | null;
  label: string;
  valueCount: number;
};

export type ExplorerAuthor = {
  label: string;
  contributionCount: number;
};

export type ExplorerSnapshot = {
  indicators: ExplorerIndicator[];
  values: ExplorerValue[];
  sectors: ExplorerSector[];
  territories: ExplorerTerritory[];
  authors: ExplorerAuthor[];
};

function keyForTerritory(value: Pick<ExplorerValue, "territory_level" | "territory_code" | "territory_label">) {
  return [value.territory_level ?? "", value.territory_code ?? "", value.territory_label ?? ""].join("|");
}

export async function getExplorerSnapshot(): Promise<ExplorerSnapshot> {
  const supabase = await createClient();

  const [indicatorResult, valueResult, sectorResult, authorResult] = await Promise.all([
    supabase
      .from("observatory_indicators")
      .select("id, code, slug, title, description, unit_code")
      .eq("publication_status", "published")
      .in("operational_status", ["active", "deprecated"])
      .order("title"),
    supabase
      .from("observatory_indicator_values")
      .select(
        "id, indicator_id, numeric_value, period_start, period_end, territory_level, territory_code, territory_label, business_sector_id, country_code, country_label, quality_code",
      )
      .eq("status", "final")
      .order("period_start", { ascending: false })
      .limit(2000),
    supabase
      .from("business_sectors")
      .select("id, slug, name, description")
      .eq("is_active", true)
      .order("sort_order")
      .order("name"),
    supabase
      .from("content_authors")
      .select(
        "display_label, content_id, contents!inner(editorial_status, publication_status, visibility_status)",
      )
      .not("display_label", "is", null),
  ]);

  if (indicatorResult.error) throw new Error(indicatorResult.error.message);
  if (valueResult.error) throw new Error(valueResult.error.message);
  if (sectorResult.error) throw new Error(sectorResult.error.message);
  if (authorResult.error) throw new Error(authorResult.error.message);

  const indicators = (indicatorResult.data ?? []) as ExplorerIndicator[];
  const indicatorIds = new Set(indicators.map((indicator) => indicator.id));
  const values = ((valueResult.data ?? []) as ExplorerValue[]).filter((value) =>
    indicatorIds.has(value.indicator_id),
  );
  const sectors = (sectorResult.data ?? []) as ExplorerSector[];

  const territoryCounts = new Map<string, ExplorerTerritory>();
  for (const value of values) {
    if (!value.territory_label) continue;
    const key = keyForTerritory(value);
    const current = territoryCounts.get(key);
    territoryCounts.set(key, {
      level: value.territory_level,
      code: value.territory_code,
      label: value.territory_label,
      valueCount: (current?.valueCount ?? 0) + 1,
    });
  }

  const authorCounts = new Map<string, number>();
  for (const row of authorResult.data ?? []) {
    const contents = Array.isArray(row.contents) ? row.contents[0] : row.contents;
    if (
      contents?.editorial_status !== "ready" ||
      contents?.publication_status !== "published" ||
      contents?.visibility_status !== "public"
    ) {
      continue;
    }
    const label = row.display_label?.trim();
    if (!label) continue;
    authorCounts.set(label, (authorCounts.get(label) ?? 0) + 1);
  }

  return {
    indicators,
    values,
    sectors,
    territories: Array.from(territoryCounts.values()).sort((a, b) =>
      a.label.localeCompare(b.label, "it"),
    ),
    authors: Array.from(authorCounts.entries())
      .map(([label, contributionCount]) => ({ label, contributionCount }))
      .sort((a, b) => b.contributionCount - a.contributionCount || a.label.localeCompare(b.label, "it")),
  };
}

export function formatExplorerValue(value: number, unitCode: string) {
  const formatted = new Intl.NumberFormat("it-IT", {
    maximumFractionDigits: Number.isInteger(value) ? 0 : 1,
  }).format(value);

  if (unitCode === "percent") return `${formatted}%`;
  if (unitCode === "eur") return `${formatted} €`;
  if (unitCode === "eur_thousands") return `${formatted} mila €`;
  if (unitCode === "index_points") return `${formatted} punti`;
  return formatted;
}
