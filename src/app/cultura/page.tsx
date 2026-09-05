import type { Metadata } from "next";
import Link from "next/link";
import { PublicEmpty } from "@/components/public/PublicEmpty";
import { PublicResultCard } from "@/components/public/PublicResultCard";
import { VOICE_CONTENT_TYPES } from "@/lib/data/public/collections";
import { listCultureContents, listUpcomingCulturalEvents } from "@/lib/data/public/culture";
import { CONTENT_TYPES, EVENT_DELIVERY_MODES, formatItalianDateTime, label } from "@/lib/public/labels";
import { pageSocialMetadata } from "@/lib/seo/social-metadata";

const TITLE = "Cultura e industrie creative | Immigrati Imprenditori";
const DESCRIPTION = "Storie, eventi, analisi e industrie culturali e creative osservate dal Centro Studi attraverso migrazioni, diaspora, impresa e territori.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/cultura" },
  ...pageSocialMetadata({ title: TITLE, description: DESCRIPTION, pathname: "/cultura" }),
};

const CREATIVE_FIELDS = [
  "Audiovisivo", "Editoria", "Musica", "Spettacolo dal vivo", "Design", "Moda", "Artigianato artistico", "Patrimonio e servizi culturali",
] as const;

const CENTER_LINKS = [
  ["/osservatorio", "Osservatorio", "Dati e indicatori per leggere il contesto economico e territoriale."],
  ["/atlante", "Atlante", "Paesi, territori e rotte per collocare i fenomeni nello spazio."],
  ["/storie", "Storie e voci", "Interviste e testimonianze per affiancare persone e dati."],
] as const;

function isVoice(typeCode: string) {
  return (VOICE_CONTENT_TYPES as readonly string[]).includes(typeCode);
}

