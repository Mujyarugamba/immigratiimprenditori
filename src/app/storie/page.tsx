import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import type { PublicContentListItem } from "@/lib/data/public/contents";
import { listPublicStories } from "@/lib/data/public/stories";
import { CONTENT_TYPES, formatItalianDate, label } from "@/lib/public/labels";

export const metadata: Metadata = {
  title: "Storie e interviste",
  description:
    "Storie, testimonianze e interviste sull'imprenditoria migrante in Italia e nel mondo.",
};

export default async function StoriePage() {
  let stories: PublicContentListItem[] = [];
  try {
    stories = await listPublicStories();
  } catch {
    stories = [];
  }

  const [lead, ...rest] = stories;

  return (
    <main id="contenuto" className="pb-16">
      <Container>
        <header className="border-b border-black py-10 sm:py-14">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">
            Voci · Immigrati Imprenditori
          </p>
          <h1 className="mt-3 max-w-4xl text-4xl font-semibold tracking-tight text-black sm:text-5xl">
            Storie e interviste
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-700">
            Persone che fanno impresa fuori dal proprio Paese d&apos;origine,
            esperti e istituzioni che osservano il fenomeno. Non soltanto storie
            di successo: anche ostacoli, scelte, fallimenti, passaggi generazionali
            e relazioni economiche tra Paesi.
          </p>
          <div className="mt-7 flex flex-wrap gap-5 text-sm font-medium">
            <Link href="/contribuisci" className="border border-black bg-black px-4 py-2.5 text-white">
              Racconta la tua storia
            </Link>
            <Link href="/contribuisci" className="border-b border-black py-2.5 text-black">
              Proponi un&apos;intervista
            </Link>
          </div>
        </header>

        {lead ? (
          <section className="grid border-b border-black py-10 lg:grid-cols-[1fr_2fr] lg:gap-12">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                In evidenza
              </p>
              <p className="mt-3 text-sm text-neutral-600">
                {label(CONTENT_TYPES, lead.type_code)}
                {lead.published_at ? ` · ${formatItalianDate(lead.published_at)}` : ""}
              </p>
            </div>
            <article className="mt-5 lg:mt-0">
              <h2 className="max-w-3xl text-3xl font-semibold leading-tight tracking-tight text-black sm:text-4xl">
                <Link href={`/contenuti/${lead.slug}`} className="hover:underline hover:underline-offset-4">
                  {lead.title}
                </Link>
              </h2>
              {lead.abstract ? (
                <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-700">
                  {lead.abstract}
                </p>
              ) : null}
              <Link
                href={`/contenuti/${lead.slug}`}
                className="mt-5 inline-block text-sm font-semibold text-black underline underline-offset-4"
              >
                Leggi
              </Link>
            </article>
          </section>
        ) : (
          <section className="border-b border-black py-12">
            <p className="max-w-2xl text-base leading-7 text-neutral-700">
              La redazione sta preparando le prime storie e interviste del nuovo
              Osservatorio. Puoi già proporre una testimonianza o una persona da
              intervistare: ogni proposta sarà valutata dalla redazione.
            </p>
          </section>
        )}

        {rest.length > 0 ? (
          <section className="py-10">
            <div className="flex items-end justify-between gap-4 border-b border-black pb-3">
              <h2 className="text-xl font-semibold text-black">Archivio delle voci</h2>
              <span className="text-xs uppercase tracking-[0.12em] text-neutral-500">
                {stories.length} contenuti
              </span>
            </div>
            <div className="divide-y divide-neutral-300">
              {rest.map((story) => (
                <article key={story.id} className="grid gap-3 py-6 md:grid-cols-[180px_1fr]">
                  <div className="text-xs leading-5 text-neutral-500">
                    <p>{label(CONTENT_TYPES, story.type_code)}</p>
                    {story.published_at ? <p>{formatItalianDate(story.published_at)}</p> : null}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold leading-snug text-black">
                      <Link href={`/contenuti/${story.slug}`} className="hover:underline hover:underline-offset-4">
                        {story.title}
                      </Link>
                    </h3>
                    {story.abstract ? (
                      <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-700">
                        {story.abstract}
                      </p>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <section className="border-y border-black py-10">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
            Partecipa
          </p>
          <h2 className="mt-2 max-w-2xl text-2xl font-semibold tracking-tight text-black">
            Conosci una storia che merita di essere documentata?
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-700">
            Imprenditori, ricercatori, associazioni e persone che vivono direttamente
            il fenomeno possono inviare una segnalazione. La pubblicazione non è
            automatica: ogni proposta viene verificata e curata dalla redazione.
          </p>
          <Link
            href="/contribuisci"
            className="mt-5 inline-block border border-black px-4 py-2.5 text-sm font-semibold text-black"
          >
            Invia una proposta
          </Link>
        </section>
      </Container>
    </main>
  );
}
