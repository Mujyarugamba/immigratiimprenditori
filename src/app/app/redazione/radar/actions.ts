"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { runEditorialRadar } from "@/lib/radar/run";
import { getApplicationSession } from "@/lib/session/get-application-session";

async function requireEditorialAccess() {
  const session = await getApplicationSession();
  if (!session?.isActiveAccount || (!session.isEditor && !session.isApplicationAdmin)) {
    redirect("/app/forbidden");
  }
}

export async function runRadarAction(formData: FormData): Promise<void> {
  await requireEditorialAccess();
  const mode = String(formData.get("mode") ?? "preview") === "import" ? "write" : "preview";

  try {
    const result = await runEditorialRadar({
      write: mode === "write",
      maxInsert: 50,
    });
    revalidatePath("/app/redazione/radar");
    revalidatePath("/app/redazione/inbox");
    const params = new URLSearchParams({
      mode: result.mode,
      fetched: String(result.fetched),
      normalized: String(result.normalized),
      duplicates: String(result.duplicates),
      fresh: String(result.newCandidates),
      selected: String(result.selected),
      capped: String(result.capped),
      inserted: String(result.inserted),
    });
    redirect(`/app/redazione/radar?${params.toString()}`);
  } catch {
    redirect("/app/redazione/radar?error=run");
  }
}
