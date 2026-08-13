/**
 * D1.3A — Eurostat lfsa_esgan controlled ingest.
 *
 *   npx tsx scripts/external-data/ingest-eurostat-lfsa-esgan.ts --dry-run
 *   npx tsx scripts/external-data/ingest-eurostat-lfsa-esgan.ts --apply
 */

import { runEurostatIngest } from "@/lib/external-data/eurostat/apply-lfsa-esgan";

async function main() {
  const apply = process.argv.includes("--apply");
  if (apply && process.argv.includes("--dry-run")) {
    console.error("Pass either --dry-run or --apply, not both.");
    process.exit(2);
  }

  const mode = apply ? "apply" : "dry-run";
  const result = await runEurostatIngest(mode);

  const summary = {
    mode: result.mode,
    dbWrites: result.mode === "dry-run" ? 0 : result.db
      ? result.db.inserted + result.db.updated
      : null,
    source: result.dryRun.sourceId,
    dataset: result.dryRun.datasetId,
    indicator: "OBS-EU-SELF-CIT",
    geography: "IT",
    referencePeriod: "2021-2023",
    recordsFetched: result.dryRun.counts.fetched,
    recordsMapped: result.dryRun.counts.valid,
    recordsRejected: result.dryRun.counts.rejected,
    new: result.db?.inserted ?? result.dryRun.counts.create,
    update: result.db?.updated ?? result.dryRun.counts.update,
    unchanged: result.db?.unchanged ?? result.dryRun.counts.unchanged,
    errors: result.dryRun.errors,
    sanity: result.sanity,
    blocked: result.blocked,
    sidecarPath: result.sidecarPath,
    db: result.db ?? null,
    retrievedAt: result.dryRun.retrievedAt,
    licenseClass: result.dryRun.licenseClass,
  };

  console.log(JSON.stringify(summary, null, 2));

  if (!result.sanity.ok) process.exit(1);
  if (result.dryRun.errors.length) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
