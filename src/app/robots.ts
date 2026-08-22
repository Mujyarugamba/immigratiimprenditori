import type { MetadataRoute } from "next";

const SITE_URL = "https://immigratiimprenditori.it";

function isNetlifyPreviewLikeContext() {
  return process.env.NETLIFY === "true" && process.env.CONTEXT !== "production";
}

export default function robots(): MetadataRoute.Robots {
  if (isNetlifyPreviewLikeContext()) {
    return {
      rules: [
        {
          userAgent: "*",
          disallow: "/",
        },
      ],
    };
  }

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
