import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  assertIncentiviGovSchema,
  deriveTemporalAccessState,
  dryRunIncentiviGov,
  incentiviGovNaturalKey,
  INCENTIVI_GOV_OPENDATA,
  mapIncentiviGovDoc,
  type IncentiviGovSolrResponse,
} from "@/lib/external-data/incentivi-gov/opendata";

const sampleDoc = {
  zs_nid: "1426",
  zs_title: "Credito d’imposta digitalizzazione imprese",
  zs_url: "/it/catalogo/credito-dimposta-digitalizzazione-imprese",
  zs_field_open_date: "2024-01-01T00:00:00",
  zs_field_close_date: "2027-12-31T00:00:00",
  zm_field_regions_value: ["Lombardia", "Lazio"],
  zm_field_scopes_value: ["Digitalizzazione", "Innovazione e ricerca"],
  zs_field_subject_grant: "Ministero delle Imprese",
  zs_field_link: "https://www.example.gov.it/bando",
  zs_body: "<p>Sintesi ufficiale breve della misura.</p>",
  ds_last_update: "2024-03-28T15:51:32Z",
};

const payload: IncentiviGovSolrResponse = {
  response: { numFound: 1, docs: [sampleDoc] },
};

describe("D1-B Incentivi.gov open data", () => {
  it("builds natural key from source + external id", () => {
    assert.equal(incentiviGovNaturalKey("1426"), "incentivi-gov:1426");
  });

  it("maps Solr doc with provenance and no auto-publish defaults", () => {
    const mapped = mapIncentiviGovDoc(sampleDoc, {
      now: new Date("2026-08-13T12:00:00Z"),
    });
    assert.equal(mapped.naturalKey, "incentivi-gov:1426");
    assert.equal(mapped.externalId, "1426");
    assert.equal(mapped.editorialStatus, "in_review");
    assert.equal(mapped.publicationStatus, "unpublished");
    assert.equal(mapped.visibilityLevel, "private");
    assert.equal(mapped.origin, "external");
    assert.equal(INCENTIVI_GOV_OPENDATA.autoPublish, false);
    assert.equal(mapped.license, "IODL-2.0");
    assert.match(mapped.attribution, /Incentivi\.gov/);
    assert.equal(mapped.officialUrl, "https://www.example.gov.it/bando");
    assert.ok(mapped.shortDescription);
    assert.ok(mapped.shortDescription!.length <= 400);
    assert.equal(mapped.temporalAccessState, "open_or_ongoing");
    assert.equal(mapped.substantialStatus, "announced");
  });

  it("derives expired temporal state from deadline vs now", () => {
    assert.equal(
      deriveTemporalAccessState({
        openingDate: "2020-01-01T00:00:00.000Z",
        deadline: "2021-01-01T00:00:00.000Z",
        now: new Date("2026-08-13T00:00:00Z"),
      }),
      "expired",
    );
    const mapped = mapIncentiviGovDoc(
      {
        ...sampleDoc,
        zs_nid: "99",
        zs_field_close_date: "2020-01-01T00:00:00",
      },
      { now: new Date("2026-08-13T00:00:00Z") },
    );
    assert.equal(mapped.temporalAccessState, "expired");
    assert.equal(mapped.substantialStatus, "closed");
  });

  it("fails loudly on schema drift", () => {
    assert.throws(
      () => assertIncentiviGovSchema({} as IncentiviGovSolrResponse),
      /schema drift/i,
    );
  });

  it("rejects missing external id / duplicates / expired and enforces pilot max", () => {
    const report = dryRunIncentiviGov(
      {
        response: {
          docs: [
            sampleDoc,
            sampleDoc,
            { ...sampleDoc, zs_nid: "2001", zs_title: "Formazione PMI" },
            {
              ...sampleDoc,
              zs_nid: "2002",
              zs_title: "Digitalizzazione scaduta",
              zs_field_close_date: "2020-01-01T00:00:00",
            },
            { zs_title: "no id" },
            {
              zs_nid: "3001",
              zs_title: "Misura agricola generica",
              zs_url: "/it/catalogo/x",
              zm_field_scopes_value: ["Agricoltura"],
              zm_field_regions_value: ["Sicilia"],
            },
          ],
        },
      },
      { pilotMax: 1, now: new Date("2026-08-13T00:00:00Z") },
    );
    assert.equal(report.dbWrites, 0);
    assert.equal(report.counts.create, 1);
    assert.ok(report.counts.rejected >= 4);
    assert.ok(
      report.records.some((r) => r.reason === "pilot_excludes_expired"),
    );
    assert.ok(report.counts.review_required >= 1);
    assert.equal(
      report.records.filter((r) => r.action === "CREATE").length,
      1,
    );
  });

  it("is idempotent: unchanged then update on checksum change", () => {
    const first = mapIncentiviGovDoc(sampleDoc, {
      now: new Date("2026-08-13T00:00:00Z"),
    });
    const existing = new Map([
      [
        first.naturalKey,
        { naturalKey: first.naturalKey, checksumSha256: first.checksumSha256 },
      ],
    ]);
    const unchanged = dryRunIncentiviGov(payload, {
      existing,
      skipPilotFilter: true,
      now: new Date("2026-08-13T00:00:00Z"),
    });
    assert.equal(unchanged.counts.unchanged, 1);
    assert.equal(unchanged.counts.update, 0);

    const updatedPayload: IncentiviGovSolrResponse = {
      response: {
        docs: [
          {
            ...sampleDoc,
            zs_title: "Credito d’imposta digitalizzazione imprese (aggiornato)",
          },
        ],
      },
    };
    const updated = dryRunIncentiviGov(updatedPayload, {
      existing,
      skipPilotFilter: true,
      now: new Date("2026-08-13T00:00:00Z"),
    });
    assert.equal(updated.counts.update, 1);
    assert.equal(updated.counts.create, 0);
  });

  it("requires provenance fields on mapped rows", () => {
    const mapped = mapIncentiviGovDoc(sampleDoc);
    assert.ok(mapped.naturalKey);
    assert.ok(mapped.officialUrl.startsWith("https://"));
    assert.ok(mapped.sourcePageUrl.includes("incentivi.gov.it"));
    assert.equal(mapped.license, "IODL-2.0");
    assert.ok(mapped.attribution);
    assert.ok(mapped.checksumSha256.length >= 32);
  });
});
