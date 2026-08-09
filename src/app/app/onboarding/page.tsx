import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/app/OnboardingForm";
import { ensureAccountProvisioned } from "@/lib/access/ensure-account";
import { createClient } from "@/lib/supabase/server";
import { getApplicationSession } from "@/lib/session/get-application-session";
import { destinationForAccountState } from "@/lib/session/guards";

export const metadata: Metadata = {
  title: "Completa il profilo",
};

export default async function OnboardingPage() {
  const session = await getApplicationSession();
  if (!session) {
    redirect("/accedi?next=/app/onboarding");
  }

  if (
    session.accountStatus === "suspended" ||
    session.accountStatus === "disabled" ||
    session.accountStatus === "closed"
  ) {
    redirect(destinationForAccountState(session));
  }

  // Authoritative completion: access_is_active_account() → isActiveAccount.
  if (session.isActiveAccount) {
    redirect("/app");
  }

  if (session.personAssociationStatus === "contested") {
    redirect("/app/profilo");
  }

  await ensureAccountProvisioned(session.authUserId);

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", session.authUserId)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-ink text-2xl font-semibold tracking-tight">
        Completa il profilo
      </h1>
      <p className="text-ink-muted mt-3 text-sm leading-6">
        Un ultimo passo per collegare i tuoi dati personali all&apos;account e
        usare l&apos;area riservata.
      </p>
      <div className="mt-8">
        <OnboardingForm
          defaultDisplayName={profile?.display_name ?? undefined}
        />
      </div>
    </div>
  );
}
