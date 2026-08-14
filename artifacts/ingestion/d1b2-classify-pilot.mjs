/**
 * Classify the current Incentivi.gov pilot selection (same filters as importer).
 * Does not write to DB.
 */
import {
  dryRunIncentiviGov,
  fetchIncentiviGovOpenData,
  mapIncentiviGovDoc,
  INCENTIVI_GOV_OPENDATA,
} from "../../src/lib/external-data/incentivi-gov/opendata.ts";

function classify(row) {
  const reasons = [];
  if (!row.title?.trim()) reasons.push("missing_title");
  if (!String(row.officialUrl || "").startsWith("http"))
    reasons.push("missing_or_invalid_official_url");
  if (row.temporalAccessState === "expired") reasons.push("expired");
  if (!row.issuingAuthority?.trim()) reasons.push("missing_authority");
  if (!row.regions?.length) reasons.push("missing_territory");
  if (!row.shortDescription || row.shortDescription.trim().length < 40)
    reasons.push("thin_or_missing_summary");
  if (!row.deadline && row.temporalAccessState === "unknown")
    reasons.push("unclear_deadline");
  if (row.temporalAccessState === "unknown") reasons.push("unknown_temporal");

  const blocking = reasons.some((r) =>
    ["missing_title", "missing_or_invalid_official_url", "expired"].includes(r),
  );
  if (blocking) return { grade: "REJECT", reasons };
  if (reasons.length) return { grade: "QUESTIONABLE", reasons };
  return { grade: "READY", reasons: [] };
}

const { payload } = await fetchIncentiviGovOpenData({ rows: 1500 });
const report = dryRunIncentiviGov(payload);
const selectedKeys = report.records
  .filter((r) => r.action === "CREATE" || r.action === "UPDATE" || r.action === "UNCHANGED")
  .map((r) => {
    const m = String(r.reason || "").match(/incentivi-gov:\d+/);
    return m ? m[0] : null;
  })
  .filter(Boolean);

const byKey = new Map();
for (const doc of payload.response?.docs ?? []) {
  try {
    const mapped = mapIncentiviGovDoc(doc);
    byKey.set(mapped.naturalKey, mapped);
  } catch {
    /* skip invalid docs */
  }
}

const grades = { READY: 0, QUESTIONABLE: 0, REJECT: 0 };
const reasonAgg = {};
const detail = [];
for (const key of selectedKeys) {
  const mapped = byKey.get(key);
  if (!mapped) continue;
  const c = classify(mapped);
  grades[c.grade] += 1;
  for (const reason of c.reasons) {
    reasonAgg[reason] = (reasonAgg[reason] || 0) + 1;
  }
  detail.push({
    naturalKey: mapped.naturalKey,
    grade: c.grade,
    reasons: c.reasons,
    title: mapped.title.slice(0, 80),
    deadline: mapped.deadline,
    temporal: mapped.temporalAccessState,
    authority: mapped.issuingAuthority,
    regions: mapped.regions,
  });
}

console.log(
  JSON.stringify(
    {
      fetched: report.counts.fetched,
      valid: report.counts.valid,
      rejected: report.counts.rejected,
      create: report.counts.create,
      selected: selectedKeys.length,
      grades,
      reasonAgg,
      naturalKeys: [...selectedKeys].sort(),
      detail,
      licenseNote: INCENTIVI_GOV_OPENDATA.licenseNote,
    },
    null,
    2,
  ),
);
