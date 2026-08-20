import { createClient } from "@/lib/supabase/server";

export type RadarInboxItem = {
  id: string;
  title: string;
  source_label: string | null;
  original_url: string | null;
  source_published_at: string | null;
  status: string;
  received_at: string;
};

export type RadarDashboardSummary = {
  total: number;
  newItems: number;
  recent: RadarInboxItem[];
};

export async function getRadarDashboardSummary(): Promise<RadarDashboardSummary> {
  const supabase = await createClient();
  const [totalResult, newResult, recentResult] = await Promise.all([
    supabase
      .from("editorial_inbox_items")
      .select("id", { count: "exact", head: true })
      .eq("source_kind", "radar"),
    supabase
      .from("editorial_inbox_items")
      .select("id", { count: "exact", head: true })
      .eq("source_kind", "radar")
      .eq("status", "new"),
    supabase
      .from("editorial_inbox_items")
      .select("id, title, source_label, original_url, source_published_at, status, received_at")
      .eq("source_kind", "radar")
      .order("received_at", { ascending: false })
      .limit(12),
  ]);

  if (totalResult.error || newResult.error || recentResult.error) {
    throw new Error("Unable to load Radar Inbox summary");
  }

  return {
    total: totalResult.count ?? 0,
    newItems: newResult.count ?? 0,
    recent: (recentResult.data ?? []) as RadarInboxItem[],
  };
}
