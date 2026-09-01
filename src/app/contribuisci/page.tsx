import type { Metadata } from "next";
import Link from "next/link";
import { submitEditorialContributionAction } from "@/lib/editorial/submission-actions";

export const metadata: Metadata = {
  title: "Partecipa al Centro Studi",
  description: "Proponi storie, contributi di ricerca, interviste, eventi, pubblicazioni e altri materiali alla redazione di Immigrati Imprenditori.",
  alternates: { canonical: "/contribuisci" },
};

type Props = { searchParams: Promise<{ inviato?: string; errore?: string }> };

const participationPaths = [
  { title: "Racconta la tua storia d'impresa", audience: "Imprenditori e professionisti", text: "Condividi esperienza, percorso migratorio, attività, ostacoli, innovazione, crescita e relazioni tra Paesi." },
  { title: "Proponi un contributo di ricerca", audience: "Docenti, ricercatori, studiosi ed esperti", text: "Proponi un'analisi, una ricerca, un paper, dati, un commento scientifico, un'intervista o un altro contributo originale." },
  { title: "Segnala una ricerca, una pubblicazione o un evento", audience: "Università, enti, associazioni e istituzioni", text: "Porta all'attenzione della redazione studi, rapporti, dataset, eventi e materiali già pubblicati o disponibili." },
] as const;

