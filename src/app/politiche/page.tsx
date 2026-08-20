import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { listPublicPolicyBriefs } from "@/lib/data/public/reports";
import type { PublicContentListItem } from "@/lib/data/public/contents";
import { formatItalianDate } from "@/lib/public/labels";

export const metadata: Metadata = {
  title: "Politiche e normative",
  description:
    "Politiche pubbliche, norme e programmi con impatto sull'imprenditoria migrante e sulla diaspora economica.",
};

export default async function PolitichePage() {
  let items: PublicContentListItem[] = [];
  try {
    items = await listPublicPolicyBriefs();
  } catch {
    items = [];
  }

  return (
    <main id="contenuto" className="pb-16">
      <Container>
        <header className="border-b border-black py-10 sm:py-14">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">Analisi documentata</p>
          <h1 className="mt-3 max-w-4xl text-4xl font-semibold tracking-tight text-black sm:text-5xl">Politiche e normative</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-700">
            Norme, programmi e politiche pubbliche che incidono sull&apos;accesso all&apos;impresa, al credito, alle competenze, all&apos;internazionalizzazione e alle relazioni economiche delle diaspore.
          </p>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-neutral-600">
            Separiamo il testo della norma o della misura, i dati disponibili e l&apos;eventuale analisi editoriale. La sezione non assume posizioni partitiche.
          </p>
        </header>

        <section className="py-10">
          <div className="border-b border-black pb-3">
            <h2 className="text-xl font-semibold text-black">Analisi e schede</h2>
          </div>
          {items.length > 0 ? (
            <div className="divide-y divide-neutral-300">
              {items.map((item) => (
                <article key={item.id} className="grid gap-3 py-6 md:grid-cols-[170px_1fr]">
                  <div className="text-xs uppercase tracking-[0.1em] text-neutral-500">
                    {item.published_at ? formatItalianDate(item.published_at) : "Policy brief"}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold leading-snug text-black">
                      <Link href={`/contenuti/${item.slug}`} className="hover:underline hover:underline-offset-4">{item.title}</Link>
                    </h3>
                    {item.abstract ? <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-700">{item.abstract}</p> : null}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="max-w-2xl py-10 text-sm leading-6 text-neutral-600">
              La redazione sta preparando le prime schede su politiche e normative pertinenti all&apos;imprenditoria migrante.
            </p>
          )}
        </section>

        <section className="border-y border-black py-9">
          <h2 className="text-xl font-semibold text-black">Segnala una norma, un programma o una ricerca</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-700">
            Le segnalazioni entrano nella Inbox privata e vengono verificate dalla redazione prima di essere utilizzate.
          </p>
          <Link href="/contribuisci" className="mt-5 inline-block text-sm font-semibold text-black underline underline-offset-4">Invia una segnalazione</Link>
        </section>
      </Container>
    </main>
  );
}
