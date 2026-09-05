import type { Metadata } from "next";
import Link from "next/link";
import { getExplorerSnapshot } from "@/lib/data/public/explore";
import { pageSocialMetadata } from "@/lib/seo/social-metadata";

const TITLE = "Open data | Immigrati Imprenditori";
const DESCRIPTION = "Accesso ai dati pubblicati dall'Osservatorio di Immigrati Imprenditori in formato consultabile, JSON, CSV e XLSX.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/open-data" },
  ...pageSocialMetadata({ title: TITLE, description: DESCRIPTION, pathname: "/open-data" }),
};

const FILTERS = [
  ["indicatore", "slug dell'indicatore", "imprese-straniere-registrate"],
  ["territorio", "codice territorio", "IT-25"],
  ["anno", "anno del periodo", "2025"],
  ["settore", "ID numerico del settore canonico", "12"],
  ["categoria", "codice del gruppo/categoria della fonte", "FB"],
] as const;

export default async function OpenDataPage() {
  const snapshot = await getExplorerSnapshot();
  return (
    <main id="contenuto" className="preview-hub-page">
      <section className="preview-hub-hero open-data">
        <div className="preview-hub-motion" aria-hidden="true"><span>JSON · CSV · XLSX · API ·</span><span>JSON · CSV · XLSX · API ·</span></div>
        <div className="preview-hub-inner">
          <p className="preview-hub-kicker">Osservatorio · Open data</p>
          <h1>Open data</h1>
          <p className="hub-intro">I valori già pubblicati dall'Osservatorio sono disponibili anche in formato strutturato. Definizioni, fonti e note metodologiche restano parte integrante dell'interpretazione del dato.</p>
        </div>
      </section>

      <section className="preview-data-stats"><div className="preview-data-stat"><p>Indicatori</p><strong>{snapshot.indicators.length}</strong></div><div className="preview-data-stat"><p>Record</p><strong>{snapshot.values.length}</strong></div><div className="preview-data-stat"><p>Formati</p><strong>JSON · CSV · XLSX</strong></div></section>

      <div className="preview-hub-body">
        <section className="preview-data-section"><div className="preview-section-head"><div><p className="eyebrow">Accesso programmabile</p><h2>API pubblica v1</h2></div><Link href="/open-data/api">Documentazione API →</Link></div><p>La versione <code>v1</code> espone indicatori dell'Osservatorio, Paesi dell'Atlante e rotte origine-destinazione che dispongono di evidenze pubblicate. Il punto di discovery è <code>/api/v1</code>.</p></section>

        <section className="preview-data-section"><h2>Dataset pubblico</h2><p>Gli endpoint restituiscono soltanto indicatori pubblicati e valori finali resi pubblici dall'Osservatorio. Non espongono aree riservate, dati personali o contenuti redazionali non pubblicati.</p><div className="preview-data-formats"><div className="preview-data-format"><h3>JSON</h3><code>/api/open-data/indicators</code><a href="/api/open-data/indicators">Apri JSON →</a></div><div className="preview-data-format"><h3>CSV</h3><code>/api/open-data/indicators.csv</code><a href="/api/open-data/indicators.csv">Scarica CSV →</a></div><div className="preview-data-format"><h3>XLSX</h3><code>/api/open-data/indicators.xlsx</code><a href="/api/open-data/indicators.xlsx">Scarica Excel →</a></div></div></section>

        <section className="preview-data-section"><h2>Filtri degli endpoint Open Data</h2><p>JSON, CSV e XLSX accettano gli stessi parametri. I filtri possono essere combinati e coincidono con quelli del Data Explorer.</p><div className="overflow-x-auto"><table className="preview-data-table"><thead><tr><th>Parametro</th><th>Significato</th><th>Esempio</th></tr></thead><tbody>{FILTERS.map(([name, meaning, example]) => <tr key={name}><td><code>{name}</code></td><td>{meaning}</td><td><code>{example}</code></td></tr>)}</tbody></table></div><code className="mt-5 block overflow-x-auto bg-[#edf2ee] p-4 text-sm">/api/open-data/indicators.xlsx?indicatore=imprese-straniere-registrate&amp;territorio=IT-25&amp;anno=2025</code></section>

        <section className="preview-data-section"><h2>Uso corretto e condizioni di riuso</h2><p>Un valore non va separato dalla definizione dell'indicatore. In particolare cittadinanza, luogo di nascita, impresa straniera e lavoro autonomo non sono categorie equivalenti. Prima di riutilizzare o confrontare i dati, consulta la metodologia e la fonte originale.</p><div className="mt-5 flex flex-wrap gap-5 text-sm font-semibold"><Link href="/dati-e-fonti">Fonti e metodologia →</Link><Link href="/esplora/dati">Data Explorer →</Link><Link href="/fonti">Catalogo delle fonti →</Link></div></section>
      </div>
    </main>
  );
}
