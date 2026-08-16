import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { sanityCheck, UNIONCAMERE_BLOCKED } from "@/lib/external-data/eurostat/apply-lfsa-esgan";
import { parseLfsaEsganDataset } from "@/lib/external-data/eurostat/lfsa-esgan";

const fixture = {
  label: "Self-employed persons by citizenship",
  source: "ESTAT",
  updated: "2026-06-30T11:00:00+0200",
  id: ["freq", "unit", "wstatus", "citizen", "sex", "age", "geo", "time"],
  size: [1, 1, 1, 2, 1, 1, 1, 1],
  dimension: {
    freq: { category: { index: { A: 0 }, label: { A: "Annual" } } },
    unit: {
      category: { index: { THS_PER: 0 }, label: { THS_PER: "Thousand persons" } },
    },
    wstatus: {
      category: { index: { SELF: 0 }, label: { SELF: "Self-employed persons" } },
    },
    citizen: {
      category: {
        index: { NAT: 0, FOR: 1 },
        label: { NAT: "Reporting country", FOR: "Foreign country" },
      },
    },
    sex: { category: { index: { T: 0 }, label: { T: "Total" } } },
    age: {
      category: { index: { "Y15-64": 0 }, label: { "Y15-64": "From 15 to 64 years" } },
    },
    geo: { category: { index: { IT: 0 }, label: { IT: "Italy" } } },
    time: {
      category: { index: { "2023": 0 }, label: { "2023": "2023" } },
    },
  },
  value: { "0": 3510.2, "1": 287.7 },
};

describe("D1.3A Eurostat apply helpers", () => {
  it("sanity-check passes on known FOR/IT/2023 sample", () => {
    const { observations } = parseLfsaEsganDataset(fixture, {
      minYear: 2023,
      maxYear: 2023,
    });
    const result = sanityCheck(observations);
    assert.equal(result.ok, true);
    assert.ok(result.notes.some((n) => n.includes("287.7")));
  });

  it("sanity-check fails on negative values", () => {
    const { observations } = parseLfsaEsganDataset(fixture, {
      minYear: 2023,
      maxYear: 2023,
    });
    observations[0]!.numericValue = -1;
    const result = sanityCheck(observations);
    assert.equal(result.ok, false);
  });

  it("declares Unioncamere P0 as blocked without inventing data", () => {
    assert.equal(UNIONCAMERE_BLOCKED.length, 3);
    assert.ok(UNIONCAMERE_BLOCKED.every((b) => /BLOCKED/.test(b)));
  });
});
