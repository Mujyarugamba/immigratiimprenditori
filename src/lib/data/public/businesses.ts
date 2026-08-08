import { createClient } from "@/lib/supabase/server";
import {
  paginated,
  parsePageParams,
  param,
  type PaginatedResult,
} from "@/lib/data/public/paging";

const LIST_SELECT =
  "id, public_name, legal_name, summary, organization_form, substantial_status, founding_year";

export type PublicBusinessListItem = {
  id: string;
  public_name: string;
  legal_name: string;
  summary: string | null;
  organization_form: string | null;
  substantial_status: string;
  founding_year: number | null;
};

function asOne<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export type PublicBusinessDetail = PublicBusinessListItem & {
  description: string | null;
  size_band: string | null;
  editorial_status: string;
  publication_status: string;
  locations: { territory_reference: string }[];
  sectors: { id: string; name: string; is_primary: boolean }[];
};

export async function listPublicBusinesses(
  searchParams: Record<string, string | string[] | undefined> = {},
): Promise<PaginatedResult<PublicBusinessListItem>> {
  const { page, pageSize, from, to } = parsePageParams(searchParams);
  const q = param(searchParams, "q");
  const forma = param(searchParams, "forma");
  const supabase = await createClient();

  let query = supabase
    .from("businesses")
    .select(LIST_SELECT, { count: "exact" })
    .order("public_name", { ascending: true })
    .range(from, to);

  if (q) {
    query = query.or(
      `public_name.ilike.%${q}%,legal_name.ilike.%${q}%,summary.ilike.%${q}%`,
    );
  }
  if (forma) {
    query = query.eq("organization_form", forma);
  }

  const { data, count, error } = await query;
  if (error) {
    throw new Error(error.message);
  }
  return paginated(
    (data ?? []) as PublicBusinessListItem[],
    count ?? 0,
    page,
    pageSize,
  );
}

export async function getPublicBusinessById(
  id: string,
): Promise<PublicBusinessDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("businesses")
    .select(
      `
      id, public_name, legal_name, summary, description, organization_form,
      size_band, substantial_status, founding_year, editorial_status, publication_status,
      business_locations ( territory_reference, visibility_status, location_status ),
      business_sector_declarations (
        is_primary, declaration_status,
        business_sectors ( id, name )
      )
    `,
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  const locations = (
    (data.business_locations as
      | {
          territory_reference: string;
          visibility_status: string;
          location_status: string;
        }[]
      | null) ?? []
  )
    .filter(
      (l) =>
        l.visibility_status === "public" && l.location_status === "active",
    )
    .map((l) => ({
      territory_reference: l.territory_reference,
    }));

  const sectors = (
    (data.business_sector_declarations as unknown as
      | {
          is_primary: boolean;
          declaration_status: string;
          business_sectors:
            | { id: string; name: string }
            | { id: string; name: string }[]
            | null;
        }[]
      | null) ?? []
  )
    .map((d) => ({
      is_primary: d.is_primary,
      declaration_status: d.declaration_status,
      sector: asOne(d.business_sectors),
    }))
    .filter(
      (d) => d.declaration_status === "declared" && d.sector != null,
    )
    .map((d) => ({
      id: d.sector!.id,
      name: d.sector!.name,
      is_primary: d.is_primary,
    }));

  return {
    id: data.id,
    public_name: data.public_name,
    legal_name: data.legal_name,
    summary: data.summary,
    description: data.description,
    organization_form: data.organization_form,
    size_band: data.size_band,
    substantial_status: data.substantial_status,
    founding_year: data.founding_year,
    editorial_status: data.editorial_status,
    publication_status: data.publication_status,
    locations,
    sectors,
  };
}

export async function listHomeBusinesses(limit = 3) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("businesses")
    .select(LIST_SELECT)
    .order("public_name", { ascending: true })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as PublicBusinessListItem[];
}
