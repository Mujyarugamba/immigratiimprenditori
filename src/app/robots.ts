import type { MetadataRoute } from "next";
import { resolveDeploymentEnvironment } from "@/lib/deployment/environment";

const SITE_URL = "https://immigratiimprenditori.it";

export default function robots(): MetadataRoute.Robots {
  const deployment = resolveDeploymentEnvironment(process.env);

  if (deployment.isReadOnlyPreview) {
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
