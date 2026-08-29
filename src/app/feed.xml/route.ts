import { listPublicContents } from "@/lib/data/public/contents";
import { renderRss, rssResponse } from "@/lib/rss";

export async function GET() {
  try {
    const result = await listPublicContents();
    const xml = renderRss({
      title: "Immigrati Imprenditori — Centro Studi",
      description: "Dati, analisi, ricerche e voci sull'imprenditoria migrante.",
      path: "/feed.xml",
      items: result.items.map((item) => ({
        title: item.title,
        href: `/contenuti/${item.slug}`,
        description: item.abstract,
        publishedAt: item.published_at,
      })),
    });
    return rssResponse(xml);
  } catch {
    return new Response("RSS temporaneamente non disponibile", { status: 503 });
  }
}
