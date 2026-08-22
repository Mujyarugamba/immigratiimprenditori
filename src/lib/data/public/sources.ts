import { createClient } from "@/lib/supabase/server";

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
  lifecycle_status: string;
  publishedValueCount: number;
  indicatorTitles: string[];
  periodicities: string[];
  coverageLabels: string[];
  periodStart: string | null;
  periodEnd: string | null;
  qualityCodes: string[];
  valueMethodologyNotes: string[];
};

type PublishedIndicator = {
  id: string;
  title: string;
  periodicity: string;
};

type PublishedSourceValue = {
  source_id: string;
  indicator_id: string;
  period_start: string;
  period_end: string;
  territory_label: string | null;
  quality_code: string;
  methodology_note: string | null;
};

function sortedUnique(values: Array<string | null | undefined>) {
  return Array.from(
    new Set(values.map((value) => value?.trim()).filter((value): value is string => Boolean(value))),
  ).sort((a, b) => a.localeCompare(b, "it"));
}

export function summarizePublicSourceUsage(
  sourceId: string,
  values: PublishedSourceValue[],
  indicators: PublishedIndicator[],
) {
  const sourceValues = values.filter((value) => value.source_id === sourceId);
  const indicatorById = new Map(indicators.map((indicator) => [indicator.id, indicator]));
  const linkedIndicators = sourceValues
    .map((value) => indicatorById.get(value.indicator_id))
    .filter((indicator): indicator is PublishedIndicator => Boolean(indicator));

  const starts = sourceValues.map((value) => value.period_start).filter(Boolean).sort();
  const ends = sourceValues.map((value) => value.period_end).filter(Boolean).sort();

  return {
    publishedValueCount: sourceValues.length,
    indicatorTitles: sortedUnique(linkedIndicators.map((indicator) => indicator.title)),
    periodicities: sortedUnique(linkedIndicators.map((indicator) => indicator.periodicity)),
    coverageLabels: sortedUnique(sourceValues.map((value) => value.territory_label)),
    periodStart: starts[0] ?? null,
    periodEnd: ends.at(-1) ?? null,
    qualityCodes: sortedUnique(sourceValues.map((value) => value.quality_code)),
    valueMethodologyNotes: sortedUnique(sourceValues.map((value) => value.methodology_note)),
  };
}

export async function listPublicStatisticalSources(): Promise<PublicStatisticalSource[]> {
  const supabase = await createClient();
  const { data: indicators, error: indicatorError } = await supabase
    .from("observatory_indicators")
    .select("id, title, periodicity")
    .eq("publication_status", "published")
    .in("operational_status", ["active", "deprecated"]);

  if (indicatorError) throw new Error(indicatorError.message);
  const publishedIndicators = (indicators ?? []) as PublishedIndicator[];
  const indicatorIds = publishedIndicators.map((item) => item.id);
  if (indicatorIds.length === 0) return [];

  const { data: values, error: valueError } = await supabase
    .from("observatory_indicator_values")
    .select(
      "source_id, indicator_id, period_start, period_end, territory_label, quality_code, methodology_note",
    )
    .in("indicator_id", indicatorIds)
    .eq("status", "final")
    .is("withdrawn_at", null);

  if (valueError) throw new Error(valueError.message);
  const publishedValues = (values ?? []) as PublishedSourceValue[];
  const sourceIds = Array.from(new Set(publishedValues.map((value) => value.source_id).filter(Boolean)));
  if (sourceIds.length === 0) return [];

  const { data, error } = await supabase
    .from("observatory_statistical_sources")
    .select(
      "id, name, producer_name, publication_title, url, external_identifier, edition_label, source_published_on, license_note, methodology_note, lifecycle_status",
    )
    .in("id", sourceIds)
    .order("producer_name")
    .order("publication_title");

  if (error) throw new Error(error.message);
  return ((data ?? []) as Omit<
    PublicStatisticalSource,
    | "publishedValueCount"
    | "indicatorTitles"
    | "periodicities"
    | "coverageLabels"
    | "periodStart"
    | "periodEnd"
    | "qualityCodes"
    | "valueMethodologyNotes"
  >[]).map((source) => ({
    ...source,
    ...summarizePublicSourceUsage(source.id, publishedValues, publishedIndicators),
  }));
}
