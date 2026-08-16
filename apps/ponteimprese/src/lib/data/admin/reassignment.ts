import { createClient } from "@/lib/supabase/server";

export type ReassignmentCaseRow = {
  id: string;
  entity_kind: "business" | "organization";
  business_id: string | null;
  organization_id: string | null;
  reason_code: string;
  status: string;
  opened_at: string;
  entity_label: string;
};

export async function listPendingReassignmentCases(): Promise<
  ReassignmentCaseRow[]
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("management_reassignment_cases")
    .select(
      "id, entity_kind, business_id, organization_id, reason_code, status, opened_at",
    )
    .eq("status", "pending")
    .order("opened_at", { ascending: true });

  if (error || !data) return [];

  const rows: ReassignmentCaseRow[] = [];
  for (const row of data) {
    let entity_label = row.entity_kind === "business" ? "Impresa" : "Organizzazione";
    if (row.business_id) {
      const { data: biz } = await supabase
        .from("businesses")
        .select("public_name, legal_name")
        .eq("id", row.business_id)
        .maybeSingle();
      entity_label =
        (biz?.public_name as string | undefined)?.trim() ||
        (biz?.legal_name as string | undefined)?.trim() ||
        row.business_id;
    } else if (row.organization_id) {
      const { data: org } = await supabase
        .from("organizations")
        .select("name")
        .eq("id", row.organization_id)
        .maybeSingle();
      entity_label =
        (org?.name as string | undefined)?.trim() || row.organization_id;
    }
    rows.push({
      id: row.id as string,
      entity_kind: row.entity_kind as "business" | "organization",
      business_id: (row.business_id as string | null) ?? null,
      organization_id: (row.organization_id as string | null) ?? null,
      reason_code: row.reason_code as string,
      status: row.status as string,
      opened_at: row.opened_at as string,
      entity_label,
    });
  }
  return rows;
}
