import type { Metadata } from "next";
import Link from "next/link";
import { submitEditorialContributionAction } from "@/lib/editorial/submission-actions";

export const metadata: Metadata = {
  title: "Contribuisci all'Osservatorio",
  description:
    "Proponi una storia, un'intervista, un evento, una ricerca o una pubblicazione alla redazione di Immigrati Imprenditori.",
};

type Props = {
  searchParams: Promise<{
    inviato?: string;
    errore?: string;
  }>;
};

export default async function ContribuisciPage({ searchParams }: Props) {
  const params = await searchParams;
  const sent = params.inviato === "1";
  const hasError = Boolean(params.errore);

  return (
    <main id="contenuto" className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
      <header className="max-w-3xl border-b border-black pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">
          Immigrati Imprenditori · Osservatorio
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-black sm:text-5xl">
          Contribuisci all&apos;Osservatorio
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-neutral-700">
          Conosci una storia che merita di essere raccontata? Hai pubblicato una
          ricerca, conosci un evento o vuoi proporre un&apos;intervista? Puoi
          segnalarlo alla redazione senza creare un account.
        </p>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-neutral-600">
          Ogni proposta entra nella nostra Inbox privata. La redazione la valuta,
          verifica le fonti e decide se approfondirla. L&apos;invio non comporta
          pubblicazione automatica.
        </p>
      </header>

      {sent ? (
        <section className="mt-8 border border-black p-5" role="status">
          <h2 className="text-lg font-semibold text-black">Proposta ricevuta</h2>
          <p className="mt-2 text-sm leading-6 text-neutral-700">
            Grazie. Il materiale è stato inviato alla redazione e verrà valutato.
            Se necessario ti contatteremo ai recapiti indicati.
          </p>
          <Link href="/" className="mt-4 inline-block text-sm font-medium text-black underline underline-offset-4">
            Torna all&apos;Osservatorio
          </Link>
        </section>
      ) : (
        <>
          {hasError ? (
            <div className="mt-8 border border-black p-4 text-sm text-black" role="alert">
              {params.errore === "campi"
                ? "Controlla i campi obbligatori, i limiti dei valori e il consenso al ricontatto."
                : "L'invio non è riuscito. Riprova tra poco."}
            </div>
          ) : null}

          <form action={submitEditorialContributionAction} className="mt-10 space-y-10">
            <div className="sr-only" aria-hidden="true">
              <label>
                Sito web
                <input name="website" type="text" tabIndex={-1} autoComplete="off" />
              </label>
            </div>

            <section>
              <h2 className="text-xl font-semibold text-black">1. Che cosa vuoi segnalarci?</h2>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm font-medium text-black">
                  Tipo di contributo <span aria-hidden="true">*</span>
                  <select name="submission_kind" required className="border border-neutral-400 bg-white px-3 py-2.5 font-normal text-black">
                    <option value="story">Racconta una storia</option>
                    <option value="interview">Proponi un&apos;intervista</option>
                    <option value="event">Segnala un evento</option>
                    <option value="research">Segnala una ricerca</option>
                    <option value="publication">Invia una pubblicazione</option>
                    <option value="other">Altro</option>
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
                  placeholder="Raccontaci ciò che ritieni importante. Per una storia puoi spiegare chi è la persona, dove opera, che attività svolge e perché pensi che meriti attenzione."
                />
              </label>
              <label className="mt-5 flex flex-col gap-2 text-sm font-medium text-black">
                Link originale o pagina di riferimento
                <input name="original_url" type="url" maxLength={2048} className="border border-neutral-400 px-3 py-2.5 font-normal" placeholder="https://…" />
              </label>
            </section>

            <section className="border-t border-black pt-8">
              <h2 className="text-xl font-semibold text-black">2. Contesto geografico</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">
                Immigrati Imprenditori osserva l&apos;imprenditoria migrante in ogni direzione. Indica i Paesi quando sono pertinenti alla storia o alla segnalazione.
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
                  Organizzazione / impresa
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
                    Autorizzo la possibile pubblicazione del materiale inviato, fermo restando il lavoro di verifica, selezione e cura della redazione. Potremo richiedere ulteriori autorizzazioni per immagini, audio o video.
                  </span>
                </label>
              </div>
            </section>

            <div className="border-t border-black pt-7">
              <button type="submit" className="border border-black bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-white hover:text-black">
                Invia alla redazione
              </button>
              <p className="mt-4 max-w-2xl text-xs leading-5 text-neutral-500">
                Non è necessario registrarsi. Se in futuro collaborerai con continuità, potrai richiedere un account contributore dedicato.
              </p>
            </div>
          </form>
        </>
      )}
    </main>
  );
}
