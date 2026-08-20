import assert from "node:assert/strict";
import test from "node:test";
import { dedupeRadarCandidates } from "./dedupe";
import type { RadarCandidate } from "./types";

function candidate(url: string): RadarCandidate {
  return {
    title: url,
    originalUrl: url,
    sourceLabel: "example.test",
    sourcePublishedAt: null,
    summary: null,
    itemKind: "news",
    rawMetadata: {},
  };
}

test("dedupeRadarCandidates keeps first candidate for each normalized url", () => {
  const result = dedupeRadarCandidates([
    candidate("https://example.test/a"),
    candidate("https://example.test/a"),
    candidate("https://example.test/b"),
  ]);
  assert.equal(result.items.length, 2);
  assert.equal(result.duplicates, 1);
});
