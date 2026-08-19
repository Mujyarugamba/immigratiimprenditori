import assert from "node:assert/strict";
import test from "node:test";
import { normalizeGdeltItem } from "./gdelt";

test("normalizeGdeltItem keeps metadata only and canonicalizes source url", () => {
  const item = normalizeGdeltItem({
    title: "Migrant entrepreneurs open new businesses",
    url: "https://www.example.org/story/?utm_source=feed#top",
    date_published: "2026-08-19T10:00:00Z",
    language: "English",
    sourcecountry: "United States",
  });

  assert.ok(item);
  assert.equal(item.originalUrl, "https://example.org/story");
  assert.equal(item.sourceLabel, "example.org");
  assert.equal(item.itemKind, "news");
  assert.equal(item.summary, null);
  assert.equal(item.rawMetadata.adapter, "gdelt-doc-2");
});

test("normalizeGdeltItem rejects records without a usable title or http url", () => {
  assert.equal(normalizeGdeltItem({ title: "", url: "https://example.org" }), null);
  assert.equal(normalizeGdeltItem({ title: "Title", url: "mailto:test@example.org" }), null);
});
