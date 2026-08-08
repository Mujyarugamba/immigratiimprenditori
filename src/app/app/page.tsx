import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { listMyBusinesses } from "@/lib/data/authenticated/businesses";
import {
  getSelectedBusinessId,
  resolveSelectedBusinessId,
} from "@/lib/business/selected-business";
import { getApplicationSession } from "@/lib/session/get-application-session";
import { destinationForAccountState } from "@/lib/session/guards";

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

  const needsOnboarding =
    session.personAssociationStatus !== "contested" &&
    (!session.accountId ||
      !session.personId ||
      session.accountStatus === "registered");

  const businesses = session.personId
    ? await listMyBusinesses(session.personId)
    : [];
  const ctxCount = businesses.filter((b) => b.isMember).length;
  const actCount = businesses.filter((b) => b.canManage).length;
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
        Panoramica Identity + Business workspace (P3).
      </p>

      <dl className="border-line bg-surface-elevated mt-8 grid gap-4 rounded-md border p-5 text-sm shadow-soft sm:grid-cols-2">
        <div>
          <dt className="text-ink-subtle">Account</dt>
          <dd className="text-ink mt-1 font-medium">
            {session.accountStatus ?? "assente"}
          </dd>
        </div>
        <div>
          <dt className="text-ink-subtle">Persona</dt>
          <dd className="text-ink mt-1 font-medium">
            {session.personAssociationStatus === "contested"
              ? "contestata"
              : session.personId
                ? "collegata"
                : "assente"}
          </dd>
        </div>
        <div>
          <dt className="text-ink-subtle">Imprese in contesto (CTX)</dt>
          <dd className="text-ink mt-1 font-medium">{ctxCount}</dd>
        </div>
        <div>
          <dt className="text-ink-subtle">Imprese gestibili (ACT)</dt>
          <dd className="text-ink mt-1 font-medium">{actCount}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-ink-subtle">Impresa selezionata (UI)</dt>
          <dd className="text-ink mt-1 font-medium">
            {selected ? selected.business.public_name : "nessuna"}
          </dd>
        </div>
        <div>
          <dt className="text-ink-subtle">Redattore</dt>
          <dd className="text-ink mt-1 font-medium">
            {session.isEditor ? "sì" : "no"}
          </dd>
        </div>
        <div>
          <dt className="text-ink-subtle">Amministratore</dt>
          <dd className="text-ink mt-1 font-medium">
            {session.isApplicationAdmin ? "sì" : "no"}
          </dd>
        </div>
      </dl>

      {needsOnboarding ? (
        <div className="border-accent/30 bg-accent-soft mt-6 rounded-md border p-4 text-sm">
          <p className="text-ink font-medium">Prossima azione</p>
          <p className="text-ink-muted mt-1">
            Completa l&apos;onboarding per collegare la Persona.
          </p>
          <Link
            href="/app/onboarding"
            className="text-brand mt-3 inline-block font-medium hover:underline"
          >
            Vai all&apos;onboarding
          </Link>
        </div>
      ) : (
        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <Link href="/app/profilo" className="text-brand font-medium hover:underline">
            Profilo
          </Link>
          <Link href="/app/imprese" className="text-brand font-medium hover:underline">
            Imprese
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
