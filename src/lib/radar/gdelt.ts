import { normalizeRadarUrl, sourceLabelFromUrl } from "./url";
import type { RadarCandidate } from "./types";

const GDELT_DOC_ENDPOINT = "https://api.gdeltproject.org/api/v2/doc/doc";

type QuerySpec = { query: string; itemKind: RadarCandidate["itemKind"] };

const QUERIES: readonly QuerySpec[] = [
  {
    query: '("migrant entrepreneur" OR "migrant entrepreneurship" OR "immigrant entrepreneur" OR "immigrant entrepreneurship")',
    itemKind: "news",
  },
  {
    query: '("diaspora entrepreneur" OR "diaspora entrepreneurship" OR "foreign-born entrepreneur" OR "immigrant-owned business")',
    itemKind: "news",
  },
  {
    query: '(("migrant entrepreneurship" OR "immigrant entrepreneurship") AND (report OR study OR research))',
    itemKind: "report",
  },
  {
    query: '(("migrant entrepreneur" OR "immigrant entrepreneur") AND (statistics OR dataset OR "data release"))',
    itemKind: "statistical_release",
  },
  {
    query: '(("migrant entrepreneur" OR "immigrant entrepreneur") AND (policy OR programme OR program))',
    itemKind: "policy",
  },
  {
    query: '(("migrant entrepreneur" OR "immigrant entrepreneur" OR "immigrant-owned business") AND (legislation OR regulation OR law))',
    itemKind: "law_regulation",
  },
  {
    query: '(("immigrant founder" OR "migrant entrepreneur") AND (summit OR conference OR forum OR event))',
    itemKind: "event",
  },
] as const;

type JsonFeedItem = {
  id?: unknown;
  url?: unknown;
  title?: unknown;
  date_published?: unknown;
  language?: unknown;
  sourcecountry?: unknown;
  domain?: unknown;
};

type JsonFeed = { items?: unknown };

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function parsePublishedAt(value: unknown): string | null {
  const raw = text(value);
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function normalizeGdeltItem(
  item: JsonFeedItem,
  discoveredKind: RadarCandidate["itemKind"] = "news",
): RadarCandidate | null {
  const title = text(item.title);
  const rawUrl = text(item.url) ?? text(item.id);
  if (!title || !rawUrl) return null;
  const originalUrl = normalizeRadarUrl(rawUrl);
  if (!originalUrl) return null;

  return {
    title,
    originalUrl,
    sourceLabel: text(item.domain) ?? sourceLabelFromUrl(originalUrl),
    sourcePublishedAt: parsePublishedAt(item.date_published),
    summary: null,
    itemKind: discoveredKind,
    rawMetadata: {
      adapter: "gdelt-doc-2",
      discovery_kind: discoveredKind,
      language: text(item.language),
      source_country: text(item.sourcecountry),
    },
  };
}

function buildUrl(query: string): string {
  const url = new URL(GDELT_DOC_ENDPOINT);
  url.searchParams.set("query", query);
  url.searchParams.set("mode", "artlist");
  url.searchParams.set("format", "jsonfeed");
  url.searchParams.set("timespan", "7days");
  url.searchParams.set("sort", "datedesc");
  url.searchParams.set("maxrecords", "40");
  return url.toString();
}

async function fetchQuery(spec: QuerySpec): Promise<RadarCandidate[]> {
  const response = await fetch(buildUrl(spec.query), {
    headers: { "user-agent": "ImmigratiImprenditori-EditorialRadar/1.0" },
    signal: AbortSignal.timeout(20_000),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`GDELT request failed: ${response.status}`);
  const feed = (await response.json()) as JsonFeed;
  if (!Array.isArray(feed.items)) return [];
  return feed.items
    .map((item) => normalizeGdeltItem((item ?? {}) as JsonFeedItem, spec.itemKind))
    .filter((item): item is RadarCandidate => item !== null);
}

export async function fetchGdeltCandidates(): Promise<RadarCandidate[]> {
  const batches = await Promise.allSettled(QUERIES.map(fetchQuery));
  const candidates = batches.flatMap((batch) => (batch.status === "fulfilled" ? batch.value : []));
  if (batches.every((batch) => batch.status === "rejected")) throw new Error("All GDELT radar queries failed");
  return candidates;
}
