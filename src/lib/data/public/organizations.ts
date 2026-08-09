import { createClient } from "@/lib/supabase/server";
import {
  paginated,
  parsePageParams,
  param,
  type PaginatedResult,
} from "@/lib/data/public/paging";

const LIST_SELECT =
  "id, slug, name, type_code, primary_scope_code, summary, seat_city_label";

export type PublicOrganizationListItem = {
  id: string;
  slug: string;
  name: string;
  type_code: string;
  primary_scope_code: string | null;
  summary: string | null;
  seat_city_label: string | null;
};

export type PublicOrganizationOfficial = {
  id: string;
  role_kind: string;
  name: string;
};

export type PublicOrganizationDetail = PublicOrganizationListItem & {
  description: string;
  seat_region_label: string | null;
  seat_country_label: string | null;
  publication_status: string;
  visibility_status: string;
  officials: PublicOrganizationOfficial[];
};

function mapOrganizationDetail(
  data: Record<string, unknown>,
): PublicOrganizationDetail {
  const officials = (
    (data.organization_officials as
      | {
          id: string;
          role_kind: string;
          display_label: string | null;
          profiles: { display_name: string } | null;
        }[]
      | null) ?? []
  )
    .sort((a, b) => a.role_kind.localeCompare(b.role_kind))
    .map((o) => ({
      id: o.id,
      role_kind: o.role_kind,
      name: o.profiles?.display_name ?? o.display_label ?? "",
    }));

  return {
    id: data.id as string,
    slug: data.slug as string,
    name: data.name as string,
    type_code: data.type_code as string,
    primary_scope_code: data.primary_scope_code as string | null,
    summary: data.summary as string | null,
    seat_city_label: data.seat_city_label as string | null,
    description: data.description as string,
    seat_region_label: data.seat_region_label as string | null,
    seat_country_label: data.seat_country_label as string | null,
    publication_status: data.publication_status as string,
    visibility_status: data.visibility_status as string,
    officials,
  };
}

const DETAIL_SELECT = `
  id, slug, name, type_code, primary_scope_code, summary, seat_city_label,
  description, seat_region_label, seat_country_label,
  publication_status, visibility_status,
  organization_officials (
    id, role_kind, display_label,
    profiles ( display_name )
  )
`;

export async function listPublicOrganizations(
  searchParams: Record<string, string | string[] | undefined> = {},
): Promise<PaginatedResult<PublicOrganizationListItem>> {
  const { page, pageSize, from, to } = parsePageParams(searchParams);
  const q = param(searchParams, "q");
  const tipo = param(searchParams, "tipo");
  const ambito = param(searchParams, "ambito");
  const supabase = await createClient();

  let query = supabase
    .from("organizations")
    .select(LIST_SELECT, { count: "exact" })
    .order("name", { ascending: true })
    .range(from, to);

  if (q) {
    query = query.or(`name.ilike.%${q}%,summary.ilike.%${q}%`);
  }
  if (tipo) {
    query = query.eq("type_code", tipo);
  }
  if (ambito) {
    query = query.eq("primary_scope_code", ambito);
  }

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);
  return paginated(
    (data ?? []) as PublicOrganizationListItem[],
    count ?? 0,
    page,
    pageSize,
  );
}

export async function getPublicOrganizationBySlug(
  slug: string,
): Promise<PublicOrganizationDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organizations")
    .select(DETAIL_SELECT)
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return mapOrganizationDetail(data);
}

export async function listHomeOrganizations(limit = 3) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organizations")
    .select(LIST_SELECT)
    .order("name", { ascending: true })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as PublicOrganizationListItem[];
}
