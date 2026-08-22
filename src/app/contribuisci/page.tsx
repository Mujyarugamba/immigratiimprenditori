import type { Metadata } from "next";
import Link from "next/link";
import { submitEditorialContributionAction } from "@/lib/editorial/submission-actions";

export const metadata: Metadata = {
  title: "Partecipa al Centro Studi",
  description:
    "Proponi storie, contributi di ricerca, interviste, eventi, pubblicazioni e altri materiali alla redazione di Immigrati Imprenditori.",
  alternates: { canonical: "/contribuisci" },
};

type Props = {
  searchParams: Promise<{
    inviato?: string;
    errore?: string;
  }>;
};

const participationPaths = [
  {
    title: "Racconta la tua storia d'impresa",
    audience: "Imprenditori e professionisti",
    text: "Condividi esperienza, percorso migratorio, attività, ostacoli, innovazione, crescita e relazioni tra Paesi.",
  },
  {
    title: "Proponi un contributo di ricerca",
    audience: "Docenti, ricercatori, studiosi ed esperti",
    text: "Proponi un'analisi, una ricerca, un paper, dati, un commento scientifico, un'intervista o un altro contributo originale.",
  },
  {
    title: "Segnala una ricerca, una pubblicazione o un evento",
    audience: "Università, enti, associazioni e istituzioni",
    text: "Porta all'attenzione della redazione studi, rapporti, dataset, eventi e materiali già pubblicati o disponibili.",
  },
] as const;

