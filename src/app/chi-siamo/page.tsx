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

const manifestoWords = ["Studiamo", "Misuriamo", "Raccontiamo", "Documentiamo"];

export default function ChiSiamoPage() {
  const profile = INSTITUTIONAL_PROFILE;
  const disclosureComplete = hasCompleteInstitutionalDisclosure();

  return (
    <main id="contenuto" className="preview-manifest-page">
      <header className="preview-manifest-hero">
        <div className="preview-manifest-motion" aria-hidden="true">
          {[...manifestoWords, ...manifestoWords].map((word, index) => (
            <span key={`${word}-${index}`}>{word}</span>
          ))}
        </div>
        <div className="preview-manifest-hero-inner">
          <p className="manifest-kicker">
            {profile.projectName} · Centro Studi {profile.promoterShortName}
          </p>
          <h1>Chi siamo</h1>
          <p className="manifest-intro">
            ImmigratiImprenditori.it è il Centro Studi promosso da {profile.promoterShortName} per studiare,
            misurare e raccontare l&apos;imprenditoria migrante tra Paesi, territori e settori economici.
          </p>
        </div>
      </header>

      <div className="preview-manifest-body">
        <section>
          <h2>Il progetto</h2>
          <div className="manifest-copy space-y-4">
            <p>
              Il progetto osserva l&apos;imprenditoria generata dalle migrazioni in qualunque
              direzione geografica. Non studia soltanto gli immigrati in Italia: considera
              anche imprenditori italiani all&apos;estero e, più in generale, le relazioni tra
              Paese d&apos;origine e Paese di destinazione.
            </p>
            <p>
              La sua identità editoriale si fonda su tre elementi complementari:
              <strong> dati, analisi e voci</strong>. Indicatori e statistiche vengono affiancati
              da rapporti, ricerche, storie, interviste e testimonianze.
            </p>
          </div>
        </section>

        <section>
          <h2>Centro Studi e Osservatorio</h2>
          <div className="manifest-copy space-y-4">
            <p>
              {profile.promoterShortName} è l&apos;ente promotore e titolare del progetto Immigrati Imprenditori.
              Immigrati Imprenditori opera come <strong>Centro Studi</strong>.
            </p>
            <p>
              L&apos;<strong>Osservatorio</strong> è la sezione del Centro Studi dedicata a dati,
              indicatori, serie storiche, confronti territoriali e metodologia. Il progetto non
              viene presentato come testata giornalistica registrata.
            </p>
          </div>
        </section>

        <section>
          <h2>Responsabilità e direzione</h2>
          <div className="manifest-copy">
            <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-[12rem_1fr]">
              <dt className="text-sm font-semibold text-black">Ente promotore</dt>
              <dd className="text-sm leading-6 text-neutral-700">{profile.promoterShortName}</dd>
              <dt className="text-sm font-semibold text-black">Presidente AIPEL</dt>
              <dd className="text-sm leading-6 text-neutral-700">{profile.president}</dd>
              <dt className="text-sm font-semibold text-black">Direzione editoriale</dt>
              <dd className="text-sm leading-6 text-neutral-700">{profile.editorialDirector}</dd>
            </dl>
          </div>
        </section>

        <section>
          <h2>Trasparenza istituzionale</h2>
          <div className="manifest-copy">
            {disclosureComplete ? (
              <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-[12rem_1fr]">
                <dt className="text-sm font-semibold text-black">Denominazione</dt>
                <dd className="text-sm leading-6 text-neutral-700">{profile.promoterLegalName}</dd>
                <dt className="text-sm font-semibold text-black">Sede</dt>
                <dd className="text-sm leading-6 text-neutral-700">{profile.registeredOffice}</dd>
                <dt className="text-sm font-semibold text-black">Dati amministrativi</dt>
                <dd className="text-sm leading-6 text-neutral-700">{profile.administrativeDisclosure}</dd>
              </dl>
            ) : (
              <div className="preview-manifest-disclosure">
                <p className="text-sm font-semibold text-black">Scheda amministrativa in completamento</p>
                <p className="mt-2 text-sm leading-6 text-neutral-700">
                  Denominazione legale estesa, sede e dati amministrativi verranno pubblicati soltanto dopo verifica documentale.
                  Il sito non ricostruisce né deduce informazioni istituzionali mancanti da fonti informali.
                </p>
              </div>
            )}
          </div>
        </section>

        <section>
          <h2>Principi editoriali</h2>
          <div className="manifest-copy space-y-4">
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
            <div className="manifest-links flex flex-wrap gap-5 text-sm font-semibold">
              <Link href="/politica-editoriale">Politica editoriale →</Link>
              <Link href="/fonti">Fonti e metodologia →</Link>
            </div>
          </div>
        </section>

        <section>
          <h2>Contatti</h2>
          <div className="manifest-copy">
            <a href={`mailto:${profile.contactEmail}`} className="break-all border-b border-current pb-1">
              {profile.contactEmail}
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
