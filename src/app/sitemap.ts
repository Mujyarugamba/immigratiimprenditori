import type { MetadataRoute } from "next";

const SITE_URL = "https://immigratiimprenditori.it";

const publicRoutes = [
  "",
  "/osservatorio",
  "/contenuti",
  "/eventi",
  "/cultura",
  "/dati-e-fonti",
  "/notizie-e-guide",
  "/contribuisci",
  "/chi-siamo",
  "/sostieni",
  "/privacy",
  "/cookie",
  "/termini",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return publicRoutes.map((path) => ({
    url: `${SITE_URL}${path}`,
  }));
}
