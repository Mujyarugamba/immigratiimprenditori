import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  deriveTemporalLabel,
  temporalLabelIt,
  TEMPORAL_LABELS_IT,
} from "@/lib/opportunities/temporal-label";

describe("opportunity temporal labels (D1-B.2)", () => {
  const now = new Date("2026-08-13T12:00:00Z");

  it("exposes the five editorial UX labels", () => {
    assert.equal(TEMPORAL_LABELS_IT.scheduled, "In apertura");
    assert.equal(TEMPORAL_LABELS_IT.open, "Aperta");
    assert.equal(TEMPORAL_LABELS_IT.expiring, "In scadenza");
    assert.equal(TEMPORAL_LABELS_IT.expired, "Scaduta");
    assert.equal(TEMPORAL_LABELS_IT.open_ended, "Senza scadenza");
  });

  it("derives In apertura / Aperta / In scadenza / Scaduta / Senza scadenza", () => {
    assert.equal(
      temporalLabelIt(
        deriveTemporalLabel({
          opensAt: "2026-09-01T00:00:00.000Z",
          closesAt: "2026-12-31T00:00:00.000Z",
          openEnded: false,
          now,
        }),
      ),
      "In apertura",
    );
    assert.equal(
      temporalLabelIt(
        deriveTemporalLabel({
          opensAt: "2025-01-01T00:00:00.000Z",
          closesAt: "2027-12-31T00:00:00.000Z",
          openEnded: false,
          now,
        }),
      ),
      "Aperta",
    );
    assert.equal(
      temporalLabelIt(
        deriveTemporalLabel({
          opensAt: "2025-01-01T00:00:00.000Z",
          closesAt: "2026-08-20T00:00:00.000Z",
          openEnded: false,
          now,
        }),
      ),
      "In scadenza",
    );
    assert.equal(
      temporalLabelIt(
        deriveTemporalLabel({
          opensAt: "2020-01-01T00:00:00.000Z",
          closesAt: "2021-01-01T00:00:00.000Z",
          openEnded: false,
          now,
        }),
      ),
      "Scaduta",
    );
    assert.equal(
      temporalLabelIt(
        deriveTemporalLabel({
          opensAt: null,
          closesAt: null,
          openEnded: true,
          now,
        }),
      ),
      "Senza scadenza",
    );
  });
});
