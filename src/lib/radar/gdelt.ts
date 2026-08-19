import { normalizeRadarUrl, sourceLabelFromUrl } from "./url";
import type { RadarCandidate } from "./types";

const GDELT_DOC_ENDPOINT = "https://api.gdeltproject.org/api/v2/doc/doc";

const QUERIES = [
  '("migrant entrepreneur" OR "migrant entrepreneurship" OR "immigrant entrepreneur" OR "immigrant entrepreneurship")',
  '("diaspora entrepreneur" OR "diaspora entrepreneurship" OR "foreign-born entrepreneur" OR "immigrant-owned business")',
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

type JsonFeed = {
  items?: unknown;
};

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function parsePublishedAt(value: unknown): string | null {
  const raw = text(value);
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function normalizeGdeltItem(item: JsonFeedItem): RadarCandidate | null {
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
    itemKind: "news",
    rawMetadata: {
      adapter: "gdelt-doc-2",
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
  url.searchParams.set("timespan", "2days");
  url.searchParams.set("sort", "datedesc");
  url.searchParams.set("maxrecords", "75");
  return url.toString();
}

async function fetchQuery(query: string): Promise<RadarCandidate[]> {
  const response = await fetch(buildUrl(query), {
    headers: { "user-agent": "ImmigratiImprenditori-EditorialRadar/1.0" },
    signal: AbortSignal.timeout(20_000),
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`GDELT request failed: ${response.status}`);
  }

  const feed = (await response.json()) as JsonFeed;
  if (!Array.isArray(feed.items)) return [];
  return feed.items
    .map((item) => normalizeGdeltItem((item ?? {}) as JsonFeedItem))
    .filter((item): item is RadarCandidate => item !== null);
}

export async function fetchGdeltCandidates(): Promise<RadarCandidate[]> {
  const batches = await Promise.allSettled(QUERIES.map((query) => fetchQuery(query)));
  const candidates: RadarCandidate[] = [];
  for (const batch of batches) {
    if (batch.status === "fulfilled") candidates.push(...batch.value);
  }
  if (batches.every((batch) => batch.status === "rejected")) {
    throw new Error("All GDELT radar queries failed");
  }
  return candidates;
}
