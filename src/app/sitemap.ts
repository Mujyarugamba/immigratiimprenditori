import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { ATLAS_COUNTRIES } from "@/lib/atlas/scope";
import { getPublicSupabaseEnv } from "@/lib/env";
import { PLATFORM_LOCALES } from "@/lib/i18n/config";

const SITE_URL = "https://immigratiimprenditori.it";

const publicRoutes = [
  "",
  "/osservatorio",
  "/contenuti",
  "/ricerca",
  "/pubblicazioni",
  "/storie",
  "/eventi",
  "/cultura",
  "/esplora",
  "/atlante",
  "/esplora/dati",
  "/esplora/mappa",
  "/esplora/territori",
  "/esplora/settori",
  "/esplora/autori",
  "/open-data",
  "/open-data/api",
  "/fonti",
  "/glossario",
  "/dati-e-fonti",
  "/contribuisci",
  "/chi-siamo",
  "/politica-editoriale",
  "/sostieni",
  "/privacy",
  "/cookie",
  "/termini",
] as const;

const fullyLocalizedCoreRoutes = [
  "",
  "/osservatorio",
  "/contenuti",
  "/ricerca",
  "/storie",
  "/eventi",
  "/esplora",
  "/esplora/dati",
  "/esplora/territori",
  "/esplora/settori",
  "/esplora/autori",
  "/open-data",
  "/fonti",
  "/dati-e-fonti",
  "/glossario",
  "/contribuisci",
  "/chi-siamo",
] as const;

function localizedUrl(locale: string, path: string) {
  if (locale === "it") return `${SITE_URL}${path}`;
  return path === "" ? `${SITE_URL}/${locale}` : `${SITE_URL}/${locale}${path}`;
}

function languageAlternates(path: string) {
  return Object.fromEntries([
    ...PLATFORM_LOCALES.map((locale) => [locale, localizedUrl(locale, path)]),
    ["x-default", `${SITE_URL}${path}`],
  ]);
}

function staticEntries(): MetadataRoute.Sitemap {
  const italian = publicRoutes.map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency:
      path === ""
        ? ("daily" as const)
        : path === "/esplora/dati" || path === "/open-data" || path === "/atlante"
          ? ("daily" as const)
          : ("weekly" as const),
    priority:
      path === ""
        ? 1
        : path === "/osservatorio" || path === "/contenuti" || path === "/esplora" || path === "/atlante"
          ? 0.9
          : path === "/esplora/dati" || path === "/open-data" || path === "/ricerca" || path === "/pubblicazioni" || path === "/storie"
            ? 0.85
            : 0.7,
    alternates: fullyLocalizedCoreRoutes.includes(path as (typeof fullyLocalizedCoreRoutes)[number])
      ? { languages: languageAlternates(path) }
      : undefined,
  }));

  const localized: MetadataRoute.Sitemap = fullyLocalizedCoreRoutes.flatMap((path) =>
    PLATFORM_LOCALES.filter((locale) => locale !== "it").map((locale) => ({
      url: localizedUrl(locale, path),
      changeFrequency:
        path === "" || path === "/esplora/dati" || path === "/open-data"
          ? ("daily" as const)
          : ("weekly" as const),
      priority:
        path === ""
          ? 0.95
          : path === "/osservatorio" || path === "/contenuti" || path === "/esplora"
            ? 0.85
            : 0.8,
      alternates: { languages: languageAlternates(path) },
    })),
  );

  return [...italian, ...localized];
}

function atlasCountryFromCode(code: string | null | undefined) {
  const normalized = code?.toUpperCase();
  if (!normalized) return undefined;
  return ATLAS_COUNTRIES.find(
    (candidate) => candidate.code === normalized || candidate.iso3 === normalized,
  );
}

