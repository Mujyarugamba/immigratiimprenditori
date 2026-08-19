"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { findAuthUserByEmail } from "@/lib/data/editorial/contributors-admin";
import { getSiteUrl } from "@/lib/env";
import { getApplicationSession } from "@/lib/session/get-application-session";
import { createAdminClient } from "@/lib/supabase/admin";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function requireAdmin() {
  const session = await getApplicationSession();
  if (!session?.isActiveAccount || !session.isApplicationAdmin) {
    redirect("/app/forbidden");
  }
}

async function requestOrigin(): Promise<string> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  if (!host) return getSiteUrl();
  const forwardedProto = requestHeaders.get("x-forwarded-proto");
  const protocol = forwardedProto ?? (host.startsWith("localhost") ? "http" : "https");
  return `${protocol}://${host}`;
}

export async function inviteOrEnableContributorAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const fullName = String(formData.get("full_name") ?? "").trim();
  if (!EMAIL_RE.test(email)) {
    redirect("/app/redazione/contributori?error=email");
  }

  const admin = createAdminClient();
  let authUser = await findAuthUserByEmail(email);
  let invited = false;

  if (!authUser) {
    const redirectTo = `${await requestOrigin()}/invito/contributore`;
    const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
      redirectTo,
      data: fullName ? { full_name: fullName } : undefined,
    });
    if (error || !data.user) {
      redirect("/app/redazione/contributori?error=invite");
    }
    authUser = data.user;
    invited = true;
  }

  const { error: provisionError } = await admin.rpc("provision_contributor_account", {
    p_auth_user_id: authUser.id,
  });
  if (provisionError) {
    redirect("/app/redazione/contributori?error=provision");
  }

  revalidatePath("/app/redazione/contributori");
  redirect(`/app/redazione/contributori?status=${invited ? "invited" : "enabled"}`);
}

export async function revokeContributorAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const accountId = String(formData.get("account_id") ?? "").trim();
  if (!UUID_RE.test(accountId)) {
    redirect("/app/redazione/contributori?error=account");
  }

  const admin = createAdminClient();
  const { error } = await admin.rpc("revoke_contributor_role", {
    p_account_id: accountId,
  });
  if (error) {
    redirect("/app/redazione/contributori?error=revoke");
  }

  revalidatePath("/app/redazione/contributori");
  redirect("/app/redazione/contributori?status=revoked");
}
