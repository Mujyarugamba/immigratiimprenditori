import assert from "node:assert/strict";
import test from "node:test";
import { normalizeDataCiteEntry } from "./datacite";

test("normalizes DataCite dataset metadata", () => {
  const item = normalizeDataCiteEntry({
    id: "10.5678/dataset",
    attributes: {
      doi: "10.5678/dataset",
      url: "https://doi.org/10.5678/dataset",
      titles: [{ title: "Dataset on immigrant entrepreneurship" }],
      publisher: "Example Repository",
      publicationYear: 2026,
      creators: [{ name: "Rossi, Ada" }],
      types: { resourceTypeGeneral: "Dataset" },
    },
  });
  assert.ok(item);
  assert.equal(item.itemKind, "dataset");
  assert.equal(item.sourceLabel, "Example Repository");
  assert.equal(item.rawMetadata.resource_type, "Dataset");
});
