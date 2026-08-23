import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Termini di utilizzo",
  description: "Termini di utilizzo di ImmigratiImprenditori.it, Centro Studi AIPEL.",
};

export default function TerminiPage() {
  return (
    <main id="contenuto" className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
      <header className="max-w-3xl border-b border-black pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">
          Documenti legali · aggiornamento 23 agosto 2026
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-black sm:text-5xl">
          Termini di utilizzo
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-700">
          Questi termini disciplinano l&apos;utilizzo di ImmigratiImprenditori.it e delle sue
          funzioni pubbliche e riservate.
        </p>
      </header>

      <div className="mt-10 max-w-3xl space-y-10 text-base leading-7 text-neutral-700">
        <section>
          <h2 className="text-2xl font-semibold text-black">1. Titolare del progetto</h2>
          <p className="mt-4">
            ImmigratiImprenditori.it è un progetto promosso da <strong className="text-black">Associazione degli Imprenditori e Liberi Professionisti Extracomunitari in Lombardia (AIPEL)</strong>.
          </p>
          <p className="mt-3">
            Sede: <strong className="text-black">Viale Molise n. 54, 20137 Milano (MI)</strong>. Codice fiscale: <strong className="text-black">97342380157</strong>. Partita IVA: <strong className="text-black">04222160964</strong>.
          </p>
          <p className="mt-3">
            PEC: <a className="underline underline-offset-4" href="mailto:direzione@pec.aipel.it">direzione@pec.aipel.it</a>. Contatto per informazioni sui termini: <a className="underline underline-offset-4" href="mailto:info@aipel.it">info@aipel.it</a>.
          </p>
        </section>

        <section className="border-t border-black pt-8">
          <h2 className="text-2xl font-semibold text-black">2. Natura del servizio</h2>
          <p className="mt-4">
            Immigrati Imprenditori opera come Centro Studi dedicato all&apos;imprenditoria migrante.
            L&apos;Osservatorio è la sezione dedicata a dati, indicatori, serie storiche e metodologia.
            Il sito offre inoltre analisi, rapporti, fonti, eventi, storie e interviste e mette a
            disposizione strumenti per inviare proposte alla redazione.
          </p>
          <p className="mt-3">
            Il progetto non è una testata giornalistica registrata.
          </p>
        </section>

        <section className="border-t border-black pt-8">
          <h2 className="text-2xl font-semibold text-black">3. Consultazione del sito e maggiore età</h2>
          <p className="mt-4">
            La consultazione dei contenuti pubblici non richiede un account. L&apos;utente si impegna
            a non utilizzare il sito per attività illecite, per compromettere sicurezza e
            disponibilità del servizio o per accedere senza autorizzazione ad aree, dati o account.
          </p>
          <p className="mt-3">
            L&apos;invio di proposte e l&apos;attivazione di account riservati sono destinati a persone che abbiano compiuto <strong className="text-black">18 anni</strong>.
          </p>
        </section>

        <section className="border-t border-black pt-8">
          <h2 className="text-2xl font-semibold text-black">4. Account e area riservata</h2>
          <p className="mt-4">
            Gli account sono destinati a soggetti autorizzati, come redattori, amministratori e
            contributori abituali. Le credenziali sono personali e non devono essere condivise.
          </p>
          <p className="mt-3">
            AIPEL può limitare o sospendere un account in caso di violazione di questi termini,
            rischio di sicurezza, abuso delle funzioni o cessazione del rapporto che giustificava
            l&apos;accesso, nel rispetto delle regole applicabili.
          </p>
        </section>

        <section className="border-t border-black pt-8">
          <h2 className="text-2xl font-semibold text-black">5. Proposte e contributi</h2>
          <p className="mt-4">
            L&apos;invio di una storia, intervista, ricerca, evento, pubblicazione o altro materiale
            non comporta alcun diritto alla pubblicazione. Ogni proposta entra nel workflow
            redazionale e può essere verificata, approfondita, modificata, archiviata o rifiutata.
          </p>
          <p className="mt-3">
            Chi invia materiale dichiara, per quanto di propria conoscenza, che le informazioni
            fornite sono corrette e che dispone dei diritti e delle autorizzazioni necessari per
            trasmettere testi, fotografie, video, audio, documenti o altri contenuti di terzi.
          </p>
          <p className="mt-3">
            L&apos;invio non trasferisce automaticamente ad AIPEL la proprietà intellettuale del
            materiale. Il mittente consente però alla redazione di riceverlo, conservarlo e
            riprodurlo internamente nella misura necessaria alla valutazione. Per la pubblicazione
            o per utilizzi ulteriori possono essere richieste autorizzazioni specifiche.
          </p>
        </section>

        <section className="border-t border-black pt-8">
          <h2 className="text-2xl font-semibold text-black">6. Regole sui materiali inviati</h2>
          <p className="mt-4">Non devono essere inviati materiali che:</p>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>violino diritti d&apos;autore, marchi, riservatezza o altri diritti di terzi;</li>
            <li>contengano dati personali di terzi non pertinenti o acquisiti illecitamente;</li>
            <li>siano diffamatori, fraudolenti, discriminatori o comunque illeciti;</li>
            <li>contengano malware, codice ostile o tentativi di compromettere il servizio;</li>
            <li>presentino come fatti informazioni consapevolmente false o manipolate.</li>
          </ul>
        </section>

        <section className="border-t border-black pt-8">
          <h2 className="text-2xl font-semibold text-black">7. Cura editoriale e correzioni</h2>
          <p className="mt-4">
            AIPEL mantiene la responsabilità delle decisioni editoriali. I contenuti possono essere
            aggiornati, corretti, integrati, ritirati o archiviati quando emergano nuovi elementi,
            errori, esigenze di tutela o ragioni editoriali documentate.
          </p>
        </section>

        <section className="border-t border-black pt-8">
          <h2 className="text-2xl font-semibold text-black">8. Proprietà intellettuale del sito</h2>
          <p className="mt-4">
            Salvo diversa indicazione, struttura editoriale, testi originali, grafica, database,
            elaborazioni e altri contenuti prodotti da AIPEL sono protetti dalla normativa applicabile.
            È consentita la citazione di brevi estratti con indicazione chiara della fonte e link alla
            pagina originale, nei limiti previsti dalla legge.
          </p>
          <p className="mt-3">
            Materiali di terzi restano soggetti ai diritti e alle licenze dei rispettivi titolari.
          </p>
        </section>

        <section className="border-t border-black pt-8">
          <h2 className="text-2xl font-semibold text-black">9. Dati, fonti e link esterni</h2>
          <p className="mt-4">
            Il Centro Studi indica, quando pertinenti, origine, periodo e metodologia dei dati utilizzati.
            La presenza di un link verso una fonte esterna non implica controllo permanente del
            contenuto esterno né approvazione di tutte le posizioni espresse dal relativo sito.
          </p>
          <p className="mt-3">
            Gli utenti devono verificare la fonte originale quando utilizzano informazioni per
            decisioni professionali, economiche o giuridiche.
          </p>
        </section>

        <section className="border-t border-black pt-8">
          <h2 className="text-2xl font-semibold text-black">10. Disponibilità e modifiche del servizio</h2>
          <p className="mt-4">
            AIPEL può modificare struttura, funzioni e contenuti del sito per esigenze editoriali,
            tecniche, di sicurezza o normative. Non è garantita la disponibilità ininterrotta del
            servizio, fermo restando l&apos;impegno a mantenere misure ragionevoli di continuità e sicurezza.
          </p>
        </section>

        <section className="border-t border-black pt-8">
          <h2 className="text-2xl font-semibold text-black">11. Responsabilità</h2>
          <p className="mt-4">
            Le informazioni sono pubblicate con finalità di studio, documentazione e informazione e
            non sostituiscono consulenze professionali individuali. Nulla in questi termini limita
            responsabilità che non possano essere escluse o limitate ai sensi della legge applicabile.
          </p>
        </section>

        <section className="border-t border-black pt-8">
          <h2 className="text-2xl font-semibold text-black">12. Privacy</h2>
          <p className="mt-4">
            Il trattamento dei dati personali è descritto nella <Link href="/privacy" className="underline underline-offset-4">Privacy Policy</Link> e nella <Link href="/cookie" className="underline underline-offset-4">Cookie Policy</Link>.
          </p>
        </section>

        <section className="border-t border-black pt-8">
          <h2 className="text-2xl font-semibold text-black">13. Legge applicabile e foro competente</h2>
          <p className="mt-4">
            I presenti termini sono regolati dalla <strong className="text-black">legge italiana</strong>. Per gli utenti che agiscono come consumatori restano fermi il foro del consumatore e ogni altra tutela inderogabile prevista dalla normativa applicabile.
          </p>
          <p className="mt-3">
            Per gli utenti che agiscono nell&apos;ambito della propria attività professionale, imprenditoriale o istituzionale, e salvo norme inderogabili diverse, è competente in via esclusiva il <strong className="text-black">Foro di Milano</strong>.
          </p>
        </section>

        <section className="border-t border-black pt-8">
          <h2 className="text-2xl font-semibold text-black">14. Aggiornamenti</h2>
          <p className="mt-4">
            I termini possono essere aggiornati quando cambiano il servizio o il quadro normativo.
            La versione corrente è identificata dalla data indicata in testa alla pagina.
          </p>
        </section>
      </div>
    </main>
  );
}
