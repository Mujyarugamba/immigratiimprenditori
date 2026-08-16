import {
  LEGAL_ROUTES,
  TERMS_OF_USE_VERSION,
} from "@/lib/legal/versions";
import type { SupabaseClient, User } from "@supabase/supabase-js";

/** Auth user_metadata key: intent recorded at signup (not the ledger). */
export const TERMS_ACCEPTANCE_METADATA_KEY = "terms_of_use_accepted_version";

export const TERMS_ACCEPTANCE_REQUIRED_MESSAGE =
  "Per creare l’account devi accettare i Termini d’Uso.";

export const TERMS_ACCEPTANCE_RECORD_FAILED_MESSAGE =
  "Non siamo riusciti a registrare l’accettazione dei Termini d’Uso. Riprova ad accedere.";

export type TermsAcceptanceInsert = {
  account_id: string;
  document_kind: "terms_of_use";
  document_version: string;
  acceptance_channel: "signup";
};

/**
 * Server-side gate: checkbox must be present. Client-only checks are insufficient.
 */
export function parseTermsAcceptedFromForm(formData: FormData): boolean {
  const raw = formData.get("accept_terms");
  if (raw === null || raw === undefined) return false;
  if (typeof raw !== "string") return false;
  const v = raw.trim().toLowerCase();
  return v === "on" || v === "true" || v === "1" || v === "yes";
}

export function buildSignupTermsAcceptancePayload(
  accountId: string,
): TermsAcceptanceInsert {
  return {
    account_id: accountId,
    document_kind: "terms_of_use",
    document_version: TERMS_OF_USE_VERSION,
    acceptance_channel: "signup",
  };
}

export function termsVersionFromUserMetadata(
  user: User | null | undefined,
): string | null {
  const meta = user?.user_metadata;
  if (!meta || typeof meta !== "object") return null;
  const v = (meta as Record<string, unknown>)[TERMS_ACCEPTANCE_METADATA_KEY];
  return typeof v === "string" && v.trim().length > 0 ? v.trim() : null;
}

function isUniqueViolation(error: { code?: string; message?: string } | null) {
  if (!error) return false;
  return (
    error.code === "23505" ||
    /duplicate key|unique constraint/i.test(error.message ?? "")
  );
}

/**
 * Append-only ledger write. Never sends accepted_at (DB default).
 * Same version duplicate → treated as success (idempotent retry).
 */
export async function recordSignupTermsAcceptance(
  supabase: SupabaseClient,
  accountId: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const payload = buildSignupTermsAcceptancePayload(accountId);
  const { error } = await supabase.from("terms_acceptances").insert(payload);

  if (!error) return { ok: true };
  if (isUniqueViolation(error)) return { ok: true };

  console.error("terms_acceptances insert failed", {
    code: error.code,
    message: error.message,
  });
  return { ok: false, message: TERMS_ACCEPTANCE_RECORD_FAILED_MESSAGE };
}

/**
 * Complete Terms ledger when signup intent is present in Auth metadata.
 * Legacy accounts without metadata are left unchanged (no forced re-consent).
 * Only records when metadata matches the current TERMS_OF_USE_VERSION (SoT).
 */
export async function ensureSignupTermsAcceptanceIfIntended(
  supabase: SupabaseClient,
  user: User,
  accountId: string,
): Promise<{ ok: true; skipped: boolean } | { ok: false; message: string }> {
  const intended = termsVersionFromUserMetadata(user);
  if (!intended || intended !== TERMS_OF_USE_VERSION) {
    return { ok: true, skipped: true };
  }

  const recorded = await recordSignupTermsAcceptance(supabase, accountId);
  if (!recorded.ok) return recorded;
  return { ok: true, skipped: false };
}

export function signupTermsMetadata(): Record<string, string> {
  return {
    [TERMS_ACCEPTANCE_METADATA_KEY]: TERMS_OF_USE_VERSION,
  };
}

export { LEGAL_ROUTES, TERMS_OF_USE_VERSION };
