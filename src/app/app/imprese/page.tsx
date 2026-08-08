import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CreateBusinessForm } from "@/components/app/CreateBusinessForm";
import { listMyBusinesses } from "@/lib/data/authenticated/businesses";
import {
  getSelectedBusinessId,
  resolveSelectedBusinessId,
} from "@/lib/business/selected-business";
import { getApplicationSession } from "@/lib/session/get-application-session";
import { requireOperationalAccount } from "@/lib/session/guards";
import { EmptyStatePanel } from "@/components/ui/states";

export const metadata: Metadata = {
  title: "Le mie imprese",
};

export default async function ImpresePage() {
  const session = await getApplicationSession();
  const guard = requireOperationalAccount(session, "/app/imprese");
  if (!guard.ok) {
    redirect(guard.redirectTo);
  }
  if (!session?.personId) {
    redirect("/app/onboarding");
  }

  const items = await listMyBusinesses(session.personId);
  const preferred = await getSelectedBusinessId();
  const selected = resolveSelectedBusinessId(
    preferred,
    items.filter((i) => i.isMember).map((i) => i.business.id),
  );
  const ctxCount = items.filter((i) => i.isMember).length;
  const actCount = items.filter((i) => i.canManage).length;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-ink text-2xl font-semibold tracking-tight">
        Le mie imprese
      </h1>
      <p className="text-ink-muted mt-2 text-sm">
        CTX = membership attiva · ACT = membership attiva + grant di gestione.
        Il ruolo membership è solo descrittivo.
      </p>
      <p className="text-ink-subtle mt-3 text-xs">
        Contesto: {ctxCount} · Gestibili: {actCount}
        {selected ? ` · Selezionata (UI): ${selected.slice(0, 8)}…` : ""}
      </p>

      {items.length === 0 ? (
        <div className="mt-8">
          <EmptyStatePanel
            title="Nessuna Impresa"
            description="Non hai membership attive. Puoi creare una scheda Impresa: otterrai CTX, non ACT. Il primo grant richiede un Amministratore applicativo."
          />
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {items.map((item) => (
            <li
              key={item.membershipId}
              className="border-line bg-surface-elevated rounded-md border p-4 shadow-soft"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Link
                    href={`/app/imprese/${item.business.id}`}
                    className="text-ink text-base font-semibold hover:underline"
                  >
                    {item.business.public_name}
                  </Link>
                  <p className="text-ink-muted mt-1 text-sm">
                    {item.business.legal_name}
                  </p>
                  <p className="text-ink-subtle mt-2 text-xs">
                    Ruolo: <code>{item.roleId}</code> · relazione:{" "}
                    {item.relationStatus}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 text-xs">
                  <span
                    className={
                      item.isMember
                        ? "bg-brand-soft text-brand rounded-sm px-2 py-0.5 font-medium"
                        : "bg-surface-muted text-ink-muted rounded-sm px-2 py-0.5"
                    }
                  >
                    {item.isMember ? "Membro (CTX)" : "Non attiva"}
                  </span>
                  <span
                    className={
                      item.canManage
                        ? "bg-accent-soft text-accent-dark rounded-sm px-2 py-0.5 font-medium"
                        : "text-ink-subtle px-2 py-0.5"
                    }
                  >
                    {item.canManage
                      ? "Gestibile (ACT)"
                      : item.grantStatus === "revoked"
                        ? "Grant revocato"
                        : "Solo contesto"}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {session.isActiveAccount ? (
        <section className="border-line mt-10 border-t pt-8">
          <h2 className="text-ink text-lg font-semibold">Nuova Impresa</h2>
          <p className="text-ink-muted mt-1 text-sm">
            INSERT scheda ≠ grant. Dopo la creazione resterai membro senza
            gestione finché Adm non esegue il bootstrap.
          </p>
          <div className="mt-4 max-w-lg">
            <CreateBusinessForm />
          </div>
        </section>
      ) : null}
    </div>
  );
}
