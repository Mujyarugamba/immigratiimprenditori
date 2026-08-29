import { createClient } from "@/lib/supabase/server";

export type SearchResultKind =
  | "content"
  | "indicator"
  | "event"
  | "country"
  | "territory"
  | "sector"
  | "route"
  | "author"
  | "source";

export type SearchResult = {
  kind: SearchResultKind;
  title: string;
  excerpt: string | null;
  href: string;
  publishedAt: string | null;
};

const INDEXED_KINDS = new Set<SearchResultKind>([
  "content",
  "indicator",
  "event",
  "country",
  "territory",
  "sector",
  "route",
  "author",
  "source",
]);

function cleanQuery(value: string) {
  return value
    .trim()
    .replaceAll("%", "")
    .replaceAll(",", " ")
    .replace(/\s+/g, " ")
    .slice(0, 160);
}

function excerptFromBody(value: string | null) {
  if (!value) return null;
  const clean = value.replace(/\s+/g, " ").trim();
  if (!clean) return null;
  return clean.length > 320 ? `${clean.slice(0, 317)}…` : clean;
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

async function searchIndexedDocuments(
  supabase: Awaited<ReturnType<typeof createClient>>,
  query: string,
): Promise<SearchResult[]> {
  try {
    const { data, error } = await supabase
      .from("search_documents")
      .select("entity_kind, entity_key, title, body, href, source_updated_at")
      .eq("is_public", true)
      .textSearch("search_vector", query, { type: "websearch", config: "simple" })
      .limit(80);

    if (error) return [];

    return (data ?? []).flatMap((row) => {
      const kind = row.entity_kind as SearchResultKind;
      if (!INDEXED_KINDS.has(kind)) return [];
      return [
        {
          kind,
          title: row.title,
          excerpt: excerptFromBody(row.body),
          href: row.href,
          publishedAt: row.source_updated_at,
        } satisfies SearchResult,
      ];
    });
  } catch {
    // search_documents is intentionally optional until its prepared migration is applied.
    return [];
  }
}

async function searchLegacyPublicData(
  supabase: Awaited<ReturnType<typeof createClient>>,
  query: string,
): Promise<SearchResult[]> {
  const pattern = `%${query}%`;

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

  const contents: SearchResult[] = contentsResult.error
    ? []
    : (contentsResult.data ?? []).map((item) => ({
        kind: "content",
        title: item.title,
        excerpt: item.abstract,
        href: `/contenuti/${item.slug}`,
        publishedAt: item.published_at,
      }));

  const indicators: SearchResult[] = indicatorsResult.error
    ? []
    : (indicatorsResult.data ?? []).map((item) => ({
        kind: "indicator",
        title: item.title,
        excerpt: item.description,
        href: `/osservatorio/${item.slug}`,
        publishedAt: item.published_at,
      }));

  const events: SearchResult[] = eventsResult.error
    ? []
    : (eventsResult.data ?? []).map((item) => ({
        kind: "event",
        title: item.title,
        excerpt: item.summary,
        href: `/eventi/${item.id}`,
        publishedAt: item.published_at,
      }));

  return [...indicators, ...contents, ...events];
}

export async function searchPublicSite(rawQuery: string): Promise<SearchResult[]> {
  const q = cleanQuery(rawQuery);
  if (q.length < 2) return [];

  const supabase = await createClient();
  const [indexed, fallback] = await Promise.all([
    searchIndexedDocuments(supabase, q),
    searchLegacyPublicData(supabase, q),
  ]);

  const byHref = new Map<string, SearchResult>();
  for (const result of fallback) byHref.set(result.href, result);
  for (const result of indexed) byHref.set(result.href, result);

  return Array.from(byHref.values()).sort((a, b) => {
    const scoreDiff = relevanceScore(b, q) - relevanceScore(a, q);
    if (scoreDiff !== 0) return scoreDiff;
    const aDate = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const bDate = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return bDate - aDate || a.title.localeCompare(b.title, "it");
  });
}
