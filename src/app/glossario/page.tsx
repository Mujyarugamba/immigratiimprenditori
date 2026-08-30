import type { Metadata } from "next";
import Link from "next/link";
import { pageSocialMetadata } from "@/lib/seo/social-metadata";

const TITLE = "Glossario | Immigrati Imprenditori";
const DESCRIPTION =
  "Glossario metodologico dei principali termini utilizzati dal Centro Studi sull'imprenditoria migrante.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/glossario" },
  ...pageSocialMetadata({
    title: TITLE,
    description: DESCRIPTION,
    pathname: "/glossario",
  }),
};

const entries = [
  {
    term: "Imprenditore migrante",
    text: "Espressione editoriale generale usata dal Centro Studi per descrivere una persona che svolge attività imprenditoriale in relazione a un percorso migratorio. Non coincide automaticamente con una categoria statistica ufficiale.",
  },
  {
    term: "Impresa straniera",
    text: "Categoria utilizzata da fonti camerali secondo proprie regole di classificazione. Misura imprese, non persone, e non va usata come sinonimo di imprenditore migrante.",
  },
  {
    term: "Lavoratore autonomo",
    text: "Categoria statistica riferita a persone occupate in una determinata condizione professionale. Non equivale al numero di imprese registrate.",
  },
  {
    term: "Cittadino straniero",
    text: "Persona classificata in base alla cittadinanza. La cittadinanza è distinta dal luogo di nascita e non consente, da sola, di ricostruire un percorso migratorio individuale.",
  },
  {
    term: "Persona nata all'estero",
    text: "Persona classificata in base al luogo di nascita. È una variabile diversa dalla cittadinanza e può includere cittadini del Paese di residenza.",
  },
  {
    term: "Paese di origine",
    text: "Nel modello editoriale indica il Paese di partenza o di origine rilevante per la storia, la ricerca o la rotta analizzata. Il significato preciso dipende dalla fonte o dal contenuto.",
  },
  {
    term: "Paese di destinazione",
    text: "Paese nel quale la persona o l'attività economica opera nel contesto della rotta considerata. L'Italia non è assunta come destinazione obbligatoria.",
  },
  {
    term: "Rotta imprenditoriale",
    text: "Relazione analitica origine → destinazione utilizzata dal Centro Studi per collegare dati, storie, ricerche ed eventi tra due Paesi o territori.",
  },
  {
    term: "Elaborazione del Centro Studi",
    text: "Trasformazione documentata di un valore di fonte, per esempio una conversione di unità. Deve restare distinguibile dal valore direttamente pubblicato dalla fonte originale.",
  },
  {
    term: "Fonte primaria",
    text: "Fonte che produce o pubblica originariamente il dato, il documento o l'informazione utilizzata. Una fonte secondaria che commenta il dato non viene presentata come fonte primaria.",
  },
] as const;

export default function GlossarioPage() {
  return (
    <main id="contenuto" className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:py-16">
      <header className="max-w-4xl border-b border-black pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">Fonti e metodologia</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-black sm:text-5xl">Glossario</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-700">
          Termini simili possono misurare fenomeni diversi. Il glossario aiuta a mantenere separati concetti editoriali,
          categorie statistiche e definizioni adottate dalle singole fonti.
        </p>
      </header>

      <dl className="mt-8 divide-y divide-black border-y border-black">
        {entries.map((entry) => (
          <div key={entry.term} className="grid gap-3 py-6 md:grid-cols-[16rem_1fr] md:gap-8">
            <dt className="text-lg font-semibold text-black">{entry.term}</dt>
            <dd className="text-base leading-7 text-neutral-700">{entry.text}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-8 max-w-3xl text-sm leading-6 text-neutral-600">
        Le definizioni specifiche indicate nelle singole schede dell&apos;Osservatorio prevalgono sulle sintesi generali del glossario.
      </p>
      <Link href="/dati-e-fonti" className="mt-5 inline-block text-sm font-semibold underline underline-offset-4">
        Leggi Fonti e metodologia →
      </Link>
    </main>
  );
}
