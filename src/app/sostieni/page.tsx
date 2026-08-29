import type { Metadata } from "next";
import Link from "next/link";
import {
  canAcceptOnlineDonations,
  SUPPORT_CONFIGURATION,
} from "@/lib/support/config";

export const metadata: Metadata = {
  title: "Sostieni il Centro Studi",
  description:
    "Sostieni ImmigratiImprenditori.it e il lavoro del Centro Studi AIPEL su dati, analisi e testimonianze dell'imprenditoria migrante.",
};

const areeDiSostegno = [
  {
    title: "Ricerca e dati",
    text: "Raccolta, verifica e aggiornamento di indicatori, serie storiche, fonti e confronti territoriali.",
  },
  {
    title: "Storie e interviste",
    text: "Ricerca, preparazione e realizzazione di testimonianze, interviste e storie d'impresa documentate.",
  },
  {
    title: "Rapporti e pubblicazioni",
    text: "Produzione di dossier, analisi, rapporti e materiali di approfondimento accessibili e citabili.",
  },
  {
    title: "Produzione audiovisiva",
    text: "Registrazione, montaggio, trascrizione e pubblicazione di interviste, testimonianze, incontri e presentazioni.",
  },
] as const;

export default function SostieniPage() {
  const donationsEnabled = canAcceptOnlineDonations();

  return (
    <main id="contenuto" className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
      <header className="max-w-3xl border-b border-black pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">
          Immigrati Imprenditori · Centro Studi
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-black sm:text-5xl">
          Sostieni l&apos;Osservatorio
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-700">
          Il sostegno a ImmigratiImprenditori.it contribuisce alle attività del Centro Studi:
          ricerca, raccolta e verifica dei dati, interviste, rapporti e produzione audiovisiva.
        </p>
      </header>

      <section className="py-10">
        <h2 className="text-2xl font-semibold tracking-tight text-black">Che cosa sostieni</h2>
        <div className="mt-6 grid gap-px border border-black bg-black sm:grid-cols-2">
          {areeDiSostegno.map((area) => (
            <article key={area.title} className="bg-white p-6">
              <h3 className="text-lg font-semibold text-black">{area.title}</h3>
              <p className="mt-3 text-sm leading-6 text-neutral-700">{area.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-black py-10">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
          Donazioni
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-black">
          Sostegno economico online
        </h2>
        {donationsEnabled && SUPPORT_CONFIGURATION.paymentUrl ? (
          <>
            <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-700">
              Il sistema di pagamento online è attivo. Prima di procedere consulta le informazioni pubblicate su finalità e indipendenza editoriale.
            </p>
            <a
              href={SUPPORT_CONFIGURATION.paymentUrl}
              rel="noreferrer"
              className="mt-6 inline-flex border border-black bg-black px-5 py-3 text-sm font-semibold text-white"
            >
              Sostieni online →
            </a>
          </>
        ) : (
          <div className="mt-5 border border-neutral-300 bg-neutral-50 p-5">
            <p className="text-sm font-semibold text-black">Pagamenti online non ancora attivati</p>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-700">
              Non mostriamo un pulsante di pagamento finché intestazione del conto ricevente,
              provider, dati amministrativi e formulazione fiscale non sono stati verificati insieme.
              Questa scelta evita collegamenti incompleti o pagamenti verso una configurazione non definitiva.
            </p>
          </div>
        )}
      </section>

      <section className="border-t border-black py-10">
        <h2 className="text-2xl font-semibold tracking-tight text-black">Indipendenza editoriale</h2>
        <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-700">
          Sostegni, partnership e sponsorizzazioni non attribuiscono alcun diritto
          di intervento sulla selezione delle fonti, sui dati, sulle conclusioni,
          sulle interviste o sulle decisioni della redazione. Il sostegno economico
          rimane separato dall&apos;attività editoriale e di ricerca.
        </p>
        <Link href="/politica-editoriale" className="mt-5 inline-block text-sm font-semibold underline underline-offset-4">
          Leggi la politica editoriale →
        </Link>
      </section>

      <section className="border-t border-black pt-10">
        <h2 className="text-2xl font-semibold tracking-tight text-black">Partnership e sostegno istituzionale</h2>
        <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-700">
          Enti, fondazioni, università, associazioni e imprese possono sostenere
          specifiche attività di ricerca, raccolta dati, produzione editoriale o
          iniziative pubbliche. Ogni collaborazione rispetta la missione e
          l&apos;indipendenza del Centro Studi.
        </p>
        <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-700">
          Per partnership e rapporti istituzionali:{" "}
          <a
            className="break-all underline underline-offset-4"
            href={`mailto:${SUPPORT_CONFIGURATION.partnershipEmail}`}
          >
            {SUPPORT_CONFIGURATION.partnershipEmail}
          </a>.
        </p>
      </section>
    </main>
  );
}