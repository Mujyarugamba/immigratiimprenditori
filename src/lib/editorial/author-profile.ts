export const AUTHOR_PROFILE_KINDS = [
  "person",
  "organization",
  "editorial_group",
] as const;

export const AUTHOR_ROLE_KINDS = [
  "author",
  "co_author",
  "curator",
  "editor",
  "contributor",
] as const;

export type AuthorProfileKind = (typeof AUTHOR_PROFILE_KINDS)[number];
export type AuthorRoleKind = (typeof AUTHOR_ROLE_KINDS)[number];

export type AuthorProfileDraft = {
  slug: string;
  displayName: string;
  profileKind: string;
  bio: string;
  affiliation: string;
  orcid: string;
  websiteUrl: string;
  isPublic: boolean;
};

export type AuthorProfileValidation =
  | {
      ok: true;
      value: {
        slug: string;
        display_name: string;
        profile_kind: AuthorProfileKind;
        bio: string | null;
        affiliation: string | null;
        orcid: string | null;
        website_url: string | null;
        is_public: boolean;
      };
    }
  | {
      ok: false;
      message: string;
      fieldErrors: Record<string, string>;
    };

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ORCID_RE = /^0000-[0-9]{4}-[0-9]{4}-[0-9]{3}[0-9X]$/;

function optional(value: string): string | null {
  const normalized = value.trim();
  return normalized || null;
}

function normalizeWebsite(value: string): string | null {
  const normalized = optional(value);
  if (!normalized) return null;

  try {
    const url = new URL(normalized);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function validateAuthorProfileDraft(
  draft: AuthorProfileDraft,
): AuthorProfileValidation {
  const fieldErrors: Record<string, string> = {};
  const slug = draft.slug.trim();
  const displayName = draft.displayName.trim();
  const bio = optional(draft.bio);
  const affiliation = optional(draft.affiliation);
  const rawOrcid = optional(draft.orcid);
  const website = normalizeWebsite(draft.websiteUrl);

  if (!displayName) fieldErrors.display_name = "Obbligatorio";
  if (!slug) fieldErrors.slug = "Obbligatorio";
  else if (!SLUG_RE.test(slug)) {
    fieldErrors.slug = "Usa solo minuscole, numeri e trattini.";
  }

  if (!AUTHOR_PROFILE_KINDS.includes(draft.profileKind as AuthorProfileKind)) {
    fieldErrors.profile_kind = "Tipo profilo non valido.";
  }

  if (draft.websiteUrl.trim() && !website) {
    fieldErrors.website_url = "Inserisci un URL http/https valido.";
  }

  if (rawOrcid) {
    if (draft.profileKind !== "person") {
      fieldErrors.orcid = "ORCID è ammesso solo per persone.";
    } else if (!ORCID_RE.test(rawOrcid)) {
      fieldErrors.orcid = "Formato ORCID non valido.";
    }
  }

  if (draft.isPublic) {
    if (!bio) fieldErrors.bio = "La biografia è necessaria per un profilo pubblico.";
    if (!affiliation && !website) {
      fieldErrors.affiliation =
        "Per un profilo pubblico indica almeno affiliazione o sito web verificabile.";
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      message: "Controlla i dati del profilo autore.",
      fieldErrors,
    };
  }

  return {
    ok: true,
    value: {
      slug,
      display_name: displayName,
      profile_kind: draft.profileKind as AuthorProfileKind,
      bio,
      affiliation,
      orcid: rawOrcid,
      website_url: website,
      is_public: draft.isPublic,
    },
  };
}
