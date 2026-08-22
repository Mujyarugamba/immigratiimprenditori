"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service";

function safeNextPath(raw: string | null): string {
  const value = (raw ?? "").trim();
  if (value === "/app/contributore" || value.startsWith("/app/contributore/")) {
    return value;
  }
  if (value === "/app/redazione" || value.startsWith("/app/redazione/")) {
    return value;
  }
  return "/app/redazione";
}

function normalizedIp(raw: string | null): string | null {
  const value = (raw ?? "").trim();
  if (!value || value.length > 128 || !/^[0-9A-Fa-f:.]+$/.test(value)) return null;
  return value;
}

async function getClientIp(): Promise<string | null> {
  const requestHeaders = await headers();

  // Netlify's request path supplies the direct client address. The forwarded
  // fallback keeps local/non-Netlify validation useful; the independent email
  // bucket remains authoritative even if an IP-specific bucket is unavailable.
  const netlifyIp = normalizedIp(requestHeaders.get("x-nf-client-connection-ip"));
  if (netlifyIp) return netlifyIp;

  const forwarded = requestHeaders.get("x-forwarded-for")?.split(",")[0] ?? null;
  return normalizedIp(forwarded);
}

export async function signInEditorialAction(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = safeNextPath(String(formData.get("next") ?? "/app/redazione"));
  const contributorTarget = next.startsWith("/app/contributore");

  if (!email || !password) {
    redirect(`/accedi?error=missing&next=${encodeURIComponent(next)}`);
  }

  const clientIp = await getClientIp();
  const service = createServiceRoleClient();
  const { data: loginAllowed, error: rateLimitError } = await service.rpc(
    "consume_editorial_login_rate_limit",
    {
      p_email: email,
      p_client_ip: clientIp,
    },
  );

  // Fail closed: login already depends on Supabase availability, and bypassing
  // an unavailable security control would silently remove brute-force defense.
  if (rateLimitError || loginAllowed !== true) {
    redirect(`/accedi?error=rate&next=${encodeURIComponent(next)}`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    redirect(`/accedi?error=credentials&next=${encodeURIComponent(next)}`);
  }

  // Assigned-role helpers intentionally do not authorize privileged work: they
  // let us identify the role while the freshly password-authenticated session is
  // still AAL1 and route it into the mandatory MFA step.
  const [active, editorAssigned, adminAssigned, contributor] = await Promise.all([
    supabase.rpc("access_is_active_account"),
    supabase.rpc("access_is_editor_assigned"),
    supabase.rpc("access_is_application_admin_assigned"),
    supabase.rpc("access_is_contributor"),
  ]);

  if (active.error || !active.data) {
    await supabase.auth.signOut();
    redirect(`/accedi?error=account&next=${encodeURIComponent(next)}`);
  }

  const allowed = contributorTarget
    ? !contributor.error && Boolean(contributor.data)
    : !editorAssigned.error &&
      !adminAssigned.error &&
      Boolean(editorAssigned.data || adminAssigned.data);

  if (!allowed) {
    await supabase.auth.signOut();
    redirect(`/accedi?error=role&next=${encodeURIComponent(next)}`);
  }

  if (!contributorTarget) {
    const assurance = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (assurance.error || assurance.data.currentLevel !== "aal2") {
      redirect(`/app/mfa?next=${encodeURIComponent(next)}`);
    }
  }

  redirect(next);
}

export async function signOutEditorialAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
