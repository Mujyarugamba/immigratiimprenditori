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

export type RadarRunOptions = {
  write?: boolean;
  maxInsert?: number;
};

export type RadarRunResult = {
  mode: "preview" | "write";
  fetched: number;
  normalized: number;
  duplicates: number;
  newCandidates: number;
  selected: number;
  capped: number;
  inserted: number;
  sources: Record<string, number>;
};
