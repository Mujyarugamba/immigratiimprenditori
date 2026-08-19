import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Sostieni l'Osservatorio",
  description: "Sostieni ricerca, dati, interviste e produzione editoriale di Immigrati Imprenditori.",
};

export default function SostieniPage() {
  return (
    <main id="contenuto" className="pb-16">
      <Container>
        <header className="border-b border-black py-10 sm:py-14">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">AIPEL · Immigrati Imprenditori</p>
          <h1 className="mt-3 max-w-4xl text-4xl font-semibold tracking-tight text-black sm:text-5xl">Sostieni l&apos;Osservatorio</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-700">
            Ricerca, raccolta dei dati, interviste e archivio editoriale richiedono continuità. Il sostegno all&apos;Osservatorio serve a rendere questo lavoro più solido e accessibile.
          </p>
        </header>

        <section className="grid gap-8 border-b border-black py-10 md:grid-cols-3">
          <article>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">01</p>
            <h2 className="mt-2 text-xl font-semibold text-black">Ricerca e dati</h2>
            <p className="mt-3 text-sm leading-6 text-neutral-700">Aggiornamento degli indicatori, verifica delle fonti e produzione di dossier e rapporti.</p>
          </article>
          <article className="border-t border-black pt-7 md:border-l md:border-t-0 md:pl-7 md:pt-0">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">02</p>
            <h2 className="mt-2 text-xl font-semibold text-black">Storie e interviste</h2>
            <p className="mt-3 text-sm leading-6 text-neutral-700">Documentazione, interviste, trascrizioni e produzione audiovisiva selezionata.</p>
          </article>
          <article className="border-t border-black pt-7 md:border-l md:border-t-0 md:pl-7 md:pt-0">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">03</p>
            <h2 className="mt-2 text-xl font-semibold text-black">Accesso pubblico</h2>
            <p className="mt-3 text-sm leading-6 text-neutral-700">Mantenere consultabili gratuitamente dati, fonti, analisi e archivio dell&apos;Osservatorio.</p>
          </article>
        </section>

        <section className="grid gap-8 py-10 lg:grid-cols-[0.7fr_1.3fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">Donazioni</p>
            <h2 className="mt-2 text-2xl font-semibold text-black">Canale in preparazione</h2>
          </div>
          <div>
            <p className="max-w-3xl text-sm leading-7 text-neutral-700">
              Il sistema di donazione sarà attivato dopo la verifica dei dati amministrativi e fiscali di AIPEL. Fino ad allora non mostriamo promesse di detraibilità o deducibilità e non raccogliamo pagamenti attraverso questa pagina.
            </p>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-neutral-700">
              Partnership, ricerche commissionate e sponsorizzazioni compatibili con l&apos;indipendenza editoriale saranno trattate separatamente dalle decisioni della redazione.
            </p>
            <Link href="/chi-siamo" className="mt-5 inline-block text-sm font-semibold text-black underline underline-offset-4">Chi promuove l&apos;Osservatorio</Link>
          </div>
        </section>
      </Container>
    </main>
  );
}
