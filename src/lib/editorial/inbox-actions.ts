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

const ALLOWED_PRIORITIES = new Set(["critical", "high", "normal", "low"]);

type EditorialSession = NonNullable<Awaited<ReturnType<typeof getApplicationSession>>>;

async function requireEditorialSession(): Promise<EditorialSession> {
  const session = await getApplicationSession();
  if (!session?.isActiveAccount || (!session.isEditor && !session.isApplicationAdmin)) {
    throw new Error("Accesso redazionale richiesto.");
  }
  if (!session.accountId) {
    throw new Error("Account redazionale non risolto.");
  }
  return session;
}

function revalidateInbox(id: string) {
  revalidatePath("/app/redazione");
  revalidatePath("/app/redazione/inbox");
  revalidatePath(`/app/redazione/inbox/${id}`);
}

export async function updateInboxStatusAction(formData: FormData) {
  await requireEditorialSession();

  const id = String(formData.get("id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();
  if (!id || !ALLOWED_STATUSES.has(status)) {
    throw new Error("Aggiornamento Inbox non valido.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("editorial_inbox_items")
    .update({
      status,
      reviewed_at: status === "new" ? null : new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error("Impossibile aggiornare lo stato dell'arrivo.");
  revalidateInbox(id);
}

export async function updateInboxPriorityAction(formData: FormData) {
  await requireEditorialSession();

  const id = String(formData.get("id") ?? "").trim();
  const priority = String(formData.get("priority") ?? "").trim();
  if (!id || !ALLOWED_PRIORITIES.has(priority)) {
    throw new Error("Priorità Inbox non valida.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("editorial_inbox_items")
    .update({ priority })
    .eq("id", id);

  if (error) throw new Error("Impossibile aggiornare la priorità dell'arrivo.");
  revalidateInbox(id);
}

export async function assignInboxToMeAction(formData: FormData) {
  const session = await requireEditorialSession();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) throw new Error("Arrivo Inbox non valido.");

  const now = new Date().toISOString();
  const supabase = await createClient();
  const { error } = await supabase
    .from("editorial_inbox_items")
    .update({
      assigned_account_id: session.accountId,
      status: "assigned",
      reviewed_at: now,
    })
    .eq("id", id);

  if (error) throw new Error("Impossibile prendere in carico l'arrivo.");
  revalidateInbox(id);
}

export async function releaseInboxAssignmentAction(formData: FormData) {
  await requireEditorialSession();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) throw new Error("Arrivo Inbox non valido.");

  const supabase = await createClient();
  const { error } = await supabase
    .from("editorial_inbox_items")
    .update({
      assigned_account_id: null,
      status: "to_review",
    })
    .eq("id", id);

  if (error) throw new Error("Impossibile rilasciare l'arrivo.");
  revalidateInbox(id);
}
