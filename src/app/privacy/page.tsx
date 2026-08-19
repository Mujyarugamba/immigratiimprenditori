import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Informativa sul trattamento dei dati personali di Immigrati Imprenditori / AIPEL.",
};

const privacyEmail = "info@immigratiimprenditori.it";

export default function PrivacyPage() {
  return (
    <main id="contenuto" className="pb-16">
      <Container>
        <header className="border-b border-black py-10 sm:py-14">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">AIPEL · Immigrati Imprenditori</p>
          <h1 className="mt-3 max-w-4xl text-4xl font-semibold tracking-tight text-black sm:text-5xl">Informativa privacy</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-700">
            Informazioni sul trattamento dei dati personali effettuato nell&apos;ambito del sito, degli account e delle attività editoriali dell&apos;Osservatorio.
          </p>
          <p className="mt-4 text-sm text-neutral-500">Versione operativa v1 · ultimo aggiornamento 19 agosto 2026.</p>
        </header>

        <div className="divide-y divide-black">
          <section className="grid gap-8 py-10 lg:grid-cols-[0.7fr_1.3fr]">
            <h2 className="text-2xl font-semibold text-black">1. Titolare del trattamento</h2>
            <div className="space-y-3 text-sm leading-7 text-neutral-700">
              <p><strong className="text-black">AIPEL — Associazione degli Imprenditori e Liberi Professionisti Extracomunitari in Lombardia</strong>, associazione non riconosciuta.</p>
              <p>Sede legale: Viale Molise 54, 20137 Milano (MI), Italia.</p>
              <p>Codice fiscale: <span className="font-mono text-black">97342380157</span> · Partita IVA: <span className="font-mono text-black">04222160964</span>.</p>
              <p>
                Contatto per privacy e diritti degli interessati:{" "}
                <a href={`mailto:${privacyEmail}`} className="font-semibold text-black underline underline-offset-4">{privacyEmail}</a>.
              </p>
            </div>
          </section>

          <section className="grid gap-8 py-10 lg:grid-cols-[0.7fr_1.3fr]">
            <h2 className="text-2xl font-semibold text-black">2. Dati trattati</h2>
            <div className="space-y-5 text-sm leading-7 text-neutral-700">
              <div>
                <h3 className="font-semibold text-black">Navigazione e sicurezza</h3>
                <p className="mt-1">Dati tecnici necessari al funzionamento e alla sicurezza del servizio, come indirizzo IP, richieste HTTP, informazioni sul dispositivo/browser e log tecnici quando prodotti dall&apos;infrastruttura.</p>
              </div>
              <div>
                <h3 className="font-semibold text-black">Account e autenticazione</h3>
                <p className="mt-1">Identificativo dell&apos;utente di autenticazione, email usata per l&apos;accesso, stato dell&apos;account e, quando necessario, collegamento al profilo della persona e ai ruoli applicativi.</p>
              </div>
              <div>
                <h3 className="font-semibold text-black">Contribuisci</h3>
                <p className="mt-1">Tipo, titolo e testo della proposta; eventuale URL originale; Paesi di origine/destinazione indicati; nome e cognome, email, telefono facoltativo, organizzazione/impresa; consenso al contatto e consenso facoltativo alla possibile pubblicazione.</p>
              </div>
              <div>
                <h3 className="font-semibold text-black">Interviste e attività redazionale</h3>
                <p className="mt-1">Stato del contatto/intervista, date operative, stato delle autorizzazioni relative a pubblicazione, citazioni, immagini e video, oltre a note interne limitate a quanto necessario per il lavoro editoriale.</p>
              </div>
              <div>
                <h3 className="font-semibold text-black">Fonti pubbliche</h3>
                <p className="mt-1">La redazione può registrare dati professionali già resi pubblici per verificare un soggetto, una fonte o un possibile protagonista editoriale. Questi dati servono alla ricerca e alla verifica e non determinano pubblicazione automatica.</p>
              </div>
              <p>Non chiediamo di inserire categorie particolari di dati personali o informazioni non necessarie. Chi invia un contributo è invitato a evitare dati sensibili di terzi salvo che siano indispensabili e trattabili lecitamente.</p>
            </div>
          </section>

          <section className="grid gap-8 py-10 lg:grid-cols-[0.7fr_1.3fr]">
            <h2 className="text-2xl font-semibold text-black">3. Finalità e basi giuridiche</h2>
            <div className="space-y-5 text-sm leading-7 text-neutral-700">
              <p><strong className="text-black">Funzionamento, sicurezza e prevenzione degli abusi:</strong> interesse legittimo di AIPEL a mantenere il servizio sicuro e affidabile, art. 6, par. 1, lett. f) GDPR.</p>
              <p><strong className="text-black">Account richiesti o assegnati per collaborare:</strong> erogazione delle funzionalità richieste e gestione del rapporto con l&apos;utente, art. 6, par. 1, lett. b) GDPR; per attività strettamente organizzative può concorrere il legittimo interesse.</p>
              <p><strong className="text-black">Proposte inviate con “Contribuisci” e successivo contatto:</strong> consenso espresso al contatto e attività necessarie a valutare la proposta, art. 6, par. 1, lett. a) GDPR, oltre al legittimo interesse editoriale per verifiche, sicurezza e deduplica.</p>
              <p><strong className="text-black">Pubblicazione di materiali inviati, interviste, citazioni, immagini o video:</strong> consenso/autorizzazione dell&apos;interessato quando richiesta. Le autorizzazioni sono gestite separatamente per evitare che l&apos;accettazione di un&apos;intervista equivalga automaticamente al consenso per ogni formato.</p>
              <p><strong className="text-black">Ricerca editoriale su fonti pubbliche:</strong> legittimo interesse di AIPEL a svolgere attività di ricerca, verifica e documentazione coerenti con la finalità dell&apos;Osservatorio, art. 6, par. 1, lett. f) GDPR, con valutazione della pertinenza dei dati e dei diritti dell&apos;interessato.</p>
              <p><strong className="text-black">Obblighi di legge e tutela dei diritti:</strong> art. 6, par. 1, lett. c) GDPR quando il trattamento è necessario per un obbligo legale; legittimo interesse alla gestione e difesa di eventuali diritti e contestazioni quando applicabile.</p>
            </div>
          </section>

          <section className="grid gap-8 py-10 lg:grid-cols-[0.7fr_1.3fr]">
            <h2 className="text-2xl font-semibold text-black">4. Dati obbligatori e facoltativi</h2>
            <div className="space-y-4 text-sm leading-7 text-neutral-700">
              <p>Nel modulo “Contribuisci” sono necessari tipo di contributo, testo della proposta, nome, email e autorizzazione al contatto. Senza questi elementi non è possibile ricevere e gestire la proposta in modo affidabile.</p>
              <p>Telefono, organizzazione, titolo, link e contesto geografico sono facoltativi. Il consenso alla possibile pubblicazione è facoltativo: una proposta può essere inviata anche senza autorizzare la pubblicazione del materiale.</p>
            </div>
          </section>

          <section className="grid gap-8 py-10 lg:grid-cols-[0.7fr_1.3fr]">
            <h2 className="text-2xl font-semibold text-black">5. Destinatari e fornitori tecnici</h2>
            <div className="space-y-4 text-sm leading-7 text-neutral-700">
              <p>I dati possono essere trattati da persone autorizzate della redazione e dell&apos;organizzazione, nei limiti delle rispettive funzioni, e da fornitori tecnici necessari per hosting, database, autenticazione, sicurezza e invio di comunicazioni operative.</p>
              <p>I fornitori che trattano dati per conto di AIPEL devono essere gestiti secondo gli obblighi applicabili ai responsabili del trattamento. La configurazione definitiva dei fornitori, degli accordi e degli eventuali trasferimenti fuori dallo Spazio economico europeo viene verificata nel gate di lancio; ove si applichino trasferimenti extra-SEE, saranno utilizzati gli strumenti previsti dal Capo V del GDPR e questa informativa sarà aggiornata con le garanzie applicabili.</p>
              <p>I dati non vengono venduti a inserzionisti.</p>
            </div>
          </section>

          <section className="grid gap-8 py-10 lg:grid-cols-[0.7fr_1.3fr]">
            <h2 className="text-2xl font-semibold text-black">6. Conservazione</h2>
            <div className="space-y-4 text-sm leading-7 text-neutral-700">
              <p><strong className="text-black">Account:</strong> per la durata dell&apos;account e, dopo la chiusura, fino a 24 mesi per gestione operativa, sicurezza e contestazioni, salvo obblighi di legge o contenziosi che richiedano tempi diversi.</p>
              <p><strong className="text-black">Proposte non selezionate:</strong> fino a 24 mesi dall&apos;ultima attività editoriale sulla proposta; successivamente sono eliminate o rese anonime, salvo necessità documentate.</p>
              <p><strong className="text-black">Proposte selezionate e interviste:</strong> il contenuto editoriale può essere conservato nell&apos;archivio pubblico o interno del Centro Studi. I recapiti non più necessari sono riesaminati entro 24 mesi dall&apos;ultimo contatto operativo.</p>
              <p><strong className="text-black">Consensi e autorizzazioni editoriali:</strong> per la durata della pubblicazione e, dopo la rimozione, fino a 10 anni quando necessario a documentare l&apos;autorizzazione o tutelare diritti, salvo termini differenti imposti dalla legge o da un contenzioso.</p>
              <p><strong className="text-black">Log tecnici direttamente gestiti dal progetto:</strong> non oltre 90 giorni in condizioni ordinarie; un evento di sicurezza può richiedere conservazione ulteriore limitata al tempo necessario per accertamento e tutela.</p>
            </div>
          </section>

          <section className="grid gap-8 py-10 lg:grid-cols-[0.7fr_1.3fr]">
            <h2 className="text-2xl font-semibold text-black">7. Diritti dell&apos;interessato</h2>
            <div className="space-y-4 text-sm leading-7 text-neutral-700">
              <p>Nei casi previsti dal GDPR puoi chiedere accesso, rettifica, cancellazione, limitazione del trattamento, portabilità, oppure opporti al trattamento. Quando il trattamento si basa sul consenso puoi revocarlo in qualsiasi momento, senza pregiudicare la liceità del trattamento già svolto prima della revoca.</p>
              <p>
                Le richieste possono essere inviate a{" "}
                <a href={`mailto:${privacyEmail}`} className="font-semibold text-black underline underline-offset-4">{privacyEmail}</a>. La cancellazione dell&apos;account non è attualmente automatizzata dal sito: eventuali richieste di chiusura/cancellazione sono quindi gestite tramite questo contatto e valutate alla luce degli obblighi di conservazione applicabili.
              </p>
              <p>È inoltre possibile proporre reclamo al Garante per la protezione dei dati personali o all&apos;autorità di controllo competente.</p>
            </div>
          </section>

          <section className="grid gap-8 py-10 lg:grid-cols-[0.7fr_1.3fr]">
            <h2 className="text-2xl font-semibold text-black">8. Decisioni automatizzate e Radar</h2>
            <div className="space-y-4 text-sm leading-7 text-neutral-700">
              <p>Il sito non utilizza processi decisionali automatizzati che producano effetti giuridici o effetti analogamente significativi sulle persone.</p>
              <p>Il Radar editoriale può individuare fonti o materiali candidati alla verifica, ma non pubblica automaticamente: la valutazione e la decisione di pubblicare restano alla redazione.</p>
            </div>
          </section>

          <section className="grid gap-8 py-10 lg:grid-cols-[0.7fr_1.3fr]">
            <h2 className="text-2xl font-semibold text-black">9. Cookie e tecnologie analoghe</h2>
            <div className="space-y-4 text-sm leading-7 text-neutral-700">
              <p>Nel codice corrente del progetto non sono configurati cookie pubblicitari, profilazione commerciale o piattaforme di analytics marketing. L&apos;area autenticata può utilizzare cookie tecnici di sessione necessari a riconoscere l&apos;utente e mantenere l&apos;accesso.</p>
              <p>Se in futuro saranno introdotte tecnologie non strettamente necessarie, questa sezione e le eventuali modalità di consenso saranno aggiornate prima della loro attivazione.</p>
            </div>
          </section>

          <section className="grid gap-8 py-10 lg:grid-cols-[0.7fr_1.3fr]">
            <h2 className="text-2xl font-semibold text-black">10. Aggiornamenti</h2>
            <div className="space-y-4 text-sm leading-7 text-neutral-700">
              <p>Questa informativa viene aggiornata quando cambiano le finalità del trattamento, le funzionalità che raccolgono dati, i fornitori o gli assetti organizzativi rilevanti.</p>
              <p>
                Per l&apos;identità dell&apos;ente promotore e la governance editoriale vedi{" "}
                <Link href="/chi-siamo" className="font-semibold text-black underline underline-offset-4">Chi siamo</Link>.
              </p>
            </div>
          </section>
        </div>
      </Container>
    </main>
  );
}
