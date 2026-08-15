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
