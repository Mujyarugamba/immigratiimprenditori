import { createClient } from "@/lib/supabase/server";

export type EditorialAuthorProfile = {
  id: string;
  slug: string;
  display_name: string;
  profile_kind: "person" | "organization" | "editorial_group";
  bio: string | null;
  affiliation: string | null;
  orcid: string | null;
  website_url: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
};

export type EditorialAuthorAssignment = {
  id: string;
  content_id: string;
  role_kind: string;
  display_label: string | null;
  is_primary: boolean;
  sort_order: number;
};

const PROFILE_SELECT =
  "id, slug, display_name, profile_kind, bio, affiliation, orcid, website_url, is_public, created_at, updated_at";

export async function listEditorialAuthorProfiles(): Promise<EditorialAuthorProfile[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("author_profiles")
    .select(PROFILE_SELECT)
    .order("display_name", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as EditorialAuthorProfile[];
}

export async function getEditorialAuthorProfile(
  id: string,
): Promise<EditorialAuthorProfile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("author_profiles")
    .select(PROFILE_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data ?? null) as EditorialAuthorProfile | null;
}

export async function listEditorialAuthorAssignments(
  authorProfileId: string,
): Promise<EditorialAuthorAssignment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("content_authors")
    .select("id, content_id, role_kind, display_label, is_primary, sort_order")
    .eq("author_profile_id", authorProfileId)
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as EditorialAuthorAssignment[];
}

export async function listEditorialAuthorAssignableContents(): Promise<
  { id: string; title: string; slug: string; publication_status: string; visibility_status: string }[]
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contents")
    .select("id, title, slug, publication_status, visibility_status")
    .is("archived_at", null)
    .order("updated_at", { ascending: false })
    .limit(250);

  if (error) throw new Error(error.message);
  return data ?? [];
}
