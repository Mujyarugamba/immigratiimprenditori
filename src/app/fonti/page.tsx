import type { Metadata } from "next";
import Link from "next/link";
import { listPublicStatisticalSources } from "@/lib/data/public/sources";
import { pageSocialMetadata } from "@/lib/seo/social-metadata";

const TITLE = "Registro fonti e metodologia | Immigrati Imprenditori";
const DESCRIPTION =
  "Registro delle fonti statistiche effettivamente utilizzate dai dati pubblicati dell'Osservatorio, con copertura, periodicità, periodo osservato, metodo e limiti.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/fonti" },
  ...pageSocialMetadata({
    title: TITLE,
    description: DESCRIPTION,
    pathname: "/fonti",
  }),
};

const PERIODICITY_LABELS: Record<string, string> = {
  annual: "Annuale",
  quarterly: "Trimestrale",
  monthly: "Mensile",
  point_in_time: "Puntuale",
};

const QUALITY_LABELS: Record<string, string> = {
  official: "Ufficiale",
  estimated: "Stimato",
  derived: "Derivato",
  self_reported: "Autodichiarato",
};

function yearRange(start: string | null, end: string | null) {
  if (!start && !end) return "Non disponibile";
  const first = start ? new Date(start).getFullYear() : null;
  const last = end ? new Date(end).getFullYear() : null;
  if (first && last && first === last) return String(first);
  return [first, last].filter(Boolean).join("–") || "Non disponibile";
}

function compactList(values: string[], limit = 6) {
  if (values.length <= limit) return values.join(" · ");
  return `${values.slice(0, limit).join(" · ")} · +${values.length - limit}`;
}

