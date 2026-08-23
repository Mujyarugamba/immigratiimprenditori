"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getApplicationSession } from "@/lib/session/get-application-session";
import {
  AUTHOR_ROLE_KINDS,
  type AuthorRoleKind,
  validateAuthorProfileDraft,
} from "@/lib/editorial/author-profile";

export type AuthorActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
};

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

async function requireEditorialAal2() {
  const session = await getApplicationSession();
  if (!session || !session.isActiveAccount) {
    return { ok: false as const, message: "Sessione scaduta. Accedi di nuovo." };
  }
  if (!session.isEditor && !session.isApplicationAdmin) {
    return { ok: false as const, message: "Accesso riservato ai redattori." };
  }

  const supabase = await createClient();
  const assurance = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (assurance.error || assurance.data.currentLevel !== "aal2") {
    return {
      ok: false as const,
      message: "Verifica MFA richiesta prima di modificare gli autori.",
    };
  }

  return { ok: true as const, supabase };
}

function profileDraftFromForm(formData: FormData, isPublic: boolean) {
  return {
    slug: str(formData, "slug"),
    displayName: str(formData, "display_name"),
    profileKind: str(formData, "profile_kind"),
    bio: str(formData, "bio"),
    affiliation: str(formData, "affiliation"),
    orcid: str(formData, "orcid"),
    websiteUrl: str(formData, "website_url"),
    isPublic,
  };
}

async function hasPublishedAssignment(
  supabase: Awaited<ReturnType<typeof createClient>>,
  authorProfileId: string,
): Promise<boolean> {
  const { data: links, error: linksError } = await supabase
    .from("content_authors")
    .select("content_id")
    .eq("author_profile_id", authorProfileId);

  if (linksError) return false;
  const ids = (links ?? [])
    .map((row) => row.content_id as string | null)
    .filter((id): id is string => Boolean(id));
  if (ids.length === 0) return false;

  const { count, error } = await supabase
    .from("contents")
    .select("id", { count: "exact", head: true })
    .in("id", ids)
    .eq("editorial_status", "ready")
    .eq("publication_status", "published")
    .eq("visibility_status", "public")
    .is("archived_at", null);

  return !error && (count ?? 0) > 0;
}

export async function createAuthorProfileAction(
  _prev: AuthorActionState,
  formData: FormData,
): Promise<AuthorActionState> {
  const gate = await requireEditorialAal2();
  if (!gate.ok) return { ok: false, message: gate.message };

  const validation = validateAuthorProfileDraft(profileDraftFromForm(formData, false));
  if (!validation.ok) return validation;

  const { data, error } = await gate.supabase
    .from("author_profiles")
    .insert(validation.value)
    .select("id")
    .single();

  if (error) {
    return {
      ok: false,
      message:
        error.code === "23505"
          ? "Esiste già un profilo autore con questo slug."
          : "Impossibile creare il profilo autore.",
    };
  }

  revalidatePath("/app/redazione/autori");
  redirect(`/app/redazione/autori/${data.id}`);
}

export async function updateAuthorProfileAction(
  _prev: AuthorActionState,
  formData: FormData,
): Promise<AuthorActionState> {
  const gate = await requireEditorialAal2();
  if (!gate.ok) return { ok: false, message: gate.message };

  const id = str(formData, "id");
  if (!id) return { ok: false, message: "Profilo autore non valido." };

  const wantsPublic = formData.get("is_public") === "true";
  const validation = validateAuthorProfileDraft(profileDraftFromForm(formData, wantsPublic));
  if (!validation.ok) return validation;

  if (wantsPublic && !(await hasPublishedAssignment(gate.supabase, id))) {
    return {
      ok: false,
      message:
        "Per rendere pubblico il profilo collega prima almeno un contenuto già pubblicato e pubblico.",
      fieldErrors: { is_public: "Manca una pubblicazione pubblica collegata." },
    };
  }

  const { error } = await gate.supabase
    .from("author_profiles")
    .update(validation.value)
    .eq("id", id);

  if (error) {
    return {
      ok: false,
      message:
        error.code === "23505"
          ? "Esiste già un profilo autore con questo slug."
          : "Impossibile aggiornare il profilo autore.",
    };
  }

  revalidatePath("/app/redazione/autori");
  revalidatePath(`/app/redazione/autori/${id}`);
  revalidatePath("/esplora/autori");
  revalidatePath(`/autori/${validation.value.slug}`);
  return { ok: true, message: "Profilo autore aggiornato." };
}

export async function assignAuthorProfileToContentAction(
  _prev: AuthorActionState,
  formData: FormData,
): Promise<AuthorActionState> {
  const gate = await requireEditorialAal2();
  if (!gate.ok) return { ok: false, message: gate.message };

  const authorProfileId = str(formData, "author_profile_id");
  const contentId = str(formData, "content_id");
  const roleKind = str(formData, "role_kind") as AuthorRoleKind;
  if (!authorProfileId || !contentId) {
    return { ok: false, message: "Seleziona autore e contenuto." };
  }
  if (!AUTHOR_ROLE_KINDS.includes(roleKind)) {
    return { ok: false, message: "Ruolo autore non valido." };
  }

  const [{ data: profile, error: profileError }, { data: existing, error: existingError }] =
    await Promise.all([
      gate.supabase
        .from("author_profiles")
        .select("display_name")
        .eq("id", authorProfileId)
        .maybeSingle(),
      gate.supabase
        .from("content_authors")
        .select("id")
        .eq("author_profile_id", authorProfileId)
        .eq("content_id", contentId)
        .eq("role_kind", roleKind)
        .maybeSingle(),
    ]);

  if (profileError || !profile) return { ok: false, message: "Profilo autore non trovato." };
  if (existingError) return { ok: false, message: "Impossibile verificare l'attribuzione." };
  if (existing) return { ok: false, message: "Questa attribuzione esiste già." };

  const { error } = await gate.supabase.from("content_authors").insert({
    content_id: contentId,
    role_kind: roleKind,
    author_profile_id: authorProfileId,
    display_label: profile.display_name,
    is_primary: false,
  });

  if (error) return { ok: false, message: "Impossibile collegare il contenuto al profilo." };

  revalidatePath(`/app/redazione/autori/${authorProfileId}`);
  return { ok: true, message: "Contenuto collegato al profilo autore." };
}

export async function removeAuthorProfileAssignmentAction(
  _prev: AuthorActionState,
  formData: FormData,
): Promise<AuthorActionState> {
  const gate = await requireEditorialAal2();
  if (!gate.ok) return { ok: false, message: gate.message };

  const authorProfileId = str(formData, "author_profile_id");
  const assignmentId = str(formData, "assignment_id");
  if (!authorProfileId || !assignmentId) {
    return { ok: false, message: "Attribuzione non valida." };
  }

  const { error } = await gate.supabase
    .from("content_authors")
    .delete()
    .eq("id", assignmentId)
    .eq("author_profile_id", authorProfileId);

  if (error) return { ok: false, message: "Impossibile rimuovere l'attribuzione." };

  revalidatePath(`/app/redazione/autori/${authorProfileId}`);
  return { ok: true, message: "Attribuzione rimossa." };
}
