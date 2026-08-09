import type { Metadata } from "next";
import Link from "next/link";
import {
  ACCOUNT_STATUS_LABELS,
  APPLICATION_ROLE_LABELS,
} from "@/lib/admin/labels";
import { countAccountsByStatus } from "@/lib/data/admin/accounts";
import { countActiveRolesByCode } from "@/lib/data/admin/roles";
import { getApplicationSession } from "@/lib/session/get-application-session";
import { ACCOUNT_STATUSES } from "@/types/access";

export const metadata: Metadata = {
  title: "Amministrazione",
};

const sections = [
  {
    href: "/app/amministrazione/account",
    title: "Account",
    description:
      "Elenco account applicativi, stato e collegamento del profilo.",
  },
  {
    href: "/app/amministrazione/ruoli",
    title: "Ruoli",
    description: "Assegnazioni redattore e amministratore applicativo.",
  },
  {
    href: "/app/amministrazione/imprese",
    title: "Autorizzazioni imprese",
    description: "Prima abilitazione dei permessi di gestione su un’impresa.",
  },
] as const;

export default async function AmministrazioneDashboardPage() {
  const session = await getApplicationSession();
  const [statusCounts, roleCounts] = await Promise.all([
    countAccountsByStatus(),
    countActiveRolesByCode(),
  ]);

  const totalAccounts = ACCOUNT_STATUSES.reduce(
    (sum, status) => sum + statusCounts[status],
    0,
  );

  return (
    <div>
      <h1 className="text-ink text-2xl font-semibold tracking-tight">
        Dashboard Amministrazione
      </h1>
      <p className="text-ink-muted mt-2 text-sm">
        Area riservata agli amministratori applicativi. Gestisci account utenti,
        ruoli elevati e la prima abilitazione dei permessi di gestione sulle
        imprese.
        {session?.isEditor
          ? " Il tuo account ha anche accesso alla redazione: le due aree restano separate."
          : " Non risulti redattore."}
      </p>

      <p className="border-line bg-surface-elevated text-ink mt-4 rounded-md border p-4 text-sm shadow-soft">
        <strong>Amministrazione ≠ Redazione:</strong> questa area non espone
        strumenti editoriali. I ruoli di redattore e amministratore applicativo
        sono distinti e si assegnano solo da qui.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <section className="border-line bg-surface-elevated rounded-md border p-5 shadow-soft">
          <h2 className="text-ink text-base font-semibold">Account per stato</h2>
          <p className="text-ink-muted mt-1 text-xs">Totale: {totalAccounts}</p>
          <ul className="mt-3 space-y-1 text-sm">
            {ACCOUNT_STATUSES.map((status) => (
              <li key={status} className="flex justify-between gap-2">
                <span>{ACCOUNT_STATUS_LABELS[status]}</span>
                <span className="text-ink font-medium tabular-nums">
                  {statusCounts[status]}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="border-line bg-surface-elevated rounded-md border p-5 shadow-soft">
          <h2 className="text-ink text-base font-semibold">
            Ruoli attivi
          </h2>
          <ul className="mt-3 space-y-1 text-sm">
            {(
              Object.entries(roleCounts) as [
                keyof typeof roleCounts,
                number,
              ][]
            ).map(([role, count]) => (
              <li key={role} className="flex justify-between gap-2">
                <span>{APPLICATION_ROLE_LABELS[role]}</span>
                <span className="text-ink font-medium tabular-nums">{count}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="border-line bg-surface-elevated hover:border-line-strong block rounded-md border p-5 shadow-soft transition-colors"
          >
            <h2 className="text-ink text-base font-semibold">{s.title}</h2>
            <p className="text-ink-muted mt-2 text-sm">{s.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
