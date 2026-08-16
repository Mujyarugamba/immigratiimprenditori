import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { worldbankIndicatorKey } from "@/lib/external-data/natural-key";
import {
  assertWorldBankPayload,
  classifyValue,
  dryRunWorldBank,
  mapWorldBankObservation,
  normalizeCountryCode,
  simulateRevision,
  WORLDBANK_INDICATORS,
  type WbApiPayload,
} from "@/lib/external-data/worldbank/indicators";

function fixturePayload(overrides?: {
  value?: number | null;
  year?: string;
  countryId?: string;
  indicatorId?: string;
  unit?: string;
}): WbApiPayload {
  return [
    {
      page: 1,
      pages: 1,
      per_page: 1,
      total: 1,
      sourceid: "2",
      lastupdated: "2026-07-13",
    },
    [
      {
        indicator: {
          id: overrides?.indicatorId ?? "NY.GDP.MKTP.CD",
          value: "GDP (current US$)",
        },
        country: {
          id: overrides?.countryId ?? "IT",
          value: "Italy",
        },
        countryiso3code: "ITA",
        date: overrides?.year ?? "2023",
        value: overrides?.value === undefined ? 2316882296366.32 : overrides.value,
        unit: overrides?.unit ?? "",
        obs_status: "",
        decimal: 0,
      },
    ],
  ];
}

