import type { Metadata } from "next";
import Link from "next/link";
import { getExplorerIndex } from "@/lib/data/public/explore";
import { pageSocialMetadata } from "@/lib/seo/social-metadata";

const TITLE = "Esplora il Centro Studi";
const DESCRIPTION =
  "Esplora dati, mappe, territori, settori, autori, analisi, cultura, pubblicazioni, storie, eventi e fonti di Immigrati Imprenditori.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/esplora" },
  ...pageSocialMetadata({
    title: TITLE,
    description: DESCRIPTION,
    pathname: "/esplora",
  }),
};

const modules = [
  { title: "Data Explorer", text: "Interroga i valori pubblicati dall'Osservatorio per indicatore, territorio, periodo, settore e categoria.", href: "/esplora/dati" },
  { title: "Mappa quantitativa", text: "Visualizza geograficamente un singolo indicatore con simboli proporzionali e senza mescolare definizioni diverse.", href: "/esplora/mappa" },
  { title: "Territori", text: "Naviga i territori già presenti nelle serie dell'Osservatorio.", href: "/esplora/territori" },
  { title: "Settori", text: "Consulta la tassonomia dei settori economici utilizzata dal Centro Studi.", href: "/esplora/settori" },
  { title: "Autori e contributori", text: "Scopri le firme presenti nei contenuti pubblicati.", href: "/esplora/autori" },
  { title: "Analisi e ricerche", text: "Ricerche, analisi, interviste e approfondimenti verificati dalla redazione.", href: "/contenuti" },
  { title: "Cultura", text: "Eventi, storie e approfondimenti culturali e sulle industrie creative, raccolti trasversalmente dal Centro Studi.", href: "/cultura" },
  { title: "Pubblicazioni", text: "Consulta rapporti e studi pubblicati con metadati bibliografici, fonte e strumenti di citazione.", href: "/pubblicazioni" },
  { title: "Eventi", text: "Incontri, convegni e iniziative pertinenti all'imprenditoria migrante.", href: "/eventi" },
  { title: "Fonti e metodologia", text: "Definizioni, criteri di comparabilità, fonti e metodo di lavoro.", href: "/dati-e-fonti" },
  { title: "Open data", text: "Accesso ai dati pubblicati in formato leggibile da persone e sistemi.", href: "/open-data" },
] as const;

export default async function EsploraPage() {
  const index = await getExplorerIndex();

  const stats = [
    ["Indicatori pubblicati", index.indicators.length],
    ["Valori consultabili", index.valueCount],
    ["Territori presenti", index.territories.length],
    ["Settori classificati", index.sectors.length],
  ] as const;

  return (
    <main id="contenuto" className="preview-explore-page">
      <header className="preview-explore-hero">
        <div className="preview-explore-hero-inner">
          <p className="explore-kicker">Immigrati Imprenditori · Centro Studi</p>
          <h1>Esplora</h1>
          <p>
            Un unico punto di accesso a dati, mappe, analisi, cultura, pubblicazioni,
            territori, settori, persone, eventi e fonti. Ogni dato dell&apos;Osservatorio
            rimanda alla propria scheda metodologica e alla fonte.
          </p>
        </div>
      </header>

      <section className="preview-explore-stats" aria-label="Numeri dell'archivio">
        {stats.map(([label, value]) => (
          <div key={label} className="preview-explore-stat">
            <p>{label}</p>
            <strong>{value}</strong>
          </div>
        ))}
      </section>

      <div className="preview-explore-body">
        <h2>Strumenti e archivi</h2>
        <div className="preview-module-grid">
          {modules.map((module) => (
            <article key={module.href} className="preview-module-card">
              <h3>{module.title}</h3>
              <p>{module.text}</p>
              <Link href={module.href}>Apri →</Link>
            </article>
          ))}
        </div>

        <section className="preview-explore-contribute">
          <h2>Contribuisci alla conoscenza</h2>
          <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-700">
            Imprenditori, professionisti, ricercatori, docenti, università, associazioni e istituzioni
            possono proporre storie, contributi di ricerca, pubblicazioni, eventi, dati e fonti alla redazione.
          </p>
          <Link href="/contribuisci">Partecipa al Centro Studi →</Link>
        </section>
      </div>
    </main>
  );
}
