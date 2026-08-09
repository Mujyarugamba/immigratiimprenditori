import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ProfileEditForm } from "@/components/app/ProfileEditForm";
import {
  getPersonaById,
  isProfileIncomplete,
} from "@/lib/data/authenticated/persona";
import {
  labelAccountStatus,
  labelPersonAssociation,
} from "@/lib/app/user-labels";
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
        title="Profilo da verificare"
        description="Il collegamento del profilo richiede una verifica. Finché non è risolto non puoi modificare i dati né gestire le imprese."
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
        Gestisci i dati pubblici della tua persona nella rete.
      </p>

      <dl className="border-line bg-surface-elevated mt-6 grid gap-3 rounded-md border p-5 text-sm shadow-soft sm:grid-cols-2">
        <div>
          <dt className="text-ink-subtle">Stato account</dt>
          <dd className="text-ink mt-1 font-medium">
            {labelAccountStatus(session.accountStatus)}
          </dd>
        </div>
        <div>
          <dt className="text-ink-subtle">Collegamento profilo</dt>
          <dd className="text-ink mt-1 font-medium">
            {labelPersonAssociation(
              session.personAssociationStatus,
              Boolean(session.personId),
            )}
          </dd>
        </div>
      </dl>

      {incomplete ? (
        <p className="border-accent/30 bg-accent-soft text-ink mt-4 rounded-md border p-3 text-sm">
          Completa almeno il nome pubblico e lo slug del profilo.
        </p>
      ) : null}

      {!session.isActiveAccount ? (
        <p className="text-ink-muted mt-4 text-sm">
          Per modificare il profilo completa prima il percorso iniziale.{" "}
          <Link href="/app/onboarding" className="text-brand underline">
            Completa il profilo
          </Link>
        </p>
      ) : profile ? (
        <ProfileEditForm profile={profile} />
      ) : (
        <ErrorState
          title="Profilo non disponibile"
          description="Non è stato possibile caricare i dati del profilo. Completa il percorso iniziale e riprova."
          actionHref="/app/onboarding"
          actionLabel="Completa il profilo"
        />
      )}
    </div>
  );
}
