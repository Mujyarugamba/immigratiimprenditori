import { createClient } from "@/lib/supabase/server";

export type ContributorProposal = {
  id: string;
  item_kind: string;
  title: string;
  status: string;
  received_at: string;
  origin_country_label: string | null;
  destination_country_label: string | null;
  linked_content_id: string | null;
  linked_event_id: string | null;
};

const SELECT =
  "id, item_kind, title, status, received_at, origin_country_label, destination_country_label, linked_content_id, linked_event_id";

/**
 * RLS is authoritative: contributors receive only rows whose
 * submitted_by_account_id is their current Account. Editors/admins are not
 * routed to this area unless they also hold the contributor role.
 */
export async function listContributorProposals(): Promise<ContributorProposal[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("editorial_inbox_items")
    .select(SELECT)
    .order("received_at", { ascending: false })
    .limit(100);

  if (error) return [];
  return (data ?? []) as ContributorProposal[];
}
