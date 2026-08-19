import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import {
  listPublicStatisticalSources,
  type PublicStatisticalSource,
} from "@/lib/data/public/sources";

export const metadata: Metadata = {
  title: "Fonti e metodologia",
  description:
    "Fonti statistiche, criteri metodologici e regole di trasparenza dell'Osservatorio Immigrati Imprenditori.",
};

const discoverySources = [
  {
    name: "GDELT",
    kind: "Web e notizie",
    href: "https://www.gdeltproject.org/",
    description:
      "Usato dal Radar per individuare pagine recenti su imprese migranti, politiche, norme, report, statistiche ed eventi. Il risultato è un candidato da verificare, non una prova né una posizione editoriale.",
  },
  {
    name: "Crossref",
    kind: "Letteratura scientifica",
    href: "https://www.crossref.org/documentation/retrieve-metadata/rest-api/",
    description:
      "Usato per scoprire metadati bibliografici e DOI di lavori scientifici pertinenti. Il Radar conserva metadati essenziali e link originale; non copia abstract o testi delle pubblicazioni.",
  },
  {
    name: "DataCite",
    kind: "Dataset e DOI",
    href: "https://support.datacite.org/docs/api",
    description:
      "Usato per individuare dataset registrati con DOI e relativi metadati. L'esistenza di un record DataCite non sostituisce la verifica della metodologia, del produttore o dell'idoneità del dataset.",
  },
] as const;

function SourceCard({ source }: { source: PublicStatisticalSource }) {
  return (
    <article className="grid gap-4 border-b border-neutral-300 py-6 md:grid-cols-[180px_1fr]">
      <div className="text-xs leading-5 text-neutral-500">
        <p className="font-semibold uppercase tracking-[0.12em]">{source.producer_name}</p>
        {source.source_published_on ? <p className="mt-2">{source.source_published_on}</p> : null}
        {source.edition_label ? <p>{source.edition_label}</p> : null}
      </div>
      <div>
        <h3 className="text-xl font-semibold leading-snug text-black">{source.publication_title}</h3>
        {source.name !== source.publication_title ? (
          <p className="mt-1 text-sm text-neutral-600">{source.name}</p>
        ) : null}
        {source.methodology_note ? (
          <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-700">{source.methodology_note}</p>
        ) : null}
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-neutral-600">
          {source.external_identifier ? <span>ID esterno: {source.external_identifier}</span> : null}
          {source.license_note ? <span>Riuso: {source.license_note}</span> : null}
        </div>
        {source.url ? (
          <a href={source.url} target="_blank" rel="noreferrer" className="mt-4 inline-block text-sm font-semibold text-black underline underline-offset-4">
            Consulta la fonte originale
          </a>
        ) : null}
      </div>
    </article>
  );
}

export default async function FontiPage() {
  let sources: PublicStatisticalSource[] = [];
  try {
    sources = await listPublicStatisticalSources();
  } catch {
    sources = [];
  }

  return (
    <main id="contenuto" className="pb-16">
      <Container>
        <header className="border-b border-black py-10 sm:py-14">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">Trasparenza dell'Osservatorio</p>
          <h1 className="mt-3 max-w-4xl text-4xl font-semibold tracking-tight text-black sm:text-5xl">Fonti e metodologia</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-700">
            Ogni dato deve poter essere ricondotto alla fonte originale. Separiamo dati ufficiali,
            ricerca, documenti istituzionali, fonti giornalistiche e testimonianze, indicando i limiti
            quando il confronto tra Paesi o periodi non è perfettamente omogeneo.
          </p>
        </header>

        <section className="grid gap-8 border-b border-black py-10 lg:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">Metodo</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-black">Come leggiamo i dati</h2>
          </div>
          <div className="space-y-5 text-sm leading-7 text-neutral-700 lg:col-span-2">
            <p>
              Un indicatore pubblicato dall'Osservatorio deve indicare fonte, periodo di riferimento,
              unità di misura, territorio, metodologia e data di aggiornamento. Quando un valore è
              derivato o stimato, questa natura deve essere esplicita.
            </p>
            <p>
              L'imprenditoria migrante è studiata in qualunque direzione geografica. Il modello non
              assume che l'Italia sia sempre Paese di destinazione: origine, destinazione e territorio
              osservato sono dimensioni distinte.
            </p>
            <p>
              Una fonte esterna non diventa automaticamente una posizione editoriale di AIPEL. La
              redazione verifica pertinenza, affidabilità, possibilità di confronto e provenienza prima
              di usare dati, rapporti o notizie.
            </p>
          </div>
        </section>

        <section className="border-b border-black py-10" aria-labelledby="fonti-discovery">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">Radar mondiale</p>
          <h2 id="fonti-discovery" className="mt-2 text-2xl font-semibold tracking-tight text-black">Fonti di discovery, non fonti di evidenza</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-neutral-700">
            Il Radar serve a trovare materiale potenzialmente pertinente. Un record trovato dal Radar entra nella Inbox privata e deve essere verificato dalla redazione prima di diventare fonte, dato o contenuto pubblicato.
          </p>
          <div className="mt-6 divide-y divide-neutral-300 border-y border-black">
            {discoverySources.map((source) => (
              <article key={source.name} className="grid gap-3 py-5 md:grid-cols-[180px_1fr]">
                <div>
                  <h3 className="font-semibold text-black">{source.name}</h3>
                  <p className="mt-1 text-xs uppercase tracking-[0.12em] text-neutral-500">{source.kind}</p>
                </div>
                <div>
                  <p className="max-w-3xl text-sm leading-6 text-neutral-700">{source.description}</p>
                  <a href={source.href} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm font-semibold text-black underline underline-offset-4">Documentazione ufficiale →</a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="py-10">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-black pb-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">Registro delle fonti statistiche</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-black">Fonti attive</h2>
            </div>
            <span className="text-xs uppercase tracking-[0.12em] text-neutral-500">{sources.length} {sources.length === 1 ? "fonte" : "fonti"}</span>
          </div>
          {sources.length > 0 ? (
            <div>{sources.map((source) => <SourceCard key={source.id} source={source} />)}</div>
          ) : (
            <p className="max-w-2xl py-10 text-sm leading-6 text-neutral-600">Il registro pubblico delle fonti statistiche è in aggiornamento. Le fonti utilizzate nei singoli indicatori restano comunque indicate nelle relative schede.</p>
          )}
        </section>

        <section className="border-y border-black py-9">
          <h2 className="text-xl font-semibold text-black">Segnala una fonte o una ricerca</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-700">Ricercatori, istituzioni e associazioni possono segnalare dati, rapporti o pubblicazioni. La segnalazione entra nella Inbox privata della redazione e non viene pubblicata automaticamente.</p>
          <Link href="/contribuisci" className="mt-5 inline-block text-sm font-semibold text-black underline underline-offset-4">Invia una segnalazione</Link>
        </section>
      </Container>
    </main>
  );
}
