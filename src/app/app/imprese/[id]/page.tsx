import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { BusinessEditForm } from "@/components/app/BusinessEditForm";
import { MembershipGrantsPanel } from "@/components/app/MembershipGrantsPanel";
import {
  getBusinessById,
  getBusinessCapabilitiesFromDb,
} from "@/lib/data/authenticated/businesses";
import {
  getOwnMembershipForBusiness,
  listMembershipsForBusiness,
} from "@/lib/data/authenticated/memberships";
import { getApplicationSession } from "@/lib/session/get-application-session";
import { requireOperationalAccount } from "@/lib/session/guards";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const business = await getBusinessById(id);
  return { title: business?.public_name ?? "Impresa" };
}

export default async function ImpresaDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await getApplicationSession();
  const guard = requireOperationalAccount(session, `/app/imprese/${id}`);
  if (!guard.ok) {
    redirect(guard.redirectTo);
  }
  if (!session?.personId) {
    redirect("/app/onboarding");
  }

  const business = await getBusinessById(id);
  if (!business) {
    notFound();
  }

  const caps = await getBusinessCapabilitiesFromDb(id);
  if (!caps.isMember && !caps.canManage) {
    // RLS may still expose public businesses; reserved workspace requires CTX.
    redirect("/app/imprese");
  }

  const [memberships, own] = await Promise.all([
    listMembershipsForBusiness(id, session.personId),
    getOwnMembershipForBusiness(id, session.personId),
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-ink-subtle text-xs">
        <Link href="/app/imprese" className="hover:underline">
          ← Le mie imprese
        </Link>
      </p>
      <h1 className="text-ink mt-2 text-2xl font-semibold tracking-tight">
        {business.public_name}
      </h1>
      <p className="text-ink-muted mt-1 text-sm">{business.legal_name}</p>

      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <span className="bg-brand-soft text-brand rounded-sm px-2 py-0.5 font-medium">
          {caps.isMember ? "Collegata" : "Non collegata"}
        </span>
        <span
          className={
            caps.canManage
              ? "bg-accent-soft text-accent-dark rounded-sm px-2 py-0.5 font-medium"
              : "bg-surface-muted text-ink-muted rounded-sm px-2 py-0.5"
          }
        >
          {caps.canManage ? "Puoi gestire" : "Sola lettura"}
        </span>
        {own ? (
          <span className="text-ink-subtle px-2 py-0.5">
            Tuo ruolo: {own.role_id}
          </span>
        ) : null}
      </div>

      <dl className="border-line bg-surface-elevated mt-6 grid gap-3 rounded-md border p-5 text-sm shadow-soft sm:grid-cols-2">
        <div>
          <dt className="text-ink-subtle">Pubblicazione</dt>
          <dd className="text-ink mt-1">{business.publication_status}</dd>
        </div>
        <div>
          <dt className="text-ink-subtle">Editoriale</dt>
          <dd className="text-ink mt-1">{business.editorial_status}</dd>
        </div>
        <div>
          <dt className="text-ink-subtle">Sostanziale</dt>
          <dd className="text-ink mt-1">{business.substantial_status}</dd>
        </div>
        <div>
          <dt className="text-ink-subtle">Anno</dt>
          <dd className="text-ink mt-1">{business.founding_year ?? "—"}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-ink-subtle">Sommario</dt>
          <dd className="text-ink mt-1">{business.summary ?? "—"}</dd>
        </div>
      </dl>

      <section className="mt-10">
        <h2 className="text-ink text-lg font-semibold">Modifica scheda</h2>
        {caps.canManage ? (
          <BusinessEditForm business={business} />
        ) : (
          <p className="text-ink-muted mt-2 text-sm">
            Sei collegato all&apos;impresa ma non hai i permessi di gestione: la
            scheda è in sola lettura.
          </p>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-ink text-lg font-semibold">Appartenenze</h2>
        <p className="text-ink-muted mt-1 text-sm">
          Chi ha i permessi di gestione può assegnarli o revocarli ad altri
          membri. Non puoi assegnarli a te stesso.
        </p>
        <div className="mt-4">
          <MembershipGrantsPanel
            businessId={id}
            memberships={memberships}
            canManage={caps.canManage}
          />
        </div>
      </section>
    </div>
  );
}
