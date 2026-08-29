import assert from "node:assert/strict";
import test from "node:test";
import { formatTrendPeriodBounds } from "./mini-trend-period";

test("mini trend uses years when the endpoints are in different years", () => {
  assert.deepEqual(
    formatTrendPeriodBounds("2024-12-31", "2025-01-01"),
    ["2024", "2025"],
  );
});

test("mini trend distinguishes endpoints in the same year by month", () => {
  assert.deepEqual(
    formatTrendPeriodBounds("2025-01-01", "2025-10-01"),
    ["gen 2025", "ott 2025"],
  );
});

test("mini trend distinguishes endpoints in the same month by day", () => {
  assert.deepEqual(
    formatTrendPeriodBounds("2025-03-05", "2025-03-21"),
    ["5 mar 2025", "21 mar 2025"],
  );
});

test("mini trend calls out duplicate endpoint periods instead of repeating a label", () => {
  assert.deepEqual(
    formatTrendPeriodBounds("2025-03-05", "2025-03-05"),
    ["5 mar 2025", "stesso periodo"],
  );
});
