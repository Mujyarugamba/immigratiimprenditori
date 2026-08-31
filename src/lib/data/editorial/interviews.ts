import { createClient } from "@/lib/supabase/server";

export type EditorialInterviewWorkflow = {
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
  updated_at: string;
};

const SELECT =
  "content_id, workflow_status, source_origin, contacted_at, scheduled_for, interviewed_at, publication_consent_status, publication_consent_at, quote_approval_status, quote_approval_at, image_consent_status, image_consent_at, video_consent_status, video_consent_at, updated_at" as const;

export async function getEditorialInterviewWorkflow(
  contentId: string,
): Promise<EditorialInterviewWorkflow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("content_interview_workflow")
    .select(SELECT)
    .eq("content_id", contentId)
    .maybeSingle();

  if (error || !data) return null;
  return data as EditorialInterviewWorkflow;
}
