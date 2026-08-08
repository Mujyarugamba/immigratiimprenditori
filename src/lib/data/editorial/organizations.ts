import { mapPostgresError, type AppError } from "@/lib/errors/app-error";
import { createClient } from "@/lib/supabase/server";

export type EditorialOrganizationListItem = {
  id: string;
  name: string;
  slug: string;
  type_code: string;
  editorial_status: string;
  publication_status: string;
  visibility_status: string;
  operational_status: string;
  updated_at: string;
};

export type EditorialOrganization = EditorialOrganizationListItem & {
  short_name: string | null;
  summary: string | null;
  description: string;
  primary_scope_code: string | null;
  language_id: number | null;
  website_url: string | null;
  email: string | null;
  phone: string | null;
  published_at: string | null;
  withdrawn_at: string | null;
  created_at: string;
};

const LIST_SELECT =
  "id, name, slug, type_code, editorial_status, publication_status, visibility_status, operational_status, updated_at";

const DETAIL_SELECT =
  `${LIST_SELECT}, short_name, summary, description, primary_scope_code, language_id, website_url, email, phone, published_at, withdrawn_at, created_at`;

export async function listEditorialOrganizations(): Promise<
  EditorialOrganizationListItem[]
> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("organizations")
    .select(LIST_SELECT)
    .eq("owned_by_editorial", true)
    .order("updated_at", { ascending: false });
  return (data ?? []) as EditorialOrganizationListItem[];
}

export async function getEditorialOrganizationById(
  id: string,
): Promise<EditorialOrganization | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("organizations")
    .select(DETAIL_SELECT)
    .eq("id", id)
    .eq("owned_by_editorial", true)
    .maybeSingle();
  return (data as EditorialOrganization | null) ?? null;
}

export type CreateEditorialOrganizationInput = {
  type_code: string;
  name: string;
  slug: string;
  description: string;
  short_name?: string | null;
  summary?: string | null;
  primary_scope_code?: string | null;
  language_id?: number | null;
  website_url?: string | null;
  email?: string | null;
  phone?: string | null;
  operational_status?: string;
};

export type UpdateEditorialOrganizationPatch =
  Partial<CreateEditorialOrganizationInput> & {
    editorial_status?: string;
  };

export async function createEditorialOrganization(
  input: CreateEditorialOrganizationInput,
): Promise<{ ok: true; id: string } | { ok: false; error: AppError }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organizations")
    .insert({
      owned_by_editorial: true,
      owner_person_id: null,
      owner_business_id: null,
      type_code: input.type_code,
      name: input.name.trim(),
      slug: input.slug.trim(),
      description: input.description.trim(),
      short_name: input.short_name?.trim() || null,
      summary: input.summary?.trim() || null,
      primary_scope_code: input.primary_scope_code || null,
      language_id: input.language_id ?? null,
      website_url: input.website_url?.trim() || null,
      email: input.email?.trim() || null,
      phone: input.phone?.trim() || null,
      operational_status: input.operational_status ?? "active",
    })
    .select("id")
    .single();

  if (error) {
    return { ok: false, error: mapPostgresError(error) };
  }
  return { ok: true, id: data.id as string };
}

export async function updateEditorialOrganization(
  id: string,
  patch: UpdateEditorialOrganizationPatch,
): Promise<{ ok: true } | { ok: false; error: AppError }> {
  const allowed: Record<string, unknown> = {};
  for (const key of [
    "type_code",
    "name",
    "slug",
    "description",
    "short_name",
    "summary",
    "primary_scope_code",
    "language_id",
    "website_url",
    "email",
    "phone",
    "operational_status",
    "editorial_status",
  ] as const) {
    if (key in patch) {
      const val = patch[key];
      if (typeof val === "string") {
        allowed[key] = val.trim();
      } else {
        allowed[key] = val ?? null;
      }
    }
  }

  if (Object.keys(allowed).length === 0) {
    return {
      ok: false,
      error: { code: "validation", message: "Nessun campo da aggiornare." },
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("organizations")
    .update(allowed)
    .eq("id", id)
    .eq("owned_by_editorial", true);

  if (error) {
    return { ok: false, error: mapPostgresError(error) };
  }
  return { ok: true };
}

export async function publishEditorialOrganization(
  id: string,
): Promise<{ ok: true } | { ok: false; error: AppError }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("organizations")
    .update({
      editorial_status: "ready",
      publication_status: "published",
      visibility_status: "public",
      published_at: new Date().toISOString(),
      withdrawn_at: null,
    })
    .eq("id", id)
    .eq("owned_by_editorial", true);

  if (error) {
    return { ok: false, error: mapPostgresError(error) };
  }
  return { ok: true };
}

export async function withdrawEditorialOrganization(
  id: string,
): Promise<{ ok: true } | { ok: false; error: AppError }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("organizations")
    .update({
      publication_status: "withdrawn",
      withdrawn_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("owned_by_editorial", true);

  if (error) {
    return { ok: false, error: mapPostgresError(error) };
  }
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Officials
// ---------------------------------------------------------------------------

export type OrganizationOfficial = {
  id: string;
  organization_id: string;
  role_kind: string;
  person_id: string | null;
  display_label: string | null;
  is_primary: boolean;
  email: string | null;
  phone: string | null;
};

const OFFICIAL_SELECT =
  "id, organization_id, role_kind, person_id, display_label, is_primary, email, phone";

export async function listEditorialOrganizationOfficials(
  organizationId: string,
): Promise<OrganizationOfficial[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("organization_officials")
    .select(OFFICIAL_SELECT)
    .eq("organization_id", organizationId)
    .order("sort_order");
  return (data ?? []) as OrganizationOfficial[];
}

export type AddOrganizationOfficialInput = {
  organization_id: string;
  role_kind: string;
  person_id?: string | null;
  display_label?: string | null;
  email?: string | null;
  phone?: string | null;
  is_primary?: boolean;
};

export async function addEditorialOrganizationOfficial(
  input: AddOrganizationOfficialInput,
): Promise<{ ok: true; id: string } | { ok: false; error: AppError }> {
  const hasPerson = Boolean(input.person_id?.trim());
  const hasLabel = Boolean(input.display_label?.trim());

  if (hasPerson === hasLabel) {
    return {
      ok: false,
      error: {
        code: "validation",
        message: "Indica person_id oppure display_label (XOR).",
        fieldErrors: {
          display_label: "Obbligatorio se non c'è una Persona collegata",
        },
      },
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organization_officials")
    .insert({
      organization_id: input.organization_id,
      role_kind: input.role_kind,
      person_id: hasPerson ? input.person_id!.trim() : null,
      display_label: hasLabel ? input.display_label!.trim() : null,
      email: input.email?.trim() || null,
      phone: input.phone?.trim() || null,
      is_primary: input.is_primary ?? false,
      sort_order: 0,
    })
    .select("id")
    .single();

  if (error) {
    return { ok: false, error: mapPostgresError(error) };
  }
  return { ok: true, id: data.id as string };
}
