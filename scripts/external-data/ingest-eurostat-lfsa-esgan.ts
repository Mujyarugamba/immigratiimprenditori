/**
 * D1.3A — Eurostat lfsa_esgan controlled ingest.
 *
 *   npx tsx scripts/external-data/ingest-eurostat-lfsa-esgan.ts --dry-run
 *   npx tsx scripts/external-data/ingest-eurostat-lfsa-esgan.ts --apply
 */

import { runEurostatIngest } from "@/lib/external-data/eurostat/apply-lfsa-esgan";
import { parseGuardedCommand, productionUsage } from "../../artifacts/ingestion/production-write-guard.mjs";

async function main() {
  const command = parseGuardedCommand(process.argv.slice(2), {
    operation: "Eurostat ingest", modes: ["dry-run", "apply"], writeModes: ["apply"], defaultMode: "dry-run",
  });
  if (command.help) { console.log(productionUsage({ script: "scripts/external-data/ingest-eurostat-lfsa-esgan.ts", modes: ["dry-run", "apply"] })); return; }
  const mode = command.mode as "dry-run" | "apply";
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
