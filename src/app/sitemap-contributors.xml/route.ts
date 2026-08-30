import { createClient } from "@supabase/supabase-js";
import { getPublicSupabaseEnv } from "@/lib/env";

const SITE_URL = "https://www.immigratiimprenditori.it";

function xml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export async function GET() {
  let entries = "";

  try {
    const { url, publishableKey } = getPublicSupabaseEnv();
    const supabase = createClient(url, publishableKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await supabase
      .from("profiles")
      .select("slug, updated_at, published_at")
      .eq("is_public", true)
      .eq("is_active", true)
      .is("deleted_at", null)
      .not("slug", "is", null)
      .order("slug");

    if (!error) {
      entries = (data ?? [])
        .filter((profile) => Boolean(profile.slug))
        .map((profile) => {
          const loc = `${SITE_URL}/contributori/${encodeURIComponent(profile.slug)}`;
          const lastmod = profile.updated_at ?? profile.published_at;
          return [
            "  <url>",
            `    <loc>${xml(loc)}</loc>`,
            lastmod ? `    <lastmod>${xml(lastmod)}</lastmod>` : null,
            "    <changefreq>monthly</changefreq>",
            "    <priority>0.70</priority>",
            "  </url>",
          ]
            .filter(Boolean)
            .join("\n");
        })
        .join("\n");
    }
  } catch {
    // Fail closed: return a valid empty sitemap rather than leaking an error page.
  }

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    entries,
    "</urlset>",
  ]
    .filter(Boolean)
    .join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
