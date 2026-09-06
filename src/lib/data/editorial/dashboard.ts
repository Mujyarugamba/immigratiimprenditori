import { createClient } from "@/lib/supabase/server";

export type EditorialDashboardAttentionItem = {
  id: string;
  title: string;
  source_kind: string;
  source_label: string | null;
  item_kind: string;
  status: string;
  priority: string;
  received_at: string;
};

export type EditorialDashboardDraftItem = {
  id: string;
  title: string;
  type_code: string;
  updated_at: string;
};

export type EditorialDashboardRadarItem = {
  id: string;
  title: string;
  source_label: string | null;
  status: string;
  received_at: string;
};

export type EditorialDashboardOverview = {
  newInbox: number;
  toReview: number;
  needsResearch: number;
  drafts: number;
  aiToReview: number;
  aiAvailable: boolean;
  radarToday: number;
  publishedContents: number;
  attention: EditorialDashboardAttentionItem[];
  recentDrafts: EditorialDashboardDraftItem[];
  recentRadarToday: EditorialDashboardRadarItem[];
  previewSnapshot: boolean;
};

function italyDateKey(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Rome",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export async function getEditorialDashboardOverview(): Promise<EditorialDashboardOverview> {
  if (process.env.NEXT_PUBLIC_PREVIEW_READ_ONLY === "true") {
    return {
      newInbox: 1,
      toReview: 31,
      needsResearch: 5,
      drafts: 3,
      aiToReview: 0,
      aiAvailable: true,
      radarToday: 0,
      publishedContents: 21,
      attention: [],
      recentDrafts: [],
      recentRadarToday: [],
      previewSnapshot: true,
    };
  }

  const supabase = await createClient();
  const inbox = () => supabase.from("editorial_inbox_items");
  const contents = () => supabase.from("contents");

  const radarWindowStart = new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString();

  const [
    newInboxResult,
    toReviewResult,
    needsResearchResult,
    draftsResult,
    publishedResult,
    attentionResult,
    recentDraftsResult,
    radarWindowResult,
    aiResult,
  ] = await Promise.all([
    inbox().select("id", { count: "exact", head: true }).eq("status", "new"),
    inbox().select("id", { count: "exact", head: true }).eq("status", "to_review"),
    inbox().select("id", { count: "exact", head: true }).eq("status", "needs_research"),
    contents()
      .select("id", { count: "exact", head: true })
      .eq("owned_by_editorial", true)
      .eq("editorial_status", "draft")
      .eq("publication_status", "unpublished"),
    contents()
      .select("id", { count: "exact", head: true })
      .eq("owned_by_editorial", true)
      .eq("publication_status", "published"),
    inbox()
      .select(
        "id, title, source_kind, source_label, item_kind, status, priority, received_at",
      )
      .in("status", ["new", "to_review", "needs_research"])
      .order("received_at", { ascending: false })
      .limit(10),
    contents()
      .select("id, title, type_code, updated_at")
      .eq("owned_by_editorial", true)
      .eq("editorial_status", "draft")
      .eq("publication_status", "unpublished")
      .order("updated_at", { ascending: false })
      .limit(6),
    inbox()
      .select("id, title, source_label, status, received_at")
      .eq("source_kind", "radar")
      .gte("received_at", radarWindowStart)
      .order("received_at", { ascending: false })
      .limit(500),
    supabase
      .from("editorial_ai_runs")
      .select("id", { count: "exact", head: true })
      .eq("status", "generated"),
  ]);

  const todayKey = italyDateKey(new Date());
  const radarTodayItems = radarWindowResult.error
    ? []
    : ((radarWindowResult.data ?? []) as EditorialDashboardRadarItem[]).filter(
        (item) => italyDateKey(new Date(item.received_at)) === todayKey,
      );

  return {
    newInbox: newInboxResult.error ? 0 : (newInboxResult.count ?? 0),
    toReview: toReviewResult.error ? 0 : (toReviewResult.count ?? 0),
    needsResearch: needsResearchResult.error ? 0 : (needsResearchResult.count ?? 0),
    drafts: draftsResult.error ? 0 : (draftsResult.count ?? 0),
    aiToReview: aiResult.error ? 0 : (aiResult.count ?? 0),
    aiAvailable: !aiResult.error,
    radarToday: radarTodayItems.length,
    publishedContents: publishedResult.error ? 0 : (publishedResult.count ?? 0),
    attention: attentionResult.error
      ? []
      : ((attentionResult.data ?? []) as EditorialDashboardAttentionItem[]),
    recentDrafts: recentDraftsResult.error
      ? []
      : ((recentDraftsResult.data ?? []) as EditorialDashboardDraftItem[]),
    recentRadarToday: radarTodayItems.slice(0, 6),
    previewSnapshot: false,
  };
}