export default async function FontiPage() {
  const sources = await listPublicStatisticalSources();

  return (
    <main id="contenuto" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
      <header className="max-w-4xl border-b border-black pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">
          Osservatorio · Provenienza e metodo
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-black sm:text-5xl">
          Registro fonti e metodologia
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-700">
          Per ogni fonte statistica effettivamente utilizzata mostriamo chi produce il dato, quali indicatori del Centro Studi la usano,
          la copertura geografica oggi pubblicata, la periodicità, il periodo osservato e le note metodologiche disponibili.
          Il registro descrive l&apos;uso che ne fa Immigrati Imprenditori: non pretende di riassumere l&apos;intera copertura della fonte originale.
        </p>
      </header>

      <section className="mt-8 grid gap-px border border-black bg-black sm:grid-cols-3">
        <div className="bg-white p-5">
          <p className="text-xs uppercase tracking-[0.12em] text-neutral-500">Fonti in uso</p>
          <strong className="mt-2 block text-3xl text-black">{sources.length}</strong>
        </div>
        <div className="bg-white p-5 sm:col-span-2">
          <p className="text-xs uppercase tracking-[0.12em] text-neutral-500">Criterio</p>
          <p className="mt-2 text-sm leading-6 text-neutral-700">
            Entrano qui solo fonti collegate ad almeno un valore finale di un indicatore pubblico. Le altre tipologie di fonte — accademica,
            indipendente, associativa, giornalistica e testimoniale — restano distinte nella metodologia generale finché non alimentano dati statistici dell&apos;Osservatorio.
          </p>
        </div>
      </section>

      <div className="mt-10 space-y-8">
        {sources.map((source) => (
          <article key={source.id} className="border border-black bg-white">
            <header className="border-b border-black p-6 lg:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                Fonte statistica · {source.producer_name}
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-black">
                {source.publication_title}
              </h2>
              <p className="mt-2 text-sm text-neutral-600">{source.name}</p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
                {source.publishedValueCount} {source.publishedValueCount === 1 ? "valore pubblico collegato" : "valori pubblici collegati"}
              </p>
            </header>

            <div className="grid gap-px bg-neutral-300 lg:grid-cols-2">
              <section className="bg-white p-6 lg:p-8">
                <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-black">Chi è</h3>
                <dl className="mt-4 space-y-3 text-sm leading-6">
                  <div>
                    <dt className="text-neutral-500">Produttore</dt>
                    <dd className="font-medium text-black">{source.producer_name}</dd>
                  </div>
                  {source.edition_label ? (
                    <div>
                      <dt className="text-neutral-500">Edizione</dt>
                      <dd className="text-neutral-800">{source.edition_label}</dd>
                    </div>
                  ) : null}
                  {source.source_published_on ? (
                    <div>
                      <dt className="text-neutral-500">Data della fonte</dt>
                      <dd className="text-neutral-800">{source.source_published_on}</dd>
                    </div>
                  ) : null}
                  {source.external_identifier ? (
                    <div>
                      <dt className="text-neutral-500">Identificativo</dt>
                      <dd className="break-all text-neutral-800">{source.external_identifier}</dd>
                    </div>
                  ) : null}
                </dl>
              </section>

              <section className="bg-white p-6 lg:p-8">
                <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-black">Dati utilizzati</h3>
                <p className="mt-4 text-sm leading-6 text-neutral-700">
                  {source.indicatorTitles.length
                    ? compactList(source.indicatorTitles)
                    : "Nessun indicatore pubblico risolto nel registro."}
                </p>
              </section>

              <section className="bg-white p-6 lg:p-8">
                <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-black">Copertura geografica pubblicata</h3>
                <p className="mt-4 text-sm leading-6 text-neutral-700">
                  {source.coverageLabels.length
                    ? compactList(source.coverageLabels, 10)
                    : "La copertura geografica non è esplicitata nei valori pubblici collegati."}
                </p>
                <p className="mt-3 text-xs leading-5 text-neutral-500">
                  È la copertura presente oggi nel Centro Studi, non necessariamente l&apos;intera copertura disponibile presso la fonte originale.
                </p>
              </section>

              <section className="bg-white p-6 lg:p-8">
                <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-black">Periodicità e periodo</h3>
                <dl className="mt-4 space-y-3 text-sm leading-6">
                  <div>
                    <dt className="text-neutral-500">Periodicità degli indicatori collegati</dt>
                    <dd className="text-neutral-800">
                      {source.periodicities.length
                        ? source.periodicities.map((item) => PERIODICITY_LABELS[item] ?? item).join(" · ")
                        : "Non disponibile"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-neutral-500">Periodo dei valori pubblicati</dt>
                    <dd className="text-neutral-800">{yearRange(source.periodStart, source.periodEnd)}</dd>
                  </div>
                </dl>
              </section>

              <section className="bg-white p-6 lg:p-8">
                <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-black">Qualificazione dei valori</h3>
                <p className="mt-4 text-sm leading-6 text-neutral-700">
                  {source.qualityCodes.length
                    ? source.qualityCodes.map((item) => QUALITY_LABELS[item] ?? item).join(" · ")
                    : "Non disponibile"}
                </p>
                <p className="mt-3 text-xs leading-5 text-neutral-500">
                  La qualificazione riguarda i valori registrati nel Centro Studi e non costituisce un giudizio generale sull&apos;ente produttore.
                </p>
              </section>

              <section className="bg-white p-6 lg:p-8">
                <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-black">Metodo e limiti</h3>
                {source.methodology_note ? (
                  <p className="mt-4 text-sm leading-6 text-neutral-700">{source.methodology_note}</p>
                ) : (
                  <p className="mt-4 text-sm leading-6 text-neutral-700">
                    Non è registrata una nota metodologica sintetica specifica della fonte. Per i limiti occorre verificare la fonte originale e le schede degli indicatori collegati.
                  </p>
                )}
                {source.valueMethodologyNotes.length ? (
                  <div className="mt-4 border-t border-neutral-200 pt-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.1em] text-neutral-500">Note presenti sui valori</p>
                    <ul className="mt-2 space-y-2 text-sm leading-6 text-neutral-700">
                      {source.valueMethodologyNotes.slice(0, 3).map((note) => (
                        <li key={note}>• {note}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </section>
            </div>

            <footer className="flex flex-wrap items-start justify-between gap-5 border-t border-black p-6 lg:p-8">
              <div className="max-w-2xl text-xs leading-5 text-neutral-500">
                {source.license_note ? `Licenza/uso: ${source.license_note}` : "Condizioni di riuso non registrate nel campo sintetico del Centro Studi."}
              </div>
              {source.url ? (
                <a href={source.url} target="_blank" rel="noreferrer" className="text-sm font-semibold underline underline-offset-4">
                  Apri la fonte originale ↗
                </a>
              ) : null}
            </footer>
          </article>
        ))}
      </div>

      <section className="mt-10 border-t border-black pt-8">
        <h2 className="text-xl font-semibold text-black">Come leggiamo le fonti</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-neutral-700">
          Fonte, qualità del valore, definizione statistica e comparabilità sono piani diversi. Un dato può essere ufficiale ma non direttamente confrontabile con un altro se cambiano popolazione osservata, territorio, periodo, unità o definizione.
        </p>
        <div className="mt-5 flex flex-wrap gap-5 text-sm font-semibold">
          <Link href="/dati-e-fonti" className="underline underline-offset-4">Metodo, tipologie e comparabilità →</Link>
          <Link href="/glossario" className="underline underline-offset-4">Glossario →</Link>
          <Link href="/open-data" className="underline underline-offset-4">Open data →</Link>
        </div>
      </section>
    </main>
  );
}
