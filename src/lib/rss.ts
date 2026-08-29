const SITE_URL = "https://immigratiimprenditori.it";

export type RssItem = {
  title: string;
  href: string;
  description?: string | null;
  publishedAt?: string | null;
};

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function renderRss(options: {
  title: string;
  description: string;
  path: string;
  items: RssItem[];
}) {
  const items = options.items
    .map((item) => {
      const link = item.href.startsWith("http") ? item.href : `${SITE_URL}${item.href}`;
      const pubDate = item.publishedAt ? new Date(item.publishedAt).toUTCString() : "";
      return `
        <item>
          <title>${escapeXml(item.title)}</title>
          <link>${escapeXml(link)}</link>
          <guid isPermaLink="true">${escapeXml(link)}</guid>
          ${pubDate ? `<pubDate>${pubDate}</pubDate>` : ""}
          ${item.description ? `<description>${escapeXml(item.description)}</description>` : ""}
        </item>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
    <rss version="2.0">
      <channel>
        <title>${escapeXml(options.title)}</title>
        <link>${SITE_URL}${options.path}</link>
        <description>${escapeXml(options.description)}</description>
        <language>it</language>
        ${items}
      </channel>
    </rss>`;
}

export function rssResponse(xml: string) {
  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
