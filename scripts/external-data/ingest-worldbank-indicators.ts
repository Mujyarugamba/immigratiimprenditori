/**
 * D1-C.2 / D1-C.3 — World Bank Indicators ingest (Mercati M1).
 *
 *   npx tsx scripts/external-data/ingest-worldbank-indicators.ts --dry-run
 *   npx tsx scripts/external-data/ingest-worldbank-indicators.ts --apply --ensure-local-catalog
 *   npx tsx scripts/external-data/ingest-worldbank-indicators.ts --dry-run --allow-production
 *   npx tsx scripts/external-data/ingest-worldbank-indicators.ts --apply --allow-production --ensure-local-catalog
 *
 * Hard rules:
 * - --apply against Production requires --allow-production
 * - NO auto-publish
 * - ICE remains LINK_ONLY (no ICE import)
 */

import { runWorldBankIngest } from "@/lib/external-data/worldbank/apply-indicators";

async function main() {
  const apply = process.argv.includes("--apply");
  const dry = process.argv.includes("--dry-run");
  if (apply && dry) {
    console.error("Pass either --dry-run or --apply, not both.");
    process.exit(2);
  }
  if (!apply && !dry) {
    console.error("Pass --dry-run or --apply.");
    process.exit(2);
  }

  const ensureLocalCatalog = process.argv.includes("--ensure-local-catalog");
  const allowProduction = process.argv.includes("--allow-production");
  const mode = apply ? "apply" : "dry-run";

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
