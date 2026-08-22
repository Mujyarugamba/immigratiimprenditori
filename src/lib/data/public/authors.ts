import { createClient } from "@/lib/supabase/server";

export type PublicAuthorProfile = {
  id: string;
  slug: string;
  display_name: string;
  profile_kind: "person" | "organization" | "editorial_group";
  bio: string | null;
  affiliation: string | null;
  orcid: string | null;
  website_url: string | null;
};

export type PublicAuthorContent = {
  id: string;
  slug: string;
  title: string;
  abstract: string | null;
  type_code: string;
  published_at: string | null;
};

const PROFILE_SELECT =
  "id, slug, display_name, profile_kind, bio, affiliation, orcid, website_url";

export async function listPublicAuthorProfiles(): Promise<PublicAuthorProfile[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("author_profiles")
    .select(PROFILE_SELECT)
    .eq("is_public", true)
    .order("display_name", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as PublicAuthorProfile[];
}

export async function getPublicAuthorProfile(
  slug: string,
): Promise<PublicAuthorProfile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("author_profiles")
    .select(PROFILE_SELECT)
    .eq("slug", slug)
    .eq("is_public", true)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data ?? null) as PublicAuthorProfile | null;
}

export async function listPublicAuthorContents(
  authorProfileId: string,
): Promise<PublicAuthorContent[]> {
  const supabase = await createClient();
  const { data: links, error: linkError } = await supabase
    .from("content_authors")
    .select("content_id")
    .eq("author_profile_id", authorProfileId);

  if (linkError) throw new Error(linkError.message);
  const contentIds = (links ?? [])
    .map((link) => link.content_id as string | null)
    .filter((id): id is string => Boolean(id));
  if (contentIds.length === 0) return [];

  const { data, error } = await supabase
    .from("contents")
    .select("id, slug, title, abstract, type_code, published_at")
    .in("id", contentIds)
    .eq("editorial_status", "ready")
    .eq("publication_status", "published")
    .eq("visibility_status", "public")
    .is("archived_at", null)
    .order("published_at", { ascending: false, nullsFirst: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as PublicAuthorContent[];
}
