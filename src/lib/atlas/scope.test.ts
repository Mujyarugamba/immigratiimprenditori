import assert from "node:assert/strict";
import test from "node:test";
import {
  ATLAS_CORE_COUNTRIES,
  ATLAS_COUNTRIES,
  ATLAS_EXPANSION_COUNTRIES,
  FOREIGN_SUBNATIONAL_PRIORITY,
  ITALIAN_LOCAL_PRIORITY,
  ITALIAN_REGIONS,
  isAtlasCountry,
} from "./scope";

test("first Atlas scope stays within the approved perimeter", () => {
  assert.equal(ATLAS_CORE_COUNTRIES.length, 12);
  assert.equal(ATLAS_EXPANSION_COUNTRIES.length, 8);
  assert.equal(ATLAS_COUNTRIES.length, 20);
  assert.equal(ITALIAN_REGIONS.length, 20);
  assert.ok(ITALIAN_LOCAL_PRIORITY.length >= 10);
  assert.ok(ITALIAN_LOCAL_PRIORITY.length <= 15);
  assert.equal(FOREIGN_SUBNATIONAL_PRIORITY.length, 4);

  assert.equal(new Set(ATLAS_COUNTRIES.map((country) => country.code)).size, 20);
  assert.equal(new Set(ATLAS_COUNTRIES.map((country) => country.slug)).size, 20);
  assert.equal(isAtlasCountry("IT"), true);
  assert.equal(isAtlasCountry("SN"), true);
  assert.equal(isAtlasCountry("JP"), false);
});
