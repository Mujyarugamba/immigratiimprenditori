import type { PublicPublication } from "@/lib/data/public/publications";
import { absoluteUrl } from "@/lib/i18n/seo";

export function bibliographyCitation(item: PublicPublication) {
  const authors =
    item.authors.length > 0
      ? item.authors.join(", ")
      : item.publisher_name ?? "Immigrati Imprenditori";
  const year =
    item.source_publication_year ??
    (item.published_at ? new Date(item.published_at).getFullYear() : null);
  const publisher = item.publisher_name ? ` ${item.publisher_name}.` : "";
  const identifier = item.external_identifier ? ` ${item.external_identifier}.` : "";

  return `${authors}${year ? ` (${year}).` : "."} ${item.title}.${publisher}${identifier}`
    .replace(/\s+/g, " ")
    .trim();
}

export function bibliographyStructuredData(publications: PublicPublication[]) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Bibliografia scientifica — Immigrati Imprenditori",
    url: absoluteUrl("/bibliografia"),
    isPartOf: {
      "@type": "WebSite",
      name: "Immigrati Imprenditori",
      url: absoluteUrl("/"),
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: publications.length,
      itemListElement: publications.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "CreativeWork",
          name: item.title,
          url: absoluteUrl(`/contenuti/${item.slug}`),
          author:
            item.authors.length > 0
              ? item.authors.map((name) => ({ "@type": "Person", name }))
              : undefined,
          datePublished: item.source_publication_date ?? item.published_at ?? undefined,
          publisher: item.publisher_name
            ? { "@type": "Organization", name: item.publisher_name }
            : undefined,
          identifier: item.external_identifier ?? undefined,
          citation: bibliographyCitation(item),
        },
      })),
    },
  };
}
