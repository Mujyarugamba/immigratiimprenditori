import { listPublicEvents } from "@/lib/data/public/events";
import { renderRss, rssResponse } from "@/lib/rss";

export async function GET() {
  try {
    const result = await listPublicEvents();
    const xml = renderRss({
      title: "Immigrati Imprenditori — Eventi",
      description: "Eventi e appuntamenti pubblicati dal Centro Studi.",
      path: "/feed/eventi.xml",
      items: result.items.map((item) => ({
        title: item.title,
        href: `/eventi/${item.id}`,
        description: item.summary,
        publishedAt: item.next_edition?.starts_at ?? null,
      })),
    });
    return rssResponse(xml);
  } catch {
    return new Response("RSS eventi temporaneamente non disponibile", { status: 503 });
  }
}
