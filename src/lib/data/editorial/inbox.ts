import {
  paginated,
  parsePageParams,
  type PaginatedResult,
} from "@/lib/data/public/paging";
import { createClient } from "@/lib/supabase/server";

const LIST_PAGE_SIZE = 30;

export type EditorialInboxListItem = {
  id: string;
  source_kind: string;
  item_kind: string;
  title: string;
  source_label: string | null;
  original_url: string | null;
  origin_country_code: string | null;
  destination_country_code: string | null;
  origin_country_label: string | null;
  destination_country_label: string | null;
  relevance_band: string | null;
  priority: string;
  status: string;
  received_at: string;
};

export type EditorialSubmission = {
  submission_kind: string;
  submitter_name: string;
  submitter_email: string;
  submitter_phone: string | null;
  organization_name: string | null;
  contribution_text: string;
  consent_contact: boolean;
  consent_publication: boolean;
  origin_country_label: string | null;
  destination_country_label: string | null;
  submitted_at: string;
};

export type EditorialInboxActivity = {
  id: string;
  actor_account_id: string | null;
  changes: Record<string, unknown>;
  created_at: string;
};

export type EditorialInboxItem = EditorialInboxListItem & {
  source_published_at: string | null;
  summary: string | null;
  territory_id: string | null;
  duplicate_of_id: string | null;
  assigned_account_id: string | null;
  linked_content_id: string | null;
  linked_event_id: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  submission: EditorialSubmission | null;
  activity: EditorialInboxActivity[];
};

export type EditorialInboxSearchParams = {
  q?: string;
  stato?: string;
  origine?: string;
  tipo?: string;
  page?: string;
};

const LIST_SELECT =
  "id, source_kind, item_kind, title, source_label, original_url, origin_country_code, destination_country_code, origin_country_label, destination_country_label, relevance_band, priority, status, received_at";

const DETAIL_SELECT = `${LIST_SELECT}, source_published_at, summary, territory_id, duplicate_of_id, assigned_account_id, linked_content_id, linked_event_id, reviewed_at, created_at, updated_at`;

export async function listEditorialInbox(
  searchParams: EditorialInboxSearchParams = {},
): Promise<PaginatedResult<EditorialInboxListItem>> {
  const { page, from, to } = parsePageParams(searchParams, LIST_PAGE_SIZE);
  const supabase = await createClient();
  let query = supabase
    .from("editorial_inbox_items")
    .select(LIST_SELECT, { count: "exact" })
    .order("received_at", { ascending: false });

  const q = searchParams.q?.trim();
  if (q) query = query.ilike("title", `%${q}%`);
  const stato = searchParams.stato?.trim();
  if (stato) query = query.eq("status", stato);
  const origine = searchParams.origine?.trim();
  if (origine) query = query.eq("source_kind", origine);
  const tipo = searchParams.tipo?.trim();
  if (tipo) query = query.eq("item_kind", tipo);

  const { data, error, count } = await query.range(from, to);
  if (error) return paginated([], 0, page, LIST_PAGE_SIZE);

  return paginated(
    (data ?? []) as EditorialInboxListItem[],
    count ?? 0,
    page,
    LIST_PAGE_SIZE,
  );
}

export async function getEditorialInboxItemById(
  id: string,
): Promise<EditorialInboxItem | null> {
  const supabase = await createClient();
  const [
    { data: item, error: itemError },
    { data: submission },
    { data: activity, error: activityError },
  ] = await Promise.all([
    supabase
      .from("editorial_inbox_items")
      .select(DETAIL_SELECT)
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("editorial_submissions")
      .select(
        "submission_kind, submitter_name, submitter_email, submitter_phone, organization_name, contribution_text, consent_contact, consent_publication, origin_country_label, destination_country_label, submitted_at",
      )
      .eq("inbox_item_id", id)
      .maybeSingle(),
    supabase
      .from("editorial_inbox_activity")
      .select("id, actor_account_id, changes, created_at")
      .eq("inbox_item_id", id)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  if (itemError || !item) return null;
  return {
    ...(item as Omit<EditorialInboxItem, "submission" | "activity">),
    submission: (submission as EditorialSubmission | null) ?? null,
    activity: activityError ? [] : ((activity ?? []) as EditorialInboxActivity[]),
  };
}
