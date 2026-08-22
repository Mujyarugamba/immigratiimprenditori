"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isPlatformLocale } from "@/lib/i18n/config";

const ALLOWED_KINDS = new Set([
  "story",
  "interview",
  "event",
  "research",
  "publication",
  "other",
]);

const LIMITS = {
  name: 200,
  email: 320,
  title: 300,
  phone: 80,
  organization: 300,
  contribution: 20000,
  countryLabel: 160,
  url: 2048,
} as const;

function text(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value || null;
}

function within(value: string | null, max: number) {
  return value === null || value.length <= max;
}

function validHttpUrl(value: string | null) {
  if (!value) return true;
  if (value.length > LIMITS.url) return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function safeReturnPath(formData: FormData) {
  const value = text(formData, "return_path");
  if (!value || value === "/contribuisci") return "/contribuisci";
  const parts = value.split("/").filter(Boolean);
  if (parts.length === 2 && isPlatformLocale(parts[0]) && parts[0] !== "it" && parts[1] === "contribuisci") {
    return `/${parts[0]}/contribuisci`;
  }
  return "/contribuisci";
}

function resultPath(base: string, key: "inviato" | "errore", value: string) {
  return `${base}?${key}=${encodeURIComponent(value)}`;
}

export async function submitEditorialContributionAction(formData: FormData) {
  const returnPath = safeReturnPath(formData);

  // Honeypot: humans never see or fill this field. Return a normal success page
  // rather than revealing to automated submitters that they were detected.
  if (text(formData, "website")) {
    redirect(resultPath(returnPath, "inviato", "1"));
  }

  const submissionKind = text(formData, "submission_kind") ?? "";
  const submitterName = text(formData, "submitter_name") ?? "";
  const submitterEmail = text(formData, "submitter_email") ?? "";
  const contributionText = text(formData, "contribution_text") ?? "";
  const title = text(formData, "title");
  const submitterPhone = text(formData, "submitter_phone");
  const organizationName = text(formData, "organization_name");
  const originCountryLabel = text(formData, "origin_country_label");
  const destinationCountryLabel = text(formData, "destination_country_label");
  const originalUrl = text(formData, "original_url");
  const consentContact = formData.get("consent_contact") === "on";
  const consentPublication = formData.get("consent_publication") === "on";

  if (
    !ALLOWED_KINDS.has(submissionKind) ||
    !submitterName ||
    submitterName.length > LIMITS.name ||
    !submitterEmail.includes("@") ||
    submitterEmail.length > LIMITS.email ||
    !contributionText ||
    contributionText.length > LIMITS.contribution ||
    !within(title, LIMITS.title) ||
    !within(submitterPhone, LIMITS.phone) ||
    !within(organizationName, LIMITS.organization) ||
    !within(originCountryLabel, LIMITS.countryLabel) ||
    !within(destinationCountryLabel, LIMITS.countryLabel) ||
    !validHttpUrl(originalUrl) ||
    !consentContact
  ) {
    redirect(resultPath(returnPath, "errore", "campi"));
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("submit_editorial_contribution", {
    p_submission_kind: submissionKind,
    p_submitter_name: submitterName,
    p_submitter_email: submitterEmail,
    p_contribution_text: contributionText,
    p_title: title,
    p_submitter_phone: submitterPhone,
    p_organization_name: organizationName,
    p_origin_country_code: null,
    p_destination_country_code: null,
    p_original_url: originalUrl,
    p_consent_contact: consentContact,
    p_consent_publication: consentPublication,
    p_origin_country_label: originCountryLabel,
    p_destination_country_label: destinationCountryLabel,
  });

  if (error) {
    redirect(resultPath(returnPath, "errore", "invio"));
  }

  redirect(resultPath(returnPath, "inviato", "1"));
}
