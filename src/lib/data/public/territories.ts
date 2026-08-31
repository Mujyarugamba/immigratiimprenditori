import { createClient } from "@/lib/supabase/server";
import {
  getExplorerDimensionValues,
  getScopedExplorerEvidence,
  type ExplorerDimensionValue,
  type ExplorerIndicator,
  type ExplorerValue,
} from "@/lib/data/public/explore";
import type { AtlasContentItem, AtlasEventItem, AtlasIndicatorEvidence } from "@/lib/data/public/atlas";

export type PublicTerritory = {
  id: string;
  country_code: string | null;
  parent_id: string | null;
  level_kind: string;
  code: string | null;
  name: string;
  slug: string;
};

export type TerritorySummary = {
  territory: PublicTerritory;
  dataValueCount: number;
  indicatorCount: number;
  contentCount: number;
  eventCount: number;
  hasEvidence: boolean;
};

export type TerritoryDetail = TerritorySummary & {
  indicators: AtlasIndicatorEvidence[];
  contents: AtlasContentItem[];
  events: AtlasEventItem[];
  children: PublicTerritory[];
};

type TerritoryContentLink = {
  territory_id: string;
  content_id: string;
};

type TerritoryEventLink = {
  territory_id: string;
  event_id: string;
};

type TerritoryEvidenceValue = Pick<
  ExplorerDimensionValue,
  "indicator_id" | "territory_code" | "territory_label"
>;

function valuesForTerritory<T extends TerritoryEvidenceValue>(
  values: T[],
  territory: PublicTerritory,
): T[] {
  const code = territory.code?.toUpperCase();
  return values.filter((value) => {
    if (code && value.territory_code?.toUpperCase() === code) return true;
    return value.territory_label?.trim().toLocaleLowerCase("it") === territory.name.trim().toLocaleLowerCase("it");
  });
}

function indicatorEvidence(
  indicators: ExplorerIndicator[],
  values: ExplorerValue[],
): AtlasIndicatorEvidence[] {
  const grouped = new Map<string, ExplorerValue[]>();
  for (const value of values) {
    const current = grouped.get(value.indicator_id) ?? [];
    current.push(value);
    grouped.set(value.indicator_id, current);
  }

  return indicators
    .filter((indicator) => grouped.has(indicator.id))
    .map((indicator) => ({
      indicator,
      values: (grouped.get(indicator.id) ?? []).sort(
        (a, b) => new Date(b.period_start).getTime() - new Date(a.period_start).getTime(),
      ),
    }));
}

async function scopedTerritoryEvidence(territory: PublicTerritory) {
  const requests = [getScopedExplorerEvidence({ territoryLabel: territory.name })];
  if (territory.code?.trim()) {
    requests.push(getScopedExplorerEvidence({ territoryCode: territory.code.trim() }));
  }
  const results = await Promise.all(requests);
  const values = new Map<string, ExplorerValue>();
  const indicators = new Map<string, ExplorerIndicator>();
  for (const result of results) {
    for (const value of result.values) values.set(value.id, value);
    for (const indicator of result.indicators) indicators.set(indicator.id, indicator);
  }
  return {
    values: valuesForTerritory(Array.from(values.values()), territory),
    indicators: Array.from(indicators.values()),
  };
}

