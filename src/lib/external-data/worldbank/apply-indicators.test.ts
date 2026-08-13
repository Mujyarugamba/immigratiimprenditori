import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  assertApplyTarget,
  assertLocalOnlyTarget,
  isLocalSupabaseUrl,
  LOCAL_PILOT_MARKETS,
  parseChecksum,
  parseNaturalKey,
} from "@/lib/external-data/worldbank/apply-indicators";
import {
  dryRunWorldBank,
  simulateRevision,
  WORLDBANK_INDICATORS,
  type WbApiPayload,
} from "@/lib/external-data/worldbank/indicators";

function fixturePayload(): WbApiPayload {
  return [
    {
      page: 1,
      pages: 1,
      per_page: 1,
      total: 1,
      lastupdated: "2026-07-13",
    },
    [
      {
        indicator: { id: "NY.GDP.MKTP.CD", value: "GDP (current US$)" },
        country: { id: "IT", value: "Italy" },
        countryiso3code: "ITA",
        date: "2023",
        value: 100,
        unit: "",
        decimal: 0,
      },
    ],
  ];
}

describe("D1-C.2/D1-C.3 World Bank apply guards", () => {
  it("accepts local URLs; Production apply needs allowProduction", () => {
    assert.equal(isLocalSupabaseUrl("http://127.0.0.1:54321"), true);
    assert.equal(isLocalSupabaseUrl("http://localhost:54321"), true);
    assert.equal(isLocalSupabaseUrl("https://xyz.supabase.co"), false);
    assert.throws(
      () => assertLocalOnlyTarget("https://xyz.supabase.co"),
      /REFUSED/,
    );
    assert.throws(
      () => assertApplyTarget("https://xyz.supabase.co", false),
      /allowProduction/,
    );
    assert.doesNotThrow(() =>
      assertApplyTarget("https://xyz.supabase.co", true),
    );
    assert.doesNotThrow(() =>
      assertApplyTarget("http://127.0.0.1:54321", false),
    );
  });

  it("parses natural key and checksum from contact_note provenance", () => {
    const note =
      "natural_key=worldbank:NY.GDP.MKTP.CD:IT:2023 | source=worldbank-indicators | checksum=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
    assert.equal(parseNaturalKey(note), "worldbank:NY.GDP.MKTP.CD:IT:2023");
    assert.equal(
      parseChecksum(note),
      "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    );
    assert.equal(parseNaturalKey(null), null);
  });

  it("local pilot markets are exactly IT/DE/FR country refs", () => {
    assert.deepEqual(
      LOCAL_PILOT_MARKETS.map((m) => m.countryRef).sort(),
      ["DE", "FR", "IT"],
    );
    assert.equal(LOCAL_PILOT_MARKETS.length, 3);
  });

  it("review-only future apply state remains non-public", () => {
    const report = dryRunWorldBank(
      [
        {
          payload: fixturePayload(),
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
    const obs = report.selected[0];
    assert.ok(obs);
    assert.equal(obs.visibilityStatus, "editorial");
    assert.equal(obs.verificationStatus, "in_review");
    assert.equal(obs.substantialStatus, "signaled");
    assert.equal(obs.autoPublish, false);
    assert.equal(WORLDBANK_INDICATORS.autoPublish, false);
    assert.equal(WORLDBANK_INDICATORS.ice.policy, "LINK_ONLY");
  });

  it("revision keeps natural key and changes checksum (update path)", () => {
    const report = dryRunWorldBank(
      [
        {
          payload: fixturePayload(),
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
    const base = report.selected[0]!;
    const revised = simulateRevision(base, 101);
    assert.equal(revised.naturalKey, base.naturalKey);
    assert.notEqual(revised.checksumSha256, base.checksumSha256);
    assert.match(revised.contactNote, /natural_key=worldbank:NY.GDP.MKTP.CD:IT:2023/);
    assert.equal(revised.visibilityStatus, "editorial");

    const withExisting = dryRunWorldBank(
      [
        {
          payload: [
            fixturePayload()[0],
            [
              {
                ...fixturePayload()[1]![0],
                value: 101,
              },
            ],
          ],
          apiEndpoint:
            "https://api.worldbank.org/v2/country/IT/indicator/NY.GDP.MKTP.CD?format=json",
        },
      ],
      {
        countries: ["IT"],
        indicators: ["NY.GDP.MKTP.CD"],
        keepFullSeries: true,
        existing: new Map([
          [
            base.naturalKey,
            {
              naturalKey: base.naturalKey,
              checksumSha256: base.checksumSha256,
            },
          ],
        ]),
      },
    );
    assert.equal(withExisting.counts.update, 1);
    assert.equal(withExisting.counts.create, 0);
    assert.equal(withExisting.dbWrites, 0);
  });

  it("null value is never coerced to zero invent", () => {
    const report = dryRunWorldBank(
      [
        {
          payload: [
            fixturePayload()[0],
            [
              {
                ...fixturePayload()[1]![0],
                value: null,
              },
            ],
          ],
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
    assert.equal(report.counts.valid, 0);
    assert.ok(
      report.records.some(
        (r) =>
          r.action === "REVIEW_REQUIRED" &&
          String(r.reason ?? "").includes("never coerced to 0"),
      ),
    );
  });
});
