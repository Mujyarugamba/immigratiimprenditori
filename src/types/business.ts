/** Impresa / Appartenenza / management — Access/RLS v1 (no new DB fields). */

export type BusinessRow = {
  id: string;
  legal_name: string;
  public_name: string;
  summary: string | null;
  description: string | null;
  organization_form: string | null;
  size_band: string | null;
  founding_year: number | null;
  substantial_status: string;
  editorial_status: string;
  publication_status: string;
  administrative_status: string | null;
  is_archived: boolean;
  deleted_at: string | null;
};

/** Ephemeral UI capabilities — never persisted, never sole authorization. */
export type BusinessCapabilities = {
  businessId: string;
  isMember: boolean;
  canManage: boolean;
};

export type BusinessListItem = {
  business: Pick<
    BusinessRow,
    | "id"
    | "legal_name"
    | "public_name"
    | "summary"
    | "publication_status"
    | "editorial_status"
    | "substantial_status"
  >;
  membershipId: string;
  roleId: string;
  relationStatus: string;
  /** CTX: active membership for current Persona */
  isMember: boolean;
  /** ACT: CTX ∧ granted management authorization */
  canManage: boolean;
  grantStatus: "granted" | "revoked" | "none";
  authorizationId: string | null;
};

export type MembershipListItem = {
  id: string;
  personId: string;
  personDisplayName: string | null;
  businessId: string;
  roleId: string;
  relationStatus: string;
  isContested: boolean;
  grantStatus: "granted" | "revoked" | "none";
  authorizationId: string | null;
  isSelf: boolean;
};

/** Columns authenticated may UPDATE on profiles (Access A4.2). */
export const PROFILE_SELF_EDITABLE_FIELDS = [
  "display_name",
  "slug",
  "bio",
  "organization_name",
  "organization_type",
  "role_description",
  "city",
  "province",
  "region",
  "country",
  "website",
  "phone",
  "avatar_url",
  "is_public",
] as const;

export type ProfileSelfEditableField =
  (typeof PROFILE_SELF_EDITABLE_FIELDS)[number];

export type ProfileSelfUpdate = Partial<{
  display_name: string;
  slug: string;
  bio: string | null;
  organization_name: string | null;
  organization_type: string | null;
  role_description: string | null;
  city: string | null;
  province: string | null;
  region: string | null;
  country: string | null;
  website: string | null;
  phone: string | null;
  avatar_url: string | null;
  is_public: boolean;
}>;

/** ACT-editable business sheet fields (UI whitelist; RLS/ACT remains authority). */
export const BUSINESS_ACT_EDITABLE_FIELDS = [
  "legal_name",
  "public_name",
  "summary",
  "description",
  "organization_form",
  "size_band",
  "founding_year",
  "substantial_status",
  "editorial_status",
  "publication_status",
  "administrative_status",
  "is_archived",
] as const;

export type BusinessActUpdate = Partial<{
  legal_name: string;
  public_name: string;
  summary: string | null;
  description: string | null;
  organization_form: string | null;
  size_band: string | null;
  founding_year: number | null;
  substantial_status: "active" | "ceased";
  editorial_status: "draft" | "incomplete" | "complete";
  publication_status: "unpublished" | "public";
  administrative_status: string | null;
  is_archived: boolean;
}>;

export const SELECTED_BUSINESS_COOKIE = "ii_selected_business_id";