async function publicLinkedItems(territoryId: string) {
  const supabase = await createClient();
  const [contentGeo, eventGeo] = await Promise.all([
    supabase.from("content_geographies").select("content_id").eq("territory_id", territoryId),
    supabase.from("event_geographies").select("event_id").eq("territory_id", territoryId),
  ]);

  if (contentGeo.error) throw new Error(contentGeo.error.message);
  if (eventGeo.error) throw new Error(eventGeo.error.message);

  const contentIds = Array.from(new Set((contentGeo.data ?? []).map((row) => row.content_id)));
  const eventIds = Array.from(new Set((eventGeo.data ?? []).map((row) => row.event_id)));

  const [contentResult, eventResult] = await Promise.all([
    contentIds.length
      ? supabase
          .from("contents")
          .select("id, slug, title, abstract, type_code, published_at")
          .in("id", contentIds)
          .eq("editorial_status", "ready")
          .eq("publication_status", "published")
          .eq("visibility_status", "public")
          .order("published_at", { ascending: false, nullsFirst: false })
          .limit(12)
      : Promise.resolve({ data: [], error: null }),
    eventIds.length
      ? supabase
          .from("events")
          .select("id, title, summary, type_code, published_at")
          .in("id", eventIds)
          .eq("editorial_status", "ready")
          .eq("publication_status", "published")
          .eq("visibility_status", "public")
          .order("published_at", { ascending: false, nullsFirst: false })
          .limit(8)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (contentResult.error) throw new Error(contentResult.error.message);
  if (eventResult.error) throw new Error(eventResult.error.message);

  return {
    contents: (contentResult.data ?? []) as AtlasContentItem[],
    events: (eventResult.data ?? []) as AtlasEventItem[],
  };
}

async function batchPublicLinkCounts(territoryIds: string[]) {
  const contentCounts = new Map<string, number>();
  const eventCounts = new Map<string, number>();
  if (territoryIds.length === 0) return { contentCounts, eventCounts };

  const supabase = await createClient();
  const [contentGeoResult, eventGeoResult] = await Promise.all([
    supabase
      .from("content_geographies")
      .select("territory_id, content_id")
      .in("territory_id", territoryIds),
    supabase
      .from("event_geographies")
      .select("territory_id, event_id")
      .in("territory_id", territoryIds),
  ]);

  if (contentGeoResult.error) throw new Error(contentGeoResult.error.message);
  if (eventGeoResult.error) throw new Error(eventGeoResult.error.message);

  const contentLinks = (contentGeoResult.data ?? []) as TerritoryContentLink[];
  const eventLinks = (eventGeoResult.data ?? []) as TerritoryEventLink[];
  const contentIds = Array.from(new Set(contentLinks.map((link) => link.content_id)));
  const eventIds = Array.from(new Set(eventLinks.map((link) => link.event_id)));

  const [contentResult, eventResult] = await Promise.all([
    contentIds.length
      ? supabase
          .from("contents")
          .select("id")
          .in("id", contentIds)
          .eq("editorial_status", "ready")
          .eq("publication_status", "published")
          .eq("visibility_status", "public")
      : Promise.resolve({ data: [], error: null }),
    eventIds.length
      ? supabase
          .from("events")
          .select("id")
          .in("id", eventIds)
          .eq("editorial_status", "ready")
          .eq("publication_status", "published")
          .eq("visibility_status", "public")
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (contentResult.error) throw new Error(contentResult.error.message);
  if (eventResult.error) throw new Error(eventResult.error.message);

  const publicContentIds = new Set((contentResult.data ?? []).map((row) => row.id));
  const publicEventIds = new Set((eventResult.data ?? []).map((row) => row.id));
  const contentSets = new Map<string, Set<string>>();
  const eventSets = new Map<string, Set<string>>();

  for (const link of contentLinks) {
    if (!publicContentIds.has(link.content_id)) continue;
    const set = contentSets.get(link.territory_id) ?? new Set<string>();
    set.add(link.content_id);
    contentSets.set(link.territory_id, set);
  }
  for (const link of eventLinks) {
    if (!publicEventIds.has(link.event_id)) continue;
    const set = eventSets.get(link.territory_id) ?? new Set<string>();
    set.add(link.event_id);
    eventSets.set(link.territory_id, set);
  }

  for (const [territoryId, ids] of contentSets) contentCounts.set(territoryId, ids.size);
  for (const [territoryId, ids] of eventSets) eventCounts.set(territoryId, ids.size);

  return { contentCounts, eventCounts };
}

export async function listPublishedTerritorySummaries(): Promise<TerritorySummary[]> {
  const supabase = await createClient();
  const [territoryResult, dimensions] = await Promise.all([
    supabase
      .from("geo_territories")
      .select("id, country_code, parent_id, level_kind, code, name, slug")
      .eq("is_active", true)
      .in("level_kind", ["region", "province_state", "metropolitan_area", "municipality_city"])
      .order("name"),
    getExplorerDimensionValues(),
  ]);

  if (territoryResult.error) throw new Error(territoryResult.error.message);
  const territories = (territoryResult.data ?? []) as PublicTerritory[];
  const { contentCounts, eventCounts } = await batchPublicLinkCounts(
    territories.map((territory) => territory.id),
  );

  return territories
    .map((territory) => {
      const values = valuesForTerritory(dimensions, territory);
      const dataValueCount = values.length;
      const indicatorCount = new Set(values.map((value) => value.indicator_id)).size;
      const contentCount = contentCounts.get(territory.id) ?? 0;
      const eventCount = eventCounts.get(territory.id) ?? 0;
      return {
        territory,
        dataValueCount,
        indicatorCount,
        contentCount,
        eventCount,
        hasEvidence: dataValueCount + contentCount + eventCount > 0,
      };
    })
    .filter((item) => item.hasEvidence);
}

export async function getTerritoryDetail(slug: string): Promise<TerritoryDetail | null> {
  const supabase = await createClient();
  const { data: territoryRow, error } = await supabase
    .from("geo_territories")
    .select("id, country_code, parent_id, level_kind, code, name, slug")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!territoryRow) return null;

  const territory = territoryRow as PublicTerritory;
  const [evidence, links, childResult] = await Promise.all([
    scopedTerritoryEvidence(territory),
    publicLinkedItems(territory.id),
    supabase
      .from("geo_territories")
      .select("id, country_code, parent_id, level_kind, code, name, slug")
      .eq("parent_id", territory.id)
      .eq("is_active", true)
      .order("name"),
  ]);

  if (childResult.error) throw new Error(childResult.error.message);
  const indicators = indicatorEvidence(evidence.indicators, evidence.values);
  const children = (childResult.data ?? []) as PublicTerritory[];
  const dataValueCount = evidence.values.length;
  const indicatorCount = indicators.length;
  const contentCount = links.contents.length;
  const eventCount = links.events.length;
  const hasEvidence = dataValueCount + contentCount + eventCount > 0;

  return {
    territory,
    dataValueCount,
    indicatorCount,
    contentCount,
    eventCount,
    hasEvidence,
    indicators,
    contents: links.contents,
    events: links.events,
    children,
  };
}
