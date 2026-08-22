import { createClient } from "@/lib/supabase/server";

export type SearchResult = {
  kind: "content" | "indicator" | "event";
  title: string;
  excerpt: string | null;
  href: string;
  publishedAt: string | null;
};

function cleanQuery(value: string) {
  return value.trim().replaceAll("%", "").replaceAll(",", " ").slice(0, 160);
}

export async function searchPublicSite(rawQuery: string): Promise<SearchResult[]> {
  const q = cleanQuery(rawQuery);
  if (q.length < 2) return [];

  const supabase = await createClient();
  const pattern = `%${q}%`;

  const [contentsResult, indicatorsResult, eventsResult] = await Promise.all([
    supabase
      .from("contents")
      .select("slug, title, abstract, published_at")
      .eq("editorial_status", "ready")
      .eq("publication_status", "published")
      .eq("visibility_status", "public")
      .or(`title.ilike.${pattern},abstract.ilike.${pattern}`)
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(30),
    supabase
      .from("observatory_indicators")
      .select("slug, title, description, published_at")
      .eq("publication_status", "published")
      .in("operational_status", ["active", "deprecated"])
      .or(`title.ilike.${pattern},description.ilike.${pattern}`)
      .order("title")
      .limit(20),
    supabase
      .from("events")
      .select("id, title, summary, published_at")
      .eq("editorial_status", "ready")
      .eq("publication_status", "published")
      .eq("visibility_status", "public")
      .or(`title.ilike.${pattern},summary.ilike.${pattern}`)
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(20),
  ]);

  if (contentsResult.error) throw new Error(contentsResult.error.message);
  if (indicatorsResult.error) throw new Error(indicatorsResult.error.message);
  if (eventsResult.error) throw new Error(eventsResult.error.message);

  const contents: SearchResult[] = (contentsResult.data ?? []).map((item) => ({
    kind: "content",
    title: item.title,
    excerpt: item.abstract,
    href: `/contenuti/${item.slug}`,
    publishedAt: item.published_at,
  }));

  const indicators: SearchResult[] = (indicatorsResult.data ?? []).map((item) => ({
    kind: "indicator",
    title: item.title,
    excerpt: item.description,
    href: `/osservatorio/${item.slug}`,
    publishedAt: item.published_at,
  }));

  const events: SearchResult[] = (eventsResult.data ?? []).map((item) => ({
    kind: "event",
    title: item.title,
    excerpt: item.summary,
    href: `/eventi/${item.id}`,
    publishedAt: item.published_at,
  }));

  return [...indicators, ...contents, ...events];
}