export default async function ContribuisciPage({ searchParams }: Props) {
  const params = await searchParams;
  const sent = params.inviato === "1";
  const hasError = Boolean(params.errore);

  return (
    <main id="contenuto" className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
      <header className="max-w-3xl border-b border-black pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">
          Immigrati Imprenditori · Partecipazione
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-black sm:text-5xl">
          Partecipa al Centro Studi
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-700">
          ImmigratiImprenditori.it raccoglie contributi, esperienze, ricerche e segnalazioni
          da imprenditori, ricercatori, docenti, studiosi, professionisti, associazioni e
          istituzioni. Ogni proposta viene valutata dalla redazione prima di qualsiasi pubblicazione.
        </p>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-neutral-600">
          Le proposte entrano nella Inbox redazionale privata. La redazione verifica le fonti,
          valuta la rilevanza e decide se approfondire il materiale. L&apos;invio non comporta
          pubblicazione automatica.
        </p>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">
          Per contatti editoriali: <a className="underline underline-offset-4" href="mailto:redazione@immigratiimprenditori.it">redazione@immigratiimprenditori.it</a>.
        </p>
      </header>

      <section className="py-10" aria-labelledby="come-partecipare">
        <h2 id="come-partecipare" className="text-2xl font-semibold tracking-tight text-black">
          Come puoi partecipare
        </h2>
        <div className="mt-6 grid gap-px border border-black bg-black md:grid-cols-3">
          {participationPaths.map((path) => (
            <article key={path.title} className="bg-white p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
                {path.audience}
              </p>
              <h3 className="mt-3 text-lg font-semibold leading-6 text-black">{path.title}</h3>
              <p className="mt-3 text-sm leading-6 text-neutral-700">{path.text}</p>
            </article>
          ))}
        </div>
      </section>

      {sent ? (
        <section className="border border-black p-5" role="status">
          <h2 className="text-lg font-semibold text-black">Proposta ricevuta</h2>
          <p className="mt-2 text-sm leading-6 text-neutral-700">
            Grazie. Il materiale entra nella coda redazionale per la valutazione.
            La redazione utilizza i recapiti indicati se serve un approfondimento.
          </p>
          <Link href="/" className="mt-4 inline-block text-sm font-medium text-black underline underline-offset-4">
            Torna al Centro Studi
          </Link>
        </section>
      ) : (
        <>
          {hasError ? (
            <div className="border border-black p-4 text-sm text-black" role="alert">
              {params.errore === "campi"
                ? "Controlla i campi obbligatori, i limiti dei valori e il consenso al ricontatto."
                : "L'invio non è riuscito. Riprova tra poco."}
            </div>
          ) : null}

          <form id="modulo-partecipazione" action={submitEditorialContributionAction} className="mt-10 space-y-10">
            <div className="sr-only" aria-hidden="true">
              <label>
                Sito web
                <input name="website" type="text" tabIndex={-1} autoComplete="off" />
              </label>
            </div>

            <section>
              <h2 className="text-xl font-semibold text-black">1. Che cosa vuoi proporre alla redazione?</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">
                Seleziona la voce più vicina al tuo contributo. Puoi usare lo stesso modulo sia per
                un contenuto originale sia per segnalare materiale già esistente.
              </p>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm font-medium text-black">
                  Tipo di proposta <span aria-hidden="true">*</span>
                  <select name="submission_kind" required className="border border-neutral-400 bg-white px-3 py-2.5 font-normal text-black">
                    <option value="story">Racconta la tua storia d&apos;impresa</option>
                    <option value="research">Proponi un contributo di ricerca</option>
                    <option value="interview">Proponi un&apos;intervista</option>
                    <option value="event">Segnala un evento</option>
                    <option value="publication">Segnala una pubblicazione</option>
                    <option value="other">Video, dati o altro materiale</option>
                  </select>
                </label>
                <label className="flex flex-col gap-2 text-sm font-medium text-black">
                  Titolo o oggetto
                  <input name="title" maxLength={300} className="border border-neutral-400 px-3 py-2.5 font-normal" placeholder="Una breve descrizione" />
                </label>
              </div>

              <label className="mt-5 flex flex-col gap-2 text-sm font-medium text-black">
                Testo della proposta <span aria-hidden="true">*</span>
                <textarea
                  name="contribution_text"
                  required
                  maxLength={20000}
                  rows={9}
                  className="border border-neutral-400 px-3 py-2.5 font-normal leading-6"
                  placeholder="Descrivi ciò che proponi o segnali, perché è rilevante e quali fonti o elementi possono aiutare la redazione a valutarlo."
                />
              </label>
              <label className="mt-5 flex flex-col gap-2 text-sm font-medium text-black">
                Link originale, video o pagina di riferimento
                <input name="original_url" type="url" maxLength={2048} className="border border-neutral-400 px-3 py-2.5 font-normal" placeholder="https://…" />
              </label>
            </section>

            <section className="border-t border-black pt-8">
              <h2 className="text-xl font-semibold text-black">2. Contesto geografico</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">
                Immigrati Imprenditori osserva l&apos;imprenditoria migrante in ogni direzione. Indica i Paesi quando sono pertinenti alla storia, alla ricerca o alla segnalazione.
              </p>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm font-medium text-black">
                  Paese di origine
                  <input name="origin_country_label" maxLength={160} className="border border-neutral-400 px-3 py-2.5 font-normal" placeholder="es. Italia, Marocco, India" />
                </label>
                <label className="flex flex-col gap-2 text-sm font-medium text-black">
                  Paese in cui opera / destinazione
                  <input name="destination_country_label" maxLength={160} className="border border-neutral-400 px-3 py-2.5 font-normal" placeholder="es. Stati Uniti, Francia, Italia" />
                </label>
              </div>
            </section>

            <section className="border-t border-black pt-8">
              <h2 className="text-xl font-semibold text-black">3. I tuoi recapiti</h2>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm font-medium text-black">
                  Nome e cognome <span aria-hidden="true">*</span>
                  <input name="submitter_name" required maxLength={200} autoComplete="name" className="border border-neutral-400 px-3 py-2.5 font-normal" />
                </label>
                <label className="flex flex-col gap-2 text-sm font-medium text-black">
                  Email <span aria-hidden="true">*</span>
                  <input name="submitter_email" required type="email" maxLength={320} autoComplete="email" className="border border-neutral-400 px-3 py-2.5 font-normal" />
                </label>
                <label className="flex flex-col gap-2 text-sm font-medium text-black">
                  Telefono
                  <input name="submitter_phone" type="tel" maxLength={80} autoComplete="tel" className="border border-neutral-400 px-3 py-2.5 font-normal" />
                </label>
                <label className="flex flex-col gap-2 text-sm font-medium text-black">
                  Organizzazione / impresa / ente
                  <input name="organization_name" maxLength={300} autoComplete="organization" className="border border-neutral-400 px-3 py-2.5 font-normal" />
                </label>
              </div>
            </section>

            <section className="border-t border-black pt-8">
              <h2 className="text-xl font-semibold text-black">4. Consensi</h2>
              <div className="mt-5 space-y-4 text-sm leading-6 text-neutral-700">
                <label className="flex items-start gap-3">
                  <input name="consent_contact" type="checkbox" required className="mt-1 size-4" />
                  <span>
                    Autorizzo la redazione a utilizzare i miei recapiti per contattarmi in relazione a questa proposta. <strong className="text-black">Obbligatorio.</strong>
                  </span>
                </label>
                <label className="flex items-start gap-3">
                  <input name="consent_publication" type="checkbox" className="mt-1 size-4" />
                  <span>
                    Autorizzo la possibile pubblicazione del materiale inviato, fermo restando il lavoro di verifica, selezione e cura della redazione. Per immagini, audio o video possono essere richieste ulteriori autorizzazioni.
                  </span>
                </label>
              </div>
            </section>

            <div className="border-t border-black pt-7">
              <button type="submit" className="border border-black bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-white hover:text-black">
                Invia alla redazione
              </button>
              <p className="mt-4 max-w-2xl text-xs leading-5 text-neutral-500">
                Non è necessario registrarsi. Chi collabora con continuità può richiedere un account contributore dedicato.
              </p>
            </div>
          </form>
        </>
      )}
    </main>
  );
}
