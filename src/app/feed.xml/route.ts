import { listPublicContents } from "@/lib/data/public/contents";

const SITE_URL = "https://immigratiimprenditori.it";

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export async function GET() {
  try {
    const result = await listPublicContents();
    const items = result.items
      .map((item) => {
        const link = `${SITE_URL}/contenuti/${item.slug}`;
        const pubDate = item.published_at ? new Date(item.published_at).toUTCString() : "";
        return `
          <item>
            <title>${escapeXml(item.title)}</title>
            <link>${link}</link>
            <guid isPermaLink="true">${link}</guid>
            ${pubDate ? `<pubDate>${pubDate}</pubDate>` : ""}
            ${item.abstract ? `<description>${escapeXml(item.abstract)}</description>` : ""}
          </item>`;
      })
      .join("");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
      <rss version="2.0">
        <channel>
          <title>Immigrati Imprenditori — Centro Studi</title>
          <link>${SITE_URL}</link>
          <description>Dati, analisi, ricerche e voci sull'imprenditoria migrante.</description>
          <language>it</language>
          ${items}
        </channel>
      </rss>`;

    return new Response(xml, {
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600",
      },
    });
  } catch {
    return new Response("RSS temporaneamente non disponibile", { status: 503 });
  }
}
