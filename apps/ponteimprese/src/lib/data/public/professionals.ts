import { createClient } from "@/lib/supabase/server";
import {
  paginated,
  parsePageParams,
  param,
  type PaginatedResult,
} from "@/lib/data/public/paging";

const LIST_SELECT =
  "id, headline, summary, practice_mode_code, availability_status, person_id, context_business_id";

export type PublicProfessionalListItem = {
  id: string;
  headline: string | null;
  summary: string | null;
  practice_mode_code: string | null;
  availability_status: string;
  person_id: string;
  context_business_id: string | null;
};

export type PublicProfessionalPerson = {
  id: string;
  display_name: string;
  slug: string | null;
};

export type PublicProfessionalCategory = {
  category_code: string;
  label_it: string;
  is_primary: boolean;
};

export type PublicProfessionalDetail = PublicProfessionalListItem & {
  editorial_status: string;
  publication_status: string;
  visibility_status: string;
  person: PublicProfessionalPerson | null;
  categories: PublicProfessionalCategory[];
};

export async function listPublicProfessionals(
  searchParams: Record<string, string | string[] | undefined> = {},
): Promise<PaginatedResult<PublicProfessionalListItem>> {
  const { page, pageSize, from, to } = parsePageParams(searchParams);
  const q = param(searchParams, "q");
  const pratica = param(searchParams, "pratica");
  const categoria = param(searchParams, "categoria");
  const supabase = await createClient();

  let query = categoria
    ? supabase
        .from("professional_profiles")
        .select(
          `${LIST_SELECT}, professional_profile_categories!inner ( category_code )`,
          { count: "exact" },
        )
        .eq("professional_profile_categories.category_code", categoria)
        .order("headline", { ascending: true, nullsFirst: false })
        .range(from, to)
    : supabase
        .from("professional_profiles")
        .select(LIST_SELECT, { count: "exact" })
        .order("headline", { ascending: true, nullsFirst: false })
        .range(from, to);

  if (q) {
    query = query.or(`headline.ilike.%${q}%,summary.ilike.%${q}%`);
  }
  if (pratica) {
    query = query.eq("practice_mode_code", pratica);
  }

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);

  const items = (data ?? []).map((row) => {
    const r = row as PublicProfessionalListItem;
    return {
      id: r.id,
      headline: r.headline,
      summary: r.summary,
      practice_mode_code: r.practice_mode_code,
      availability_status: r.availability_status,
      person_id: r.person_id,
      context_business_id: r.context_business_id,
    };
  });

  return paginated(items, count ?? 0, page, pageSize);
}

export async function getPublicProfessionalById(
  id: string,
): Promise<PublicProfessionalDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("professional_profiles")
    .select(
      `
      id, headline, summary, practice_mode_code, availability_status,
      person_id, context_business_id, editorial_status, publication_status,
      visibility_status,
      profiles!professional_profiles_person_id_fkey ( id, display_name, slug ),
      professional_profile_categories (
        category_code, is_primary, declaration_status,
        professional_categories ( label_it )
      )
    `,
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  const personRow = data.profiles as
    | { id: string; display_name: string; slug: string | null }
    | { id: string; display_name: string; slug: string | null }[]
    | null;
  const person = Array.isArray(personRow) ? personRow[0] : personRow;

  const categories = (
    (data.professional_profile_categories as unknown as
      | {
          category_code: string;
          is_primary: boolean;
          declaration_status: string;
          professional_categories: { label_it: string } | null;
        }[]
      | null) ?? []
  )
    .filter(
      (c) =>
        c.declaration_status === "declared" &&
        c.professional_categories != null,
    )
    .map((c) => ({
      category_code: c.category_code,
      label_it: c.professional_categories!.label_it,
      is_primary: c.is_primary,
    }));

  return {
    id: data.id,
    headline: data.headline,
    summary: data.summary,
    practice_mode_code: data.practice_mode_code,
    availability_status: data.availability_status,
    person_id: data.person_id,
    context_business_id: data.context_business_id,
    editorial_status: data.editorial_status,
    publication_status: data.publication_status,
    visibility_status: data.visibility_status,
    person: person
      ? {
          id: person.id,
          display_name: person.display_name,
          slug: person.slug ?? null,
        }
      : null,
    categories,
  };
}

export async function listHomeProfessionals(limit = 3) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("professional_profiles")
    .select(LIST_SELECT)
    .order("headline", { ascending: true, nullsFirst: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as PublicProfessionalListItem[];
}
