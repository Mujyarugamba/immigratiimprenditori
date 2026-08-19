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

export async function updateInboxStatusAction(formData: FormData) {
  const session = await getApplicationSession();
  if (!session?.isActiveAccount || (!session.isEditor && !session.isApplicationAdmin)) {
    throw new Error("Accesso redazionale richiesto.");
  }

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

  revalidatePath("/app/redazione/inbox");
  revalidatePath(`/app/redazione/inbox/${id}`);
}
