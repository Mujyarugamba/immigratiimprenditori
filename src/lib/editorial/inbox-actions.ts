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

async function writeInboxActivity(
  inboxItemId: string,
  actorAccountId: string | null,
  changes: Record<string, unknown>,
) {
  const supabase = await createClient();
  const { error } = await supabase.from("editorial_inbox_activity").insert({
    inbox_item_id: inboxItemId,
    actor_account_id: actorAccountId,
    changes,
  });
  // The write policy is prepared in a migration but may not yet be applied to
  // the production DB used by branch previews. Editorial state changes must not
  // fail merely because the optional audit append is not available yet.
  return !error;
}

export async function updateInboxStatusAction(formData: FormData) {
  const session = await requireEditorialSession();

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

  if (current.status !== status) {
    await writeInboxActivity(id, session.accountId, {
      kind: "status_change",
      from: current.status,
      to: status,
    });
  }

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

  await writeInboxActivity(id, session.accountId, {
    kind: "assignment",
    from_account_id: current.assigned_account_id,
    to_account_id: session.accountId,
  });

  revalidatePath("/app/redazione/inbox");
  revalidatePath(`/app/redazione/inbox/${id}`);
}
