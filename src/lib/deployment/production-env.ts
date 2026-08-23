import type { DeploymentEnv } from "./environment";

const REQUIRED_HOSTED_PRODUCTION_ENV = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
] as const;

export function validateHostedProductionEnv(env: DeploymentEnv) {
  const missing = REQUIRED_HOSTED_PRODUCTION_ENV.filter((name) => !env[name]?.trim());
  if (missing.length) {
    return {
      ok: false as const,
      error: `Production environment is missing required variables: ${missing.join(", ")}`,
    };
  }

  const rawUrl = env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== "https:") {
      return { ok: false as const, error: "Production Supabase URL must use HTTPS." };
    }
  } catch {
    return {
      ok: false as const,
      error: "Production Supabase URL is not a valid absolute HTTPS URL.",
    };
  }

  return { ok: true as const };
}
