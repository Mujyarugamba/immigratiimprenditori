import type { Metadata } from "next";
import Link from "next/link";
import { ACCOUNT_STATUS_LABELS } from "@/lib/admin/labels";
import { listAccounts } from "@/lib/data/admin/accounts";
import { buildQueryString, param } from "@/lib/data/public/paging";
import { formatItalianDateTime } from "@/lib/public/labels";
import { isAccountStatus } from "@/types/access";

export const metadata: Metadata = {
  title: "Account — Amministrazione",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminAccountsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const statusRaw = param(sp, "status");
  const status = isAccountStatus(statusRaw) ? statusRaw : "";
  const q = param(sp, "q");
  const page = Math.max(1, Number.parseInt(param(sp, "page") || "1", 10) || 1);

  const result = await listAccounts({ status, q, page });
  const baseQuery = { status: status || undefined, q: q || undefined };

  return (
    <div>
      <div>
        <h1 className="text-ink text-2xl font-semibold tracking-tight">
          Account
        </h1>
        <p className="text-ink-muted mt-1 text-sm">
          Elenco account applicativi. Nessuna password o token esposti.
        </p>
      </div>

      <form
        method="get"
        className="border-line bg-surface-elevated mt-6 flex flex-wrap items-end gap-3 rounded-md border p-4 shadow-soft"
      >
        <div className="flex min-w-[200px] flex-1 flex-col gap-1.5">
          <label htmlFor="q" className="text-ink text-sm font-medium">
            Cerca (id parziale)
          </label>
          <input
            id="q"
            name="q"
            defaultValue={q}
            placeholder="Cerca per identificativo…"
            className="border-line bg-surface text-ink focus:border-brand focus:ring-brand/30 rounded-md border px-3 py-2 text-sm outline-none focus:ring-2"
          />
        </div>
        <div className="flex min-w-[160px] flex-col gap-1.5">
          <label htmlFor="status" className="text-ink text-sm font-medium">
            Stato
          </label>
          <select
            id="status"
            name="status"
            defaultValue={status}
            className="border-line bg-surface text-ink focus:border-brand focus:ring-brand/30 rounded-md border px-3 py-2 text-sm outline-none focus:ring-2"
          >
            <option value="">Tutti</option>
            {Object.entries(ACCOUNT_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
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
        <table className="border-line w-full min-w-[720px] border text-left text-sm">
          <thead className="bg-surface-muted text-ink">
            <tr>
              <th className="border-line border px-3 py-2 font-medium">Account</th>
              <th className="border-line border px-3 py-2 font-medium">Stato</th>
              <th className="border-line border px-3 py-2 font-medium">Persona</th>
              <th className="border-line border px-3 py-2 font-medium">Creato</th>
              <th className="border-line border px-3 py-2 font-medium" />
            </tr>
          </thead>
          <tbody>
            {result.items.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-ink-muted border-line border px-3 py-6 text-center"
                >
                  Nessun Account trovato.
                </td>
              </tr>
            ) : (
              result.items.map((account) => (
                <tr key={account.id}>
                  <td className="border-line border px-3 py-2">
                    <span className="font-mono text-xs">{account.id}</span>
                  </td>
                  <td className="border-line border px-3 py-2">
                    {ACCOUNT_STATUS_LABELS[account.account_status]}
                  </td>
                  <td className="border-line border px-3 py-2">
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
                      <span className="text-ink-muted">—</span>
                    )}
                  </td>
                  <td className="border-line border px-3 py-2">
                    {formatItalianDateTime(account.created_at)}
                  </td>
                  <td className="border-line border px-3 py-2">
                    <Link
                      href={`/app/amministrazione/account/${account.id}`}
                      className="text-brand hover:underline"
                    >
                      Dettaglio
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {result.pageCount > 1 ? (
        <nav
          className="text-ink-muted mt-4 flex flex-wrap items-center gap-3 text-sm"
          aria-label="Paginazione"
        >
          {page > 1 ? (
            <Link
              href={`/app/amministrazione/account${buildQueryString(baseQuery, {
                page: String(page - 1),
              })}`}
              className="text-brand hover:underline"
            >
              ← Precedente
            </Link>
          ) : null}
          <span>
            Pagina {result.page} di {result.pageCount}
          </span>
          {page < result.pageCount ? (
            <Link
              href={`/app/amministrazione/account${buildQueryString(baseQuery, {
                page: String(page + 1),
              })}`}
              className="text-brand hover:underline"
            >
              Successiva →
            </Link>
          ) : null}
        </nav>
      ) : null}
    </div>
  );
}
