import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatObservatoryPeriod,
  formatObservatoryValue,
} from "./observatory-format";

describe("observatory formatting", () => {
  it("formats percentages and counts", () => {
    assert.equal(formatObservatoryValue(12.5, "percent"), "12,5%");
    assert.equal(formatObservatoryValue(1234, "units"), "1.234");
  });

  it("formats annual periods as a year", () => {
    assert.equal(formatObservatoryPeriod("2025-01-01", "2025-12-31", "annual"), "2025");
  });

  it("keeps explicit ranges for non annual periods", () => {
    assert.match(
      formatObservatoryPeriod("2025-01-01", "2025-03-31", "quarterly"),
      /2025/,
    );
  });
});
