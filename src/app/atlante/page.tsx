import type { Metadata } from "next";
import Link from "next/link";
import { AtlasRouteMap } from "@/components/atlas/AtlasRouteMap";
import { listAtlasCountrySummaries } from "@/lib/data/public/atlas";
import { listPublishedRouteSummaries } from "@/lib/data/public/routes";
import { pageSocialMetadata } from "@/lib/seo/social-metadata";

const TITLE = "Atlante dell'imprenditoria migrante";
const DESCRIPTION = "Paesi e territori letti attraverso dati, ricerche, storie, rotte ed eventi verificati dal Centro Studi Immigrati Imprenditori.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/atlante" },
  ...pageSocialMetadata({ title: TITLE, description: DESCRIPTION, pathname: "/atlante" }),
};

export default async function AtlantePage() {
  const [summaries, routes] = await Promise.all([listAtlasCountrySummaries(), listPublishedRouteSummaries()]);
  const published = summaries.filter((item) => item.hasEvidence);

  return (
    <main id="contenuto" className="preview-hub-page">
      <section className="preview-hub-hero atlas">
        <div className="preview-hub-motion" aria-hidden="true"><span>Paesi · rotte · territori ·</span><span>Paesi · rotte · territori ·</span></div>
        <div className="preview-hub-inner">
          <p className="preview-hub-kicker">Osservatorio · Atlante</p>
          <h1>Atlante dell'imprenditoria migrante</h1>
          <p className="hub-intro">Una lettura geografica che riunisce soltanto evidenze già disponibili: indicatori, analisi, storie, rotte ed eventi. Le schede vengono rese pubbliche quando esiste materiale sostanziale.</p>
        </div>
      </section>

      <div className="preview-hub-body">
        {published.length > 0 ? <section aria-labelledby="atlas-map-heading">
          <div className="preview-section-head"><div><p className="eyebrow">Geografia delle evidenze</p><h2 id="atlas-map-heading">Paesi e rotte documentate</h2></div>{routes.length > 0 ? <Link href="/atlante/rotte">Esplora tutte le rotte →</Link> : null}</div>
          <div className="preview-map-shell"><AtlasRouteMap countries={published} routes={routes} /></div>
        </section> : null}

        <section className="mt-16">
          <div className="preview-section-head"><div><p className="eyebrow">Copertura disponibile</p><h2>{published.length} {published.length === 1 ? "Paese" : "Paesi"} con evidenze pubblicate</h2></div><Link href="/esplora/dati">Apri il Data Explorer →</Link></div>
          {published.length > 0 ? <div className="preview-index-grid">{published.map((item) => <article key={item.country.code} className="preview-index-card"><p className="index-meta">{item.country.code} · {item.country.iso3}</p><h2><Link href={`/atlante/${item.country.slug}`}>{item.country.name}</Link></h2><dl className="preview-atlas-country-stats"><div><dt>Indicatori</dt><dd>{item.indicatorCount}</dd></div><div><dt>Valori dati</dt><dd>{item.dataValueCount}</dd></div><div><dt>Analisi / storie</dt><dd>{item.contentCount}</dd></div><div><dt>Eventi</dt><dd>{item.eventCount}</dd></div></dl><div className="index-footer"><Link href={`/atlante/${item.country.slug}`}>Apri la scheda Paese →</Link></div></article>)}</div> : <p>Nessuna scheda Paese soddisfa ancora il criterio di pubblicazione dell'Atlante.</p>}
        </section>
      </div>
    </main>
  );
}
