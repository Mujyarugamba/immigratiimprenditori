import assert from "node:assert/strict";
import test from "node:test";
import { normalizeRadarUrl, sourceLabelFromUrl } from "./url";

test("normalizeRadarUrl removes fragments and common tracking parameters", () => {
  assert.equal(
    normalizeRadarUrl("https://Example.com/story/?utm_source=x&b=2&a=1#section"),
    "https://example.com/story?a=1&b=2",
  );
});

test("normalizeRadarUrl rejects unsupported protocols", () => {
  assert.equal(normalizeRadarUrl("javascript:alert(1)"), null);
});

test("sourceLabelFromUrl returns a compact hostname", () => {
  assert.equal(sourceLabelFromUrl("https://www.Example.org/a"), "example.org");
});
