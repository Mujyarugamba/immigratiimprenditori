import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { checksumSha256 } from "@/lib/external-data/checksum";
import {
  dryRunLfsaEsgan,
  parseLfsaEsganDataset,
} from "@/lib/external-data/eurostat/lfsa-esgan";
import { eurostatLfsaEsganKey } from "@/lib/external-data/natural-key";

/** Minimal JSON-stat fixture (IT / SELF / THS_PER / T / Y15-64). */
const fixture = {
  label: "Self-employed persons by citizenship",
  source: "ESTAT",
  updated: "2026-06-30T11:00:00+0200",
  id: ["freq", "unit", "wstatus", "citizen", "sex", "age", "geo", "time"],
  size: [1, 1, 1, 2, 1, 1, 1, 2],
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
      category: {
        index: { "2022": 0, "2023": 1 },
        label: { "2022": "2022", "2023": "2023" },
      },
    },
  },
  // layout: citizen(2) × time(2) → 4 cells
  value: {
    "0": 3500.1, // NAT 2022
    "1": 3510.2, // NAT 2023
    "2": 280.5, // FOR 2022
    "3": 287.7, // FOR 2023
  },
};

describe("D1.2 Eurostat lfsa_esgan parser", () => {
  it("maps fixture cells to OBS-EU-SELF-CIT with IT territory", () => {
    const { observations, rejected } = parseLfsaEsganDataset(fixture);
    assert.equal(rejected.length, 0);
    assert.equal(observations.length, 4);
    assert.ok(observations.every((o) => o.indicatorCode === "OBS-EU-SELF-CIT"));
    assert.ok(observations.every((o) => o.territoryCode === "IT"));
    assert.ok(
      observations.some(
        (o) => o.citizenshipCode === "FOR" && o.numericValue === 287.7,
      ),
    );
  });

  it("builds stable natural keys and checksums", () => {
    const key = eurostatLfsaEsganKey({
      unit: "THS_PER",
      wstatus: "SELF",
      citizen: "FOR",
      sex: "T",
      age: "Y15-64",
      geo: "IT",
      year: 2023,
    });
    assert.equal(
      key,
      "eurostat:lfsa_esgan|THS_PER|SELF|FOR|T|Y15-64|IT|2023",
    );
    const a = checksumSha256({ a: 1, b: 2 });
    const b = checksumSha256({ b: 2, a: 1 });
    assert.equal(a, b);
  });

  it("dry-run is idempotent (CREATE then UNCHANGED)", () => {
    const first = dryRunLfsaEsgan(fixture);
    assert.equal(first.dbWrites, 0);
    assert.equal(first.counts.create, 4);
    assert.equal(first.counts.valid, 4);
    assert.equal(first.licenseClass, "REUSABLE_WITH_ATTRIBUTION");

    const checksums = new Map(
      first.records
        .filter((r) => r.observation)
        .map((r) => [r.observation!.naturalKey, r.observation!.checksumSha256]),
    );
    const second = dryRunLfsaEsgan(fixture, { existingChecksums: checksums });
    assert.equal(second.counts.unchanged, 4);
    assert.equal(second.counts.create, 0);
    assert.equal(second.dbWrites, 0);
  });

  it("fails loudly on schema drift (missing dimension)", () => {
    const broken = {
      ...fixture,
      id: ["freq", "unit", "wstatus", "citizen", "sex", "age", "geo"],
      size: [1, 1, 1, 2, 1, 1, 1],
    };
    assert.throws(() => parseLfsaEsganDataset(broken), /schema drift/i);
  });

  it("rejects out-of-allowlist dimensions without throwing", () => {
    const withPc = {
      ...fixture,
      dimension: {
        ...fixture.dimension,
        unit: {
          category: { index: { PC_EMP: 0 }, label: { PC_EMP: "Percentage" } },
        },
      },
      value: { "0": 10 },
      size: [1, 1, 1, 1, 1, 1, 1, 1],
      dimensionCitizen: undefined,
    };
    // Rebuild a single-cell PC_EMP dataset
    const ds = {
      label: fixture.label,
      updated: fixture.updated,
      id: fixture.id,
      size: [1, 1, 1, 1, 1, 1, 1, 1],
      dimension: {
        ...fixture.dimension,
        unit: {
          category: { index: { PC_EMP: 0 }, label: { PC_EMP: "Percentage" } },
        },
        citizen: {
          category: { index: { FOR: 0 }, label: { FOR: "Foreign country" } },
        },
        time: {
          category: { index: { "2023": 0 }, label: { "2023": "2023" } },
        },
      },
      value: { "0": 12.3 },
    };
    const { observations, rejected } = parseLfsaEsganDataset(ds);
    assert.equal(observations.length, 0);
    assert.ok(rejected.length >= 1);
    void withPc;
  });

  it("requires provenance fields on normalized observations", () => {
    const { observations } = parseLfsaEsganDataset(fixture);
    for (const o of observations) {
      assert.ok(o.sourceExternalIdentifier);
      assert.ok(o.methodologyNote);
      assert.ok(o.naturalKey);
      assert.ok(o.checksumSha256.length === 64);
      assert.match(o.periodStart, /^\d{4}-01-01$/);
      assert.match(o.periodEnd, /^\d{4}-12-31$/);
    }
  });
});
