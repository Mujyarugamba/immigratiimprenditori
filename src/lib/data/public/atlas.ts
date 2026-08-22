import {
  ATLAS_COUNTRIES,
  type AtlasCountry,
} from "@/lib/atlas/scope";
import { createClient } from "@/lib/supabase/server";
import {
  getExplorerSnapshot,
  type ExplorerIndicator,
  type ExplorerValue,
} from "@/lib/data/public/explore";

export type AtlasContentItem = {
  id: string;
  slug: string;
  title: string;
  abstract: string | null;
  type_code: string;
  published_at: string | null;
};

export type AtlasEventItem = {
  id: string;
  title: string;
  summary: string | null;
  type_code: string;
  published_at: string | null;
};

export type AtlasIndicatorEvidence = {
  indicator: ExplorerIndicator;
  values: ExplorerValue[];
};

export type AtlasCountrySummary = {
  country: AtlasCountry;
  dataValueCount: number;
  indicatorCount: number;
  contentCount: number;
  eventCount: number;
  hasEvidence: boolean;
};

export type AtlasCountryDetail = AtlasCountrySummary & {
  indicators: AtlasIndicatorEvidence[];
  contents: AtlasContentItem[];
  events: AtlasEventItem[];
};

type GeographyLink = {
  content_id?: string;
  event_id?: string;
  country_code: string | null;
};

function matchesCountryTerritory(value: ExplorerValue, country: AtlasCountry) {
  const code = value.territory_code?.toUpperCase();
  return code === country.code || code === country.iso3;
}

function mapIndicatorEvidence(
  indicators: ExplorerIndicator[],
  values: ExplorerValue[],
): AtlasIndicatorEvidence[] {
  const byIndicator = new Map<string, ExplorerValue[]>();
  for (const value of values) {
    const current = byIndicator.get(value.indicator_id) ?? [];
    current.push(value);
    byIndicator.set(value.indicator_id, current);
  }

  return indicators
    .filter((indicator) => byIndicator.has(indicator.id))
    .map((indicator) => ({
      indicator,
      values: (byIndicator.get(indicator.id) ?? []).sort(
        (a, b) =>
          new Date(b.period_start).getTime() - new Date(a.period_start).getTime(),
      ),
    }));
}

export async function listAtlasCountrySummaries(): Promise<AtlasCountrySummary[]> {
  const supabase = await createClient();
  const snapshotPromise = getExplorerSnapshot();
  const codes = ATLAS_COUNTRIES.map((country) => country.code);

  const [snapshot, contentGeoResult, eventGeoResult] = await Promise.all([
    snapshotPromise,
    supabase
      .from("content_geographies")
      .select("content_id, country_code")
      .in("country_code", codes),
    supabase
      .from("event_geographies")
      .select("event_id, country_code")
      .in("country_code", codes),
  ]);

  if (contentGeoResult.error) throw new Error(contentGeoResult.error.message);
  if (eventGeoResult.error) throw new Error(eventGeoResult.error.message);

  const contentLinks = (contentGeoResult.data ?? []) as GeographyLink[];
  const eventLinks = (eventGeoResult.data ?? []) as GeographyLink[];
  const contentIds = Array.from(
    new Set(contentLinks.map((link) => link.content_id).filter(Boolean)),
  ) as string[];
  const eventIds = Array.from(
    new Set(eventLinks.map((link) => link.event_id).filter(Boolean)),
  ) as string[];

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

  return ATLAS_COUNTRIES.map((country) => {
    const countryValues = snapshot.values.filter((value) =>
      matchesCountryTerritory(value, country),
    );
    const indicatorCount = new Set(countryValues.map((value) => value.indicator_id)).size;
    const countryContentIds = new Set(
      contentLinks
        .filter(
          (link) =>
            link.country_code?.toUpperCase() === country.code &&
            link.content_id &&
            publicContentIds.has(link.content_id),
        )
        .map((link) => link.content_id as string),
    );
    const countryEventIds = new Set(
      eventLinks
        .filter(
          (link) =>
            link.country_code?.toUpperCase() === country.code &&
            link.event_id &&
            publicEventIds.has(link.event_id),
        )
        .map((link) => link.event_id as string),
    );

    const dataValueCount = countryValues.length;
    const contentCount = countryContentIds.size;
    const eventCount = countryEventIds.size;

    return {
      country,
      dataValueCount,
      indicatorCount,
      contentCount,
      eventCount,
      hasEvidence: dataValueCount + contentCount + eventCount > 0,
    };
  });
}

export async function getAtlasCountryDetail(
  country: AtlasCountry,
): Promise<AtlasCountryDetail> {
  const supabase = await createClient();
  const snapshot = await getExplorerSnapshot();
  const countryValues = snapshot.values.filter((value) =>
    matchesCountryTerritory(value, country),
  );
  const indicators = mapIndicatorEvidence(snapshot.indicators, countryValues);

  const [contentGeoResult, eventGeoResult] = await Promise.all([
    supabase
      .from("content_geographies")
      .select("content_id")
      .eq("country_code", country.code),
    supabase
      .from("event_geographies")
      .select("event_id")
      .eq("country_code", country.code),
  ]);

  if (contentGeoResult.error) throw new Error(contentGeoResult.error.message);
  if (eventGeoResult.error) throw new Error(eventGeoResult.error.message);

  const contentIds = Array.from(
    new Set((contentGeoResult.data ?? []).map((row) => row.content_id)),
  );
  const eventIds = Array.from(
    new Set((eventGeoResult.data ?? []).map((row) => row.event_id)),
  );

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

  const contents = (contentResult.data ?? []) as AtlasContentItem[];
  const events = (eventResult.data ?? []) as AtlasEventItem[];
  const dataValueCount = countryValues.length;
  const indicatorCount = indicators.length;
  const contentCount = contents.length;
  const eventCount = events.length;

  return {
    country,
    dataValueCount,
    indicatorCount,
    contentCount,
    eventCount,
    hasEvidence: dataValueCount + contentCount + eventCount > 0,
    indicators,
    contents,
    events,
  };
}
