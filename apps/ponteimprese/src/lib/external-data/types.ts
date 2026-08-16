/** Shared contracts for D1 external-data ingestion (design + dry-run). */

export type LicenseClass =
  | "OPEN_REUSABLE"
  | "REUSABLE_WITH_ATTRIBUTION"
  | "API_TERMS"
  | "CURATED_ONLY"
  | "UNCLEAR"
  | "DO_NOT_INGEST";

export type IngestAction =
  | "CREATE"
  | "UPDATE"
  | "UNCHANGED"
  | "SUPERSEDE"
  | "REJECT"
  | "REVIEW_REQUIRED";

export type DryRunCounts = {
  fetched: number;
  valid: number;
  rejected: number;
  create: number;
  update: number;
  unchanged: number;
  supersede: number;
  review_required: number;
  errors: number;
};

export type NormalizedObservation = {
  indicatorCode: string;
  naturalKey: string;
  numericValue: number;
  periodStart: string; // YYYY-MM-DD
  periodEnd: string;
  territoryLevel: "italy" | "region" | "province" | "other";
  territoryCode: string;
  territoryLabel: string;
  /** Eurostat citizen code reused in country_* columns — not a market country. */
  citizenshipCode?: string;
  citizenshipLabel?: string;
  unitNote: string;
  qualityCode: "official" | "estimated" | "derived" | "self_reported";
  sourceExternalIdentifier: string;
  sourceUpdated?: string;
  methodologyNote: string;
  checksumSha256: string;
};

export type DryRunRecord = {
  action: IngestAction;
  observation?: NormalizedObservation;
  reason?: string;
};

export type DryRunReport = {
  runId: string;
  sourceId: string;
  datasetId: string;
  mode: "dry-run";
  startedAt: string;
  endedAt: string;
  retrievedAt: string;
  licenseClass: LicenseClass;
  licenseNote: string;
  counts: DryRunCounts;
  records: DryRunRecord[];
  errors: string[];
  dbWrites: 0;
};
