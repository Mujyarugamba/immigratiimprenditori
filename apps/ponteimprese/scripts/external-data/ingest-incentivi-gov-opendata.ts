/**
 * D1-B / D1-B.1 — Incentivi.gov open-data controlled ingest.
 *
 *   npx tsx scripts/external-data/ingest-incentivi-gov-opendata.ts --dry-run
 *   npx tsx scripts/external-data/ingest-incentivi-gov-opendata.ts --apply
 *
 * Apply writes review-only rows (editorial_status=in_review,
 * publication_status=unpublished, visibility_level=private).
 * AUTO-PUBLISH = NO. Do not point --apply at Production without D1-B.2 GO.
 */

import { runIncentiviGovIngest } from "@/lib/external-data/incentivi-gov/apply-opendata";
import { INCENTIVI_GOV_OPENDATA } from "@/lib/external-data/incentivi-gov/opendata";
import { parseGuardedCommand, productionUsage } from "../../artifacts/ingestion/production-write-guard.mjs";

async function main() {
  const command = parseGuardedCommand(process.argv.slice(2), {
    operation: "Incentivi.gov ingest", modes: ["dry-run", "apply"], writeModes: ["apply"], defaultMode: "dry-run",
  });
  if (command.help) { console.log(productionUsage({ script: "scripts/external-data/ingest-incentivi-gov-opendata.ts", modes: ["dry-run", "apply"] })); return; }
  const mode = command.mode as "dry-run" | "apply";
  const result = await runIncentiviGovIngest(mode);

  const summary = {
    mode: result.mode,
    autoPublish: result.autoPublish,
    source: INCENTIVI_GOV_OPENDATA.sourceId,
    dataset: INCENTIVI_GOV_OPENDATA.datasetId,
    endpoint: result.endpoint,
    licenseClass: result.dryRun.licenseClass,
    attribution: INCENTIVI_GOV_OPENDATA.attribution,
    fetched: result.dryRun.counts.fetched,
    validated: result.dryRun.counts.valid,
    rejected: result.dryRun.counts.rejected,
    selected: result.selected.length,
    inserted: result.db?.inserted ?? result.dryRun.counts.create,
    updated: result.db?.updated ?? result.dryRun.counts.update,
    unchanged: result.db?.unchanged ?? result.dryRun.counts.unchanged,
    reviewOnlyCount: result.db?.reviewOnlyCount ?? null,
    publishedCount: result.db?.publishedCount ?? 0,
    duplicates: result.db?.duplicates ?? 0,
    dbWrites:
      result.mode === "dry-run"
        ? 0
        : (result.db?.inserted ?? 0) + (result.db?.updated ?? 0),
    errors: result.errors,
    naturalKeys: result.selected.map((s) => s.naturalKey),
    samples: result.selected.slice(0, 5).map((s) => ({
      naturalKey: s.naturalKey,
      title: s.title.slice(0, 80),
      deadline: s.deadline,
      temporal: s.temporalAccessState,
      editorialStatus: s.editorialStatus,
      publicationStatus: s.publicationStatus,
    })),
    retrievedAt: result.retrievedAt,
    sidecarPath: result.sidecarPath,
  };

  console.log(JSON.stringify(summary, null, 2));

  if (result.dryRun.errors.length || result.errors.length) process.exit(1);
  // D1-B.3: humans may publish after review. Importer never auto-publishes
  // (autoPublish is hard-coded false; inserts always enter review-only).
  // publishedCount > 0 after apply is expected once editorial publication exists.
  if (result.autoPublish) {
    console.error("GATE FAIL: autoPublish must remain false.");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
