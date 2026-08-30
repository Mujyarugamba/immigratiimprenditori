import type { MetadataRoute } from "next";
import { resolveDeploymentEnvironment } from "@/lib/deployment/environment";

const SITE_URL = "https://www.immigratiimprenditori.it";

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
    // The contributor sitemap route stays available, but it is intentionally
    // not advertised until at least one public contributor profile exists.
    sitemap: [`${SITE_URL}/sitemap.xml`],
    host: SITE_URL,
  };
}
