import { normalizeRadarUrl } from "./url";
import type { RadarCandidate } from "./types";

const CROSSREF_WORKS_ENDPOINT = "https://api.crossref.org/works";
const QUERIES = ["migrant entrepreneurship", "immigrant entrepreneurship"] as const;

type CrossrefItem = {
  DOI?: unknown;
  URL?: unknown;
  title?: unknown;
  publisher?: unknown;
  type?: unknown;
  author?: unknown;
  created?: { "date-time"?: unknown } | null;
  published?: { "date-parts"?: unknown } | null;
  "container-title"?: unknown;
};

type CrossrefResponse = {
  message?: { items?: unknown };
};

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function firstText(value: unknown): string | null {
  if (!Array.isArray(value)) return text(value);
  return value.map(text).find((item): item is string => Boolean(item)) ?? null;
}

function parseDateParts(value: unknown): string | null {
  if (!Array.isArray(value) || !Array.isArray(value[0])) return null;
  const parts = value[0].map((part) => Number(part));
  const year = parts[0];
  if (!Number.isInteger(year) || year < 1000) return null;
  const month = Number.isInteger(parts[1]) ? Math.min(12, Math.max(1, parts[1])) : 1;
  const day = Number.isInteger(parts[2]) ? Math.min(31, Math.max(1, parts[2])) : 1;
  const date = new Date(Date.UTC(year, month - 1, day));
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function authors(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 8).flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const record = entry as Record<string, unknown>;
    const given = text(record.given);
    const family = text(record.family);
    const name = [given, family].filter(Boolean).join(" ");
    return name ? [name] : [];
  });
}

function itemKind(type: string | null): RadarCandidate["itemKind"] {
  if (type === "report" || type === "report-series" || type === "monograph") return "report";
  return "academic_paper";
}

export function normalizeCrossrefItem(item: CrossrefItem): RadarCandidate | null {
  const title = firstText(item.title);
  const doi = text(item.DOI);
  const rawUrl = text(item.URL) ?? (doi ? `https://doi.org/${doi}` : null);
  if (!title || !rawUrl) return null;
  const originalUrl = normalizeRadarUrl(rawUrl);
  if (!originalUrl) return null;

  const type = text(item.type);
  return {
    title,
    originalUrl,
    sourceLabel: text(item.publisher) ?? firstText(item["container-title"]) ?? "Crossref",
    sourcePublishedAt: parseDateParts(item.published?.["date-parts"]),
    summary: null,
    itemKind: itemKind(type),
    rawMetadata: {
      adapter: "crossref-rest",
      doi,
      crossref_type: type,
      authors: authors(item.author),
      container_title: firstText(item["container-title"]),
      indexed_at: text(item.created?.["date-time"]),
    },
  };
}

function isoDateDaysAgo(days: number): string {
  const date = new Date(Date.now() - days * 86_400_000);
  return date.toISOString().slice(0, 10);
}

function buildUrl(query: string): string {
  const url = new URL(CROSSREF_WORKS_ENDPOINT);
  url.searchParams.set("query.bibliographic", query);
  url.searchParams.set("filter", `from-created-date:${isoDateDaysAgo(14)}`);
  url.searchParams.set("sort", "created");
  url.searchParams.set("order", "desc");
  url.searchParams.set("rows", "25");
  const contact = process.env.RADAR_CONTACT_EMAIL?.trim();
  if (contact) url.searchParams.set("mailto", contact);
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
  if (!response.ok) throw new Error(`Crossref request failed: ${response.status}`);
  const body = (await response.json()) as CrossrefResponse;
  const items = body.message?.items;
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => normalizeCrossrefItem((item ?? {}) as CrossrefItem))
    .filter((item): item is RadarCandidate => item !== null);
}

export async function fetchCrossrefCandidates(): Promise<RadarCandidate[]> {
  const batches = await Promise.allSettled(QUERIES.map(fetchQuery));
  const candidates = batches.flatMap((batch) => (batch.status === "fulfilled" ? batch.value : []));
  if (batches.every((batch) => batch.status === "rejected")) throw new Error("All Crossref radar queries failed");
  return candidates;
}
