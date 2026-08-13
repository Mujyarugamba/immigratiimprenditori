/**
 * D1.2 / D1.3A helper — Eurostat lfsa_esgan DRY-RUN only.
 * No DB writes. Optional network fetch; default uses embedded sample path via --fixture.
 *
 * Usage:
 *   node scripts/external-data/dry-run-eurostat-lfsa-esgan.mjs
 *   node scripts/external-data/dry-run-eurostat-lfsa-esgan.mjs --fetch
 */

import { createHash } from "node:crypto";

const API =
  "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/lfsa_esgan";

const fixture = {
  label: "Self-employed persons by citizenship",
  source: "ESTAT",
  updated: "2026-06-30T11:00:00+0200",
  id: ["freq", "unit", "wstatus", "citizen", "sex", "age", "geo", "time"],
  size: [1, 1, 1, 2, 1, 1, 1, 1],
  dimension: {
    freq: { category: { index: { A: 0 }, label: { A: "Annual" } } },
    unit: {
      category: {
        index: { THS_PER: 0 },
        label: { THS_PER: "Thousand persons" },
      },
    },
    wstatus: {
      category: {
        index: { SELF: 0 },
        label: { SELF: "Self-employed persons" },
      },
    },
    citizen: {
      category: {
        index: { NAT: 0, FOR: 1 },
        label: { NAT: "Reporting country", FOR: "Foreign country" },
      },
    },
    sex: { category: { index: { T: 0 }, label: { T: "Total" } } },
    age: {
      category: {
        index: { "Y15-64": 0 },
        label: { "Y15-64": "From 15 to 64 years" },
      },
    },
    geo: { category: { index: { IT: 0 }, label: { IT: "Italy" } } },
    time: {
      category: { index: { "2023": 0 }, label: { "2023": "2023" } },
    },
  },
  value: { 0: 3510.2, 1: 287.7 },
};

function sha256(obj) {
  return createHash("sha256")
    .update(JSON.stringify(obj, Object.keys(obj).sort()), "utf8")
    .digest("hex");
}

async function main() {
  const fetchLive = process.argv.includes("--fetch");
  let dataset = fixture;
  let retrievedAt = new Date().toISOString();

  if (fetchLive) {
    const url = `${API}?format=JSON&lang=en&geo=IT&freq=A&wstatus=SELF&unit=THS_PER&sex=T&age=Y15-64&citizen=FOR&citizen=NAT&time=2022&time=2023`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    dataset = await res.json();
    retrievedAt = new Date().toISOString();
  }

  const fetched = Object.keys(dataset.value ?? {}).length;
  const report = {
    mode: "dry-run",
    dbWrites: 0,
    sourceId: "eurostat-lfsa-esgan",
    datasetId: "lfsa_esgan",
    retrievedAt,
    sourceUpdated: dataset.updated ?? null,
    licenseClass: "REUSABLE_WITH_ATTRIBUTION",
    fetched,
    sampleChecksum: sha256({
      label: dataset.label,
      updated: dataset.updated,
      fetched,
    }),
    note: "No database write. Full parse/idempotency covered by unit tests.",
  };

  console.log(JSON.stringify(report, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
