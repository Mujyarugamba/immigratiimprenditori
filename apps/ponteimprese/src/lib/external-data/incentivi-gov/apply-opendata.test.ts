import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { selectPilotOpportunities } from "@/lib/external-data/incentivi-gov/apply-opendata";
import {
  assertIncentiviGovSchema,
  INCENTIVI_GOV_OPENDATA,
} from "@/lib/external-data/incentivi-gov/opendata";

describe("D1-B.1 Incentivi.gov apply selection", () => {
  it("never selects auto-publish fields and keeps review-only defaults", () => {
    const { selected, dryRun } = selectPilotOpportunities(
      {
        response: {
          docs: [
            {
              zs_nid: "9001",
              zs_title: "Digitalizzazione PMI nazionale",
              zs_url: "/it/catalogo/x",
              zs_field_open_date: "2025-01-01T00:00:00",
              zs_field_close_date: "2027-12-31T00:00:00",
              zm_field_scopes_value: ["Digitalizzazione"],
              zm_field_regions_value: ["Lombardia"],
              zs_field_subject_grant: "MIMIT",
              zs_field_link: "https://www.example.gov.it/bando",
              zs_body: "Sintesi",
            },
          ],
        },
      },
      { now: new Date("2026-08-13T12:00:00Z"), pilotMax: 20 },
    );
    assert.equal(INCENTIVI_GOV_OPENDATA.autoPublish, false);
    assert.equal(selected.length, 1);
    assert.equal(selected[0].editorialStatus, "in_review");
    assert.equal(selected[0].publicationStatus, "unpublished");
    assert.equal(selected[0].visibilityLevel, "private");
    assert.equal(dryRun.dbWrites, 0);
  });

  it("fails loudly on source schema drift", () => {
    assert.throws(
      () => assertIncentiviGovSchema({ error: { msg: "bad" } }),
      /schema|error/i,
    );
  });

  it("does not select expired rows via natural-key prefix collision", () => {
    const { selected } = selectPilotOpportunities(
      {
        response: {
          docs: [
            {
              zs_nid: "1843",
              zs_title: "Digitalizzazione attiva",
              zs_url: "/it/catalogo/a",
              zs_field_open_date: "2025-01-01T00:00:00",
              zs_field_close_date: "2027-12-31T00:00:00",
              zm_field_scopes_value: ["Digitalizzazione"],
              zm_field_regions_value: ["Lombardia"],
              zs_field_link: "https://www.example.gov.it/a",
            },
            {
              zs_nid: "184",
              zs_title: "Investimento scaduto 2023",
              zs_url: "/it/catalogo/b",
              zs_field_open_date: "2022-01-01T00:00:00",
              zs_field_close_date: "2023-12-31T00:00:00",
              zm_field_scopes_value: ["Investimenti"],
              zm_field_regions_value: ["Lombardia"],
              zs_field_link: "https://www.example.gov.it/b",
            },
          ],
        },
      },
      { now: new Date("2026-08-13T12:00:00Z"), pilotMax: 20 },
    );
    assert.deepEqual(
      selected.map((s) => s.naturalKey),
      ["incentivi-gov:1843"],
    );
  });
});
