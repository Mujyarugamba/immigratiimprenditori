import type { AppError } from "@/lib/errors/app-error";

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

export type AddOrganizationOfficialInput = {
  organization_id: string;
  role_kind: string;
  person_id?: string | null;
  display_label?: string | null;
  email?: string | null;
  phone?: string | null;
  is_primary?: boolean;
};

const PONTE_ONLY_ERROR: AppError = {
  code: "not_found",
  message: "La gestione delle organizzazioni è disponibile in PonteImprese.",
};

export async function listEditorialOrganizations(): Promise<
  EditorialOrganizationListItem[]
> {
  return [];
}

export async function getEditorialOrganizationById(
  _id: string,
): Promise<EditorialOrganization | null> {
  return null;
}

export async function createEditorialOrganization(
  _input: CreateEditorialOrganizationInput,
): Promise<{ ok: true; id: string } | { ok: false; error: AppError }> {
  return { ok: false, error: PONTE_ONLY_ERROR };
}

export async function updateEditorialOrganization(
  _id: string,
  _patch: UpdateEditorialOrganizationPatch,
): Promise<{ ok: true } | { ok: false; error: AppError }> {
  return { ok: false, error: PONTE_ONLY_ERROR };
}

export async function publishEditorialOrganization(
  _id: string,
): Promise<{ ok: true } | { ok: false; error: AppError }> {
  return { ok: false, error: PONTE_ONLY_ERROR };
}

export async function withdrawEditorialOrganization(
  _id: string,
): Promise<{ ok: true } | { ok: false; error: AppError }> {
  return { ok: false, error: PONTE_ONLY_ERROR };
}

export async function listEditorialOrganizationOfficials(
  _organizationId: string,
): Promise<OrganizationOfficial[]> {
  return [];
}

export async function addEditorialOrganizationOfficial(
  _input: AddOrganizationOfficialInput,
): Promise<{ ok: true; id: string } | { ok: false; error: AppError }> {
  return { ok: false, error: PONTE_ONLY_ERROR };
}
