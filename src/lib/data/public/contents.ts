import { stripContentsAcquisitionTrailer } from "@/lib/contents/strip-acquisition-trailer";
import { createClient } from "@/lib/supabase/server";
import {
  paginated,
  parsePageParams,
  param,
  type PaginatedResult,
} from "@/lib/data/public/paging";

const LIST_SELECT =
  "id, slug, title, abstract, type_code, primary_category_code, language_id, is_featured, published_at";

export type PublicContentListItem = {
  id: string;
  slug: string;
  title: string;
  abstract: string | null;
  type_code: string;
  primary_category_code: string | null;
  language_id: number;
  is_featured: boolean;
  published_at: string | null;
};

export type PublicContentAuthor = {
  id: string;
  role_kind: string;
  person_id: string | null;
  business_id: string | null;
  professional_profile_id: string | null;
  display_label: string | null;
  is_primary: boolean;
  sort_order: number;
  attribution_note: string | null;
};

export type PublicContentSubjectLink = {
  id: string;
  person_id: string | null;
  business_id: string | null;
  professional_profile_id: string | null;
};

export type PublicContentEventLink = {
  id: string;
  event_id: string;
};

export type PublicContentOpportunityLink = {
  id: string;
  opportunity_id: string;
};

export type PublicContentDetail = PublicContentListItem & {
  body: string;
  body_format: string;
  cover_url: string | null;
  source_url: string | null;
  publication_status: string;
  visibility_status: string;
  authors: PublicContentAuthor[];
  subject_links: PublicContentSubjectLink[];
  event_links: PublicContentEventLink[];
  opportunity_links: PublicContentOpportunityLink[];
};

function mapContentDetail(data: Record<string, unknown>): PublicContentDetail {
  const authors = (
    (data.content_authors as PublicContentAuthor[] | null) ?? []
  )
    .map((author) => ({
      id: author.id,
      role_kind: author.role_kind,
      person_id: author.person_id,
      business_id: author.business_id,
      professional_profile_id: author.professional_profile_id,
      display_label: author.display_label,
      is_primary: Boolean(author.is_primary),
      sort_order: author.sort_order ?? 0,
      attribution_note: author.attribution_note,
    }))
    .sort((a, b) => a.sort_order - b.sort_order);

  const subject_links = (
    (data.content_subject_links as PublicContentSubjectLink[] | null) ?? []
  ).map((l) => ({
    id: l.id,
    person_id: l.person_id,
    business_id: l.business_id,
    professional_profile_id: l.professional_profile_id,
  }));

  const event_links = (
    (data.content_event_links as PublicContentEventLink[] | null) ?? []
  ).map((l) => ({
    id: l.id,
    event_id: l.event_id,
  }));

  const opportunity_links = (
    (data.content_opportunity_links as PublicContentOpportunityLink[] | null) ??
    []
  ).map((l) => ({
    id: l.id,
    opportunity_id: l.opportunity_id,
  }));

  return {
    id: data.id as string,
    slug: data.slug as string,
    title: data.title as string,
    abstract: data.abstract as string | null,
    type_code: data.type_code as string,
    primary_category_code: data.primary_category_code as string | null,
    language_id: data.language_id as number,
    is_featured: data.is_featured as boolean,
    published_at: data.published_at as string | null,
    body: stripContentsAcquisitionTrailer(data.body as string),
    body_format: data.body_format as string,
    cover_url: data.cover_url as string | null,
    source_url: data.source_url as string | null,
    publication_status: data.publication_status as string,
    visibility_status: data.visibility_status as string,
    authors,
    subject_links,
    event_links,
    opportunity_links,
  };
}

const DETAIL_SELECT = `
  id, slug, title, abstract, type_code, primary_category_code, language_id,
  is_featured, published_at, body, body_format, cover_url, source_url,
  publication_status, visibility_status,
  content_authors (
    id, role_kind, person_id, business_id, professional_profile_id,
    display_label, is_primary, sort_order, attribution_note
  ),
  content_subject_links ( id, person_id, business_id, professional_profile_id ),
  content_event_links ( id, event_id ),
  content_opportunity_links ( id, opportunity_id )
`;

export async function listPublicContents(
  searchParams: Record<string, string | string[] | undefined> = {},
): Promise<PaginatedResult<PublicContentListItem>> {
  const { page, pageSize, from, to } = parsePageParams(searchParams);
  const q = param(searchParams, "q");
  const tipo = param(searchParams, "tipo");
  const categoria = param(searchParams, "categoria");
  const inEvidenza = param(searchParams, "in_evidenza");
  const supabase = await createClient();

  let query = supabase
    .from("contents")
    .select(LIST_SELECT, { count: "exact" })
    .order("is_featured", { ascending: false })
    .order("published_at", { ascending: false, nullsFirst: false })
    .range(from, to);

  if (q) {
    query = query.or(`title.ilike.%${q}%,abstract.ilike.%${q}%`);
  }
  if (tipo) {
    query = query.eq("type_code", tipo);
  }
  if (categoria) {
    query = query.eq("primary_category_code", categoria);
  }
  if (inEvidenza === "1") {
    query = query.eq("is_featured", true);
  }

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);
  return paginated(
    (data ?? []) as PublicContentListItem[],
    count ?? 0,
    page,
    pageSize,
  );
}

export async function getPublicContentBySlug(
  slug: string,
): Promise<PublicContentDetail | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("contents")
      .select(DETAIL_SELECT)
      .eq("slug", slug)
      .maybeSingle();

    if (error || !data) return null;
    return mapContentDetail(data);
  } catch {
    return null;
  }
}

export async function listHomeContents(limit = 3) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contents")
    .select(LIST_SELECT)
    .order("is_featured", { ascending: false })
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as PublicContentListItem[];
}
