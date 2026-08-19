"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getApplicationSession } from "@/lib/session/get-application-session";
import { createClient } from "@/lib/supabase/server";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const WORKFLOW = new Set(["candidate","contacted","scheduled","interviewed","fact_check","approved","declined","closed"]);
const ORIGINS = new Set(["editorial","contribution","referral","public_source"]);
const CONSENTS = new Set(["pending","granted","declined","not_required"]);

async function requireEditor() {
  const session = await getApplicationSession();
  if (!session?.isActiveAccount || (!session.isEditor && !session.isApplicationAdmin)) {
    redirect("/app/forbidden");
  }
}

function consentDate(status: string, existingStatus: string | null, existingDate: string | null, now: string) {
  if (status !== "granted") return null;
  if (existingStatus === "granted" && existingDate) return existingDate;
  return now;
}

function parseUtcDateTime(value: FormDataEntryValue | null): string | null {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const parsed = new Date(`${raw}:00Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

export async function saveInterviewWorkflowAction(formData: FormData): Promise<void> {
  await requireEditor();
  const contentId = String(formData.get("content_id") ?? "").trim();
  if (!UUID_RE.test(contentId)) redirect("/app/redazione/storie?error=content");

  const workflowStatus = String(formData.get("workflow_status") ?? "candidate");
  const sourceOrigin = String(formData.get("source_origin") ?? "editorial");
  const publicationConsent = String(formData.get("publication_consent_status") ?? "pending");
  const quoteApproval = String(formData.get("quote_approval_status") ?? "pending");
  const imageConsent = String(formData.get("image_consent_status") ?? "pending");
  const videoConsent = String(formData.get("video_consent_status") ?? "not_required");
  if (!WORKFLOW.has(workflowStatus) || !ORIGINS.has(sourceOrigin) ||
      ![publicationConsent, quoteApproval, imageConsent, videoConsent].every((value) => CONSENTS.has(value))) {
    redirect(`/app/redazione/storie/${contentId}?error=values`);
  }

  const supabase = await createClient();
  const { data: current } = await supabase
    .from("content_interview_workflow")
    .select("*")
    .eq("content_id", contentId)
    .maybeSingle();

  const now = new Date().toISOString();
  const scheduledInput = parseUtcDateTime(formData.get("scheduled_for"));
  const scheduledFor = workflowStatus === "scheduled"
    ? scheduledInput ?? current?.scheduled_for ?? null
    : scheduledInput ?? current?.scheduled_for ?? null;
  if (workflowStatus === "scheduled" && !scheduledFor) {
    redirect(`/app/redazione/storie/${contentId}?error=schedule`);
  }

  const contactedAt = workflowStatus === "candidate"
    ? current?.contacted_at ?? null
    : current?.contacted_at ?? now;
  const interviewReached = ["interviewed","fact_check","approved","closed"].includes(workflowStatus);
  const interviewedAt = interviewReached ? current?.interviewed_at ?? now : current?.interviewed_at ?? null;
  const notes = String(formData.get("internal_notes") ?? "").trim() || null;

  const payload = {
    content_id: contentId,
    workflow_status: workflowStatus,
    source_origin: sourceOrigin,
    contacted_at: contactedAt,
    scheduled_for: scheduledFor,
    interviewed_at: interviewedAt,
    publication_consent_status: publicationConsent,
    publication_consent_at: consentDate(publicationConsent, current?.publication_consent_status ?? null, current?.publication_consent_at ?? null, now),
    quote_approval_status: quoteApproval,
    quote_approval_at: consentDate(quoteApproval, current?.quote_approval_status ?? null, current?.quote_approval_at ?? null, now),
    image_consent_status: imageConsent,
    image_consent_at: consentDate(imageConsent, current?.image_consent_status ?? null, current?.image_consent_at ?? null, now),
    video_consent_status: videoConsent,
    video_consent_at: consentDate(videoConsent, current?.video_consent_status ?? null, current?.video_consent_at ?? null, now),
    internal_notes: notes,
  };

  const { error } = await supabase.from("content_interview_workflow").upsert(payload, { onConflict: "content_id" });
  if (error) redirect(`/app/redazione/storie/${contentId}?error=save`);

  revalidatePath("/app/redazione/storie");
  revalidatePath(`/app/redazione/storie/${contentId}`);
  redirect(`/app/redazione/storie/${contentId}?status=saved`);
}
