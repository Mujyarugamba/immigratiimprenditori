import {
  RESEARCH_CONTENT_TYPES,
  listPublishedContentsByTypes,
} from "@/lib/data/public/collections";
import { renderRss, rssResponse } from "@/lib/rss";

export async function GET() {
  try {
    const items = await listPublishedContentsByTypes(RESEARCH_CONTENT_TYPES, 50);
    const xml = renderRss({
      title: "Immigrati Imprenditori — Ricerca",
      description: "Analisi, ricerche, rapporti e note dati pubblicati dal Centro Studi.",
      path: "/feed/ricerca.xml",
      items: items.map((item) => ({
        title: item.title,
        href: `/contenuti/${item.slug}`,
        description: item.abstract,
        publishedAt: item.published_at,
      })),
    });
    return rssResponse(xml);
  } catch {
    return new Response("RSS ricerca temporaneamente non disponibile", { status: 503 });
  }
}
