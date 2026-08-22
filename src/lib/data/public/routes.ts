import {
  getAtlasCountryByCode,
  type AtlasCountry,
} from "@/lib/atlas/scope";
import { createClient } from "@/lib/supabase/server";
import {
  getExplorerSnapshot,
  type ExplorerIndicator,
  type ExplorerValue,
} from "@/lib/data/public/explore";
import type {
  AtlasContentItem,
  AtlasEventItem,
  AtlasIndicatorEvidence,
} from "@/lib/data/public/atlas";

export type PublicMigrationRoute = {
  id: string;
  origin_country_code: string;
  destination_country_code: string;
  slug: string;
  origin: AtlasCountry;
  destination: AtlasCountry;
};

export type RouteSummary = {
  route: PublicMigrationRoute;
  dataValueCount: number;
  indicatorCount: number;
  contentCount: number;
  eventCount: number;
  hasEvidence: boolean;
};

export type RouteDetail = RouteSummary & {
  indicators: AtlasIndicatorEvidence[];
  contents: AtlasContentItem[];
  events: AtlasEventItem[];
};

function destinationMatches(value: ExplorerValue, destination: AtlasCountry) {
  const code = value.territory_code?.toUpperCase();
  return code === destination.code || code === destination.iso3;
}

function routeValues(values: ExplorerValue[], route: PublicMigrationRoute) {
  return values.filter(
    (value) =>
      value.country_code?.toUpperCase() === route.origin.code &&
      destinationMatches(value, route.destination),
  );
}

function mapIndicatorEvidence(
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

function hydrateRoute(row: {
  id: string;
  origin_country_code: string;
  destination_country_code: string;
  slug: string;
}): PublicMigrationRoute | null {
  const origin = getAtlasCountryByCode(row.origin_country_code);
  const destination = getAtlasCountryByCode(row.destination_country_code);
  if (!origin || !destination) return null;
  return { ...row, origin, destination };
}

async function publicLinkedItems(routeId: string) {
  const supabase = await createClient();
  const [contentRouteResult, eventRouteResult] = await Promise.all([
    supabase.from("content_routes").select("content_id").eq("route_id", routeId),
    supabase.from("event_routes").select("event_id").eq("route_id", routeId),
  ]);

  if (contentRouteResult.error) throw new Error(contentRouteResult.error.message);
  if (eventRouteResult.error) throw new Error(eventRouteResult.error.message);

  const contentIds = Array.from(
    new Set((contentRouteResult.data ?? []).map((row) => row.content_id)),
  );
  const eventIds = Array.from(
    new Set((eventRouteResult.data ?? []).map((row) => row.event_id)),
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

  return {
    contents: (contentResult.data ?? []) as AtlasContentItem[],
    events: (eventResult.data ?? []) as AtlasEventItem[],
  };
}

export async function listPublishedRouteSummaries(): Promise<RouteSummary[]> {
  const supabase = await createClient();
  const [routeResult, snapshot] = await Promise.all([
    supabase
      .from("migration_routes")
      .select("id, origin_country_code, destination_country_code, slug")
      .eq("is_active", true)
      .order("slug"),
    getExplorerSnapshot(),
  ]);

  if (routeResult.error) throw new Error(routeResult.error.message);

  const routes = (routeResult.data ?? [])
    .map((row) => hydrateRoute(row))
    .filter((route): route is PublicMigrationRoute => Boolean(route));

  const summaries = await Promise.all(
    routes.map(async (route) => {
      const values = routeValues(snapshot.values, route);
      const links = await publicLinkedItems(route.id);
      const dataValueCount = values.length;
      const indicatorCount = new Set(values.map((value) => value.indicator_id)).size;
      const contentCount = links.contents.length;
      const eventCount = links.events.length;
      return {
        route,
        dataValueCount,
        indicatorCount,
        contentCount,
        eventCount,
        hasEvidence: dataValueCount + contentCount + eventCount > 0,
      };
    }),
  );

  return summaries.filter((summary) => summary.hasEvidence);
}

export async function getRouteDetail(slug: string): Promise<RouteDetail | null> {
  const supabase = await createClient();
  const { data: routeRow, error } = await supabase
    .from("migration_routes")
    .select("id, origin_country_code, destination_country_code, slug")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!routeRow) return null;

  const route = hydrateRoute(routeRow);
  if (!route) return null;

  const [snapshot, links] = await Promise.all([
    getExplorerSnapshot(),
    publicLinkedItems(route.id),
  ]);
  const values = routeValues(snapshot.values, route);
  const indicators = mapIndicatorEvidence(snapshot.indicators, values);
  const dataValueCount = values.length;
  const indicatorCount = indicators.length;
  const contentCount = links.contents.length;
  const eventCount = links.events.length;
  const hasEvidence = dataValueCount + contentCount + eventCount > 0;

  return {
    route,
    dataValueCount,
    indicatorCount,
    contentCount,
    eventCount,
    hasEvidence,
    indicators,
    contents: links.contents,
    events: links.events,
  };
}
