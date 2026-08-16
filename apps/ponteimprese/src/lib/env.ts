/**
 * Environment accessors. Never import service-role helpers from client components.
 */

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export function getPublicSupabaseEnv() {
  return {
    url: required(
      "NEXT_PUBLIC_SUPABASE_URL",
      process.env.NEXT_PUBLIC_SUPABASE_URL,
    ),
    publishableKey: required(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    ),
  };
}

/** Server-only. Do not call from Client Components or shared modules imported by them. */
export function getServiceRoleKey(): string {
  if (typeof window !== "undefined") {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY must not be read in the browser");
  }
  return required(
    "SUPABASE_SERVICE_ROLE_KEY",
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

/**
 * Server-only HMAC secret for M2 subject_ref (never NEXT_PUBLIC_*).
 * Min 32 characters. Used only when inserting a concrete legal retention record.
 */
export function getLegalSubjectHmacSecret(): string {
  if (typeof window !== "undefined") {
    throw new Error("LEGAL_SUBJECT_HMAC_SECRET must not be read in the browser");
  }
  const value = process.env.LEGAL_SUBJECT_HMAC_SECRET?.trim();
  if (!value || value.length < 32) {
    throw new Error(
      "Missing or too-short environment variable: LEGAL_SUBJECT_HMAC_SECRET (min 32 chars)",
    );
  }
  return value;
}

/** Public site origin for redirects/metadata. Optional; defaults to localhost in dev. */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return "http://localhost:3000";
  return raw.replace(/\/$/, "");
}
