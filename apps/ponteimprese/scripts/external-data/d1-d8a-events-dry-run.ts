/**
 * Historical mixed-repo Events dry-run.
 * The events acquisition engine lives under CONDIVISO / Centro Studi
 * (`EVENTI_APP_OWNERSHIP = CENTRO_STUDI`). It is not copied into PonteImprese
 * and this script must not import `apps/centro-studi`.
 * Residual: PI_EXTERNAL_SCRIPT_FILE_DEPENDENCIES (Prompt 7 / S2-GATE-EVENTI).
 */
import {
  eventsDryRunUsage,
  parseEventsDryRunArgs,
  runEventsDryRun,
} from "@/lib/external-data/events/dry-run";

async function main() {
  const args = parseEventsDryRunArgs(process.argv.slice(2));
  if (args.help) {
    console.log(eventsDryRunUsage());
    return;
  }
  console.error("D1-D.8A dry-run: public metadata/link acquisition only");
  const output = await runEventsDryRun(args);
  console.log(JSON.stringify(output, null, 2));
  if (output.counts.total < 1) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
