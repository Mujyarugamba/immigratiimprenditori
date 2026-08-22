import { createClient } from "@/lib/supabase/server";

export type PublicPublication = {
  id: string;
  slug: string;
  title: string;
  abstract: string | null;
  type_code: string;
  published_at: string | null;
  report_kind: string | null;
  publisher_name: string | null;
  source_publication_year: number | null;
  source_publication_date: string | null;
  external_identifier: string | null;
  document_url: string | null;
  authors: string[];
};

export async function listPublications(limit = 200): Promise<PublicPublication[]> {
  const supabase = await createClient();
  const { data: contents, error: contentError } = await supabase
    .from("contents")
    .select("id, slug, title, abstract, type_code, published_at")
    .in("type_code", ["research_report", "working_paper", "policy_brief", "dossier", "data_note"])
    .eq("editorial_status", "ready")
    .eq("publication_status", "published")
    .eq("visibility_status", "public")
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(limit);

  if (contentError) throw new Error(contentError.message);
  const rows = contents ?? [];
  const ids = rows.map((item) => item.id);
  if (ids.length === 0) return [];

  const [metadataResult, authorResult] = await Promise.all([
    supabase
      .from("content_report_metadata")
      .select("content_id, report_kind, publisher_name, source_publication_year, source_publication_date, external_identifier, document_url")
      .in("content_id", ids),
    supabase
      .from("content_authors")
      .select("content_id, display_label, sort_order")
      .in("content_id", ids)
      .not("display_label", "is", null)
      .order("sort_order"),
  ]);

  if (metadataResult.error) throw new Error(metadataResult.error.message);
  if (authorResult.error) throw new Error(authorResult.error.message);

  const metadataMap = new Map((metadataResult.data ?? []).map((item) => [item.content_id, item]));
  const authorMap = new Map<string, string[]>();
  for (const author of authorResult.data ?? []) {
    const label = author.display_label?.trim();
    if (!label) continue;
    const current = authorMap.get(author.content_id) ?? [];
    current.push(label);
    authorMap.set(author.content_id, current);
  }

  return rows.map((item) => {
    const metadata = metadataMap.get(item.id);
    return {
      ...item,
      report_kind: metadata?.report_kind ?? null,
      publisher_name: metadata?.publisher_name ?? null,
      source_publication_year: metadata?.source_publication_year ?? null,
      source_publication_date: metadata?.source_publication_date ?? null,
      external_identifier: metadata?.external_identifier ?? null,
      document_url: metadata?.document_url ?? null,
      authors: authorMap.get(item.id) ?? [],
    };
  });
}

export function publicationKindLabel(kind: string | null, typeCode: string) {
  if (typeCode === "working_paper") return "Working Paper";
  if (typeCode === "policy_brief") return "Policy Brief";
  if (typeCode === "dossier") return "Dossier";
  if (typeCode === "data_note") return "Nota dati";
  if (kind === "academic_study") return "Studio accademico";
  if (kind === "external_report") return "Rapporto esterno";
  if (kind === "institutional_report") return "Rapporto istituzionale";
  if (kind === "aipel_report") return "Rapporto AIPEL";
  if (kind === "dossier") return "Dossier";
  return "Pubblicazione";
}
