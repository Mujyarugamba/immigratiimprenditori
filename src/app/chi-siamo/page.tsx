import type { Metadata } from "next";
import Link from "next/link";
import {
  hasCompleteInstitutionalDisclosure,
  INSTITUTIONAL_PROFILE,
} from "@/lib/institutional/profile";

export const metadata: Metadata = {
  title: "Chi siamo | Immigrati Imprenditori",
  description:
    "Immigrati Imprenditori è il Centro Studi promosso da AIPEL per studiare, misurare e raccontare l'imprenditoria migrante tra Paesi e territori.",
};

export default function ChiSiamoPage() {
  const profile = INSTITUTIONAL_PROFILE;
  const disclosureComplete = hasCompleteInstitutionalDisclosure();

  return (
    <main id="contenuto" className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
      <header className="max-w-3xl border-b border-black pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">
          {profile.projectName} · Centro Studi {profile.promoterShortName}
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-black sm:text-5xl">Chi siamo</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-neutral-700">
          ImmigratiImprenditori.it è il Centro Studi promosso da {profile.promoterShortName} per studiare,
          misurare e raccontare l&apos;imprenditoria migrante tra Paesi, territori e settori economici.
        </p>
      </header>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold tracking-tight text-black">Il progetto</h2>
        <div className="mt-4 max-w-3xl space-y-4 text-base leading-7 text-neutral-700">
          <p>
            Il progetto osserva l&apos;imprenditoria generata dalle migrazioni in qualunque
            direzione geografica. Non studia soltanto gli immigrati in Italia: considera
            anche imprenditori italiani all&apos;estero e, più in generale, le relazioni tra
            Paese d&apos;origine e Paese di destinazione.
          </p>
          <p>
            La sua identità editoriale si fonda su tre elementi complementari:
            <strong className="text-black"> dati, analisi e voci</strong>. Indicatori e
            statistiche vengono affiancati da rapporti, ricerche, storie, interviste e testimonianze.
          </p>
        </div>
      </section>

      <section className="mt-10 border-t border-black pt-8">
        <h2 className="text-2xl font-semibold tracking-tight text-black">Centro Studi e Osservatorio</h2>
        <div className="mt-4 max-w-3xl space-y-4 text-base leading-7 text-neutral-700">
          <p>
            {profile.promoterShortName} è l&apos;ente promotore e titolare del progetto Immigrati Imprenditori.
            Immigrati Imprenditori opera come <strong className="text-black">Centro Studi</strong>.
          </p>
          <p>
            L&apos;<strong className="text-black">Osservatorio</strong> è la sezione del Centro Studi
            dedicata a dati, indicatori, serie storiche, confronti territoriali e metodologia.
            Il progetto non viene presentato come testata giornalistica registrata.
          </p>
        </div>
      </section>

      <section className="mt-10 border-t border-black pt-8">
        <h2 className="text-2xl font-semibold tracking-tight text-black">Responsabilità e direzione</h2>
        <dl className="mt-5 grid max-w-3xl gap-x-8 gap-y-5 sm:grid-cols-[12rem_1fr]">
          <dt className="text-sm font-semibold text-black">Ente promotore</dt>
          <dd className="text-sm leading-6 text-neutral-700">{profile.promoterShortName}</dd>

          <dt className="text-sm font-semibold text-black">Presidente AIPEL</dt>
          <dd className="text-sm leading-6 text-neutral-700">{profile.president}</dd>

          <dt className="text-sm font-semibold text-black">Direzione editoriale</dt>
          <dd className="text-sm leading-6 text-neutral-700">{profile.editorialDirector}</dd>
        </dl>
      </section>

      <section className="mt-10 border-t border-black pt-8">
        <h2 className="text-2xl font-semibold tracking-tight text-black">Trasparenza istituzionale</h2>
        {disclosureComplete ? (
          <dl className="mt-5 grid max-w-3xl gap-x-8 gap-y-5 sm:grid-cols-[12rem_1fr]">
            <dt className="text-sm font-semibold text-black">Denominazione</dt>
            <dd className="text-sm leading-6 text-neutral-700">{profile.promoterLegalName}</dd>
            <dt className="text-sm font-semibold text-black">Sede</dt>
            <dd className="text-sm leading-6 text-neutral-700">{profile.registeredOffice}</dd>
            <dt className="text-sm font-semibold text-black">Dati amministrativi</dt>
            <dd className="text-sm leading-6 text-neutral-700">{profile.administrativeDisclosure}</dd>
          </dl>
        ) : (
          <div className="mt-5 border border-neutral-300 bg-neutral-50 p-5">
            <p className="text-sm font-semibold text-black">Scheda amministrativa in completamento</p>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-700">
              Denominazione legale estesa, sede e dati amministrativi verranno pubblicati soltanto dopo verifica documentale.
              Il sito non ricostruisce né deduce informazioni istituzionali mancanti da fonti informali.
            </p>
          </div>
        )}
      </section>

      <section className="mt-10 border-t border-black pt-8">
        <h2 className="text-2xl font-semibold tracking-tight text-black">Principi editoriali</h2>
        <div className="mt-4 max-w-3xl space-y-4 text-base leading-7 text-neutral-700">
          <p>
            La redazione distingue fatti, dati, interpretazioni e opinioni. Le fonti devono
            essere identificabili e ogni dato, quando pertinente, deve riportare origine,
            periodo, unità di misura, territorio e metodologia.
          </p>
          <p>
            Le proposte esterne non vengono pubblicate automaticamente. La redazione mantiene
            la responsabilità della verifica, della selezione e della pubblicazione dei contenuti.
          </p>
          <p>
            Sostegni, partnership e sponsorizzazioni non attribuiscono alcun diritto di intervento sulle scelte editoriali.
          </p>
        </div>
        <div className="mt-5 flex flex-wrap gap-5 text-sm font-semibold">
          <Link href="/politica-editoriale" className="underline underline-offset-4">Politica editoriale →</Link>
          <Link href="/fonti" className="underline underline-offset-4">Fonti e metodologia →</Link>
        </div>
      </section>

      <section className="mt-10 border-t border-black pt-8">
        <h2 className="text-2xl font-semibold tracking-tight text-black">Contatti</h2>
        <p className="mt-4 text-base leading-7 text-neutral-700">
          <a href={`mailto:${profile.contactEmail}`} className="break-all underline underline-offset-4">{profile.contactEmail}</a>
        </p>
      </section>
    </main>
  );
}