export default async function CulturaHubPage() {
  const [events, contents] = await Promise.all([
    listUpcomingCulturalEvents(6).catch(() => []),
    listCultureContents(18).catch(() => []),
  ]);
  const stories = contents.filter((item) => isVoice(item.type_code)).slice(0, 6);
  const analysis = contents.filter((item) => !isVoice(item.type_code)).slice(0, 6);

  return (
    <main id="contenuto" className="preview-culture-page">
      <section className="preview-culture-hero">
        <div className="preview-culture-motion" aria-hidden="true">
          <span>idee · voci · impresa · territori ·</span><span>idee · voci · impresa · territori ·</span>
        </div>
        <div className="preview-culture-hero-inner">
          <p className="culture-kicker">Centro Studi · Cultura</p>
          <h1>Cultura e industrie creative</h1>
          <p className="culture-intro">
            Uno spazio per osservare come migrazioni, diaspora e mobilità internazionale attraversano produzione culturale, creatività, impresa, lavoro e territori. Dati e ricerca vengono letti insieme a persone, eventi e reti transnazionali.
          </p>
          <nav aria-label="Sezioni Cultura" className="preview-culture-nav">
            <a href="#storie">Storie e voci</a><a href="#eventi">Eventi</a><a href="#industrie-creative">Industrie creative</a><a href="#analisi">Analisi</a>
          </nav>
        </div>
      </section>

      <section className="preview-culture-pillars">
        {[
          ["Persone e storie", "Percorsi creativi, diaspora, seconde generazioni e relazioni tra Paesi raccontati attraverso voci documentate."],
          ["Economia culturale", "Impresa, lavoro, filiere, produzione, distribuzione e mercati nelle industrie culturali e creative."],
          ["Territori e scambi", "Città, Paesi e reti transnazionali come luoghi in cui cultura e imprenditoria migrante si trasformano."],
        ].map(([title, description]) => <article key={title}><h2>{title}</h2><p>{description}</p></article>)}
      </section>

      <section id="storie" className="preview-culture-section">
        <div className="preview-culture-section-inner">
          <div className="preview-culture-section-head">
            <div><p className="eyebrow">Persone</p><h2>Storie e voci</h2></div>
            <div><p>Interviste, testimonianze e storie d'impresa che mostrano la dimensione umana della produzione culturale e creativa.</p><Link href="/storie">Tutte le storie →</Link></div>
          </div>
          {stories.length === 0 ? <PublicEmpty title="Nessuna storia culturale pubblicata in questa raccolta." /> : (
            <div className="preview-culture-grid">{stories.map((item) => <PublicResultCard key={item.id} href={`/contenuti/${item.slug}`} title={item.title} description={item.abstract} badges={[label(CONTENT_TYPES, item.type_code)]} />)}</div>
          )}
        </div>
      </section>

      <section id="eventi" className="preview-culture-section alt">
        <div className="preview-culture-section-inner">
          <div className="preview-culture-section-head">
            <div><p className="eyebrow">Agenda</p><h2>Eventi culturali</h2></div>
            <div><p>Appuntamenti pertinenti a cultura, industrie creative, diaspore e trasformazioni economiche e sociali.</p><Link href="/eventi?tipo=cultural">Tutti gli eventi culturali →</Link></div>
          </div>
          {events.length === 0 ? <PublicEmpty title="Nessun evento culturale futuro disponibile al momento." /> : (
            <div className="preview-culture-grid">{events.map((item) => <PublicResultCard key={item.id} href={`/eventi/${item.id}`} title={item.title} description={item.summary} badges={[label(EVENT_DELIVERY_MODES, item.delivery_mode)]} meta={item.next_edition ? [formatItalianDateTime(item.next_edition.starts_at), item.next_edition.city_text ?? undefined].filter(Boolean) as string[] : undefined} />)}</div>
          )}
        </div>
      </section>

      <section id="industrie-creative" className="preview-culture-section">
        <div className="preview-culture-section-inner preview-creative-layout">
          <div className="preview-creative-copy"><p className="eyebrow">Economia</p><h2>Industrie culturali e creative</h2><p>Il Centro Studi segue la cultura anche come attività economica: filiere, professionalità, impresa, mercati e mobilità internazionale.</p></div>
          <div className="preview-creative-grid">{CREATIVE_FIELDS.map((field) => <div key={field}>{field}</div>)}</div>
        </div>
      </section>

      <section id="analisi" className="preview-culture-section alt">
        <div className="preview-culture-section-inner">
          <div className="preview-culture-section-head">
            <div><p className="eyebrow">Ricerca</p><h2>Analisi e approfondimenti</h2></div>
            <div><p>Studi, note, guide e altri contenuti per leggere la dimensione culturale dell'imprenditoria migrante con fonti e contesto.</p><Link href="/contenuti?categoria=culture">Archivio Cultura →</Link></div>
          </div>
          {analysis.length === 0 ? <PublicEmpty title="Nessuna analisi culturale disponibile in questa raccolta." /> : (
            <div className="preview-culture-grid">{analysis.map((item) => <PublicResultCard key={item.id} href={`/contenuti/${item.slug}`} title={item.title} description={item.abstract} badges={[label(CONTENT_TYPES, item.type_code)]} />)}</div>
          )}
        </div>
      </section>

      <section className="preview-culture-section">
        <div className="preview-culture-section-inner">
          <div className="preview-culture-section-head"><div><p className="eyebrow">Collegamenti</p><h2>Cultura dentro il Centro Studi</h2></div><p>Cultura non vive isolata: ogni tema può essere letto insieme a dati, territori, rotte e testimonianze del resto dell'Osservatorio.</p></div>
          <div className="preview-culture-links">{CENTER_LINKS.map(([href, title, description]) => <article key={href}><h3>{title}</h3><p>{description}</p><Link href={href}>Esplora →</Link></article>)}</div>
          <div className="preview-culture-contribute"><h2>Segnala una storia, un evento o una ricerca</h2><p>Le segnalazioni entrano nella Inbox redazionale e non vengono pubblicate automaticamente: la redazione verifica pertinenza, fonti e qualità.</p><Link href="/contribuisci">Contribuisci alla conoscenza →</Link></div>
        </div>
      </section>
    </main>
  );
}
