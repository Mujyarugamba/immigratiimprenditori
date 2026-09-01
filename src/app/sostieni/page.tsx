import type { Metadata } from "next";
import Link from "next/link";
import { canAcceptOnlineDonations, SUPPORT_CONFIGURATION } from "@/lib/support/config";

export const metadata: Metadata = {
  title: "Sostieni il Centro Studi",
  description: "Sostieni ImmigratiImprenditori.it e il lavoro del Centro Studi AIPEL su dati, analisi e testimonianze dell'imprenditoria migrante.",
};

const BANK_ACCOUNT_HOLDER =
  "Associazione degli Imprenditori e Liberi Professionisti Extracomunitari in Lombardia";
const BANK_IBAN = "IT77Y3688801600100000119423";
const BANK_TRANSFER_REASON = "Contributo libero – Centro Studi Immigrati Imprenditori";

const areeDiSostegno = [
  { title: "Ricerca e dati", text: "Raccolta, verifica e aggiornamento di indicatori, serie storiche, fonti e confronti territoriali." },
  { title: "Storie e interviste", text: "Ricerca, preparazione e realizzazione di testimonianze, interviste e storie d'impresa documentate." },
  { title: "Rapporti e pubblicazioni", text: "Produzione di dossier, analisi, rapporti e materiali di approfondimento accessibili e citabili." },
  { title: "Produzione audiovisiva", text: "Registrazione, montaggio, trascrizione e pubblicazione di interviste, testimonianze, incontri e presentazioni." },
] as const;

export default function SostieniPage() {
  const donationsEnabled = canAcceptOnlineDonations();

  return (
    <main id="contenuto" className="preview-support-page">
      <header className="preview-support-hero">
        <p className="support-kicker">Centro Studi · Sostegno</p>
        <h1>Sostieni il lavoro.</h1>
        <p>Il sostegno a ImmigratiImprenditori.it contribuisce alle attività del Centro Studi: ricerca, raccolta e verifica dei dati, interviste, rapporti e produzione audiovisiva.</p>
      </header>

      <div className="preview-support-body">
        <section className="preview-support-section"><h2>Che cosa sostieni</h2><div className="preview-support-grid">{areeDiSostegno.map((area) => <article key={area.title}><h3>{area.title}</h3><p>{area.text}</p></article>)}</div></section>

        <section className="preview-support-section">
          <h2>Sostegno economico</h2>
          <div className="preview-support-grid">
            <article>
              <h3>Online con Stripe</h3>
              {donationsEnabled && SUPPORT_CONFIGURATION.paymentUrl ? (
                <>
                  <p>Puoi scegliere liberamente l&apos;importo e completare il pagamento sulla pagina sicura di Stripe.</p>
                  <a href={SUPPORT_CONFIGURATION.paymentUrl} rel="noreferrer">Sostieni online →</a>
                </>
              ) : (
                <p>Il pagamento online non è attualmente disponibile.</p>
              )}
            </article>

            <article>
              <h3>Bonifico bancario</h3>
              <dl className="preview-support-bank">
                <div><dt>Intestatario</dt><dd>{BANK_ACCOUNT_HOLDER}</dd></div>
                <div><dt>IBAN</dt><dd><code>{BANK_IBAN}</code></dd></div>
                <div><dt>Causale consigliata</dt><dd>{BANK_TRANSFER_REASON}</dd></div>
              </dl>
            </article>
          </div>
          <p className="preview-support-fiscal-note">Le informazioni fiscali sull&apos;eventuale detraibilità o deducibilità non sono indicate finché non vengono verificate separatamente.</p>
        </section>

        <section className="preview-support-section"><h2>Indipendenza editoriale</h2><p>Sostegni, partnership e sponsorizzazioni non attribuiscono alcun diritto di intervento sulla selezione delle fonti, sui dati, sulle conclusioni, sulle interviste o sulle decisioni della redazione. Il sostegno economico rimane separato dall&apos;attività editoriale e di ricerca.</p><Link href="/politica-editoriale">Leggi la politica editoriale →</Link></section>

        <section className="preview-support-section"><h2>Partnership e sostegno istituzionale</h2><p>Enti, fondazioni, università, associazioni e imprese possono sostenere specifiche attività di ricerca, raccolta dati, produzione editoriale o iniziative pubbliche. Ogni collaborazione rispetta la missione e l&apos;indipendenza del Centro Studi.</p><p>Per partnership e rapporti istituzionali: <a href={`mailto:${SUPPORT_CONFIGURATION.partnershipEmail}`}>{SUPPORT_CONFIGURATION.partnershipEmail}</a>.</p></section>
      </div>
    </main>
  );
}
