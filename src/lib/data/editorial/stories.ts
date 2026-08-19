import { createClient } from "@/lib/supabase/server";

const STORY_TYPES = ["interview", "business_story", "personal_story", "testimony"] as const;

export type EditorialStoryListItem = {
  id: string;
  title: string;
  slug: string;
  type_code: string;
  editorial_status: string;
  publication_status: string;
  visibility_status: string;
  is_featured: boolean;
  updated_at: string;
  workflow_status: string | null;
  publication_consent_status: string | null;
};

export type EditorialStoryWorkflow = {
  content_id: string;
  workflow_status: string;
  source_origin: string;
  contacted_at: string | null;
  scheduled_for: string | null;
  interviewed_at: string | null;
  publication_consent_status: string;
  publication_consent_at: string | null;
  quote_approval_status: string;
  quote_approval_at: string | null;
  image_consent_status: string;
  image_consent_at: string | null;
  video_consent_status: string;
  video_consent_at: string | null;
  internal_notes: string | null;
  updated_at: string;
};

export type EditorialStoryDetail = {
  id: string;
  title: string;
  slug: string;
  type_code: string;
  editorial_status: string;
  publication_status: string;
  visibility_status: string;
  workflow: EditorialStoryWorkflow | null;
};

export async function listEditorialStories(): Promise<EditorialStoryListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contents")
    .select(
      "id, title, slug, type_code, editorial_status, publication_status, visibility_status, is_featured, updated_at",
    )
    .eq("owned_by_editorial", true)
    .in("type_code", [...STORY_TYPES])
    .order("is_featured", { ascending: false })
    .order("updated_at", { ascending: false });

  if (error || !data) return [];
  const ids = data.map((row) => row.id);
  const { data: workflows } = ids.length
    ? await supabase
        .from("content_interview_workflow")
        .select("content_id, workflow_status, publication_consent_status")
        .in("content_id", ids)
    : { data: [] as { content_id: string; workflow_status: string; publication_consent_status: string }[] };

  const workflowByContent = new Map(
    (workflows ?? []).map((row) => [row.content_id, row]),
  );

  return data.map((row) => {
    const workflow = workflowByContent.get(row.id);
    return {
      ...row,
      workflow_status: workflow?.workflow_status ?? null,
      publication_consent_status: workflow?.publication_consent_status ?? null,
    } as EditorialStoryListItem;
  });
}

export async function getEditorialStoryById(id: string): Promise<EditorialStoryDetail | null> {
  const supabase = await createClient();
  const { data: content, error } = await supabase
    .from("contents")
    .select("id, title, slug, type_code, editorial_status, publication_status, visibility_status")
    .eq("id", id)
    .eq("owned_by_editorial", true)
    .maybeSingle();

  if (error || !content || !STORY_TYPES.includes(content.type_code as (typeof STORY_TYPES)[number])) {
    return null;
  }

  const { data: workflow } = await supabase
    .from("content_interview_workflow")
    .select(
      "content_id, workflow_status, source_origin, contacted_at, scheduled_for, interviewed_at, publication_consent_status, publication_consent_at, quote_approval_status, quote_approval_at, image_consent_status, image_consent_at, video_consent_status, video_consent_at, internal_notes, updated_at",
    )
    .eq("content_id", id)
    .maybeSingle();

  return {
    ...content,
    workflow: (workflow as EditorialStoryWorkflow | null) ?? null,
  } as EditorialStoryDetail;
}
