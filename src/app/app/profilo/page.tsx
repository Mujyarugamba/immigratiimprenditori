import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ProfileEditForm } from "@/components/app/ProfileEditForm";
import {
  getPersonaById,
  isProfileIncomplete,
} from "@/lib/data/authenticated/persona";
import { getApplicationSession } from "@/lib/session/get-application-session";
import { requireAuthenticated } from "@/lib/session/guards";
import { ErrorState } from "@/components/ui/states";

export const metadata: Metadata = {
  title: "Il mio profilo",
};

export default async function ProfiloPage() {
  const session = await getApplicationSession();
  const auth = requireAuthenticated(session, "/app/profilo");
  if (!auth.ok) {
    redirect(auth.redirectTo);
  }
  if (!session) {
    redirect("/accedi?next=/app/profilo");
  }

  if (
    session.accountStatus === "suspended" ||
    session.accountStatus === "disabled" ||
    session.accountStatus === "closed"
  ) {
    redirect(
      session.accountStatus === "suspended"
        ? "/app/stato/sospeso"
        : session.accountStatus === "disabled"
          ? "/app/stato/disabilitato"
          : "/app/stato/chiuso",
    );
  }

  if (session.personAssociationStatus === "contested") {
    return (
      <ErrorState
        title="Associazione Persona contestata"
        description="L'Account è collegato a una Persona in stato contested. Le operazioni operative (CTX/ACT, modifica profilo) restano bloccate finché l'associazione non torna declared/verified."
        actionHref="/app"
        actionLabel="Dashboard"
      />
    );
  }

  if (!session.personId) {
    redirect("/app/onboarding");
  }

  const profile = await getPersonaById(session.personId);
  const incomplete = isProfileIncomplete(profile);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-ink text-2xl font-semibold tracking-tight">
        Il mio profilo
      </h1>
      <p className="text-ink-muted mt-2 text-sm">
        Persona risolta via Auth → Account →{" "}
        <code>access_current_person_id()</code>. I campi modificabili seguono i
        column grant Access A4.2.
      </p>

      <dl className="border-line bg-surface-elevated mt-6 grid gap-3 rounded-md border p-5 text-sm shadow-soft sm:grid-cols-2">
        <div>
          <dt className="text-ink-subtle">Account</dt>
          <dd className="text-ink mt-1 font-medium">
            {session.accountStatus ?? "—"}
          </dd>
        </div>
        <div>
          <dt className="text-ink-subtle">Associazione</dt>
          <dd className="text-ink mt-1 font-medium">
            {session.personAssociationStatus ?? "—"}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-ink-subtle">Persona id</dt>
          <dd className="text-ink mt-1 break-all">{session.personId}</dd>
        </div>
      </dl>

      {incomplete ? (
        <p className="border-accent/30 bg-accent-soft text-ink mt-4 rounded-md border p-3 text-sm">
          Profilo incompleto (UI): completa almeno nome e slug.
        </p>
      ) : null}

      {!session.isActiveAccount ? (
        <p className="text-ink-muted mt-4 text-sm">
          Account non <code>active</code>: la modifica profilo richiede Account
          operativo.{" "}
          <Link href="/app/onboarding" className="text-brand underline">
            Completa onboarding
          </Link>
        </p>
      ) : profile ? (
        <ProfileEditForm profile={profile} />
      ) : (
        <ErrorState
          title="Persona non leggibile"
          description="La riga profilo non è disponibile sotto RLS. Riprova dopo l'onboarding."
          actionHref="/app/onboarding"
          actionLabel="Onboarding"
        />
      )}
    </div>
  );
}
