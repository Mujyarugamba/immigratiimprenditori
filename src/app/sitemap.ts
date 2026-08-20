import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/env";
import {
  listPublicContentSitemapEntries,
  listPublicEventSitemapEntries,
  listPublicIndicatorSitemapEntries,
  type PublicSitemapEntry,
} from "@/lib/seo/sitemap-data";

const PUBLIC_PATHS = [
  "",
  "/osservatorio",
  "/storie",
  "/rapporti",
  "/territori",
  "/eventi",
  "/politiche",
  "/fonti",
  "/contribuisci",
  "/chi-siamo",
  "/sostieni",
  "/privacy",
] as const;

function dynamicEntries(origin: string, entries: PublicSitemapEntry[]): MetadataRoute.Sitemap {
  return entries.map((entry) => ({
    url: `${origin}${entry.path}`,
    lastModified: entry.lastModified ? new Date(entry.lastModified) : undefined,
    changeFrequency: "monthly",
    priority: 0.7,
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = getSiteUrl();
  const staticEntries: MetadataRoute.Sitemap = PUBLIC_PATHS.map((path, index) => ({
    url: `${origin}${path}`,
    changeFrequency: index === 0 ? "daily" : "weekly",
    priority: index === 0 ? 1 : index <= 7 ? 0.8 : 0.5,
  }));

  const [contents, events, indicators] = await Promise.all([
    listPublicContentSitemapEntries().catch(() => []),
    listPublicEventSitemapEntries().catch(() => []),
    listPublicIndicatorSitemapEntries().catch(() => []),
  ]);

  return [
    ...staticEntries,
    ...dynamicEntries(origin, contents),
    ...dynamicEntries(origin, events),
    ...dynamicEntries(origin, indicators),
  ];
}
