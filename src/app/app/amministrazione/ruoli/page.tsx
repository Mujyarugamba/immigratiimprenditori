import type { Metadata } from "next";
import Link from "next/link";
import { AssignRoleForm } from "@/components/app/admin/AssignRoleForm";
import { RevokeRoleButton } from "@/components/app/admin/RevokeRoleButton";
import {
  APPLICATION_ROLE_LABELS,
  ASSIGNMENT_STATUS_LABELS,
  WHITELISTED_APPLICATION_ROLES,
} from "@/lib/admin/labels";
import { listRoleAssignments } from "@/lib/data/admin/roles";
import { param } from "@/lib/data/public/paging";
import { formatItalianDateTime } from "@/lib/public/labels";

export const metadata: Metadata = {
  title: "Ruoli — Amministrazione",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminRuoliPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const roleRaw = param(sp, "role");
  const statusRaw = param(sp, "status");
  const role = (WHITELISTED_APPLICATION_ROLES as readonly string[]).includes(
    roleRaw,
  )
    ? (roleRaw as (typeof WHITELISTED_APPLICATION_ROLES)[number])
    : "";
  const status =
    statusRaw === "active" || statusRaw === "revoked" ? statusRaw : "";

  const assignments = await listRoleAssignments({ role, status });

  return (
    <div>
      <div>
        <h1 className="text-ink text-2xl font-semibold tracking-tight">
          Ruoli applicativi
        </h1>
        <p className="text-ink-muted mt-1 text-sm">
          Solo <code>redattore</code> e{" "}
          <code>amministratore_applicativo</code>. Nessun DML diretto su{" "}
          <code>account_role_assignments</code>.
        </p>
      </div>

      <form
        method="get"
        className="border-line bg-surface-elevated mt-6 flex flex-wrap items-end gap-3 rounded-md border p-4 shadow-soft"
      >
        <div className="flex min-w-[180px] flex-col gap-1.5">
          <label htmlFor="role" className="text-ink text-sm font-medium">
            Ruolo
          </label>
          <select
            id="role"
            name="role"
            defaultValue={role}
            className="border-line bg-surface text-ink focus:border-brand focus:ring-brand/30 rounded-md border px-3 py-2 text-sm outline-none focus:ring-2"
          >
            <option value="">Tutti</option>
            {WHITELISTED_APPLICATION_ROLES.map((code) => (
              <option key={code} value={code}>
                {APPLICATION_ROLE_LABELS[code]}
              </option>
            ))}
          </select>
        </div>
        <div className="flex min-w-[160px] flex-col gap-1.5">
          <label htmlFor="status" className="text-ink text-sm font-medium">
            Stato assegnazione
          </label>
          <select
            id="status"
            name="status"
            defaultValue={status}
            className="border-line bg-surface text-ink focus:border-brand focus:ring-brand/30 rounded-md border px-3 py-2 text-sm outline-none focus:ring-2"
          >
            <option value="">Tutti</option>
            <option value="active">Attivo</option>
            <option value="revoked">Revocato</option>
          </select>
        </div>
        <button
          type="submit"
          className="bg-brand text-brand-contrast hover:bg-brand-dark rounded-md px-4 py-2 text-sm font-medium transition-colors"
        >
          Filtra
        </button>
      </form>

      <div className="mt-6 overflow-x-auto">
        <table className="border-line w-full min-w-[640px] border text-left text-sm">
          <thead className="bg-surface-muted text-ink">
            <tr>
              <th className="border-line border px-3 py-2 font-medium">Account</th>
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
                  colSpan={5}
                  className="text-ink-muted border-line border px-3 py-6 text-center"
                >
                  Nessuna assegnazione.
                </td>
              </tr>
            ) : (
              assignments.map((a) => (
                <tr key={a.id}>
                  <td className="border-line border px-3 py-2">
                    <Link
                      href={`/app/amministrazione/account/${a.account_id}`}
                      className="text-brand hover:underline font-mono text-xs"
                    >
                      {a.account_id}
                    </Link>
                  </td>
                  <td className="border-line border px-3 py-2">
                    {APPLICATION_ROLE_LABELS[a.role_code]}
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
                        accountId={a.account_id}
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

      <section className="border-line bg-surface-elevated mt-8 rounded-md border p-5 shadow-soft">
        <h2 className="text-ink text-base font-semibold">Assegna ruolo</h2>
        <p className="text-ink-muted mt-1 text-sm">
          Inserisci l&apos;Account target. Non puoi assegnare ruoli al tuo
          Account (auto-promozione bloccata anche lato RPC).
        </p>
        <div className="mt-4 max-w-md">
          <AssignRoleForm />
        </div>
      </section>
    </div>
  );
}
