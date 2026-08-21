import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "Informazioni sui cookie e sugli strumenti tecnici utilizzati da ImmigratiImprenditori.it.",
};

export default function CookiePage() {
  return (
    <main id="contenuto" className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
      <header className="max-w-3xl border-b border-black pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">
          Documenti legali · aggiornamento 21 agosto 2026
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-black sm:text-5xl">
          Cookie Policy
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-700">
          ImmigratiImprenditori.it utilizza soltanto strumenti tecnici necessari
          al funzionamento e alla sicurezza del servizio. Non sono attivi cookie
          di profilazione, advertising o analytics comportamentali.
        </p>
      </header>

      <div className="mt-10 max-w-3xl space-y-10 text-base leading-7 text-neutral-700">
        <section>
          <h2 className="text-2xl font-semibold text-black">1. Che cosa sono i cookie</h2>
          <p className="mt-4">
            I cookie sono piccole informazioni che un sito può memorizzare nel browser per
            consentire funzioni tecniche, ricordare una sessione o, in altri contesti,
            effettuare misurazioni e profilazione. Questa policy riguarda anche strumenti
            tecnici con funzione equivalente quando utilizzati dal sito.
          </p>
        </section>

        <section className="border-t border-black pt-8">
          <h2 className="text-2xl font-semibold text-black">2. Strumenti tecnici utilizzati</h2>
          <p className="mt-4">
            Il sito può utilizzare cookie tecnici e di sessione strettamente necessari per:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>autenticare redattori, amministratori e contributori autorizzati;</li>
            <li>mantenere e aggiornare in sicurezza una sessione Supabase Auth;</li>
            <li>proteggere le aree riservate e prevenire comportamenti anomali;</li>
            <li>garantire le funzioni richieste dall&apos;utente.</li>
          </ul>
          <p className="mt-3">
            Questi strumenti sono necessari alla fornitura del servizio richiesto e non sono
            utilizzati per creare profili pubblicitari.
          </p>
        </section>

        <section className="border-t border-black pt-8">
          <h2 className="text-2xl font-semibold text-black">3. Nessun cookie di profilazione</h2>
          <p className="mt-4">
            Alla data di aggiornamento non risultano integrati nel sito Google Analytics, pixel
            pubblicitari, sistemi di remarketing, Hotjar o altri strumenti di tracciamento
            comportamentale. Non sono inoltre caricati automaticamente embed social o video
            YouTube che richiedano cookie non tecnici.
          </p>
        </section>

        <section className="border-t border-black pt-8">
          <h2 className="text-2xl font-semibold text-black">4. Perché non compare un banner “Accetta tutto”</h2>
          <p className="mt-4">
            Le linee guida del Garante distinguono gli strumenti tecnici, necessari al servizio,
            dagli strumenti non tecnici che richiedono consenso preventivo. Poiché il sito utilizza
            soltanto strumenti tecnici, non viene mostrato un banner di consenso privo di una scelta
            reale da compiere.
          </p>
          <p className="mt-3">
            Gli strumenti non tecnici vengono attivati soltanto quando sono presenti le informazioni
            e i meccanismi di consenso richiesti dalla normativa applicabile.
          </p>
        </section>

        <section className="border-t border-black pt-8">
          <h2 className="text-2xl font-semibold text-black">5. Link e servizi esterni</h2>
          <p className="mt-4">
            Un normale link verso un sito esterno non comporta, di per sé, il caricamento sul
            nostro sito dei cookie del servizio esterno. Quando l&apos;utente segue il link, si
            applicano le regole e le informative del sito raggiunto.
          </p>
          <p className="mt-3">
            I contenuti incorporati che richiedono strumenti non tecnici sono pubblicati solo con
            soluzioni compatibili con gli obblighi di informazione e consenso applicabili.
          </p>
        </section>

        <section className="border-t border-black pt-8">
          <h2 className="text-2xl font-semibold text-black">6. Gestione dal browser</h2>
          <p className="mt-4">
            È possibile eliminare o bloccare i cookie dalle impostazioni del browser. Il blocco
            dei cookie tecnici può però impedire l&apos;accesso alle aree riservate o compromettere
            funzioni richieste dall&apos;utente.
          </p>
        </section>

        <section className="border-t border-black pt-8">
          <h2 className="text-2xl font-semibold text-black">7. Titolare e contatti</h2>
          <p className="mt-4">
            Il titolare è AIPEL. Per informazioni sui cookie:
            {" "}<a className="underline underline-offset-4" href="mailto:cookies@aipel.it">cookies@aipel.it</a>.
          </p>
          <p className="mt-3">
            Per il quadro completo dei trattamenti consulta la <Link href="/privacy" className="underline underline-offset-4">Privacy Policy</Link>.
          </p>
        </section>
      </div>
    </main>
  );
}
