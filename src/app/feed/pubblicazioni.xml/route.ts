import { listPublications } from "@/lib/data/public/publications";
import { renderRss, rssResponse } from "@/lib/rss";

export async function GET() {
  try {
    const publications = await listPublications(50);
    const xml = renderRss({
      title: "Immigrati Imprenditori — Pubblicazioni",
      description: "Rapporti, studi e pubblicazioni presenti nella biblioteca del Centro Studi.",
      path: "/feed/pubblicazioni.xml",
      items: publications.map((item) => ({
        title: item.title,
        href: `/contenuti/${item.slug}`,
        description: item.abstract,
        publishedAt: item.source_publication_date ?? item.published_at,
      })),
    });
    return rssResponse(xml);
  } catch {
    return new Response("RSS pubblicazioni temporaneamente non disponibile", { status: 503 });
  }
}
