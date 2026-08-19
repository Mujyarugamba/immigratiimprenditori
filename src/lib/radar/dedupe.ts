import type { RadarCandidate } from "./types";

export function dedupeRadarCandidates(candidates: RadarCandidate[]): {
  items: RadarCandidate[];
  duplicates: number;
} {
  const seen = new Set<string>();
  const items: RadarCandidate[] = [];
  let duplicates = 0;

  for (const candidate of candidates) {
    if (seen.has(candidate.originalUrl)) {
      duplicates += 1;
      continue;
    }
    seen.add(candidate.originalUrl);
    items.push(candidate);
  }

  return { items, duplicates };
}
