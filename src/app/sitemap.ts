import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/env";

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

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = getSiteUrl();
  return PUBLIC_PATHS.map((path, index) => ({
    url: `${origin}${path}`,
    changeFrequency: index === 0 ? "daily" : "weekly",
    priority: index === 0 ? 1 : index <= 7 ? 0.8 : 0.5,
  }));
}
