import assert from "node:assert/strict";
import test from "node:test";
import type { PublicPublication } from "@/lib/data/public/publications";
import {
  bibliographyCitation,
  bibliographyStructuredData,
} from "./bibliography-structured-data";

const publication: PublicPublication = {
  id: "publication-1",
  slug: "studio-migrazioni",
  title: "Studio sulle migrazioni imprenditoriali",
  abstract: null,
  type_code: "research_report",
  published_at: "2026-08-01T10:00:00.000Z",
  report_kind: "academic_study",
  publisher_name: "Centro di ricerca",
  source_publication_year: 2025,
  source_publication_date: "2025-11-10",
  external_identifier: "doi:10.1234/example",
  document_url: "https://example.org/studio",
  authors: ["Ada Rossi", "Omar Bianchi"],
};

test("bibliography citation keeps public bibliographic fields aligned", () => {
  assert.equal(
    bibliographyCitation(publication),
    "Ada Rossi, Omar Bianchi (2025). Studio sulle migrazioni imprenditoriali. Centro di ricerca. doi:10.1234/example.",
  );
});

test("bibliography structured data exposes a conservative CreativeWork ItemList", () => {
  const structuredData = bibliographyStructuredData([publication]);

  assert.equal(structuredData["@type"], "CollectionPage");
  assert.equal(structuredData.url, "https://www.immigratiimprenditori.it/bibliografia");
  assert.equal(structuredData.mainEntity["@type"], "ItemList");
  assert.equal(structuredData.mainEntity.numberOfItems, 1);
  assert.deepEqual(structuredData.mainEntity.itemListElement[0], {
    "@type": "ListItem",
    position: 1,
    item: {
      "@type": "CreativeWork",
      name: "Studio sulle migrazioni imprenditoriali",
      url: "https://www.immigratiimprenditori.it/contenuti/studio-migrazioni",
      author: [
        { "@type": "Person", name: "Ada Rossi" },
        { "@type": "Person", name: "Omar Bianchi" },
      ],
      datePublished: "2025-11-10",
      publisher: { "@type": "Organization", name: "Centro di ricerca" },
      identifier: "doi:10.1234/example",
      citation:
        "Ada Rossi, Omar Bianchi (2025). Studio sulle migrazioni imprenditoriali. Centro di ricerca. doi:10.1234/example.",
    },
  });
});
