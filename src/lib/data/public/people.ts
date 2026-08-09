import { createClient } from "@/lib/supabase/server";
import { isCultureProfessionalCategory } from "@/lib/data/public/culture";
import type { PublicProfessionalCategory } from "@/lib/data/public/professionals";

/**
 * Public Persona columns — explicit allow-list.
 * Never select phone, email, account lifecycle, or auth ids for public UI.
 */
const PUBLIC_PERSON_SELECT =
  "id, slug, display_name, bio, city, province, region, country, website, avatar_url, organization_name, role_description";

export type PublicPerson = {
  id: string;
  slug: string;
  display_name: string;
  bio: string | null;
  city: string | null;
  province: string | null;
  region: string | null;
  country: string | null;
  website: string | null;
  avatar_url: string | null;
  organization_name: string | null;
  role_description: string | null;
};

export type PublicPersonBusinessLink = {
  membershipId: string;
  roleId: string | null;
  business: {
    id: string;
    public_name: string;
    summary: string | null;
  };
};

export type PublicPersonProfessionalSummary = {
  id: string;
  headline: string | null;
  summary: string | null;
  practice_mode_code: string | null;
  categories: PublicProfessionalCategory[];
  isCultureRelated: boolean;
};

/** Documented gate mirroring profiles_select_public (app defense-in-depth). */
export const PUBLIC_PERSON_VISIBILITY_GATE = {
  is_public: true,
  is_active: true,
  deleted_at: null,
} as const;

/** Columns that must never appear in public person selects / payloads. */
export const PUBLIC_PERSON_EXCLUDED_FIELDS = [
  "phone",
  "email",
  "auth_user_id",
  "account_id",
  "is_active",
  "deleted_at",
  "published_at",
  "created_at",
  "updated_at",
] as const;

function mapPerson(data: Record<string, unknown>): PublicPerson {
  return {
    id: String(data.id),
    slug: String(data.slug),
    display_name: String(data.display_name),
    bio: (data.bio as string | null) ?? null,
    city: (data.city as string | null) ?? null,
    province: (data.province as string | null) ?? null,
    region: (data.region as string | null) ?? null,
    country: (data.country as string | null) ?? null,
    website: (data.website as string | null) ?? null,
    avatar_url: (data.avatar_url as string | null) ?? null,
    organization_name: (data.organization_name as string | null) ?? null,
    role_description: (data.role_description as string | null) ?? null,
  };
}

/**
 * Public Persona by slug.
 * Soft-fails to null when missing / not public (RLS + explicit is_public filter).
 * Owner sessions must not see private profiles on the public route.
 */
export async function getPublicPersonBySlug(
  slug: string,
): Promise<PublicPerson | null> {
  const trimmed = slug.trim();
  if (!trimmed) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(PUBLIC_PERSON_SELECT)
    .eq("slug", trimmed)
    .eq("is_public", true)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    // Soft-fail for not-visible / RLS miss; throw only unexpected transport errors.
    if (
      error.code === "PGRST116" ||
      error.message.toLowerCase().includes("row") ||
      error.message.toLowerCase().includes("permission")
    ) {
      return null;
    }
    throw new Error(error.message);
  }
  if (!data) return null;
  return mapPerson(data as Record<string, unknown>);
}

export async function listHomePublicPeople(limit = 6): Promise<PublicPerson[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(PUBLIC_PERSON_SELECT)
    .eq("is_public", true)
    .eq("is_active", true)
    .order("display_name", { ascending: true })
    .limit(limit);

  if (error) throw new Error(error.message);
  return ((data ?? []) as Record<string, unknown>[]).map(mapPerson);
}

/** Linked public professional profile for a person, if any. */
export async function getPublicProfessionalForPerson(
  personId: string,
): Promise<PublicPersonProfessionalSummary | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("professional_profiles")
    .select(
      `
      id, headline, summary, practice_mode_code, person_id,
      professional_profile_categories (
        category_code, is_primary, declaration_status,
        professional_categories ( label_it )
      )
    `,
    )
    .eq("person_id", personId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

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
    id: data.id as string,
    headline: (data.headline as string | null) ?? null,
    summary: (data.summary as string | null) ?? null,
    practice_mode_code: (data.practice_mode_code as string | null) ?? null,
    categories,
    isCultureRelated: categories.some((c) =>
      isCultureProfessionalCategory(c.category_code),
    ),
  };
}

/**
 * Public memberships → public businesses only.
 * Relies on membership visibility_status=public and businesses public RLS.
 * Never surfaces CTX/ACT or management grants.
 */
export async function listPublicBusinessesForPerson(
  personId: string,
): Promise<PublicPersonBusinessLink[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("business_memberships")
    .select(
      `
      id, role_id,
      businesses!inner (
        id, public_name, summary
      )
    `,
    )
    .eq("person_id", personId)
    .order("id", { ascending: true });

  if (error) throw new Error(error.message);

  return ((data ?? []) as unknown as
    | {
        id: string;
        role_id: string | null;
        businesses:
          | { id: string; public_name: string; summary: string | null }
          | { id: string; public_name: string; summary: string | null }[]
          | null;
      }[]).flatMap((row) => {
    const business = Array.isArray(row.businesses)
      ? row.businesses[0]
      : row.businesses;
    if (!business) return [];
    return [
      {
        membershipId: row.id,
        roleId: row.role_id,
        business: {
          id: business.id,
          public_name: business.public_name,
          summary: business.summary,
        },
      },
    ];
  });
}

export function formatPersonTerritory(person: PublicPerson): string | null {
  const parts = [person.city, person.province, person.region, person.country]
    .map((p) => p?.trim())
    .filter(Boolean);
  return parts.length ? parts.join(", ") : null;
}

export function personMetadataDescription(person: PublicPerson): string {
  const bio = person.bio?.trim();
  if (bio) {
    return bio.length > 160 ? `${bio.slice(0, 157)}…` : bio;
  }
  const territory = formatPersonTerritory(person);
  if (territory) {
    return `Profilo pubblico nella rete Immigrati Imprenditori · ${territory}`;
  }
  return "Profilo pubblico nella rete Immigrati Imprenditori.";
}