export default async function ContribuisciPage({ searchParams }: Props) {
  const params = await searchParams;
  const sent = params.inviato === "1";
  const hasError = Boolean(params.errore);

  return (
    <main id="contenuto" className="preview-contribute-page">
      <section className="preview-contribute-hero">
        <div className="preview-contribute-motion" aria-hidden="true"><span>storie · dati · ricerca · fonti ·</span><span>storie · dati · ricerca · fonti ·</span></div>
        <div className="preview-contribute-hero-inner">
          <p className="contribute-kicker">Partecipazione editoriale</p>
          <h1>Contribuisci alla conoscenza.</h1>
          <p>Il Centro Studi raccoglie esperienze, ricerche, fonti e segnalazioni da imprenditori, studiosi, professionisti, università, associazioni e istituzioni. Ogni proposta viene valutata dalla redazione prima di qualsiasi pubblicazione.</p>
        </div>
      </section>

      <div className="preview-contribute-body">
        <section aria-labelledby="come-partecipare">
          <h2 id="come-partecipare" className="sr-only">Come puoi partecipare</h2>
          <div className="preview-participation-grid">
            {participationPaths.map((path) => <article key={path.title}><p className="audience">{path.audience}</p><h3>{path.title}</h3><p>{path.text}</p></article>)}
          </div>
        </section>

        {sent ? (
          <section className="preview-submit-status" role="status"><h2>Proposta ricevuta</h2><p>Grazie. Il materiale entra nella coda redazionale per la valutazione. La redazione utilizza i recapiti indicati se serve un approfondimento.</p><Link href="/">Torna al Centro Studi →</Link></section>
        ) : (
          <section className="preview-submit-shell">
            <h2>Proponi un contenuto</h2>
            <p className="preview-submit-note">Le proposte entrano nella Inbox redazionale privata. La redazione verifica le fonti, valuta la rilevanza e decide se approfondire il materiale. L'invio non comporta pubblicazione automatica. Per contatti editoriali: <a href="mailto:redazione@immigratiimprenditori.it">redazione@immigratiimprenditori.it</a>.</p>
            {hasError ? <div id="submission-form-error" className="preview-submit-status" role="alert">{params.errore === "campi" ? "Controlla i campi obbligatori, i limiti dei valori e la presa d'atto dell'informativa privacy." : "L'invio non è riuscito. Riprova tra poco."}</div> : null}

            <form id="modulo-partecipazione" action={submitEditorialContributionAction} aria-describedby={hasError ? "submission-form-error" : undefined} className="preview-form">
              <div hidden aria-hidden="true"><label>Sito web<input name="website" type="text" tabIndex={-1} autoComplete="off" /></label></div>

              <section className="preview-form-section">
                <div className="preview-form-section-intro"><h3>1. La proposta</h3><p>Seleziona la voce più vicina al tuo contributo. Puoi proporre un contenuto originale oppure segnalare materiale già esistente.</p></div>
                <div className="preview-form-fields">
                  <div className="preview-form-fields two">
                    <label>Tipo di proposta *<select name="submission_kind" required><option value="story">Racconta la tua storia d'impresa</option><option value="research">Proponi un contributo di ricerca</option><option value="interview">Proponi un'intervista</option><option value="event">Segnala un evento</option><option value="publication">Segnala una pubblicazione</option><option value="other">Video, dati o altro materiale</option></select></label>
                    <label>Titolo o oggetto<input name="title" maxLength={300} placeholder="Una breve descrizione" /></label>
                  </div>
                  <label>Testo della proposta *<textarea name="contribution_text" required maxLength={20000} rows={9} placeholder="Descrivi ciò che proponi o segnali, perché è rilevante e quali fonti o elementi possono aiutare la redazione a valutarlo." /></label>
                  <label>Link originale, video o pagina di riferimento<input name="original_url" type="url" maxLength={2048} placeholder="https://…" /></label>
                </div>
              </section>

              <section className="preview-form-section">
                <div className="preview-form-section-intro"><h3>2. Contesto geografico</h3><p>Indica i Paesi quando sono pertinenti alla storia, alla ricerca o alla segnalazione.</p></div>
                <div className="preview-form-fields two">
                  <label>Paese di origine<input name="origin_country_label" maxLength={160} placeholder="es. Italia, Marocco, India" /></label>
                  <label>Paese in cui opera / destinazione<input name="destination_country_label" maxLength={160} placeholder="es. Stati Uniti, Francia, Italia" /></label>
                </div>
              </section>

              <section className="preview-form-section">
                <div className="preview-form-section-intro"><h3>3. I tuoi recapiti</h3><p>Servono alla redazione solo per ricevere e, se necessario, approfondire la proposta.</p></div>
                <div className="preview-form-fields two">
                  <label>Nome e cognome *<input name="submitter_name" required maxLength={200} autoComplete="name" /></label>
                  <label>Email *<input name="submitter_email" required type="email" maxLength={320} autoComplete="email" /></label>
                  <label>Telefono<input name="submitter_phone" type="tel" maxLength={80} autoComplete="tel" /></label>
                  <label>Organizzazione / impresa / ente<input name="organization_name" maxLength={300} autoComplete="organization" /></label>
                </div>
              </section>

              <section className="preview-form-section">
                <div className="preview-form-section-intro"><h3>4. Privacy e autorizzazioni</h3><p>Nessuna proposta viene pubblicata automaticamente.</p></div>
                <div className="preview-form-checks">
                  <label><input name="consent_contact" type="checkbox" required /><span>Prendo atto che i recapiti indicati saranno trattati dalla redazione per ricevere, valutare e, se necessario, approfondire questa proposta. Ho letto la <Link href="/privacy">Privacy Policy</Link>. <strong>Obbligatorio.</strong></span></label>
                  <label><input name="consent_publication" type="checkbox" /><span>Autorizzo la possibile pubblicazione del materiale inviato, fermo restando il lavoro di verifica, selezione e cura della redazione. Per immagini, audio o video possono essere richieste ulteriori autorizzazioni. <strong>Facoltativo.</strong></span></label>
                </div>
              </section>

              <div className="preview-form-submit"><button type="submit">Invia alla redazione</button><p>L'invio di proposte è riservato a persone che hanno compiuto 18 anni. Non è necessario registrarsi. Chi collabora con continuità può richiedere un account contributore dedicato.</p></div>
            </form>
          </section>
        )}
      </div>
    </main>
  );
}
