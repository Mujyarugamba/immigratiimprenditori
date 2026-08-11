import type { MetadataRoute } from "next";

const PUBLIC_PATHS = [
  "/",
  "/persone",
  "/imprese",
  "/opportunita",
  "/collaborazioni",
  "/mercati",
  "/servizi",
  "/eventi",
  "/cultura",
  "/contenuti",
  "/osservatorio",
  "/organizzazioni",
  "/chi-siamo",
  "/contatti",
  "/pubblica",
  "/privacy",
  "/cookie",
  "/termini",
  "/dati-e-fonti",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "http://localhost:3000";
  const lastModified = new Date();

  return PUBLIC_PATHS.map((path) => ({
    url: `${siteUrl}${path === "/" ? "" : path}`,
    lastModified,
    changeFrequency: path === "/" ? "daily" : "weekly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
