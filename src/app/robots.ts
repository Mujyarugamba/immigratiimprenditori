import type { MetadataRoute } from "next";

const SITE_URL = "https://immigratiimprenditori.it";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/app/", "/accedi"],
      },
    ],
    sitemap: [
      `${SITE_URL}/sitemap.xml`,
      `${SITE_URL}/sitemap-contributors.xml`,
    ],
    host: SITE_URL,
  };
}
