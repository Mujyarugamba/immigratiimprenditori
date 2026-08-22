import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { getPublicSupabaseEnv } from "@/lib/env";
import { PLATFORM_LOCALES } from "@/lib/i18n/config";

const SITE_URL = "https://immigratiimprenditori.it";

const publicRoutes = [
  "",
  "/osservatorio",
  "/contenuti",
  "/ricerca",
  "/storie",
  "/eventi",
  "/cultura",
  "/esplora",
  "/esplora/dati",
  "/esplora/territori",
  "/esplora/settori",
  "/esplora/autori",
  "/open-data",
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
        : path === "/esplora/dati" || path === "/open-data"
          ? ("daily" as const)
          : ("weekly" as const),
    priority:
      path === ""
        ? 1
        : path === "/osservatorio" || path === "/contenuti" || path === "/esplora"
          ? 0.9
          : path === "/esplora/dati" || path === "/open-data" || path === "/ricerca" || path === "/storie"
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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = staticEntries();

  try {
    const { url, publishableKey } = getPublicSupabaseEnv();
    const supabase = createClient(url, publishableKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const [contentsResult, indicatorsResult, eventsResult] = await Promise.all([
      supabase
        .from("contents")
        .select("slug, updated_at, published_at")
        .eq("editorial_status", "ready")
        .eq("publication_status", "published")
        .eq("visibility_status", "public"),
      supabase
        .from("observatory_indicators")
        .select("slug, updated_at, published_at")
        .eq("publication_status", "published")
        .in("operational_status", ["active", "deprecated"]),
      supabase
        .from("events")
        .select("id, updated_at, published_at")
        .eq("editorial_status", "ready")
        .eq("publication_status", "published")
        .eq("visibility_status", "public"),
    ]);

    const contents: MetadataRoute.Sitemap = (contentsResult.data ?? []).map((item) => ({
      url: `${SITE_URL}/contenuti/${item.slug}`,
      lastModified: item.updated_at ?? item.published_at ?? undefined,
      changeFrequency: "monthly",
      priority: 0.8,
    }));

    const indicators: MetadataRoute.Sitemap = (indicatorsResult.data ?? []).map((item) => ({
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

    return [...base, ...contents, ...indicators, ...events];
  } catch {
    return base;
  }
}
