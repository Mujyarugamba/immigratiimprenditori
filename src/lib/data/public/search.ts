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

function relevanceScore(result: SearchResult, query: string) {
  const q = query.toLocaleLowerCase("it");
  const title = result.title.toLocaleLowerCase("it");
  const excerpt = result.excerpt?.toLocaleLowerCase("it") ?? "";

  let score = 0;
  if (title === q) score += 120;
  else if (title.startsWith(q)) score += 80;
  else if (title.includes(q)) score += 55;
  if (excerpt.includes(q)) score += 20;

  const words = q.split(/\s+/).filter(Boolean);
  for (const word of words) {
    if (title.includes(word)) score += 8;
    if (excerpt.includes(word)) score += 2;
  }

  if (result.kind === "indicator") score += 3;
  if (result.publishedAt) {
    const year = new Date(result.publishedAt).getFullYear();
    if (Number.isFinite(year)) score += Math.max(0, Math.min(5, year - 2021));
  }

  return score;
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
      .is("archived_at", null)
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
      .is("archived_at", null)
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

  return [...indicators, ...contents, ...events].sort((a, b) => {
    const scoreDiff = relevanceScore(b, q) - relevanceScore(a, q);
    if (scoreDiff !== 0) return scoreDiff;
    const aDate = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const bDate = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return bDate - aDate || a.title.localeCompare(b.title, "it");
  });
}
