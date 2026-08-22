import { createClient } from "@/lib/supabase/server";

export type PublicStatisticalSource = {
  id: string;
  name: string;
  producer_name: string;
  publication_title: string;
  url: string | null;
  external_identifier: string | null;
  edition_label: string | null;
  source_published_on: string | null;
  license_note: string | null;
  methodology_note: string | null;
  lifecycle_status: string;
};

export async function listPublicStatisticalSources(): Promise<PublicStatisticalSource[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("observatory_statistical_sources")
    .select(
      "id, name, producer_name, publication_title, url, external_identifier, edition_label, source_published_on, license_note, methodology_note, lifecycle_status",
    )
    .neq("lifecycle_status", "withdrawn")
    .order("producer_name")
    .order("publication_title");

  if (error) throw new Error(error.message);
  return (data ?? []) as PublicStatisticalSource[];
}
