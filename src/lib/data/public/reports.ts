import { createClient } from "@/lib/supabase/server";
import type { PublicContentListItem } from "@/lib/data/public/contents";

const REPORT_TYPES = ["research_report", "data_note", "policy_brief"] as const;
const LIST_SELECT =
  "id, slug, title, abstract, type_code, primary_category_code, language_id, is_featured, published_at, source_url";

export type PublicReportListItem = PublicContentListItem & {
  source_url: string | null;
  report_kind: string | null;
  publisher_name: string | null;
  source_publication_year: number | null;
  document_url: string | null;
  authors: string[];
  geographies: string[];
  tags: string[];
};

type ReportMetadataRow = {
  content_id: string;
  report_kind: string;
  publisher_name: string;
  source_publication_year: number;
  document_url: string | null;
};

type AuthorRow = {
  content_id: string;
  display_label: string | null;
  is_primary: boolean;
  sort_order: number;
};

type GeographyRow = {
  content_id: string;
  country_code: string | null;
  relation_kind: string;
  geo_territories: { name: string } | null;
};

type TagRow = {
  content_id: string;
  sort_order: number;
  content_tags: { name_it: string } | null;
};

function countryLabel(code: string): string {
  try {
    return new Intl.DisplayNames(["it"], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

async function listByTypes(
  types: readonly string[],
  limit: number,
): Promise<PublicReportListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contents")
    .select(LIST_SELECT)
    .in("type_code", [...types])
    .order("is_featured", { ascending: false })
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  const base = (data ?? []) as (PublicContentListItem & { source_url: string | null })[];
  const ids = base.map((item) => item.id);
  if (ids.length === 0) return [];

  const [metadataRes, authorsRes, geographiesRes, tagsRes] = await Promise.all([
    supabase
      .from("content_report_metadata")
      .select("content_id, report_kind, publisher_name, source_publication_year, document_url")
      .in("content_id", ids),
    supabase
      .from("content_authors")
      .select("content_id, display_label, is_primary, sort_order")
      .in("content_id", ids)
      .order("is_primary", { ascending: false })
      .order("sort_order", { ascending: true }),
    supabase
      .from("content_geographies")
      .select("content_id, country_code, relation_kind, geo_territories(name)")
      .in("content_id", ids)
      .order("sort_order", { ascending: true }),
    supabase
      .from("content_tag_links")
      .select("content_id, sort_order, content_tags(name_it)")
      .in("content_id", ids)
      .order("sort_order", { ascending: true }),
  ]);

  if (metadataRes.error) throw new Error(metadataRes.error.message);
  if (authorsRes.error) throw new Error(authorsRes.error.message);
  if (geographiesRes.error) throw new Error(geographiesRes.error.message);
  if (tagsRes.error) throw new Error(tagsRes.error.message);

  const metadata = (metadataRes.data ?? []) as ReportMetadataRow[];
  const authors = (authorsRes.data ?? []) as AuthorRow[];
  const geographies = (geographiesRes.data ?? []) as unknown as GeographyRow[];
  const tags = (tagsRes.data ?? []) as unknown as TagRow[];

  return base.map((item) => {
    const report = metadata.find((row) => row.content_id === item.id) ?? null;
    return {
      ...item,
      report_kind: report?.report_kind ?? null,
      publisher_name: report?.publisher_name ?? null,
      source_publication_year: report?.source_publication_year ?? null,
      document_url: report?.document_url ?? item.source_url,
      authors: authors
        .filter((row) => row.content_id === item.id && row.display_label)
        .map((row) => row.display_label as string),
      geographies: geographies
        .filter((row) => row.content_id === item.id)
        .map((row) => row.geo_territories?.name ?? (row.country_code ? countryLabel(row.country_code) : null))
        .filter((value): value is string => Boolean(value)),
      tags: tags
        .filter((row) => row.content_id === item.id && row.content_tags?.name_it)
        .map((row) => row.content_tags?.name_it as string),
    };
  });
}

export async function listPublicReports(limit = 40): Promise<PublicReportListItem[]> {
  return listByTypes(REPORT_TYPES, limit);
}

export async function listPublicPolicyBriefs(limit = 40): Promise<PublicReportListItem[]> {
  return listByTypes(["policy_brief"], limit);
}
