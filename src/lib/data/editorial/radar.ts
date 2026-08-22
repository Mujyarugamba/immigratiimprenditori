import { createClient } from "@/lib/supabase/server";

export type RadarItem = {
  id: string;
  item_kind: string;
  title: string;
  source_label: string | null;
  original_url: string | null;
  relevance_band: string | null;
  priority: string;
  status: string;
  received_at: string;
};

export type RadarOverview = {
  total: number;
  newCount: number;
  reviewCount: number;
  researchCount: number;
  recent: RadarItem[];
  sourceCounts: Array<{ label: string; count: number }>;
  bandCounts: Array<{ label: string; count: number }>;
};

function rankedCounts(values: Array<string | null>) {
  const counts = new Map<string, number>();
  for (const value of values) {
    const key = value?.trim() || "Non classificato";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Array.from(counts, ([label, count]) => ({ label, count })).sort(
    (a, b) => b.count - a.count || a.label.localeCompare(b.label, "it"),
  );
}

export async function getRadarOverview(): Promise<RadarOverview> {
  const supabase = await createClient();
  const base = () => supabase.from("editorial_inbox_items");

  const [totalResult, newResult, reviewResult, researchResult, recentResult] =
    await Promise.all([
      base()
        .select("id", { count: "exact", head: true })
        .eq("source_kind", "radar"),
      base()
        .select("id", { count: "exact", head: true })
        .eq("source_kind", "radar")
        .eq("status", "new"),
      base()
        .select("id", { count: "exact", head: true })
        .eq("source_kind", "radar")
        .eq("status", "to_review"),
      base()
        .select("id", { count: "exact", head: true })
        .eq("source_kind", "radar")
        .eq("status", "needs_research"),
      base()
        .select(
          "id, item_kind, title, source_label, original_url, relevance_band, priority, status, received_at",
        )
        .eq("source_kind", "radar")
        .order("received_at", { ascending: false })
        .limit(60),
    ]);

  const recent = recentResult.error ? [] : ((recentResult.data ?? []) as RadarItem[]);

  return {
    total: totalResult.error ? recent.length : (totalResult.count ?? recent.length),
    newCount: newResult.error ? recent.filter((item) => item.status === "new").length : (newResult.count ?? 0),
    reviewCount: reviewResult.error
      ? recent.filter((item) => item.status === "to_review").length
      : (reviewResult.count ?? 0),
    researchCount: researchResult.error
      ? recent.filter((item) => item.status === "needs_research").length
      : (researchResult.count ?? 0),
    recent,
    sourceCounts: rankedCounts(recent.map((item) => item.source_label)).slice(0, 12),
    bandCounts: rankedCounts(recent.map((item) => item.relevance_band)).slice(0, 8),
  };
}
