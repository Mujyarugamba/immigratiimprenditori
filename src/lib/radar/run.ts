import { createAdminClient } from "@/lib/supabase/admin";
import { dedupeRadarCandidates } from "./dedupe";
import { fetchGdeltCandidates } from "./gdelt";
import type { RadarCandidate, RadarRunResult } from "./types";

const LOOKUP_CHUNK = 50;

async function existingUrls(urls: string[]): Promise<Set<string>> {
  const supabase = createAdminClient();
  const found = new Set<string>();

  for (let i = 0; i < urls.length; i += LOOKUP_CHUNK) {
    const chunk = urls.slice(i, i + LOOKUP_CHUNK);
    const { data, error } = await supabase
      .from("editorial_inbox_items")
      .select("original_url")
      .in("original_url", chunk);
    if (error) throw new Error(`Radar dedupe lookup failed: ${error.message}`);
    for (const row of data ?? []) {
      if (row.original_url) found.add(row.original_url);
    }
  }

  return found;
}

async function insertCandidates(candidates: RadarCandidate[]): Promise<number> {
  if (candidates.length === 0) return 0;
  const supabase = createAdminClient();
  const rows = candidates.map((candidate) => ({
    source_kind: "radar",
    item_kind: candidate.itemKind,
    title: candidate.title,
    original_url: candidate.originalUrl,
    source_label: candidate.sourceLabel,
    source_published_at: candidate.sourcePublishedAt,
    summary: candidate.summary,
    priority: "normal",
    status: "new",
    raw_metadata: candidate.rawMetadata,
  }));

  const { data, error } = await supabase
    .from("editorial_inbox_items")
    .insert(rows)
    .select("id");
  if (error) throw new Error(`Radar Inbox insert failed: ${error.message}`);
  return data?.length ?? 0;
}

export async function runEditorialRadar(): Promise<RadarRunResult> {
  const fetchedCandidates = await fetchGdeltCandidates();
  const internal = dedupeRadarCandidates(fetchedCandidates);
  const existing = await existingUrls(internal.items.map((item) => item.originalUrl));
  const newItems = internal.items.filter((item) => !existing.has(item.originalUrl));
  const inserted = await insertCandidates(newItems);

  const sources: Record<string, number> = {};
  for (const item of newItems) {
    const key = item.sourceLabel ?? "unknown";
    sources[key] = (sources[key] ?? 0) + 1;
  }

  return {
    fetched: fetchedCandidates.length,
    normalized: internal.items.length,
    duplicates: internal.duplicates + existing.size,
    inserted,
    sources,
  };
}
