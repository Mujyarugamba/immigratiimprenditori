import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isNatureUnitCoherent } from "./observatory";

describe("observatory nature↔unit coherence", () => {
  it("accepts coherent pairs", () => {
    assert.equal(isNatureUnitCoherent("count", "units"), true);
    assert.equal(isNatureUnitCoherent("percentage", "percent"), true);
    assert.equal(isNatureUnitCoherent("currency", "eur"), true);
    assert.equal(isNatureUnitCoherent("currency", "eur_thousands"), true);
    assert.equal(isNatureUnitCoherent("ratio", "ratio"), true);
    assert.equal(isNatureUnitCoherent("index", "index_points"), true);
  });

  it("rejects incoherent pairs", () => {
    assert.equal(isNatureUnitCoherent("count", "percent"), false);
    assert.equal(isNatureUnitCoherent("percentage", "units"), false);
    assert.equal(isNatureUnitCoherent("currency", "ratio"), false);
    assert.equal(isNatureUnitCoherent("unknown", "units"), false);
  });
});
