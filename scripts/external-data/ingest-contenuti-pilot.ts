/**
 * D1-D.3 — Contenuti metadata/link-only controlled pilot ingest.
 *
 *   npx tsx scripts/external-data/ingest-contenuti-pilot.ts --mode dry-run
 *   Apply additionally requires --apply --yes --project-ref <Production ref>.
 *
 * Hard rules:
 * - max 20 curated cards; metadata/link only
 * - review-only: draft + unpublished + private; published_at null
 * - NO auto-publish
 * - Production apply requires the shared Production write authorization
 * - Do not start D1-D.4 (editorial publish)
 */

import { runContentsPilotIngest } from "@/lib/external-data/contents/apply-contents";
import { parseGuardedCommand, productionUsage } from "../../artifacts/ingestion/production-write-guard.mjs";

async function main() {
  const command = parseGuardedCommand(process.argv.slice(2), {
    operation: "Content ingest",
    modes: ["dry-run", "apply"], writeModes: ["apply"], defaultMode: "dry-run",
    extraBooleanFlags: ["--skip-redirect-check"],
  });
  if (command.help) { console.log(productionUsage({ script: "scripts/external-data/ingest-contenuti-pilot.ts", modes: ["dry-run", "apply"] })); return; }
  const allowProduction = command.authorizedWrite;
  const skipRedirectCheck = command.flags["--skip-redirect-check"];
  const mode = command.mode as "dry-run" | "apply";

  const result = await runContentsPilotIngest({
    mode,
    allowProduction,
    skipRedirectCheck,
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
    selected: result.selected.length,
    perSource: result.perSource,
    fetched: result.dryRun.counts.fetched,
    validated: result.dryRun.counts.valid,
    rejected: result.dryRun.counts.rejected,
    wouldCreate: result.dryRun.counts.create,
    wouldUpdate: result.dryRun.counts.update,
    unchangedDry: result.dryRun.counts.unchanged,
    inserted: result.db?.inserted ?? null,
    updated: result.db?.updated ?? null,
    unchanged: result.db?.unchanged ?? null,
    reviewOnlyCount: result.db?.reviewOnlyCount ?? null,
    publicCount: result.db?.publicCount ?? null,
    scheduledCount: result.db?.scheduledCount ?? null,
    publishedAtSet: result.db?.publishedAtSet ?? null,
    duplicates: result.db?.duplicates ?? null,
    offAllowlistUrls: result.db?.offAllowlistUrls ?? null,
    redirectFailures: result.redirectChecks.filter((r) => !r.ok).length,
    exclusions: result.exclusions.length,
    records: result.selected.map((s) => ({
      source: s.provenance.sourceCode,
      title: s.editorial.titleIt,
      date: s.provenance.publishedOn ?? s.provenance.updatedOn,
      canonicalUrl: s.provenance.canonicalUrl,
      naturalKey: s.naturalKey,
      editorialStatus: s.editorialStatus,
      publicationStatus: s.publicationStatus,
      visibilityStatus: s.visibilityStatus,
    })),
    errors: result.errors,
    sidecarPath: result.sidecarPath ?? null,
    retrievedAt: result.retrievedAt,
  };

  console.log(JSON.stringify(summary, null, 2));

  if (result.errors.length) process.exit(1);
  if (result.mode === "apply" && !result.isLocalTarget && !allowProduction) {
    process.exit(1);
  }
  if (result.autoPublish) {
    console.error("GATE FAIL: autoPublish must remain false.");
    process.exit(1);
  }
  // D1-D.3: fresh review-only import must leave public/published_at/scheduled at 0.
  // D1-D.4+: human-published READY rows may remain public after idempotent refresh;
  // only forbid importer-driven publication (autoPublish) and new inserts that are public.
  if (
    result.mode === "apply" &&
    (result.db?.inserted ?? 0) === 0 &&
    (result.db?.updated ?? 0) === 0
  ) {
    // Idempotent refresh — publicCount may be > 0 from prior editorial publish.
  } else if (
    result.mode === "apply" &&
    ((result.db?.publicCount ?? 0) > 0 ||
      (result.db?.publishedAtSet ?? 0) > 0 ||
      (result.db?.scheduledCount ?? 0) > 0) &&
    (result.db?.inserted ?? 0) > 0
  ) {
    console.error(
      "GATE FAIL: new inserts must stay review-only (no importer public/published_at/scheduled).",
    );
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
