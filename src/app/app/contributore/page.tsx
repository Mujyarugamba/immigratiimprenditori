import type { Metadata } from "next";
import Link from "next/link";
import { listContributorProposals } from "@/lib/data/contributor/proposals";

export const metadata: Metadata = {
  title: "Le mie proposte",
  robots: { index: false, follow: false },
};

const STATUS_LABELS: Record<string, string> = {
  new: "Ricevuta",
  to_review: "In valutazione",
  needs_research: "Da approfondire",
  assigned: "Presa in carico",
  draft_created: "Bozza redazionale creata",
  published: "Pubblicata",
  rejected: "Non selezionata",
  archived: "Archiviata",
};

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("it-IT", { dateStyle: "medium" }).format(date);
}

export default async function ContributorePage() {
  const proposals = await listContributorProposals();

  return (
    <main id="contenuto">
      <header className="max-w-3xl border-b border-black pb-7">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">Immigrati Imprenditori · Contributore</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-black sm:text-4xl">Le mie proposte</h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-neutral-700">
          Qui trovi soltanto i materiali inviati mentre eri collegato con il tuo account contributore. La redazione resta responsabile di verifica, selezione e pubblicazione.
        </p>
        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold">
          <Link href="/contribuisci" className="text-black underline underline-offset-4">Invia una nuova proposta</Link>
          <Link href="/app/account" className="text-black underline underline-offset-4">Gestisci account</Link>
        </div>
      </header>

      {proposals.length === 0 ? (
        <section className="mt-8 border border-neutral-300 p-5">
          <h2 className="text-base font-semibold text-black">Nessuna proposta collegata</h2>
          <p className="mt-2 text-sm leading-6 text-neutral-600">
            Le proposte inviate senza account restano nella Inbox redazionale, ma non vengono associate retroattivamente al profilo per evitare attribuzioni automatiche non verificate.
          </p>
        </section>
      ) : (
        <section className="mt-8" aria-labelledby="elenco-proposte">
          <h2 id="elenco-proposte" className="sr-only">Elenco delle mie proposte</h2>
          <div className="border-t border-black">
            {proposals.map((proposal) => {
              const route = [proposal.origin_country_label, proposal.destination_country_label].filter(Boolean).join(" → ");
              return (
                <article key={proposal.id} className="border-b border-neutral-300 py-5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="text-base font-semibold text-black">{proposal.title}</h3>
                    <span className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-600">{STATUS_LABELS[proposal.status] ?? proposal.status}</span>
                  </div>
                  <p className="mt-2 text-xs text-neutral-500">Inviata il {formatDate(proposal.received_at)}{route ? ` · ${route}` : ""}</p>
                  {proposal.linked_content_id || proposal.linked_event_id ? (
                    <p className="mt-3 text-sm leading-6 text-neutral-700">La redazione ha collegato questa proposta a un contenuto in lavorazione o pubblicazione.</p>
                  ) : null}
                </article>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}
