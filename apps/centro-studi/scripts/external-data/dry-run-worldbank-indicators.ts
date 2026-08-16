/**
 * D1-C.1 — World Bank Indicators DRY-RUN only (Mercati M1).
 *
 *   npx tsx scripts/external-data/dry-run-worldbank-indicators.ts
 *
 * Hard rules this session:
 * - LIVE fetch against World Bank API
 * - dbWrites MUST stay 0
 * - NO --apply / NO DB / NO migration / NO publish / NO ICE scrape
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  dryRunWorldBank,
  fetchWorldBankPilot,
  WORLDBANK_INDICATORS,
  type NormalizedWbObservation,
} from "@/lib/external-data/worldbank/indicators";

function refuseApply(): void {
  if (process.argv.includes("--apply")) {
    console.error(
      "REFUSED: D1-C.1 is dry-run only. No --apply / no DB writes this session.",
    );
    process.exit(2);
  }
}

function qaSample(
  selected: NormalizedWbObservation[],
  rawByEndpoint: Map<string, unknown>,
): Array<{
  naturalKey: string;
  country: string;
  indicator: string;
  year: number;
  value: number | null;
  unit: string;
  vsSource: "PASS" | "FAIL";
  note: string;
}> {
  const out: Array<{
    naturalKey: string;
    country: string;
    indicator: string;
    year: number;
    value: number | null;
    unit: string;
    vsSource: "PASS" | "FAIL";
    note: string;
  }> = [];

  for (const obs of selected.slice(0, 8)) {
    let vsSource: "PASS" | "FAIL" = "FAIL";
    let note = "source row not found in fetched payload";
    for (const [, payload] of rawByEndpoint) {
      if (!Array.isArray(payload) || !Array.isArray(payload[1])) continue;
      const rows = payload[1] as Array<{
        indicator?: { id?: string };
        country?: { id?: string };
        date?: string;
        value?: number | null;
      }>;
      const hit = rows.find(
        (r) =>
          r.indicator?.id === obs.indicatorCode &&
          String(r.country?.id ?? "").toUpperCase() === obs.countryIso2 &&
          Number(r.date) === obs.year,
      );
      if (!hit) continue;
      if (hit.value === obs.numericValue) {
        vsSource = "PASS";
        note = "value/year/country/indicator match WB response";
      } else {
        vsSource = "FAIL";
        note = `mismatch source=${String(hit.value)} mapped=${String(obs.numericValue)}`;
      }
      break;
    }
    out.push({
      naturalKey: obs.naturalKey,
      country: obs.countryIso2,
      indicator: obs.indicatorCode,
      year: obs.year,
      value: obs.numericValue,
      unit: obs.unit,
      vsSource,
      note,
    });
  }
  return out;
}

async function main() {
  refuseApply();

  const countries = WORLDBANK_INDICATORS.pilotCountries;
  const indicators = WORLDBANK_INDICATORS.pilotIndicatorCodes;

  const marketCatalog = new Map(
    countries.map((c) => [c, `market:${c}`] as const),
  );

  const fetched = await fetchWorldBankPilot({ countries, indicators });
  const rawByEndpoint = new Map(
    fetched.payloads.map((p) => [p.apiEndpoint, p.payload] as const),
  );

  const report = dryRunWorldBank(fetched.payloads, {
    retrievedAt: fetched.retrievedAt,
    countries,
    indicators,
    marketCatalog,
  });

  // In-memory revision simulation (no DB).
  let revisionSim: {
    naturalKey: string;
    action: string;
    dbWrites: 0;
  } | null = null;
  if (report.selected[0]) {
    const base = report.selected[0];
    const existing = new Map([
      [
        base.naturalKey,
        { naturalKey: base.naturalKey, checksumSha256: base.checksumSha256 },
      ],
    ]);
    const bumpedValue = (base.numericValue ?? 0) + 1;
    const revisedPayloads = fetched.payloads.map((item) => {
      if (!Array.isArray(item.payload) || !Array.isArray(item.payload[1])) {
        return item;
      }
      const rows = item.payload[1].map((row) => {
        if (
          row.indicator?.id === base.indicatorCode &&
          String(row.country?.id ?? "").toUpperCase() === base.countryIso2 &&
          Number(row.date) === base.year
        ) {
          return { ...row, value: bumpedValue };
        }
        return row;
      });
      return {
        apiEndpoint: item.apiEndpoint,
        payload: [item.payload[0], rows] as typeof item.payload,
      };
    });
    const revised = dryRunWorldBank(revisedPayloads, {
      retrievedAt: fetched.retrievedAt,
      countries,
      indicators,
      marketCatalog,
      existing,
    });
    const action =
      revised.records.find((r) => r.observation && (r.observation as { naturalKey?: string }).naturalKey === base.naturalKey)
        ?.action ?? "UNKNOWN";
    revisionSim = {
      naturalKey: base.naturalKey,
      action,
      dbWrites: 0,
    };
  }

  const manualQa = qaSample(report.selected, rawByEndpoint);
  const qaPass = manualQa.filter((q) => q.vsSource === "PASS").length;

  const stamp = fetched.retrievedAt.replace(/[:.]/g, "-");
  const sidecarDir = join(
    process.cwd(),
    "artifacts",
    "ingestion",
    `dry-worldbank-indicators-${stamp}`,
  );
  mkdirSync(sidecarDir, { recursive: true });

  const summary = {
    mode: "dry-run" as const,
    dbWrites: 0 as const,
    autoPublish: WORLDBANK_INDICATORS.autoPublish,
    source: WORLDBANK_INDICATORS.sourceId,
    dataset: WORLDBANK_INDICATORS.datasetId,
    license: WORLDBANK_INDICATORS.license,
    licenseClass: report.licenseClass,
    attribution: WORLDBANK_INDICATORS.attribution,
    countries: [...countries],
    indicators: [...indicators],
    periods: `${WORLDBANK_INDICATORS.dateStart}:${WORLDBANK_INDICATORS.dateEnd} (map=latest non-null year)`,
    timeStrategy:
      "Fetch 2022:2024 for history/update check; map one support_resource per country×indicator at latest non-null year (D1-C).",
    fetched: report.counts.fetched,
    validated: report.counts.valid,
    rejected: report.counts.rejected,
    wouldInsert: report.counts.create,
    wouldUpdate: report.counts.update,
    unchanged: report.counts.unchanged,
    reviewRequiredFutureApply: report.counts.review_required,
    futureEditorialState: {
      substantial_status: "signaled",
      verification_status: "in_review",
      visibility_status: "editorial",
      autoPublish: false,
    },
    errors: report.errors,
    ice: WORLDBANK_INDICATORS.ice,
    naturalKeyPattern: "worldbank:{indicator}:{iso2}:{year}",
    revisionSimulation: revisionSim,
    manualQa: {
      checked: manualQa.length,
      pass: qaPass,
      fail: manualQa.length - qaPass,
      sample: manualQa.slice(0, 5),
    },
    diagnosticSample: report.selected.slice(0, 5).map((s) => ({
      naturalKey: s.naturalKey,
      name: s.name,
      summary: s.summary,
      unit: s.unit,
      marketCodeHint: s.marketCodeHint,
      websiteUrl: s.websiteUrl,
      verificationStatus: s.verificationStatus,
      visibilityStatus: s.visibilityStatus,
    })),
    endpoints: fetched.payloads.map((p) => p.apiEndpoint),
    retrievedAt: fetched.retrievedAt,
    sidecarPath: join(sidecarDir, "manifest.json"),
  };

  writeFileSync(
    summary.sidecarPath,
    JSON.stringify(
      {
        ...summary,
        provenanceClass: "P-D",
        selectedNaturalKeys: report.selected.map((s) => s.naturalKey),
      },
      null,
      2,
    ),
    "utf8",
  );

  console.log(JSON.stringify(summary, null, 2));

  if (report.errors.length) process.exit(1);
  if (summary.dbWrites !== 0) {
    console.error("GATE FAIL: dbWrites must be 0");
    process.exit(1);
  }
  if (WORLDBANK_INDICATORS.autoPublish) {
    console.error("GATE FAIL: autoPublish must remain false");
    process.exit(1);
  }
  if (qaPass < 5) {
    console.error(`GATE FAIL: manual QA PASS count ${qaPass} < 5`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