describe("D1-C.1 World Bank indicators", () => {
  it("parses and maps fixture observation with natural key", () => {
    const payload = fixturePayload();
    const report = dryRunWorldBank(
      [
        {
          payload,
          apiEndpoint:
            "https://api.worldbank.org/v2/country/IT/indicator/NY.GDP.MKTP.CD?format=json",
        },
      ],
      {
        countries: ["IT"],
        indicators: ["NY.GDP.MKTP.CD"],
        keepFullSeries: true,
      },
    );
    assert.equal(report.dbWrites, 0);
    assert.equal(report.counts.valid, 1);
    assert.equal(report.counts.create, 1);
    assert.equal(report.selected[0]?.naturalKey, "worldbank:NY.GDP.MKTP.CD:IT:2023");
    assert.equal(report.selected[0]?.numericValue, 2316882296366.32);
    assert.equal(report.selected[0]?.unit, "current US$");
    assert.equal(report.selected[0]?.verificationStatus, "in_review");
    assert.equal(report.selected[0]?.visibilityStatus, "editorial");
    assert.equal(report.selected[0]?.autoPublish, false);
  });

  it("normalizes country to ISO2 canonical ref without geo duplicates", () => {
    const n = normalizeCountryCode({
      iso2: "de",
      iso3: "DEU",
      label: "Germany",
    });
    assert.equal(n.canonicalRef, "DE");
    assert.equal(n.iso2, "DE");
    assert.equal(n.iso3, "DEU");
    assert.throws(() => normalizeCountryCode({ iso2: "DEU" }), /ISO2/);
    assert.throws(() => normalizeCountryCode({ iso2: "Italia" }), /ISO2/);
  });

  it("builds approved natural key and is idempotent on remapping", () => {
    const key = worldbankIndicatorKey({
      indicatorCode: "SP.POP.TOTL",
      countryIso2: "FR",
      year: 2022,
    });
    assert.equal(key, "worldbank:SP.POP.TOTL:FR:2022");

    const payload = fixturePayload({
      indicatorId: "SP.POP.TOTL",
      countryId: "FR",
      year: "2022",
      value: 67935651,
    });
    const first = dryRunWorldBank(
      [{ payload, apiEndpoint: "https://api.worldbank.org/v2/test" }],
      {
        countries: ["FR"],
        indicators: ["SP.POP.TOTL"],
        keepFullSeries: true,
      },
    );
    const existing = new Map(
      first.selected.map((s) => [
        s.naturalKey,
        { naturalKey: s.naturalKey, checksumSha256: s.checksumSha256 },
      ]),
    );
    const second = dryRunWorldBank(
      [{ payload, apiEndpoint: "https://api.worldbank.org/v2/test" }],
      {
        countries: ["FR"],
        indicators: ["SP.POP.TOTL"],
        keepFullSeries: true,
        existing,
      },
    );
    assert.equal(second.counts.unchanged, 1);
    assert.equal(second.counts.create, 0);
    assert.equal(second.dbWrites, 0);
  });

  it("revision simulation yields UPDATE without duplicate key", () => {
    const payload = fixturePayload({ value: 100 });
    const first = dryRunWorldBank(
      [{ payload, apiEndpoint: "https://api.worldbank.org/v2/test" }],
      {
        countries: ["IT"],
        indicators: ["NY.GDP.MKTP.CD"],
        keepFullSeries: true,
      },
    );
    const base = first.selected[0]!;
    const revised = simulateRevision(base, 101);
    assert.equal(revised.naturalKey, base.naturalKey);
    assert.notEqual(revised.checksumSha256, base.checksumSha256);
    assert.match(revised.contactNote, /license=CC BY 4\.0/);

    const existing = new Map([
      [
        base.naturalKey,
        { naturalKey: base.naturalKey, checksumSha256: base.checksumSha256 },
      ],
    ]);
    const revisedPayload = fixturePayload({ value: 101 });
    const next = dryRunWorldBank(
      [{ payload: revisedPayload, apiEndpoint: "https://api.worldbank.org/v2/test" }],
      {
        countries: ["IT"],
        indicators: ["NY.GDP.MKTP.CD"],
        keepFullSeries: true,
        existing,
      },
    );
    assert.equal(next.counts.update, 1);
    assert.equal(next.counts.create, 0);
    assert.equal(next.dbWrites, 0);
  });

  it("never coerces null to 0; classifies null vs missing", () => {
    assert.deepEqual(classifyValue(null), {
      numericValue: null,
      valueStatus: "null_published",
    });
    assert.deepEqual(classifyValue(undefined), {
      numericValue: null,
      valueStatus: "missing_unsupported",
    });
    assert.deepEqual(classifyValue(0), {
      numericValue: 0,
      valueStatus: "numeric",
    });
    assert.throws(() => classifyValue("12"), /non-numeric/);

    const nullPayload = fixturePayload({ value: null });
    const report = dryRunWorldBank(
      [{ payload: nullPayload, apiEndpoint: "https://api.worldbank.org/v2/test" }],
      {
        countries: ["IT"],
        indicators: ["NY.GDP.MKTP.CD"],
        keepFullSeries: true,
      },
    );
    assert.equal(report.counts.valid, 0);
    assert.ok(report.counts.rejected >= 1);
    assert.ok(
      report.records.some(
        (r) =>
          r.action === "REVIEW_REQUIRED" &&
          /never coerced to 0/i.test(r.reason ?? ""),
      ),
    );
  });

  it("requires provenance fields and rejects incomplete indicator mapping", () => {
    const mapped = mapWorldBankObservation(
      {
        indicator: { id: "NY.GDP.MKTP.CD", value: "GDP (current US$)" },
        country: { id: "IT", value: "Italy" },
        countryiso3code: "ITA",
        date: "2023",
        value: 1,
        unit: "",
        decimal: 0,
      },
      {
        retrievedAt: "2026-08-13T12:00:00.000Z",
        apiEndpoint: "https://api.worldbank.org/v2/country/IT/indicator/NY.GDP.MKTP.CD",
        sourceLastUpdated: "2026-07-13",
      },
    );
    assert.ok(mapped.observation);
    assert.match(mapped.observation!.contactNote, /retrieved_at=/);
    assert.match(mapped.observation!.contactNote, /license=CC BY 4\.0/);
    assert.match(mapped.observation!.contactNote, /indicator=NY\.GDP\.MKTP\.CD/);
    assert.match(mapped.observation!.contactNote, /api=https:\/\//);
  });

  it("fails observably on malformed payload", () => {
    assert.throws(() => assertWorldBankPayload({}), /schema drift/i);
    assert.throws(() => assertWorldBankPayload([{}]), /schema drift/i);
    const report = dryRunWorldBank(
      [{ payload: { broken: true }, apiEndpoint: "https://example.invalid" }],
      { countries: ["IT"], indicators: ["NY.GDP.MKTP.CD"] },
    );
    assert.equal(report.counts.errors, 1);
    assert.equal(report.dbWrites, 0);
  });

  it("enforces pilot caps and no auto-publish", () => {
    assert.equal(WORLDBANK_INDICATORS.autoPublish, false);
    assert.ok(
      WORLDBANK_INDICATORS.pilotCountries.length <=
        WORLDBANK_INDICATORS.pilotMaxCountries,
    );
    assert.ok(
      WORLDBANK_INDICATORS.pilotIndicatorCodes.length <=
        WORLDBANK_INDICATORS.pilotMaxIndicators,
    );
    assert.equal(WORLDBANK_INDICATORS.ice.policy, "LINK_ONLY");

    const report = dryRunWorldBank([], {
      countries: ["IT", "DE", "FR", "ES"],
      indicators: ["NY.GDP.MKTP.CD"],
    });
    assert.equal(report.counts.errors, 1);
    assert.match(report.errors[0] ?? "", /country cap/i);
  });

  it("maps percent-rate indicator without fraction conversion", () => {
    const payload = fixturePayload({
      indicatorId: "NY.GDP.MKTP.KD.ZG",
      value: 0.7,
      year: "2023",
    });
    const report = dryRunWorldBank(
      [{ payload, apiEndpoint: "https://api.worldbank.org/v2/test" }],
      {
        countries: ["IT"],
        indicators: ["NY.GDP.MKTP.KD.ZG"],
        keepFullSeries: true,
      },
    );
    assert.equal(report.selected[0]?.numericValue, 0.7);
    assert.equal(report.selected[0]?.unit, "percent (annual growth)");
    assert.match(report.selected[0]?.methodologyNotes ?? "", /not a fraction/i);
  });
});
