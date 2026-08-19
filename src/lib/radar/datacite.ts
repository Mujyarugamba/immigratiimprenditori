import { normalizeRadarUrl } from "./url";
import type { RadarCandidate } from "./types";

const DATACITE_DOIS_ENDPOINT = "https://api.datacite.org/dois";
const QUERIES = ["migrant entrepreneurship", "immigrant entrepreneurship"] as const;

type DataCiteAttributes = {
  doi?: unknown;
  url?: unknown;
  titles?: unknown;
  publisher?: unknown;
  publicationYear?: unknown;
  creators?: unknown;
  types?: unknown;
  dates?: unknown;
};

type DataCiteEntry = {
  id?: unknown;
  attributes?: DataCiteAttributes | null;
};

type DataCiteResponse = { data?: unknown };

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function titleFrom(value: unknown): string | null {
  if (!Array.isArray(value)) return null;
  for (const entry of value) {
    if (!entry || typeof entry !== "object") continue;
    const title = text((entry as Record<string, unknown>).title);
    if (title) return title;
  }
  return null;
}

function creatorsFrom(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 8).flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const name = text((entry as Record<string, unknown>).name);
    return name ? [name] : [];
  });
}

function resourceTypeFrom(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  return text(record.resourceTypeGeneral) ?? text(record.resourceType);
}

function issuedDate(value: unknown): string | null {
  if (!Array.isArray(value)) return null;
  for (const entry of value) {
    if (!entry || typeof entry !== "object") continue;
    const record = entry as Record<string, unknown>;
    const dateType = text(record.dateType)?.toLowerCase();
    if (dateType !== "issued" && dateType !== "available") continue;
    const raw = text(record.date);
    if (!raw) continue;
    const date = new Date(raw);
    if (!Number.isNaN(date.getTime())) return date.toISOString();
  }
  return null;
}

export function normalizeDataCiteEntry(entry: DataCiteEntry): RadarCandidate | null {
  const attributes = entry.attributes;
  if (!attributes) return null;
  const title = titleFrom(attributes.titles);
  const doi = text(attributes.doi) ?? text(entry.id);
  const rawUrl = text(attributes.url) ?? (doi ? `https://doi.org/${doi}` : null);
  if (!title || !rawUrl) return null;
  const originalUrl = normalizeRadarUrl(rawUrl);
  if (!originalUrl) return null;

  return {
    title,
    originalUrl,
    sourceLabel: text(attributes.publisher) ?? "DataCite",
    sourcePublishedAt: issuedDate(attributes.dates),
    summary: null,
    itemKind: "dataset",
    rawMetadata: {
      adapter: "datacite-rest",
      doi,
      publication_year: Number(attributes.publicationYear) || null,
      creators: creatorsFrom(attributes.creators),
      resource_type: resourceTypeFrom(attributes.types),
    },
  };
}

function dateRange(): { start: string; end: string } {
  const end = new Date();
  const start = new Date(end.getTime() - 30 * 86_400_000);
  return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
}

function buildUrl(query: string): string {
  const { start, end } = dateRange();
  const url = new URL(DATACITE_DOIS_ENDPOINT);
  url.searchParams.set("resource-type-id", "dataset");
  url.searchParams.set("query", `${query} AND created:[${start} TO ${end}]`);
  url.searchParams.set("sort", "-created");
  url.searchParams.set("page[size]", "25");
  return url.toString();
}

async function fetchQuery(query: string): Promise<RadarCandidate[]> {
  const contact = process.env.RADAR_CONTACT_EMAIL?.trim();
  const agent = contact
    ? `ImmigratiImprenditori-EditorialRadar/1.0 (mailto:${contact})`
    : "ImmigratiImprenditori-EditorialRadar/1.0";
  const response = await fetch(buildUrl(query), {
    headers: { "user-agent": agent },
    signal: AbortSignal.timeout(20_000),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`DataCite request failed: ${response.status}`);
  const body = (await response.json()) as DataCiteResponse;
  if (!Array.isArray(body.data)) return [];
  return body.data
    .map((entry) => normalizeDataCiteEntry((entry ?? {}) as DataCiteEntry))
    .filter((item): item is RadarCandidate => item !== null);
}

export async function fetchDataCiteCandidates(): Promise<RadarCandidate[]> {
  const batches = await Promise.allSettled(QUERIES.map(fetchQuery));
  const candidates = batches.flatMap((batch) => (batch.status === "fulfilled" ? batch.value : []));
  if (batches.every((batch) => batch.status === "rejected")) throw new Error("All DataCite radar queries failed");
  return candidates;
}
