import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/app/OnboardingForm";
import { ensureAccountProvisioned } from "@/lib/access/ensure-account";
import { createClient } from "@/lib/supabase/server";
import { getApplicationSession } from "@/lib/session/get-application-session";

export const metadata: Metadata = {
  title: "Onboarding",
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
    redirect(`/app/stato/${session.accountStatus === "suspended" ? "sospeso" : session.accountStatus === "disabled" ? "disabilitato" : "chiuso"}`);
  }

  if (session.isActiveAccount && session.personId) {
    redirect("/app");
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
        Onboarding
      </h1>
      <ol className="text-ink-muted mt-4 list-decimal space-y-2 pl-5 text-sm">
        <li>Auth user creato</li>
        <li>Account applicativo provisionato (service-role RPC)</li>
        <li>
          Persona auto-creata da trigger <code>handle_new_user</code> con id =
          auth user (bootstrap contratto self-link)
        </li>
        <li>
          Collegamento Account→Persona via <code>access_link_person</code>
        </li>
      </ol>
      <p className="text-ink-muted mt-4 text-sm">
        Stato attuale Account:{" "}
        <strong>{session.accountStatus ?? "in provisioning"}</strong>
        {" · "}
        Persona collegata:{" "}
        <strong>{session.personId ? "sì" : "no"}</strong>
      </p>
      <div className="mt-8">
        <OnboardingForm
          defaultDisplayName={profile?.display_name ?? undefined}
        />
      </div>
    </div>
  );
}
