import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { countryDisplayNameIt } from "./geography";

describe("countryDisplayNameIt", () => {
  it("renders ISO country codes in Italian", () => {
    assert.equal(countryDisplayNameIt("IT"), "Italia");
    assert.equal(countryDisplayNameIt("US"), "Stati Uniti");
  });

  it("falls back safely for invalid or empty codes", () => {
    assert.equal(countryDisplayNameIt("XYZ"), "XYZ");
    assert.equal(countryDisplayNameIt(null), "");
  });
});
