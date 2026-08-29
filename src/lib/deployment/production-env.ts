import type { DeploymentEnv } from "./environment";

const REQUIRED_HOSTED_PRODUCTION_ENV = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_SITE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
] as const;

function validateHttpsAbsoluteUrl(raw: string, label: string) {
  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== "https:") {
      return { ok: false as const, error: `${label} must use HTTPS.` };
    }
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: `${label} is not a valid absolute HTTPS URL.` };
  }
}

export function validateHostedProductionEnv(env: DeploymentEnv) {
  const missing = REQUIRED_HOSTED_PRODUCTION_ENV.filter((name) => !env[name]?.trim());
  if (missing.length) {
    return {
      ok: false as const,
      error: `Production environment is missing required variables: ${missing.join(", ")}`,
    };
  }

  const supabase = validateHttpsAbsoluteUrl(
    env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "",
    "Production Supabase URL",
  );
  if (!supabase.ok) return supabase;

  const site = validateHttpsAbsoluteUrl(
    env.NEXT_PUBLIC_SITE_URL?.trim() ?? "",
    "Production site URL",
  );
  if (!site.ok) return site;

  return { ok: true as const };
}
