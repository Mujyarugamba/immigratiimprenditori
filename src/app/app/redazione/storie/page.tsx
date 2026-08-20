import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { listEditorialStories } from "@/lib/data/editorial/stories";

export const metadata: Metadata = {
  title: "Storie e interviste — Redazione",
};

const TYPE_LABELS: Record<string, string> = {
  interview: "Intervista",
  business_story: "Storia d'impresa",
  personal_story: "Storia personale",
  testimony: "Testimonianza",
};

const PUBLICATION_LABELS: Record<string, string> = {
  unpublished: "Non pubblicato",
  published: "Pubblicato",
  withdrawn: "Ritirato",
};

const WORKFLOW_LABELS: Record<string, string> = {
  candidate: "Candidato",
  contacted: "Contattato",
  scheduled: "Programmato",
  interviewed: "Intervistato",
  fact_check: "Fact-check",
  approved: "Approvato",
  declined: "Declinato",
  closed: "Chiuso",
};

const CONSENT_LABELS: Record<string, string> = {
  pending: "Consenso da acquisire",
  granted: "Consenso pubblicazione ✓",
  declined: "Pubblicazione negata",
  not_required: "Consenso non richiesto",
};

export default async function StorieRedazionePage() {
  const stories = await listEditorialStories();

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-black pb-4">
        <div>
          <p className="text-ink-muted text-xs font-semibold uppercase tracking-[0.14em]">
            Voci
          </p>
          <h1 className="text-ink mt-2 text-2xl font-semibold tracking-tight">
            Storie e interviste
          </h1>
          <p className="text-ink-muted mt-2 max-w-2xl text-sm leading-6">
            Gestione delle Voci originali: candidatura, contatto, intervista, fact-check e consensi restano separati dalla pubblicazione del contenuto.
          </p>
        </div>
        <Button href="/app/redazione/contenuti/nuovo" size="sm">
          Nuova storia o intervista
        </Button>
      </div>

      {stories.length === 0 ? (
        <section className="py-10">
          <p className="text-ink-muted max-w-xl text-sm leading-6">
            Non ci sono ancora storie o interviste trasformate in contenuti. Le candidature del Numero zero restano nella Inbox finché non parte una vera intervista.
          </p>
          <div className="mt-5 flex flex-wrap gap-4 text-sm font-medium">
            <Link href="/app/redazione/inbox" className="underline underline-offset-4">
              Apri Inbox
            </Link>
            <Link href="/app/redazione/numero-zero" className="underline underline-offset-4">
              Apri Numero zero
            </Link>
          </div>
        </section>
      ) : (
        <div className="mt-6 divide-y divide-neutral-300 border-y border-black">
          {stories.map((story) => (
            <article key={story.id} className="grid gap-3 py-5 md:grid-cols-[170px_1fr_190px] md:items-start">
              <div className="text-xs leading-5 text-neutral-500">
                <p>{TYPE_LABELS[story.type_code] ?? story.type_code}</p>
                <p>{PUBLICATION_LABELS[story.publication_status] ?? story.publication_status}</p>
                {story.is_featured ? <p className="font-semibold text-black">In evidenza</p> : null}
              </div>
              <div>
                <h2 className="text-lg font-semibold leading-snug text-black">{story.title}</h2>
                <p className="mt-1 text-xs text-neutral-500">/{story.slug}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="border border-neutral-300 px-2 py-1 text-black">
                    {story.workflow_status ? WORKFLOW_LABELS[story.workflow_status] ?? story.workflow_status : "Workflow non avviato"}
                  </span>
                  <span className="border border-neutral-300 px-2 py-1 text-black">
                    {story.publication_consent_status ? CONSENT_LABELS[story.publication_consent_status] ?? story.publication_consent_status : "Consenso da acquisire"}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 md:justify-end">
                <Link
                  href={`/app/redazione/storie/${story.id}`}
                  className="text-sm font-semibold text-black underline underline-offset-4"
                >
                  Workflow intervista
                </Link>
                <Link
                  href={`/app/redazione/contenuti/${story.id}`}
                  className="text-sm font-medium text-black underline underline-offset-4"
                >
                  Contenuto
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}

      <section className="mt-8 border-t border-black pt-6">
        <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-black">
          Principio editoriale
        </h2>
        <p className="text-ink-muted mt-2 max-w-2xl text-sm leading-6">
          Non cerchiamo soltanto storie di successo. Hanno valore editoriale anche ostacoli,
          insuccessi, accesso al credito, discriminazioni, passaggi generazionali,
          internazionalizzazione e relazioni economiche tra Paese d'origine e destinazione.
          Una fonte pubblica può suggerire un protagonista, ma non sostituisce mai la sua intervista originale.
        </p>
      </section>
    </div>
  );
}
