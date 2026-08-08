import { createClient } from "@/lib/supabase/server";
import {
  paginated,
  parsePageParams,
  param,
  type PaginatedResult,
} from "@/lib/data/public/paging";

const LIST_SELECT =
  "id, slug, title, form_code, operational_status, object_text, purpose_text";

export type PublicCollaborationListItem = {
  id: string;
  slug: string;
  title: string;
  form_code: string;
  operational_status: string;
  object_text: string;
  purpose_text: string;
};

export type PublicCollaborationParticipant = {
  id: string;
  person_name: string | null;
  business_name: string | null;
};

export type PublicCollaborationDetail = PublicCollaborationListItem & {
  description: string | null;
  editorial_status: string;
  participants: PublicCollaborationParticipant[];
};

function mapCollaborationDetail(
  data: Record<string, unknown>,
): PublicCollaborationDetail {
  const participants = (
    (data.collaboration_participants as
      | {
          id: string;
          profiles: { display_name: string } | null;
          businesses: { public_name: string } | null;
        }[]
      | null) ?? []
  ).map((p) => ({
    id: p.id,
    person_name: p.profiles?.display_name ?? null,
    business_name: p.businesses?.public_name ?? null,
  }));

  return {
    id: data.id as string,
    slug: data.slug as string,
    title: data.title as string,
    form_code: data.form_code as string,
    operational_status: data.operational_status as string,
    object_text: data.object_text as string,
    purpose_text: data.purpose_text as string,
    description: data.description as string | null,
    editorial_status: data.editorial_status as string,
    participants,
  };
}

const DETAIL_SELECT = `
  id, slug, title, form_code, operational_status, object_text, purpose_text,
  description, editorial_status,
  collaboration_participants (
    id,
    profiles ( display_name ),
    businesses ( public_name )
  )
`;

export async function listPublicCollaborations(
  searchParams: Record<string, string | string[] | undefined> = {},
): Promise<PaginatedResult<PublicCollaborationListItem>> {
  const { page, pageSize, from, to } = parsePageParams(searchParams);
  const q = param(searchParams, "q");
  const forma = param(searchParams, "forma");
  const stato = param(searchParams, "stato");
  const supabase = await createClient();

  let query = supabase
    .from("collaborations")
    .select(LIST_SELECT, { count: "exact" })
    .order("title", { ascending: true })
    .range(from, to);

  if (q) {
    query = query.or(
      `title.ilike.%${q}%,object_text.ilike.%${q}%,purpose_text.ilike.%${q}%`,
    );
  }
  if (forma) {
    query = query.eq("form_code", forma);
  }
  if (stato) {
    query = query.eq("operational_status", stato);
  }

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);
  return paginated(
    (data ?? []) as PublicCollaborationListItem[],
    count ?? 0,
    page,
    pageSize,
  );
}

export async function getPublicCollaborationBySlug(
  slug: string,
): Promise<PublicCollaborationDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("collaborations")
    .select(DETAIL_SELECT)
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return mapCollaborationDetail(data);
}

export async function getPublicCollaborationById(
  id: string,
): Promise<PublicCollaborationDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("collaborations")
    .select(DETAIL_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return mapCollaborationDetail(data);
}

export async function listHomeCollaborations(limit = 3) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("collaborations")
    .select(LIST_SELECT)
    .order("title", { ascending: true })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as PublicCollaborationListItem[];
}
