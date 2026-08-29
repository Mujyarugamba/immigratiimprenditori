import assert from "node:assert/strict";
import test from "node:test";
import {
  PUBLIC_VALUE_MAX_LIMIT,
  publicValueYearRange,
  resolveExplicitPage,
  resolvePublicValueStatuses,
  toPublicValuePage,
} from "./public-values";

test("public value statuses default to provisional, final and revised", () => {
  assert.deepEqual(resolvePublicValueStatuses(), [
    "provisional",
    "final",
    "revised",
  ]);
});

test("public value statuses reject withdrawn and empty filters", () => {
  assert.throws(
    () => resolvePublicValueStatuses("withdrawn" as never),
    /Unsupported public value status/,
  );
  assert.throws(() => resolvePublicValueStatuses([]), /must not be empty/);
});

test("explicit pagination is bounded and does not silently drop offset", () => {
  assert.deepEqual(resolveExplicitPage({}), { limit: 500, offset: 0 });
  assert.deepEqual(resolveExplicitPage({ limit: 80, offset: 160 }), {
    limit: 80,
    offset: 160,
  });
  assert.equal(resolveExplicitPage({ limit: 5000 }).limit, PUBLIC_VALUE_MAX_LIMIT);
  assert.throws(() => resolveExplicitPage({ limit: 0 }), /positive integer/);
  assert.throws(() => resolveExplicitPage({ offset: -1 }), /non-negative integer/);
});

test("year filter is a closed calendar bound", () => {
  assert.deepEqual(publicValueYearRange("2023"), {
    start: "2023-01-01",
    endExclusive: "2024-01-01",
  });
  assert.throws(() => publicValueYearRange("recent"), /Invalid public value year/);
});

test("page metadata exposes remaining rows instead of truncating them", () => {
  assert.deepEqual(toPublicValuePage(500, 1200, 500, 0), {
    limit: 500,
    offset: 0,
    total: 1200,
    hasMore: true,
  });
  assert.equal(toPublicValuePage(200, 200, 500, 0).hasMore, false);
});
