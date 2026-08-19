import { createClient } from "@/lib/supabase/server";

const REPORT_TYPES = ["research_report", "data_note", "policy_brief"] as const;

export type EditorialReportListItem = {
  id: string;
  title: string;
  slug: string;
  type_code: string;
  publication_status: string;
  is_featured: boolean;
  updated_at: string;
};

export async function listEditorialReports(): Promise<EditorialReportListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contents")
    .select("id, title, slug, type_code, publication_status, is_featured, updated_at")
    .eq("owned_by_editorial", true)
    .in("type_code", [...REPORT_TYPES])
    .order("is_featured", { ascending: false })
    .order("updated_at", { ascending: false });

  if (error) return [];
  return (data ?? []) as EditorialReportListItem[];
}
