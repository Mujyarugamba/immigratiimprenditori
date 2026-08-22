import { createClient } from "@/lib/supabase/server";

export type InterviewShortlistCandidate = {
  id: string;
  title: string;
  summary: string | null;
  sourceLabel: string | null;
  sourceUrl: string | null;
  originCountryCode: string | null;
  destinationCountryCode: string | null;
  relevanceBand: string | null;
  priority: string;
  status: string;
  receivedAt: string;
};

export async function listInterviewShortlistCandidates(): Promise<InterviewShortlistCandidate[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("editorial_inbox_items")
    .select(
      "id, title, summary, source_label, original_url, origin_country_code, destination_country_code, relevance_band, priority, status, received_at",
    )
    .eq("item_kind", "interview_proposal")
    .not("status", "in", "(rejected,archived)")
    .order("received_at", { ascending: true });

  if (error) return [];

  return (data ?? []).map((row) => ({
    id: row.id as string,
    title: row.title as string,
    summary: row.summary as string | null,
    sourceLabel: row.source_label as string | null,
    sourceUrl: row.original_url as string | null,
    originCountryCode: row.origin_country_code as string | null,
    destinationCountryCode: row.destination_country_code as string | null,
    relevanceBand: row.relevance_band as string | null,
    priority: row.priority as string,
    status: row.status as string,
    receivedAt: row.received_at as string,
  }));
}
