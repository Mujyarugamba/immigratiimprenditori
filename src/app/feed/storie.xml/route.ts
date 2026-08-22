import {
  VOICE_CONTENT_TYPES,
  listPublishedContentsByTypes,
} from "@/lib/data/public/collections";
import { renderRss, rssResponse } from "@/lib/rss";

export async function GET() {
  try {
    const items = await listPublishedContentsByTypes(VOICE_CONTENT_TYPES, 50);
    const xml = renderRss({
      title: "Immigrati Imprenditori — Storie e voci",
      description: "Storie, interviste e testimonianze pubblicate dal Centro Studi.",
      path: "/feed/storie.xml",
      items: items.map((item) => ({
        title: item.title,
        href: `/contenuti/${item.slug}`,
        description: item.abstract,
        publishedAt: item.published_at,
      })),
    });
    return rssResponse(xml);
  } catch {
    return new Response("RSS storie temporaneamente non disponibile", { status: 503 });
  }
}
