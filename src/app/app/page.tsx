import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { listMyBusinesses } from "@/lib/data/authenticated/businesses";
import {
  getSelectedBusinessId,
  resolveSelectedBusinessId,
} from "@/lib/business/selected-business";
import {
  labelAccountStatus,
  labelPersonAssociation,
  labelProfileReady,
} from "@/lib/app/user-labels";
import { getApplicationSession } from "@/lib/session/get-application-session";
import {
  destinationForAccountState,
  needsInitialOnboarding,
} from "@/lib/session/guards";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function AppDashboardPage() {
  const session = await getApplicationSession();
  if (!session) {
    redirect("/accedi?next=/app");
  }

  if (
    session.accountStatus === "suspended" ||
    session.accountStatus === "disabled" ||
    session.accountStatus === "closed"
  ) {
    redirect(destinationForAccountState(session));
  }

  const needsOnboarding = needsInitialOnboarding(session);

  const businesses = session.personId
    ? await listMyBusinesses(session.personId)
    : [];
  const linkedCount = businesses.filter((b) => b.isMember).length;
  const manageableCount = businesses.filter((b) => b.canManage).length;
  const preferred = await getSelectedBusinessId();
  const selectedId = resolveSelectedBusinessId(
    preferred,
    businesses.filter((b) => b.isMember).map((b) => b.business.id),
  );
  const selected = businesses.find((b) => b.business.id === selectedId);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-ink text-2xl font-semibold tracking-tight">
        Dashboard
      </h1>
      <p className="text-ink-muted mt-2 text-sm">
        Panoramica del tuo spazio personale.
      </p>

      <dl className="border-line bg-surface-elevated mt-8 grid gap-4 rounded-md border p-5 text-sm shadow-soft sm:grid-cols-2">
        <div>
          <dt className="text-ink-subtle">Stato account</dt>
          <dd className="text-ink mt-1 font-medium">
            {labelAccountStatus(session.accountStatus)}
          </dd>
        </div>
        <div>
          <dt className="text-ink-subtle">Profilo</dt>
          <dd className="text-ink mt-1 font-medium">
            {labelProfileReady(session.isActiveAccount)}
            {session.personAssociationStatus === "contested"
              ? " · da verificare"
              : ""}
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
        <div>
          <dt className="text-ink-subtle">Imprese collegate</dt>
          <dd className="text-ink mt-1 font-medium">{linkedCount}</dd>
        </div>
        <div>
          <dt className="text-ink-subtle">Imprese che puoi gestire</dt>
          <dd className="text-ink mt-1 font-medium">{manageableCount}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-ink-subtle">Impresa selezionata</dt>
          <dd className="text-ink mt-1 font-medium">
            {selected ? selected.business.public_name : "Nessuna"}
          </dd>
        </div>
        {session.isEditor || session.isApplicationAdmin ? (
          <div className="sm:col-span-2">
            <dt className="text-ink-subtle">Ruoli aggiuntivi</dt>
            <dd className="text-ink mt-1 font-medium">
              {[
                session.isEditor ? "Redazione" : null,
                session.isApplicationAdmin ? "Amministrazione" : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </dd>
          </div>
        ) : null}
      </dl>

      {needsOnboarding ? (
        <div className="border-accent/30 bg-accent-soft mt-6 rounded-md border p-4 text-sm">
          <p className="text-ink font-medium">Completa il profilo</p>
          <p className="text-ink-muted mt-1">
            Collega i tuoi dati personali per usare pienamente l&apos;area
            riservata.
          </p>
          <Link
            href="/app/onboarding"
            className="text-brand mt-3 inline-block font-medium hover:underline"
          >
            Continua
          </Link>
        </div>
      ) : (
        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <Link
            href="/app/profilo"
            className="text-brand font-medium hover:underline"
          >
            Vai al profilo
          </Link>
          <Link
            href="/app/imprese"
            className="text-brand font-medium hover:underline"
          >
            Le mie imprese
          </Link>
          {selectedId ? (
            <Link
              href={`/app/imprese/${selectedId}`}
              className="text-brand font-medium hover:underline"
            >
              Apri impresa selezionata
            </Link>
          ) : null}
        </div>
      )}
    </div>
  );
}
