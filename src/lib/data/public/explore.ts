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

export const EXPLORER_VALUE_PAGE_SIZE = 1000;

export async function collectExplorerPages<T>(
  fetchPage: (from: number, to: number) => Promise<T[]>,
  pageSize = EXPLORER_VALUE_PAGE_SIZE,
): Promise<T[]> {
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 1000) {
    throw new Error("Explorer page size must be an integer between 1 and 1000");
  }

  const rows: T[] = [];
  for (let from = 0; ; from += pageSize) {
    const page = await fetchPage(from, from + pageSize - 1);
    rows.push(...page);
    if (page.length < pageSize) return rows;
  }
}

function keyForTerritory(value: Pick<ExplorerValue, "territory_level" | "territory_code" | "territory_label">) {
  return [value.territory_level ?? "", value.territory_code ?? "", value.territory_label ?? ""].join("|");
}

export async function getExplorerSnapshot(): Promise<ExplorerSnapshot> {
  const supabase = await createClient();

  const valuesPromise = collectExplorerPages<ExplorerValue>(async (from, to) => {
    const result = await supabase
      .from("observatory_indicator_values")
      .select(
        "id, indicator_id, numeric_value, period_start, period_end, territory_level, territory_code, territory_label, business_sector_id, country_code, country_label, quality_code",
      )
      .eq("status", "final")
      .order("period_start", { ascending: false })
      .order("id", { ascending: true })
      .range(from, to);

    if (result.error) throw new Error(result.error.message);
    return (result.data ?? []) as ExplorerValue[];
  });

  const [indicatorResult, values, sectorResult, authorResult] = await Promise.all([
    supabase
      .from("observatory_indicators")
      .select("id, code, slug, title, description, unit_code")
      .eq("publication_status", "published")
      .in("operational_status", ["active", "deprecated"])
      .order("title"),
    valuesPromise,
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
  if (sectorResult.error) throw new Error(sectorResult.error.message);
  if (authorResult.error) throw new Error(authorResult.error.message);

  const indicators = (indicatorResult.data ?? []) as ExplorerIndicator[];
  const indicatorIds = new Set(indicators.map((indicator) => indicator.id));
  const publicValues = values.filter((value) => indicatorIds.has(value.indicator_id));
  const sectors = (sectorResult.data ?? []) as ExplorerSector[];

  const territoryCounts = new Map<string, ExplorerTerritory>();
  for (const value of publicValues) {
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
    values: publicValues,
    sectors,
    territories: Array.from(territoryCounts.values()).sort((a, b) =>
      a.label.localeCompare(b.label, "it"),
    ),
    authors: Array.from(authorCounts.entries())
      .map(([label, contributionCount]) => ({ label, contributionCount }))
      .sort((a, b) => b.contributionCount - a.contributionCount || a.label.localeCompare(b.label, "it")),
  };
}

const NUMBER_LOCALES: Record<string, string> = {
  it: "it-IT",
  en: "en-GB",
  fr: "fr-FR",
  es: "es-ES",
  de: "de-DE",
  ar: "ar",
  zh: "zh-CN",
};

const UNIT_LABELS: Record<string, Record<string, string>> = {
  eur_thousands: {
    it: "mila €",
    en: "thousand €",
    fr: "milliers d'€",
    es: "miles de €",
    de: "Tsd. €",
    ar: "ألف €",
    zh: "千欧元",
  },
  index_points: {
    it: "punti",
    en: "points",
    fr: "points",
    es: "puntos",
    de: "Punkte",
    ar: "نقطة",
    zh: "点",
  },
};

export function formatExplorerValue(value: number, unitCode: string, locale = "it") {
  const formatted = new Intl.NumberFormat(NUMBER_LOCALES[locale] ?? locale, {
    maximumFractionDigits: Number.isInteger(value) ? 0 : 1,
  }).format(value);

  if (unitCode === "percent") return `${formatted}%`;
  if (unitCode === "eur") return `${formatted} €`;
  const localizedUnit = UNIT_LABELS[unitCode]?.[locale];
  if (localizedUnit) return `${formatted} ${localizedUnit}`;
  return formatted;
}
