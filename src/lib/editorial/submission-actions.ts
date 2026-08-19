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

function within(value: string | null, max: number, min = 0) {
  if (value == null) return min === 0;
  return value.length >= min && value.length <= max;
}

function isValidEmail(value: string) {
  if (value.length > 320 || value.length < 5) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isSafeHttpUrl(value: string | null) {
  if (!value) return true;
  if (value.length > 2000) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export async function submitEditorialContributionAction(formData: FormData) {
  // Honeypot: real visitors never fill this hidden field. Return a normal success
  // response to automated form fillers without creating database records.
  if (text(formData, "website")) {
    redirect("/contribuisci?inviato=1");
  }

  const submissionKind = text(formData, "submission_kind") ?? "";
  const submitterName = text(formData, "submitter_name") ?? "";
  const submitterEmail = text(formData, "submitter_email") ?? "";
  const contributionText = text(formData, "contribution_text") ?? "";
  const title = text(formData, "title");
  const phone = text(formData, "submitter_phone");
  const organization = text(formData, "organization_name");
  const originLabel = text(formData, "origin_country_label");
  const destinationLabel = text(formData, "destination_country_label");
  const originalUrl = text(formData, "original_url");
  const consentContact = formData.get("consent_contact") === "on";
  const consentPublication = formData.get("consent_publication") === "on";

  if (
    !ALLOWED_KINDS.has(submissionKind) ||
    !within(submitterName, 180, 2) ||
    !isValidEmail(submitterEmail) ||
    !within(contributionText, 20_000, 20) ||
    !within(title, 240) ||
    !within(phone, 80) ||
    !within(organization, 240) ||
    !within(originLabel, 120) ||
    !within(destinationLabel, 120) ||
    !isSafeHttpUrl(originalUrl) ||
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
    p_title: title,
    p_submitter_phone: phone,
    p_organization_name: organization,
    p_origin_country_code: null,
    p_destination_country_code: null,
    p_original_url: originalUrl,
    p_consent_contact: consentContact,
    p_consent_publication: consentPublication,
    p_origin_country_label: originLabel,
    p_destination_country_label: destinationLabel,
  });

  if (error) {
    redirect("/contribuisci?errore=invio");
  }

  redirect("/contribuisci?inviato=1");
}
