"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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

export async function signInEditorialAction(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNextPath(String(formData.get("next") ?? "/app/redazione"));
  const contributorTarget = next.startsWith("/app/contributore");

  if (!email || !password) {
    redirect(`/accedi?error=missing&next=${encodeURIComponent(next)}`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    redirect(`/accedi?error=credentials&next=${encodeURIComponent(next)}`);
  }

  const [active, editor, admin, contributor] = await Promise.all([
    supabase.rpc("access_is_active_account"),
    supabase.rpc("access_is_editor"),
    supabase.rpc("access_is_application_admin"),
    supabase.rpc("access_is_contributor"),
  ]);

  if (active.error || !active.data) {
    await supabase.auth.signOut();
    redirect(`/accedi?error=account&next=${encodeURIComponent(next)}`);
  }

  const allowed = contributorTarget
    ? !contributor.error && Boolean(contributor.data)
    : !editor.error && !admin.error && Boolean(editor.data || admin.data);

  if (!allowed) {
    await supabase.auth.signOut();
    redirect(`/accedi?error=role&next=${encodeURIComponent(next)}`);
  }

  redirect(next);
}

export async function signOutEditorialAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
