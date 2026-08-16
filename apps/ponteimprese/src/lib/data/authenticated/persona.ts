import { mapPostgresError, type AppError } from "@/lib/errors/app-error";
import { pickProfileSelfUpdate } from "@/lib/profile/whitelist";
import { createClient } from "@/lib/supabase/server";
import {
  PROFILE_SELF_EDITABLE_FIELDS,
  type ProfileSelfUpdate,
} from "@/types/business";

export { pickProfileSelfUpdate };

export type PersonaProfile = {
  id: string;
  display_name: string | null;
  slug: string | null;
  bio: string | null;
  organization_name: string | null;
  organization_type: string | null;
  role_description: string | null;
  city: string | null;
  province: string | null;
  region: string | null;
  country: string | null;
  website: string | null;
  avatar_url: string | null;
  is_public: boolean | null;
  is_active: boolean | null;
};

const SELF_SELECT =
  "id, display_name, slug, bio, organization_name, organization_type, role_description, city, province, region, country, website, avatar_url, is_public, is_active";

/** Self Persona row by Access person id (not auth.uid as policy). */
export async function getPersonaById(
  personId: string,
): Promise<PersonaProfile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(SELF_SELECT)
    .eq("id", personId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }
  return data as PersonaProfile;
}

export async function updateOwnPersona(
  personId: string,
  patch: ProfileSelfUpdate,
): Promise<{ ok: true } | { ok: false; error: AppError }> {
  const allowed: ProfileSelfUpdate = {};
  for (const key of PROFILE_SELF_EDITABLE_FIELDS) {
    if (key in patch) {
      (allowed as Record<string, unknown>)[key] =
        patch[key as keyof ProfileSelfUpdate];
    }
  }

  if (Object.keys(allowed).length === 0) {
    return {
      ok: false,
      error: {
        code: "validation",
        message: "Nessun campo modificabile fornito.",
      },
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update(allowed)
    .eq("id", personId);

  if (error) {
    return { ok: false, error: mapPostgresError(error) };
  }
  return { ok: true };
}

export function isProfileIncomplete(profile: PersonaProfile | null): boolean {
  if (!profile) return true;
  return !profile.display_name?.trim() || !profile.slug?.trim();
}
