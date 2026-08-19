export type RadarCandidate = {
  title: string;
  originalUrl: string;
  sourceLabel: string | null;
  sourcePublishedAt: string | null;
  summary: string | null;
  itemKind:
    | "news"
    | "report"
    | "academic_paper"
    | "dataset"
    | "statistical_release"
    | "event"
    | "policy"
    | "law_regulation"
    | "story_tip"
    | "other";
  rawMetadata: Record<string, unknown>;
};

export type RadarRunResult = {
  fetched: number;
  normalized: number;
  duplicates: number;
  inserted: number;
  sources: Record<string, number>;
};
