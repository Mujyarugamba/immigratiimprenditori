"use server";

import { revalidatePath } from "next/cache";
import { getApplicationSession } from "@/lib/session/get-application-session";
import { createClient } from "@/lib/supabase/server";

const REVIEW_STATUSES = new Set(["reviewed", "accepted", "rejected"]);

async function requireEditorialSession() {
  const session = await getApplicationSession();
  if (!session?.isActiveAccount || (!session.isEditor && !session.isApplicationAdmin)) {
    throw new Error("Accesso redazionale richiesto.");
  }
  if (!session.accountId) throw new Error("Account redazionale non risolto.");
  return session;
}

export async function reviewEditorialAiRunAction(formData: FormData) {
  const session = await requireEditorialSession();
  const id = String(formData.get("id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();

  if (!id || !REVIEW_STATUSES.has(status)) {
    throw new Error("Revisione AI non valida.");
  }

  const supabase = await createClient();
  const { data: current, error: currentError } = await supabase
    .from("editorial_ai_runs")
    .select("status")
    .eq("id", id)
    .maybeSingle();

  if (currentError || !current) {
    throw new Error("Run AI non disponibile nell'ambiente collegato.");
  }
  if (current.status === "failed") {
    throw new Error("Un run fallito non può essere approvato.");
  }

  const { error } = await supabase
    .from("editorial_ai_runs")
    .update({
      status,
      reviewed_by_account_id: session.accountId,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error("Impossibile registrare la revisione del run AI.");
  revalidatePath("/app/redazione/ai");
}
