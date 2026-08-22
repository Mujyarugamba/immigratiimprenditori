import assert from "node:assert/strict";
import test from "node:test";
import {
  ATLAS_COUNTRY_CENTRES,
  ATLAS_MAP_HEIGHT,
  ATLAS_MAP_WIDTH,
  projectAtlasCoordinate,
  routeCurvePath,
} from "./map";
import { ATLAS_COUNTRIES } from "./scope";

test("every Atlas country has a cartographic anchor", () => {
  assert.equal(Object.keys(ATLAS_COUNTRY_CENTRES).length, ATLAS_COUNTRIES.length);
  for (const country of ATLAS_COUNTRIES) {
    const centre = ATLAS_COUNTRY_CENTRES[country.code];
    assert.ok(centre);
    assert.ok(centre.lon >= -180 && centre.lon <= 180);
    assert.ok(centre.lat >= -90 && centre.lat <= 90);
  }
});

test("equirectangular projection stays inside the route map", () => {
  for (const coordinate of Object.values(ATLAS_COUNTRY_CENTRES)) {
    const point = projectAtlasCoordinate(coordinate);
    assert.ok(point.x >= 0 && point.x <= ATLAS_MAP_WIDTH);
    assert.ok(point.y >= 0 && point.y <= ATLAS_MAP_HEIGHT);
  }
});

test("route path is deterministic", () => {
  const path = routeCurvePath(ATLAS_COUNTRY_CENTRES.MA, ATLAS_COUNTRY_CENTRES.IT);
  assert.match(path, /^M /);
  assert.match(path, / Q /);
});
