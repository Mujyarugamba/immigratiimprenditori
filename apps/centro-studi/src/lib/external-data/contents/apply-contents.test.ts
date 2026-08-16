import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildContentsDryRun,
  normalizePilotBatch,
} from "@/lib/external-data/contents/apply-contents";
import { CONTENUTI_ACQUISITION } from "@/lib/external-data/contents/allowlist";
import {
  assertPilotCapsNotExceeded,
  CONTENUTI_PILOT_CANDIDATES,
} from "@/lib/external-data/contents/pilot-manifest";
import { planContentsRefresh } from "@/lib/external-data/contents/acquisition";

describe("D1-D.3 Contenti pilot batch", () => {
  it("respects per-source and total caps", () => {
    assertPilotCapsNotExceeded(CONTENUTI_PILOT_CANDIDATES);
    assert.ok(
      CONTENUTI_PILOT_CANDIDATES.length <= CONTENUTI_ACQUISITION.pilotCaps.total,
    );
    const by = new Map<string, number>();
    for (const c of CONTENUTI_PILOT_CANDIDATES) {
      by.set(c.sourceCode, (by.get(c.sourceCode) ?? 0) + 1);
    }
    assert.equal(by.get("ismu-rapporti"), 8);
    assert.equal(by.get("minlavoro-stranieri-lavoro"), 5);
    assert.equal(by.get("emn-european-migration-network"), 4);
    assert.ok((by.get("futurae-mlps-unioncamere") ?? 0) <= 3);
    assert.ok((by.get("futurae-mlps-unioncamere") ?? 0) >= 1);
  });

  it("normalizes all candidates as review-only metadata stubs", () => {
    const { selected, rejectedDuplicates, errors } = normalizePilotBatch();
    assert.equal(errors.length, 0);
    assert.equal(rejectedDuplicates.length, 0);
    assert.equal(selected.length, CONTENUTI_PILOT_CANDIDATES.length);
    for (const row of selected) {
      assert.equal(row.autoPublish, false);
      assert.equal(row.editorialStatus, "draft");
      assert.equal(row.publicationStatus, "unpublished");
      assert.equal(row.visibilityStatus, "private");
      assert.equal(row.ownedByEditorial, true);
      assert.equal(row.acquisitionMode, "METADATA_LINK_ONLY");
      assert.equal(row.storagePolicy.storeFullPage, false);
      assert.equal(row.storagePolicy.storeFullPdf, false);
      assert.ok(row.bodyStub.includes("Link alla fonte"));
      assert.ok(!row.bodyStub.includes("<html"));
      assert.equal(row.editorial.coverUrl, null);
    }
  });

  it("dry-run plans CREATE when DB empty and never auto-publishes", () => {
    const { selected, rejectedDuplicates, errors } = normalizePilotBatch();
    const dry = buildContentsDryRun({
      selected,
      existing: new Map(),
      rejectedDuplicates,
      normalizeErrors: errors,
      startedAt: "2026-08-13T18:00:00.000Z",
    });
    assert.equal(dry.dbWrites, 0);
    assert.equal(dry.counts.create, selected.length);
    assert.equal(dry.counts.update, 0);
    for (const row of selected) {
      const plan = planContentsRefresh({ incoming: row, existing: null });
      assert.equal(plan.autoPublish, false);
      assert.equal(plan.action, "CREATE");
    }
  });

  it("refresh plan preserves editorial axes", () => {
    const { selected } = normalizePilotBatch();
    const row = selected[0];
    const plan = planContentsRefresh({
      incoming: row,
      existing: {
        naturalKey: row.naturalKey,
        checksumSha256: "deadbeef".repeat(8),
        editorialStatus: "ready",
        publicationStatus: "unpublished",
        visibilityStatus: "private",
        title: "Titolo editato dalla redazione",
        abstract: "Sintesi umana",
        primaryCategoryCode: "culture",
        sourceTitleSha256: "different",
        sourceSummarySha256: "different",
      },
    });
    assert.equal(plan.autoPublish, false);
    assert.equal(plan.preserved.editorialStatus, "ready");
    assert.equal(plan.preserved.publicationStatus, "unpublished");
    assert.equal(plan.preserved.visibilityStatus, "private");
    assert.equal(plan.preserved.title, "Titolo editato dalla redazione");
    assert.equal(plan.preserved.abstract, "Sintesi umana");
    assert.equal(plan.preserved.primaryCategoryCode, "culture");
    assert.equal(plan.titleFromSource, false);
    assert.equal(plan.summaryFromSource, false);
  });
});
