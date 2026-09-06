import type { Metadata } from "next";
import Link from "next/link";
import { listPublications, publicationKindLabel } from "@/lib/data/public/publications";
import { absoluteUrl } from "@/lib/i18n/seo";
import { pageSocialMetadata } from "@/lib/seo/social-metadata";

const TITLE = "Pubblicazioni";
const DESCRIPTION = "Rapporti, studi e pubblicazioni verificati e pubblicati dal Centro Studi Immigrati Imprenditori.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/pubblicazioni" },
  ...pageSocialMetadata({ title: TITLE, description: DESCRIPTION, pathname: "/pubblicazioni" }),
};

export default async function PubblicazioniPage() {
  const publications = await listPublications();
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Pubblicazioni — Immigrati Imprenditori",
    url: absoluteUrl("/pubblicazioni"),
    isPartOf: { "@type": "WebSite", name: "Immigrati Imprenditori", url: absoluteUrl("/") },
    hasPart: publications.map((item) => ({ "@type": "Report", name: item.title, url: absoluteUrl(`/contenuti/${item.slug}`), datePublished: item.source_publication_date ?? item.published_at ?? undefined, author: item.authors.map((name) => ({ "@type": "Person", name })), publisher: item.publisher_name ? { "@type": "Organization", name: item.publisher_name } : undefined })),
  };

  return (
    <main id="contenuto" className="preview-hub-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <section className="preview-hub-hero publications">
        <div className="preview-hub-motion" aria-hidden="true"><span>rapporti · studi · dossier ·</span><span>rapporti · studi · dossier ·</span></div>
        <div className="preview-hub-inner">
          <p className="preview-hub-kicker">Centro Studi · Biblioteca</p>
          <h1>Pubblicazioni</h1>
          <p className="hub-intro">Rapporti e studi già pubblicati e verificati dalla redazione. Ogni scheda conserva autori, fonte, data, metadati bibliografici e strumenti di citazione disponibili.</p>
        </div>
      </section>

      <div className="preview-hub-body">
        <div className="preview-section-head"><div><p className="eyebrow">Biblioteca</p><h2>Rapporti e studi</h2></div><div className="flex flex-wrap gap-4"><Link href="/contenuti">Analisi →</Link><Link href="/fonti">Fonti →</Link><Link href="/dati-e-fonti">Metodologia →</Link></div></div>
        {publications.length > 0 ? <div className="preview-index-grid">{publications.map((item) => <article key={item.id} className="preview-index-card"><p className="index-meta">{publicationKindLabel(item.report_kind, item.type_code)}{item.source_publication_year ? ` · ${item.source_publication_year}` : ""}</p><h2><Link href={`/contenuti/${item.slug}`}>{item.title}</Link></h2>{item.authors.length > 0 ? <p className="font-semibold">{item.authors.join(", ")}</p> : null}{item.publisher_name ? <p>{item.publisher_name}</p> : null}{item.abstract ? <p>{item.abstract}</p> : null}<div className="index-footer flex flex-wrap gap-4"><Link href={`/contenuti/${item.slug}`}>Apri la scheda →</Link>{item.document_url ? <a href={item.document_url} target="_blank" rel="noopener noreferrer">Documento originale ↗</a> : null}</div></article>)}</div> : <p>Non risultano pubblicazioni che soddisfino attualmente i criteri editoriali pubblici.</p>}
      </div>
    </main>
  );
}
