"use server";

import { revalidatePath } from "next/cache";
import { getApplicationSession } from "@/lib/session/get-application-session";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_STATUSES = new Set([
  "new",
  "to_review",
  "needs_research",
  "assigned",
  "draft_created",
  "rejected",
  "archived",
]);

async function requireEditorialSession() {
  const session = await getApplicationSession();
  if (!session?.isActiveAccount || (!session.isEditor && !session.isApplicationAdmin)) {
    throw new Error("Accesso redazionale richiesto.");
  }
  return session;
}

export async function updateInboxStatusAction(formData: FormData) {
  await requireEditorialSession();

  const id = String(formData.get("id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();
  if (!id || !ALLOWED_STATUSES.has(status)) {
    throw new Error("Aggiornamento Inbox non valido.");
  }

  const supabase = await createClient();
  const { data: current, error: currentError } = await supabase
    .from("editorial_inbox_items")
    .select("status")
    .eq("id", id)
    .maybeSingle();
  if (currentError || !current) throw new Error("Arrivo editoriale non trovato.");

  const { error } = await supabase
    .from("editorial_inbox_items")
    .update({
      status,
      reviewed_at: status === "new" ? null : new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error("Impossibile aggiornare lo stato dell'arrivo.");

  // editorial_inbox_activity_log is the canonical database audit trigger. It
  // records status/priority/assignment changes atomically with this update.
  revalidatePath("/app/redazione/inbox");
  revalidatePath(`/app/redazione/inbox/${id}`);
}

export async function assignInboxToMeAction(formData: FormData) {
  const session = await requireEditorialSession();
  if (!session.accountId) throw new Error("Account redazionale non risolto.");

  const id = String(formData.get("id") ?? "").trim();
  if (!id) throw new Error("Arrivo editoriale non valido.");

  const supabase = await createClient();
  const { data: current, error: currentError } = await supabase
    .from("editorial_inbox_items")
    .select("assigned_account_id, status")
    .eq("id", id)
    .maybeSingle();
  if (currentError || !current) throw new Error("Arrivo editoriale non trovato.");

  const { error } = await supabase
    .from("editorial_inbox_items")
    .update({
      assigned_account_id: session.accountId,
      status: current.status === "new" || current.status === "to_review" ? "assigned" : current.status,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw new Error("Impossibile assegnare l'arrivo.");

  // Assignment and any accompanying status transition are captured once by the
  // canonical database trigger, avoiding duplicate/non-atomic audit rows.
  revalidatePath("/app/redazione/inbox");
  revalidatePath(`/app/redazione/inbox/${id}`);
}
