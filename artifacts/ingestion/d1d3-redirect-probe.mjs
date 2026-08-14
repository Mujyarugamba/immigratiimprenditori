import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const code = `
import {
  normalizePilotBatch,
  checkPilotRedirects,
} from "@/lib/external-data/contents/apply-contents";

async function main() {
  const { selected, errors } = normalizePilotBatch();
  console.log(JSON.stringify({ selected: selected.length, normalizeErrors: errors }));
  const r = await checkPilotRedirects(selected);
  console.log(
    JSON.stringify(
      {
        fail: r.redirectChecks.filter((x) => !x.ok),
        okCount: r.redirectChecks.filter((x) => x.ok).length,
        errors: r.errors,
      },
      null,
      2,
    ),
  );
  if (r.errors.length) process.exit(1);
}
main();
`;
writeFileSync("artifacts/ingestion/d1d3-redirect-probe.ts", code);
const r = spawnSync("npx", ["tsx", "artifacts/ingestion/d1d3-redirect-probe.ts"], {
  encoding: "utf8",
  shell: true,
});
process.stdout.write(r.stdout || "");
process.stderr.write(r.stderr || "");
process.exit(r.status ?? 1);
