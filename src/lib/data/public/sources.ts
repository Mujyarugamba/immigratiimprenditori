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
};

export async function listPublicStatisticalSources(): Promise<PublicStatisticalSource[]> {
  const supabase = await createClient();
  const { data: indicators, error: indicatorError } = await supabase
    .from("observatory_indicators")
    .select("id")
    .eq("publication_status", "published")
    .in("operational_status", ["active", "deprecated"]);

  if (indicatorError) throw new Error(indicatorError.message);
  const indicatorIds = (indicators ?? []).map((item) => item.id);
  if (indicatorIds.length === 0) return [];

  const { data: values, error: valueError } = await supabase
    .from("observatory_indicator_values")
    .select("source_id")
    .in("indicator_id", indicatorIds)
    .eq("status", "final")
    .is("withdrawn_at", null);

  if (valueError) throw new Error(valueError.message);

  const sourceCounts = new Map<string, number>();
  for (const value of values ?? []) {
    if (!value.source_id) continue;
    sourceCounts.set(value.source_id, (sourceCounts.get(value.source_id) ?? 0) + 1);
  }
  const sourceIds = Array.from(sourceCounts.keys());
  if (sourceIds.length === 0) return [];

  const { data, error } = await supabase
    .from("observatory_statistical_sources")
    .select(
      "id, name, producer_name, publication_title, url, external_identifier, edition_label, source_published_on, license_note, methodology_note, lifecycle_status",
    )
    .in("id", sourceIds)
    .neq("lifecycle_status", "withdrawn")
    .order("producer_name")
    .order("publication_title");

  if (error) throw new Error(error.message);
  return ((data ?? []) as Omit<PublicStatisticalSource, "publishedValueCount">[]).map((source) => ({
    ...source,
    publishedValueCount: sourceCounts.get(source.id) ?? 0,
  }));
}
