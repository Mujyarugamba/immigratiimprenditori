import {
  normalizePilotBatch,
  checkPilotRedirects,
} from "@/lib/external-data/contents/apply-contents";

async function main() {
  const { selected, errors } = normalizePilotBatch();
  console.log(
    JSON.stringify({ selected: selected.length, normalizeErrors: errors }),
  );
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
