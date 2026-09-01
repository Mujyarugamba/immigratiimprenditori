import type { Metadata } from "next";
import Link from "next/link";
import { listPublishedContentsByTypes, VOICE_CONTENT_TYPES } from "@/lib/data/public/collections";
import { pageSocialMetadata } from "@/lib/seo/social-metadata";

const TITLE = "Storie e voci | Immigrati Imprenditori";
const DESCRIPTION = "Storie d'impresa, interviste, testimonianze e contenuti audiovisivi pubblicati dal Centro Studi.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/storie" },
  ...pageSocialMetadata({ title: TITLE, description: DESCRIPTION, pathname: "/storie" }),
};

function formatDate(value: string | null) {
  if (!value) return "";
  return new Intl.DateTimeFormat("it-IT", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

export default async function StoriePage() {
  const items = await listPublishedContentsByTypes(VOICE_CONTENT_TYPES);
  return (
    <main id="contenuto" className="preview-hub-page">
      <section className="preview-hub-hero stories">
        <div className="preview-hub-motion" aria-hidden="true"><span>persone · percorsi · impresa ·</span><span>persone · percorsi · impresa ·</span></div>
        <div className="preview-hub-inner">
          <p className="preview-hub-kicker">Centro Studi · Persone</p>
          <h1>Storie e voci</h1>
          <p className="hub-intro">Storie d'impresa, interviste e testimonianze affiancano i dati per documentare percorsi, ostacoli, innovazione, fallimenti, crescita, relazioni tra Paesi e trasformazioni dei territori.</p>
        </div>
      </section>

      <div className="preview-hub-body">
        {items.length > 0 ? <div className="preview-index-grid">{items.map((item) => <article key={item.id} className="preview-index-card"><p className="index-meta">{item.type_code.replaceAll("_", " ")} {formatDate(item.published_at) ? `· ${formatDate(item.published_at)}` : ""}</p><h2><Link href={`/contenuti/${item.slug}`}>{item.title}</Link></h2>{item.abstract ? <p>{item.abstract}</p> : null}<div className="index-footer"><Link href={`/contenuti/${item.slug}`}>Apri la storia →</Link></div></article>)}</div> : <p>Nessuna storia o intervista disponibile in questa raccolta.</p>}
        <section className="preview-hub-cta"><h2>Hai una storia da proporre?</h2><p>Le proposte entrano nella Inbox redazionale privata e vengono valutate prima di qualsiasi pubblicazione.</p><Link href="/contribuisci">Contribuisci alla conoscenza →</Link></section>
      </div>
    </main>
  );
}
