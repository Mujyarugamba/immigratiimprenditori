import assert from "node:assert/strict";
import test from "node:test";
import type { PublicIndicatorDetail } from "@/lib/data/public/observatory";
import { observatoryDatasetStructuredData } from "./observatory-dataset";

const indicator: PublicIndicatorDetail = {
  id: "indicator-1",
  code: "OBS-TEST-01",
  slug: "imprese-straniere-registrate",
  title: "Imprese straniere registrate",
  description: "Numero di imprese straniere registrate nel territorio osservato.",
  value_nature: "count",
  unit_code: "count",
  periodicity: "annual",
  purpose_text: "Misurare la consistenza delle imprese straniere registrate.",
  methodology_summary: "Valori pubblicati con definizione e fonte esplicite.",
  publication_status: "published",
  values: [
    {
      id: "v2",
      numeric_value: 120,
      period_start: "2025-01-01",
      period_end: "2025-12-31",
      quality_code: "official",
      territory_level: "region",
      territory_code: "IT-25",
      territory_label: "Lombardia",
      country_code: "FB",
      country_label: "Cittadinanza estera",
      source_name: "Fonte statistica",
    },
    {
      id: "v1",
      numeric_value: 100,
      period_start: "2023-01-01",
      period_end: "2023-12-31",
      quality_code: "official",
      territory_level: "country",
      territory_code: "IT",
      territory_label: "Italia",
      country_code: "FB",
      country_label: "Cittadinanza estera",
      source_name: "Fonte statistica",
    },
  ],
};

test("Observatory indicator Dataset uses canonical www URLs and real download distributions", () => {
  const schema = observatoryDatasetStructuredData(indicator);

  assert.equal(schema["@type"], "Dataset");
  assert.equal(schema.name, indicator.title);
  assert.equal(schema.identifier, indicator.code);
  assert.equal(
    schema.url,
    "https://www.immigratiimprenditori.it/osservatorio/imprese-straniere-registrate",
  );
  assert.equal(schema.temporalCoverage, "2023-01-01/2025-12-31");
  assert.deepEqual(
    schema.spatialCoverage?.map((place) => place.name).sort(),
    ["Italia", "Lombardia"],
  );
  assert.equal(JSON.stringify(schema).includes("Cittadinanza estera"), false);
  assert.equal("license" in schema, false);
  assert.deepEqual(
    schema.distribution.map((item) => [item.encodingFormat, item.contentUrl]),
    [
      [
        "application/json",
        "https://www.immigratiimprenditori.it/api/open-data/indicators?indicatore=imprese-straniere-registrate",
      ],
      [
        "text/csv",
        "https://www.immigratiimprenditori.it/api/open-data/indicators.csv?indicatore=imprese-straniere-registrate",
      ],
      [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "https://www.immigratiimprenditori.it/api/open-data/indicators.xlsx?indicatore=imprese-straniere-registrate",
      ],
    ],
  );
});

test("Dataset omits temporal and spatial coverage when the indicator has no public values", () => {
  const schema = observatoryDatasetStructuredData({ ...indicator, values: [] });
  assert.equal(schema.temporalCoverage, undefined);
  assert.equal(schema.spatialCoverage, undefined);
});
