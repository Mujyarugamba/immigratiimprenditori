import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { listContributorAccountsAdmin } from "@/lib/data/editorial/contributors-admin";
import { getApplicationSession } from "@/lib/session/get-application-session";
import {
  inviteOrEnableContributorAction,
  revokeContributorAction,
} from "./actions";

export const metadata: Metadata = { title: "Contributori · Redazione" };

type PageProps = {
  searchParams: Promise<{ status?: string; error?: string }>;
};

const statusMessages: Record<string, string> = {
  invited: "Invito inviato e ruolo contributore predisposto.",
  enabled: "Account esistente abilitato come contributore.",
  revoked: "Ruolo contributore revocato.",
};

const errorMessages: Record<string, string> = {
  email: "Inserisci un indirizzo email valido.",
  invite: "Non è stato possibile inviare l’invito.",
  provision: "L’utente esiste, ma l’abilitazione non è stata completata. Puoi riprovare.",
  account: "Identificativo account non valido.",
  revoke: "Non è stato possibile revocare il ruolo contributore.",
};

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("it-IT", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export default async function ContributoriPage({ searchParams }: PageProps) {
  const session = await getApplicationSession();
  if (!session?.isActiveAccount || !session.isApplicationAdmin) {
    redirect("/app/forbidden");
  }

  const params = await searchParams;
  const rows = await listContributorAccountsAdmin().catch(() => []);
  const statusMessage = params.status ? statusMessages[params.status] : null;
  const errorMessage = params.error ? errorMessages[params.error] : null;

  return (
    <div>
      <p className="text-ink-muted text-xs font-semibold uppercase tracking-[0.14em]">
        Amministrazione editoriale
      </p>
      <h1 className="text-ink mt-2 text-2xl font-semibold tracking-tight">
        Contributori abituali
      </h1>
      <p className="text-ink-muted mt-2 max-w-2xl text-sm leading-6">
        Invita e abilita soltanto collaboratori abituali. Il ruolo contributore non dà accesso alla redazione e consente di seguire esclusivamente le proprie proposte.
      </p>

      {statusMessage ? (
        <p className="mt-5 border border-neutral-300 px-4 py-3 text-sm" role="status">
          {statusMessage}
        </p>
      ) : null}
      {errorMessage ? (
        <p className="mt-5 border border-black px-4 py-3 text-sm" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <section className="mt-8 border-y border-black py-6" aria-labelledby="invita-contributore">
        <h2 id="invita-contributore" className="text-lg font-semibold text-black">
          Invita o abilita
        </h2>
        <form action={inviteOrEnableContributorAction} className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-black">Nome</label>
            <input id="full_name" name="full_name" type="text" autoComplete="name" className="mt-1 w-full border border-neutral-400 px-3 py-2 text-sm" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-black">Email</label>
            <input id="email" name="email" type="email" autoComplete="email" required className="mt-1 w-full border border-neutral-400 px-3 py-2 text-sm" />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className="border border-black bg-black px-4 py-2.5 text-sm font-semibold text-white">
              Invita / abilita contributore
            </button>
          </div>
        </form>
      </section>

      <section className="mt-8" aria-labelledby="elenco-contributori">
        <div className="flex items-baseline justify-between gap-4 border-b border-black pb-3">
          <h2 id="elenco-contributori" className="text-lg font-semibold text-black">Account contributori</h2>
          <span className="text-xs text-neutral-500">{rows.length} assegnazioni</span>
        </div>
        {rows.length === 0 ? (
          <p className="py-6 text-sm text-neutral-600">Nessun contributore abilitato o revocato.</p>
        ) : (
          <div className="divide-y divide-neutral-300">
            {rows.map((row) => (
              <article key={row.assignmentId} className="grid gap-3 py-5 md:grid-cols-[1fr_auto]">
                <div>
                  <h3 className="font-semibold text-black">{row.displayName || row.email || "Contributore"}</h3>
                  {row.email ? <p className="mt-1 text-sm text-neutral-700">{row.email}</p> : null}
                  <p className="mt-2 text-xs text-neutral-500">
                    Ruolo: {row.assignmentStatus} · Account: {row.accountStatus} · Assegnato: {formatDate(row.assignedAt)}
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">
                    Email: {row.emailConfirmedAt ? `confermata ${formatDate(row.emailConfirmedAt)}` : row.invitedAt ? `invito inviato ${formatDate(row.invitedAt)}` : "non confermata"}
                  </p>
                </div>
                {row.assignmentStatus === "active" ? (
                  <form action={revokeContributorAction} className="self-start">
                    <input type="hidden" name="account_id" value={row.accountId} />
                    <button type="submit" className="border border-black px-3 py-2 text-xs font-semibold text-black">
                      Revoca ruolo
                    </button>
                  </form>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
