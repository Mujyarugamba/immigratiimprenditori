"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function safeNextPath(raw: string | null): string {
  const value = (raw ?? "").trim();
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return "/app/redazione";
  }
  return value;
}

export async function signInEditorialAction(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const requestedNext = safeNextPath(String(formData.get("next") ?? "/app/redazione"));

  if (!email || !password) {
    redirect(`/accedi?error=missing&next=${encodeURIComponent(requestedNext)}`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    redirect(`/accedi?error=credentials&next=${encodeURIComponent(requestedNext)}`);
  }

  const [active, editor, admin, contributor] = await Promise.all([
    supabase.rpc("access_is_active_account"),
    supabase.rpc("access_is_editor"),
    supabase.rpc("access_is_application_admin"),
    supabase.rpc("access_is_contributor"),
  ]);

  if (active.error || !active.data) {
    await supabase.auth.signOut();
    redirect("/accedi?error=account");
  }

  if (
    editor.error ||
    admin.error ||
    contributor.error ||
    (!editor.data && !admin.data && !contributor.data)
  ) {
    await supabase.auth.signOut();
    redirect("/accedi?error=role");
  }

  const isEditorial = Boolean(editor.data || admin.data);
  const isContributorOnly = Boolean(contributor.data && !isEditorial);
  const next =
    isContributorOnly &&
    (requestedNext === "/app" || requestedNext.startsWith("/app/redazione"))
      ? "/app/contributore"
      : requestedNext;

  redirect(next);
}

export async function signOutEditorialAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
