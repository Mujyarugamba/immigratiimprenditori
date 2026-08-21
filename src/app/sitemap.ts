import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { getPublicSupabaseEnv } from "@/lib/env";

const SITE_URL = "https://immigratiimprenditori.it";

const publicRoutes = [
  "",
  "/osservatorio",
  "/contenuti",
  "/eventi",
  "/cultura",
  "/dati-e-fonti",
  "/contribuisci",
  "/chi-siamo",
  "/politica-editoriale",
  "/sostieni",
  "/privacy",
  "/cookie",
  "/termini",
] as const;

function staticEntries(): MetadataRoute.Sitemap {
  return publicRoutes.map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : path === "/osservatorio" || path === "/contenuti" ? 0.9 : 0.7,
  }));
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
