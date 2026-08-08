import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AssignRoleForm } from "@/components/app/admin/AssignRoleForm";
import { CloseAccountForm } from "@/components/app/admin/CloseAccountForm";
import { LinkPersonForm } from "@/components/app/admin/LinkPersonForm";
import { RevokeRoleButton } from "@/components/app/admin/RevokeRoleButton";
import {
  ACCOUNT_STATUS_LABELS,
  APPLICATION_ROLE_LABELS,
  ASSIGNMENT_STATUS_LABELS,
  PERSON_ASSOCIATION_LABELS,
} from "@/lib/admin/labels";
import { getAccountById } from "@/lib/data/admin/accounts";
import { listRoleAssignments } from "@/lib/data/admin/roles";
import { formatItalianDateTime } from "@/lib/public/labels";
import { getApplicationSession } from "@/lib/session/get-application-session";

export const metadata: Metadata = {
  title: "Dettaglio Account — Amministrazione",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-ink-subtle text-xs font-medium uppercase tracking-wide">
        {label}
      </dt>
      <dd className="text-ink mt-1 text-sm">{children}</dd>
    </div>
  );
}

export default async function AdminAccountDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [account, assignments, session] = await Promise.all([
    getAccountById(id),
    listRoleAssignments({ accountId: id }),
    getApplicationSession(),
  ]);

  if (!account) {
    notFound();
  }

  const isSelf = session?.accountId === account.id;
  const isClosed = account.account_status === "closed";
  const canLinkPerson = !isClosed && !account.person_id;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-ink-muted text-sm">
            <Link href="/app/amministrazione/account" className="text-brand hover:underline">
              ← Account
            </Link>
          </p>
          <h1 className="text-ink mt-2 text-2xl font-semibold tracking-tight">
            Dettaglio Account
          </h1>
          <p className="text-ink-subtle mt-1 font-mono text-xs">{account.id}</p>
        </div>
      </div>

      <dl className="border-line bg-surface-elevated mt-6 grid gap-4 rounded-md border p-5 shadow-soft sm:grid-cols-2">
        <Field label="Stato">
          {ACCOUNT_STATUS_LABELS[account.account_status]}
        </Field>
        <Field label="Auth user id">
          <span className="font-mono text-xs">{account.auth_user_id}</span>
        </Field>
        <Field label="Persona">
          {account.person?.display_name ? (
            <>
              {account.person.display_name}
              {account.person.slug ? (
                <span className="text-ink-subtle block text-xs">
                  @{account.person.slug}
                </span>
              ) : null}
            </>
          ) : account.person_id ? (
            <span className="font-mono text-xs">{account.person_id}</span>
          ) : (
            "Non associata"
          )}
        </Field>
        <Field label="Associazione Persona">
          {account.person_association_status
            ? PERSON_ASSOCIATION_LABELS[account.person_association_status] ??
              account.person_association_status
            : "—"}
        </Field>
        <Field label="Persona collegata il">
          {account.person_linked_at
            ? formatItalianDateTime(account.person_linked_at)
            : "—"}
        </Field>
        <Field label="Attivato il">
          {account.activated_at
            ? formatItalianDateTime(account.activated_at)
            : "—"}
        </Field>
        <Field label="Sospeso il">
          {account.suspended_at
            ? formatItalianDateTime(account.suspended_at)
            : "—"}
        </Field>
        <Field label="Disabilitato il">
          {account.disabled_at
            ? formatItalianDateTime(account.disabled_at)
            : "—"}
        </Field>
        <Field label="Chiuso il">
          {account.closed_at
            ? formatItalianDateTime(account.closed_at)
            : "—"}
        </Field>
        <Field label="Motivo stato">
          {account.status_reason ?? "—"}
        </Field>
        <Field label="Creato">
          {formatItalianDateTime(account.created_at)}
        </Field>
        <Field label="Aggiornato">
          {formatItalianDateTime(account.updated_at)}
        </Field>
      </dl>

      <section className="border-line bg-surface-elevated mt-8 rounded-md border p-5 shadow-soft">
        <h2 className="text-ink text-base font-semibold">Ruoli elevati</h2>
        <p className="text-ink-muted mt-1 text-sm">
          Assegnazione solo via RPC. Auto-promozione bloccata.
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="border-line w-full min-w-[480px] border text-left text-sm">
            <thead className="bg-surface-muted text-ink">
              <tr>
                <th className="border-line border px-3 py-2 font-medium">Ruolo</th>
                <th className="border-line border px-3 py-2 font-medium">Stato</th>
                <th className="border-line border px-3 py-2 font-medium">Assegnato</th>
                <th className="border-line border px-3 py-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {assignments.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="text-ink-muted border-line border px-3 py-4 text-center"
                  >
                    Nessuna assegnazione.
                  </td>
                </tr>
              ) : (
                assignments.map((a) => (
                  <tr key={a.id}>
                    <td className="border-line border px-3 py-2">
                      {APPLICATION_ROLE_LABELS[a.role_code] ?? a.role_code}
                    </td>
                    <td className="border-line border px-3 py-2">
                      {ASSIGNMENT_STATUS_LABELS[a.assignment_status]}
                    </td>
                    <td className="border-line border px-3 py-2">
                      {formatItalianDateTime(a.assigned_at)}
                    </td>
                    <td className="border-line border px-3 py-2">
                      {a.assignment_status === "active" ? (
                        <RevokeRoleButton
                          assignmentId={a.id}
                          accountId={account.id}
                          roleLabel={APPLICATION_ROLE_LABELS[a.role_code]}
                        />
                      ) : (
                        <span className="text-ink-muted text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="border-line mt-6 border-t pt-6">
          <h3 className="text-ink text-sm font-semibold">Assegna ruolo</h3>
          <div className="mt-3 max-w-md">
            <AssignRoleForm
              defaultAccountId={account.id}
              allowAssign={!isSelf && !isClosed}
            />
          </div>
        </div>
      </section>

      {canLinkPerson ? (
        <section className="border-line bg-surface-elevated mt-8 rounded-md border p-5 shadow-soft">
          <h2 className="text-ink text-base font-semibold">
            Collega Persona (Adm)
          </h2>
          <div className="mt-3 max-w-md">
            <LinkPersonForm accountId={account.id} />
          </div>
        </section>
      ) : null}

      <section className="border-line bg-surface-elevated mt-8 rounded-md border p-5 shadow-soft">
        <h2 className="text-ink text-base font-semibold">Chiudi Account</h2>
        <div className="mt-3 max-w-lg">
          <CloseAccountForm accountId={account.id} disabled={isClosed} />
        </div>
      </section>
    </div>
  );
}
