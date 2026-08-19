"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_KINDS = new Set([
  "story",
  "interview",
  "event",
  "research",
  "publication",
  "other",
]);

function text(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value || null;
}

export async function submitEditorialContributionAction(formData: FormData) {
  const submissionKind = text(formData, "submission_kind") ?? "";
  const submitterName = text(formData, "submitter_name") ?? "";
  const submitterEmail = text(formData, "submitter_email") ?? "";
  const contributionText = text(formData, "contribution_text") ?? "";
  const consentContact = formData.get("consent_contact") === "on";
  const consentPublication = formData.get("consent_publication") === "on";

  if (
    !ALLOWED_KINDS.has(submissionKind) ||
    !submitterName ||
    !submitterEmail.includes("@") ||
    !contributionText ||
    !consentContact
  ) {
    redirect("/contribuisci?errore=campi");
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("submit_editorial_contribution", {
    p_submission_kind: submissionKind,
    p_submitter_name: submitterName,
    p_submitter_email: submitterEmail,
    p_contribution_text: contributionText,
    p_title: text(formData, "title"),
    p_submitter_phone: text(formData, "submitter_phone"),
    p_organization_name: text(formData, "organization_name"),
    p_origin_country_code: null,
    p_destination_country_code: null,
    p_original_url: text(formData, "original_url"),
    p_consent_contact: consentContact,
    p_consent_publication: consentPublication,
    p_origin_country_label: text(formData, "origin_country_label"),
    p_destination_country_label: text(formData, "destination_country_label"),
  });

  if (error) {
    redirect("/contribuisci?errore=invio");
  }

  redirect("/contribuisci?inviato=1");
}
