import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getApplicationSession } from "@/lib/session/get-application-session";
import { createClient } from "@/lib/supabase/server";
import { deleteOwnAccountAction } from "./actions";

export const metadata: Metadata = {
  title: "Gestisci account",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<{ error?: string }>;
};

type DeletePreflight = {
  can_proceed?: boolean;
  blockers?: string[];
};

export default async function AccountPage({ searchParams }: PageProps) {
  const session = await getApplicationSession();
  if (!session) redirect("/accedi?next=/app/account");

  const query = await searchParams;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("access_self_delete_preflight");
  const preflight = data as DeletePreflight | null;
  const blockers = preflight?.blockers ?? [];
  const isLastAdmin = blockers.includes("last_application_admin");
  const canDelete = !error && Boolean(preflight?.can_proceed);

  const errorMessage =
    query.error === "confirmation"
      ? "Per confermare devi scrivere esattamente ELIMINA."
      : query.error === "blocked"
        ? "L'eliminazione non può essere completata in questo momento. Controlla il blocco indicato oppure contatta AIPEL."
        : null;

  return (
    <main id="contenuto" className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
      <header className="border-b border-black pb-7">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">Area riservata</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-black sm:text-4xl">Gestisci account</h1>
        <p className="mt-4 text-sm leading-6 text-neutral-700">
          Account collegato a <strong className="text-black">{session.email ?? "utente autenticato"}</strong>.
        </p>
      </header>

      {errorMessage ? <p className="mt-6 border border-black px-4 py-3 text-sm" role="alert">{errorMessage}</p> : null}

      <section className="py-8">
        <h2 className="text-xl font-semibold text-black">Che cosa elimina questa operazione</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-neutral-700">
          <li>l&apos;accesso a Immigrati Imprenditori tramite questo utente;</li>
          <li>l&apos;account applicativo e i relativi ruoli e permessi;</li>
          <li>l&apos;utente di autenticazione Supabase associato all&apos;account.</li>
        </ul>

        <h2 className="mt-8 text-xl font-semibold text-black">Che cosa non viene cancellato automaticamente</h2>
        <p className="mt-4 text-sm leading-7 text-neutral-700">
          L&apos;eliminazione dell&apos;account non cancella automaticamente eventuali profili personali, articoli,
          interviste, eventi, attribuzioni o altri materiali editoriali già conservati o pubblicati. Questi dati
          possono avere finalità e tempi di conservazione diversi e vengono valutati separatamente nell&apos;ambito dei diritti privacy.
        </p>
        <p className="mt-3 text-sm leading-7 text-neutral-700">
          Per richieste relative ai dati editoriali scrivi a{" "}
          <a href="mailto:info@immigratiimprenditori.it" className="font-semibold text-black underline underline-offset-4">info@immigratiimprenditori.it</a>{" "}
          oppure consulta l&apos; <Link href="/privacy" className="font-semibold text-black underline underline-offset-4">informativa privacy</Link>.
        </p>
      </section>

      <section className="border-t border-black pt-8">
        <h2 className="text-xl font-semibold text-black">Elimina account</h2>

        {isLastAdmin ? (
          <div className="mt-5 border border-black p-5">
            <p className="font-semibold text-black">Eliminazione bloccata</p>
            <p className="mt-2 text-sm leading-6 text-neutral-700">
              Questo è l&apos;unico amministratore applicativo attivo. Per evitare di lasciare il progetto senza gestione,
              abilita prima un altro amministratore; solo dopo questo account potrà essere eliminato.
            </p>
          </div>
        ) : error ? (
          <p className="mt-5 border border-black p-4 text-sm" role="alert">
            Non è stato possibile verificare in sicurezza lo stato dell&apos;account. Nessuna eliminazione è disponibile.
          </p>
        ) : canDelete ? (
          <form action={deleteOwnAccountAction} className="mt-5 space-y-4 border border-black p-5">
            <p className="text-sm leading-6 text-neutral-700">
              L&apos;operazione è irreversibile per l&apos;accesso. Per confermare scrivi <strong className="text-black">ELIMINA</strong> nel campo sottostante.
            </p>
            <label htmlFor="confirmation" className="block text-sm font-semibold text-black">Conferma</label>
            <input id="confirmation" name="confirmation" autoComplete="off" required className="w-full border border-neutral-400 px-3 py-2.5 text-sm" aria-describedby="delete-help" />
            <p id="delete-help" className="text-xs leading-5 text-neutral-500">
              Non usare questo comando per chiedere soltanto la rimozione di un articolo o di un dato editoriale.
            </p>
            <button type="submit" className="border border-black bg-black px-5 py-2.5 text-sm font-semibold text-white">
              Elimina definitivamente il mio account
            </button>
          </form>
        ) : (
          <p className="mt-5 text-sm leading-6 text-neutral-700">L&apos;account non risulta eliminabile in questo stato. Contatta AIPEL per la verifica.</p>
        )}
      </section>
    </main>
  );
}
