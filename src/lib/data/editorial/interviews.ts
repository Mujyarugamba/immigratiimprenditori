import { mapPostgresError, type AppError } from "@/lib/errors/app-error";
import type {
  InterviewConsentKind,
  InterviewConsentStatus,
  InterviewWorkflowStatus,
} from "@/lib/editorial/interview-workflow";
import { createClient } from "@/lib/supabase/server";

export type EditorialInterviewWorkflow = {
  content_id: string;
  workflow_status: InterviewWorkflowStatus;
  source_origin: string;
  contacted_at: string | null;
  scheduled_for: string | null;
  interviewed_at: string | null;
  publication_consent_status: InterviewConsentStatus;
  publication_consent_at: string | null;
  quote_approval_status: InterviewConsentStatus;
  quote_approval_at: string | null;
  image_consent_status: InterviewConsentStatus;
  image_consent_at: string | null;
  video_consent_status: InterviewConsentStatus;
  video_consent_at: string | null;
  updated_at: string;
};

export type InterviewWorkflowMutationResult =
  | { ok: true }
  | { ok: false; error: AppError };

const SELECT =
  "content_id, workflow_status, source_origin, contacted_at, scheduled_for, interviewed_at, publication_consent_status, publication_consent_at, quote_approval_status, quote_approval_at, image_consent_status, image_consent_at, video_consent_status, video_consent_at, updated_at" as const;

function conflict(message: string): InterviewWorkflowMutationResult {
  return { ok: false, error: { code: "conflict", message } };
}

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

export async function markEditorialInterviewContacted(
  contentId: string,
): Promise<InterviewWorkflowMutationResult> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("content_interview_workflow")
    .update({ workflow_status: "contacted", contacted_at: new Date().toISOString() })
    .eq("content_id", contentId)
    .eq("workflow_status", "candidate")
    .select("content_id")
    .maybeSingle();

  if (error) return { ok: false, error: mapPostgresError(error) };
  if (!data) return conflict("Lo stato dell’intervista è cambiato: ricarica la pagina.");
  return { ok: true };
}

export async function scheduleEditorialInterview(
  contentId: string,
  scheduledFor: string,
): Promise<InterviewWorkflowMutationResult> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("content_interview_workflow")
    .update({ workflow_status: "scheduled", scheduled_for: scheduledFor })
    .eq("content_id", contentId)
    .in("workflow_status", ["contacted", "scheduled"])
    .select("content_id")
    .maybeSingle();

  if (error) return { ok: false, error: mapPostgresError(error) };
  if (!data) return conflict("L’intervista non è più in uno stato programmabile.");
  return { ok: true };
}

export async function markEditorialInterviewInterviewed(
  contentId: string,
): Promise<InterviewWorkflowMutationResult> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("content_interview_workflow")
    .update({ workflow_status: "interviewed", interviewed_at: new Date().toISOString() })
    .eq("content_id", contentId)
    .in("workflow_status", ["contacted", "scheduled"])
    .select("content_id")
    .maybeSingle();

  if (error) return { ok: false, error: mapPostgresError(error) };
  if (!data) return conflict("L’intervista non è più in uno stato registrabile come svolta.");
  return { ok: true };
}

export async function startEditorialInterviewFactCheck(
  contentId: string,
): Promise<InterviewWorkflowMutationResult> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("content_interview_workflow")
    .update({ workflow_status: "fact_check" })
    .eq("content_id", contentId)
    .eq("workflow_status", "interviewed")
    .select("content_id")
    .maybeSingle();

  if (error) return { ok: false, error: mapPostgresError(error) };
  if (!data) return conflict("Solo un’intervista svolta può entrare in fact-check.");
  return { ok: true };
}

export async function approveEditorialInterview(
  contentId: string,
): Promise<InterviewWorkflowMutationResult> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("content_interview_workflow")
    .update({ workflow_status: "approved" })
    .eq("content_id", contentId)
    .eq("workflow_status", "fact_check")
    .eq("publication_consent_status", "granted")
    .eq("quote_approval_status", "granted")
    .select("content_id")
    .maybeSingle();

  if (error) return { ok: false, error: mapPostgresError(error) };
  if (!data) {
    return conflict(
      "Per approvare servono fact-check, consenso alla pubblicazione e approvazione delle citazioni.",
    );
  }
  return { ok: true };
}

export async function declineEditorialInterview(
  contentId: string,
): Promise<InterviewWorkflowMutationResult> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("content_interview_workflow")
    .update({ workflow_status: "declined" })
    .eq("content_id", contentId)
    .in("workflow_status", ["contacted", "scheduled"])
    .select("content_id")
    .maybeSingle();

  if (error) return { ok: false, error: mapPostgresError(error) };
  if (!data) return conflict("Solo un contatto avviato o programmato può essere segnato come declinato.");
  return { ok: true };
}

export async function updateEditorialInterviewConsent(
  contentId: string,
  kind: InterviewConsentKind,
  status: InterviewConsentStatus,
): Promise<InterviewWorkflowMutationResult> {
  const supabase = await createClient();
  const grantedAt = status === "granted" ? new Date().toISOString() : null;
  const allowedWorkflowStatuses = ["contacted", "scheduled", "interviewed", "fact_check"];

  let query;
  switch (kind) {
    case "publication":
      query = supabase
        .from("content_interview_workflow")
        .update({ publication_consent_status: status, publication_consent_at: grantedAt });
      break;
    case "quote":
      query = supabase
        .from("content_interview_workflow")
        .update({ quote_approval_status: status, quote_approval_at: grantedAt });
      break;
    case "image":
      query = supabase
        .from("content_interview_workflow")
        .update({ image_consent_status: status, image_consent_at: grantedAt });
      break;
    case "video":
      query = supabase
        .from("content_interview_workflow")
        .update({ video_consent_status: status, video_consent_at: grantedAt });
      break;
  }

  const { data, error } = await query
    .eq("content_id", contentId)
    .in("workflow_status", allowedWorkflowStatuses)
    .select("content_id")
    .maybeSingle();

  if (error) return { ok: false, error: mapPostgresError(error) };
  if (!data) return conflict("I consensi non sono modificabili nello stato corrente.");
  return { ok: true };
}
