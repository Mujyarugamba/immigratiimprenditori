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
            Gestione dei contenuti che danno voce a imprenditori, esperti e istituzioni.
            Ogni pubblicazione resta sottoposta alla revisione della redazione.
          </p>
        </div>
        <Button href="/app/redazione/contenuti/nuovo" size="sm">
          Nuova storia o intervista
        </Button>
      </div>

      {stories.length === 0 ? (
        <section className="py-10">
          <p className="text-ink-muted max-w-xl text-sm leading-6">
            Non ci sono ancora storie o interviste classificate nella redazione.
            Le nuove proposte possono arrivare dalla Inbox oppure essere create direttamente.
          </p>
          <div className="mt-5 flex flex-wrap gap-4 text-sm font-medium">
            <Link href="/app/redazione/inbox" className="underline underline-offset-4">
              Apri Inbox
            </Link>
            <Link href="/app/redazione/contenuti/nuovo" className="underline underline-offset-4">
              Crea contenuto
            </Link>
          </div>
        </section>
      ) : (
        <div className="mt-6 divide-y divide-neutral-300 border-y border-black">
          {stories.map((story) => (
            <article key={story.id} className="grid gap-3 py-5 md:grid-cols-[170px_1fr_140px] md:items-start">
              <div className="text-xs leading-5 text-neutral-500">
                <p>{TYPE_LABELS[story.type_code] ?? story.type_code}</p>
                <p>{PUBLICATION_LABELS[story.publication_status] ?? story.publication_status}</p>
                {story.is_featured ? <p className="font-semibold text-black">In evidenza</p> : null}
              </div>
              <div>
                <h2 className="text-lg font-semibold leading-snug text-black">{story.title}</h2>
                <p className="mt-1 text-xs text-neutral-500">/{story.slug}</p>
              </div>
              <div className="md:text-right">
                <Link
                  href={`/app/redazione/contenuti/${story.id}`}
                  className="text-sm font-medium text-black underline underline-offset-4"
                >
                  Modifica
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
          Non cerchiamo soltanto storie di successo. Hanno valore editoriale anche
          ostacoli, insuccessi, accesso al credito, discriminazioni, passaggi generazionali,
          internazionalizzazione e relazioni economiche tra Paese d'origine e destinazione.
        </p>
      </section>
    </div>
  );
}