function newest(previous: string | undefined, candidate: string | null | undefined) {
  if (!candidate) return previous;
  if (!previous || candidate > previous) return candidate;
  return previous;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = staticEntries();

  try {
    const { url, publishableKey } = getPublicSupabaseEnv();
    const supabase = createClient(url, publishableKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const [
      contentsResult,
      indicatorsResult,
      eventsResult,
      valuesResult,
      contentGeoResult,
      eventGeoResult,
      routesResult,
      contentRoutesResult,
      eventRoutesResult,
      territoriesResult,
      sectorsResult,
    ] = await Promise.all([
      supabase
        .from("contents")
        .select("slug, updated_at, published_at")
        .eq("editorial_status", "ready")
        .eq("publication_status", "published")
        .eq("visibility_status", "public"),
      supabase
        .from("observatory_indicators")
        .select("id, code, slug, updated_at, published_at")
        .eq("publication_status", "published")
        .in("operational_status", ["active", "deprecated"]),
      supabase
        .from("events")
        .select("id, updated_at, published_at")
        .eq("editorial_status", "ready")
        .eq("publication_status", "published")
        .eq("visibility_status", "public"),
      supabase
        .from("observatory_indicator_values")
        .select("indicator_id, territory_code, country_code, business_sector_id, updated_at, published_at")
        .eq("status", "final")
        .is("withdrawn_at", null),
      supabase.from("content_geographies").select("country_code, territory_id, updated_at"),
      supabase.from("event_geographies").select("country_code, territory_id, updated_at"),
      supabase
        .from("migration_routes")
        .select("id, origin_country_code, destination_country_code, slug, updated_at")
        .eq("is_active", true),
      supabase.from("content_routes").select("route_id, updated_at"),
      supabase.from("event_routes").select("route_id, updated_at"),
      supabase
        .from("geo_territories")
        .select("id, code, slug, updated_at")
        .eq("is_active", true)
        .in("level_kind", ["region", "province_state", "metropolitan_area", "municipality_city"]),
      supabase
        .from("business_sectors")
        .select("id, slug, updated_at")
        .eq("is_active", true),
    ]);

    const contents: MetadataRoute.Sitemap = (contentsResult.data ?? []).map((item) => ({
      url: `${SITE_URL}/contenuti/${item.slug}`,
      lastModified: item.updated_at ?? item.published_at ?? undefined,
      changeFrequency: "monthly",
      priority: 0.8,
    }));

    const indicatorRows = indicatorsResult.data ?? [];
    const indicators: MetadataRoute.Sitemap = indicatorRows.map((item) => ({
      url: `${SITE_URL}/osservatorio/${item.slug}`,
      lastModified: item.updated_at ?? item.published_at ?? undefined,
      changeFrequency: "monthly",
      priority: 0.85,
    }));

    const events: MetadataRoute.Sitemap = (eventsResult.data ?? []).map((item) => ({
      url: `${SITE_URL}/eventi/${item.id}`,
      lastModified: item.updated_at ?? item.published_at ?? undefined,
      changeFrequency: "weekly",
      priority: 0.75,
    }));

    const publishedIndicatorIds = new Set(indicatorRows.map((item) => item.id));
    const publicValues = (valuesResult.data ?? []).filter((value) =>
      publishedIndicatorIds.has(value.indicator_id),
    );

    const atlasEvidence = new Map<string, string | undefined>();
    for (const value of publicValues) {
      const country = atlasCountryFromCode(value.territory_code);
      if (!country) continue;
      atlasEvidence.set(
        country.slug,
        newest(atlasEvidence.get(country.slug), value.updated_at ?? value.published_at),
      );
    }
    for (const row of contentGeoResult.data ?? []) {
      const country = atlasCountryFromCode(row.country_code);
      if (!country) continue;
      atlasEvidence.set(country.slug, newest(atlasEvidence.get(country.slug), row.updated_at));
    }
    for (const row of eventGeoResult.data ?? []) {
      const country = atlasCountryFromCode(row.country_code);
      if (!country) continue;
      atlasEvidence.set(country.slug, newest(atlasEvidence.get(country.slug), row.updated_at));
    }

    const atlasCountries: MetadataRoute.Sitemap = Array.from(atlasEvidence).map(
      ([slug, lastModified]) => ({
        url: `${SITE_URL}/atlante/${slug}`,
        lastModified,
        changeFrequency: "monthly",
        priority: 0.82,
      }),
    );

    const contentRouteEvidence = new Map<string, string | undefined>();
    for (const row of contentRoutesResult.data ?? []) {
      contentRouteEvidence.set(row.route_id, newest(contentRouteEvidence.get(row.route_id), row.updated_at));
    }
    const eventRouteEvidence = new Map<string, string | undefined>();
    for (const row of eventRoutesResult.data ?? []) {
      eventRouteEvidence.set(row.route_id, newest(eventRouteEvidence.get(row.route_id), row.updated_at));
    }

    const routesWithEvidence = (routesResult.data ?? []).filter((route) => {
      if (contentRouteEvidence.has(route.id) || eventRouteEvidence.has(route.id)) return true;
      return publicValues.some((value) => {
        const origin = atlasCountryFromCode(value.country_code);
        const destination = atlasCountryFromCode(value.territory_code);
        return origin?.code === route.origin_country_code && destination?.code === route.destination_country_code;
      });
    });

    const routeEntries: MetadataRoute.Sitemap = routesWithEvidence.map((route) => ({
      url: `${SITE_URL}/atlante/rotte/${route.slug}`,
      lastModified: newest(
        newest(route.updated_at ?? undefined, contentRouteEvidence.get(route.id)),
        eventRouteEvidence.get(route.id),
      ),
      changeFrequency: "monthly",
      priority: 0.78,
    }));
    const routeIndex: MetadataRoute.Sitemap = routesWithEvidence.length
      ? [{ url: `${SITE_URL}/atlante/rotte`, changeFrequency: "weekly", priority: 0.8 }]
      : [];

    const contentTerritoryIds = new Set(
      (contentGeoResult.data ?? []).map((row) => row.territory_id).filter(Boolean),
    );
    const eventTerritoryIds = new Set(
      (eventGeoResult.data ?? []).map((row) => row.territory_id).filter(Boolean),
    );
    const territoryEntries: MetadataRoute.Sitemap = (territoriesResult.data ?? [])
      .filter((territory) => {
        if (contentTerritoryIds.has(territory.id) || eventTerritoryIds.has(territory.id)) return true;
        if (!territory.code) return false;
        return publicValues.some((value) => value.territory_code === territory.code);
      })
      .map((territory) => ({
        url: `${SITE_URL}/territori/${territory.slug}`,
        lastModified: territory.updated_at ?? undefined,
        changeFrequency: "monthly" as const,
        priority: 0.76,
      }));

    const sectorValueEvidence = new Map<number, string | undefined>();
    for (const value of publicValues) {
      if (value.business_sector_id == null) continue;
      sectorValueEvidence.set(
        value.business_sector_id,
        newest(sectorValueEvidence.get(value.business_sector_id), value.updated_at ?? value.published_at),
      );
    }
    const sectorEntries: MetadataRoute.Sitemap = (sectorsResult.data ?? [])
      .filter((sector) => sectorValueEvidence.has(sector.id))
      .map((sector) => ({
        url: `${SITE_URL}/settori/${sector.slug}`,
        lastModified: newest(sector.updated_at ?? undefined, sectorValueEvidence.get(sector.id)),
        changeFrequency: "monthly" as const,
        priority: 0.76,
      }));

    return [
      ...base,
      ...contents,
      ...indicators,
      ...events,
      ...atlasCountries,
      ...routeIndex,
      ...routeEntries,
      ...territoryEntries,
      ...sectorEntries,
    ];
  } catch {
    return base;
  }
}
