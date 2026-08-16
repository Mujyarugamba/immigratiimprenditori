/**
 * D1-C.2 / D1-C.3 — World Bank Indicators ingest (Mercati M1).
 *
 *   npx tsx scripts/external-data/ingest-worldbank-indicators.ts --mode dry-run
 *   Apply additionally requires --apply --yes --project-ref <Production ref>.
 *
 * Hard rules:
 * - --apply requires the shared Production write authorization
 * - NO auto-publish
 * - ICE remains LINK_ONLY (no ICE import)
 */

import { runWorldBankIngest } from "@/lib/external-data/worldbank/apply-indicators";
import { parseGuardedCommand, productionUsage } from "../../artifacts/ingestion/production-write-guard.mjs";

async function main() {
  const command = parseGuardedCommand(process.argv.slice(2), {
    operation: "World Bank ingest",
    modes: ["dry-run", "apply"], writeModes: ["apply"], defaultMode: "dry-run",
    extraBooleanFlags: ["--ensure-local-catalog"],
  });
  if (command.help) { console.log(productionUsage({ script: "scripts/external-data/ingest-worldbank-indicators.ts", modes: ["dry-run", "apply"] })); return; }
  const ensureLocalCatalog = command.flags["--ensure-local-catalog"];
  const allowProduction = command.authorizedWrite;
  const mode = command.mode as "dry-run" | "apply";

  const result = await runWorldBankIngest({
    mode,
    // Apply needs catalog; dry-run may load it if flag set for diagnostics.
    ensureLocalCatalog: ensureLocalCatalog || mode === "apply",
    allowProduction,
  });

  const summary = {
    mode: result.mode,
    targetUrl: result.targetUrl,
    isLocalTarget: result.isLocalTarget,
    allowProduction,
    dbWrites:
      result.mode === "dry-run"
        ? 0
        : (result.db?.inserted ?? 0) + (result.db?.updated ?? 0),
    autoPublish: result.autoPublish,
    source: "worldbank-indicators",
    countries: result.marketCatalog.map((m) => m.iso2),
    marketCatalog: result.marketCatalog,
    fetched: result.dryRun.counts.fetched,
    validated: result.dryRun.counts.valid,
    rejected: result.dryRun.counts.rejected,
    wouldInsert: result.dryRun.counts.create,
    wouldUpdate: result.dryRun.counts.update,
    unchangedDry: result.dryRun.counts.unchanged,
    inserted: result.db?.inserted ?? null,
    updated: result.db?.updated ?? null,
    unchanged: result.db?.unchanged ?? null,
    reviewOnlyCount: result.db?.reviewOnlyCount ?? null,
    publishedCount: result.db?.publishedCount ?? null,
    duplicates: result.db?.duplicates ?? null,
    grantProbe: result.grantProbe ?? null,
    ice: result.dryRun.icePolicy,
    errors: result.errors,
    sidecarPath: result.sidecarPath ?? null,
    retrievedAt: result.retrievedAt,
  };

  console.log(JSON.stringify(summary, null, 2));

  if (result.errors.length) process.exit(1);
  if (result.mode === "apply" && !result.isLocalTarget && !allowProduction) {
    process.exit(1);
  }
  if (result.autoPublish) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
