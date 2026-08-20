import assert from "node:assert/strict";
import test from "node:test";
import { normalizeCrossrefItem } from "./crossref";

test("normalizes Crossref scholarly metadata without copying abstracts", () => {
  const item = normalizeCrossrefItem({
    DOI: "10.1234/example",
    URL: "https://doi.org/10.1234/example",
    title: ["Migrant entrepreneurship and local economies"],
    publisher: "Example University Press",
    type: "journal-article",
    published: { "date-parts": [[2026, 8, 1]] },
    author: [{ given: "Ada", family: "Rossi" }],
  });
  assert.ok(item);
  assert.equal(item.itemKind, "academic_paper");
  assert.equal(item.sourceLabel, "Example University Press");
  assert.equal(item.summary, null);
  assert.equal(item.rawMetadata.doi, "10.1234/example");
});
