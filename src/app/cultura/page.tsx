import type { Metadata } from "next";
import Link from "next/link";
import { PublicEmpty } from "@/components/public/PublicEmpty";
import { PublicResultCard } from "@/components/public/PublicResultCard";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { VOICE_CONTENT_TYPES } from "@/lib/data/public/collections";
import {
  listCultureContents,
  listUpcomingCulturalEvents,
} from "@/lib/data/public/culture";
import {
  CONTENT_TYPES,
  EVENT_DELIVERY_MODES,
  formatItalianDateTime,
  label,
} from "@/lib/public/labels";

export const metadata: Metadata = {
  title: "Cultura e industrie creative | Immigrati Imprenditori",
  description:
    "Storie, eventi, analisi e industrie culturali e creative osservate dal Centro Studi attraverso migrazioni, diaspora, impresa e territori.",
  alternates: { canonical: "/cultura" },
};

const CREATIVE_FIELDS = [
  "Audiovisivo",
  "Editoria",
  "Musica",
  "Spettacolo dal vivo",
  "Design",
  "Moda",
  "Artigianato artistico",
  "Patrimonio e servizi culturali",
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
    <main id="contenuto">
      <Section>
        <Container className="max-w-5xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">
            Centro Studi · Cultura
          </p>
          <h1 className="mt-3 max-w-4xl text-4xl font-semibold tracking-tight text-black sm:text-5xl lg:text-6xl">
            Cultura e industrie creative
          </h1>
          <p className="mt-6 max-w-4xl text-lg leading-8 text-neutral-700">
            Uno spazio per osservare come migrazioni, diaspora e mobilità internazionale
            attraversano produzione culturale, creatività, impresa, lavoro e territori. Dati e
            ricerca vengono letti insieme a persone, eventi e reti transnazionali.
          </p>
          <nav aria-label="Sezioni Cultura" className="mt-7 flex flex-wrap gap-5 text-sm font-semibold">
            <a href="#storie" className="underline-offset-4 hover:underline">Storie e voci</a>
            <a href="#eventi" className="underline-offset-4 hover:underline">Eventi</a>
            <a href="#industrie-creative" className="underline-offset-4 hover:underline">Industrie creative</a>
            <a href="#analisi" className="underline-offset-4 hover:underline">Analisi</a>
          </nav>
        </Container>
      </Section>

      <Section className="border-y border-black py-0">
        <Container className="grid gap-px bg-black p-0 md:grid-cols-3">
          {[
            ["Persone e storie", "Percorsi creativi, diaspora, seconde generazioni e relazioni tra Paesi raccontati attraverso voci documentate."],
            ["Economia culturale", "Impresa, lavoro, filiere, produzione, distribuzione e mercati nelle industrie culturali e creative."],
            ["Territori e scambi", "Città, Paesi e reti transnazionali come luoghi in cui cultura e imprenditoria migrante si trasformano."],
          ].map(([title, description]) => (
            <article key={title} className="bg-white p-6 sm:p-8">
              <h2 className="text-xl font-semibold text-black">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-neutral-700">{description}</p>
            </article>
          ))}
        </Container>
      </Section>

      <Section id="storie">
        <Container>
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">Persone</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-black">Storie e voci</h2>
              <p className="mt-3 text-sm leading-6 text-neutral-700">
                Interviste, testimonianze e storie d'impresa che mostrano la dimensione umana della produzione culturale e creativa.
              </p>
            </div>
            <Link href="/storie" className="text-sm font-semibold underline-offset-4 hover:underline">Tutte le storie →</Link>
          </div>
          {stories.length === 0 ? (
            <PublicEmpty title="Nessuna storia culturale pubblicata in questa raccolta." />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {stories.map((item) => (
                <PublicResultCard
                  key={item.id}
                  href={`/contenuti/${item.slug}`}
                  title={item.title}
                  description={item.abstract}
                  badges={[label(CONTENT_TYPES, item.type_code)]}
                />
              ))}
            </div>
          )}
        </Container>
      </Section>

      <Section id="eventi" className="border-y border-black bg-white">
        <Container>
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">Agenda</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-black">Eventi culturali</h2>
              <p className="mt-3 text-sm leading-6 text-neutral-700">
                Appuntamenti pertinenti a cultura, industrie creative, diaspore e trasformazioni economiche e sociali.
              </p>
            </div>
            <Link href="/eventi?tipo=cultural" className="text-sm font-semibold underline-offset-4 hover:underline">Tutti gli eventi culturali →</Link>
          </div>
          {events.length === 0 ? (
            <PublicEmpty title="Nessun evento culturale futuro disponibile al momento." />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {events.map((item) => (
                <PublicResultCard
                  key={item.id}
                  href={`/eventi/${item.id}`}
                  title={item.title}
                  description={item.summary}
                  badges={[label(EVENT_DELIVERY_MODES, item.delivery_mode)]}
                  meta={item.next_edition ? [
                    formatItalianDateTime(item.next_edition.starts_at),
                    item.next_edition.city_text ?? undefined,
                  ].filter(Boolean) as string[] : undefined}
                />
              ))}
            </div>
          )}
        </Container>
      </Section>

      <Section id="industrie-creative">
        <Container className="grid gap-8 lg:grid-cols-[1fr_2fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">Economia</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-black">Industrie culturali e creative</h2>
            <p className="mt-4 text-base leading-7 text-neutral-700">
              Il Centro Studi segue la cultura anche come attività economica: filiere,
              professionalità, impresa, mercati e mobilità internazionale. Questi sono gli
              ambiti tematici iniziali.
            </p>
          </div>
          <div className="grid gap-px border border-black bg-black sm:grid-cols-2">
            {CREATIVE_FIELDS.map((field) => (
              <div key={field} className="bg-white px-6 py-5 font-semibold text-black">{field}</div>
            ))}
          </div>
        </Container>
      </Section>

      <Section id="analisi" className="border-y border-black bg-white">
        <Container>
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">Ricerca</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-black">Analisi e approfondimenti</h2>
              <p className="mt-3 text-sm leading-6 text-neutral-700">
                Studi, note, guide e altri contenuti per leggere la dimensione culturale dell'imprenditoria migrante con fonti e contesto.
              </p>
            </div>
            <Link href="/contenuti?categoria=culture" className="text-sm font-semibold underline-offset-4 hover:underline">Archivio Cultura →</Link>
          </div>
          {analysis.length === 0 ? (
            <PublicEmpty title="Nessuna analisi culturale disponibile in questa raccolta." />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {analysis.map((item) => (
                <PublicResultCard
                  key={item.id}
                  href={`/contenuti/${item.slug}`}
                  title={item.title}
                  description={item.abstract}
                  badges={[label(CONTENT_TYPES, item.type_code)]}
                />
              ))}
            </div>
          )}
        </Container>
      </Section>

      <Section>
        <Container>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">Collegamenti</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-black">Cultura dentro il Centro Studi</h2>
          <p className="mt-3 max-w-3xl text-base leading-7 text-neutral-700">
            Cultura non vive isolata: ogni tema può essere letto insieme a dati, territori,
            rotte e testimonianze del resto dell'Osservatorio.
          </p>
          <div className="mt-8 grid gap-px border border-black bg-black md:grid-cols-3">
            {CENTER_LINKS.map(([href, title, description]) => (
              <article key={href} className="flex flex-col bg-white p-6">
                <h3 className="text-xl font-semibold text-black">{title}</h3>
                <p className="mt-3 flex-1 text-sm leading-6 text-neutral-700">{description}</p>
                <Link href={href} className="mt-6 border-t border-neutral-300 pt-4 text-sm font-semibold">Esplora →</Link>
              </article>
            ))}
          </div>
          <div className="mt-10 border-t border-black pt-8">
            <h2 className="text-2xl font-semibold text-black">Segnala una storia, un evento o una ricerca</h2>
            <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-700">
              Le segnalazioni entrano nella Inbox redazionale e non vengono pubblicate automaticamente: la redazione verifica pertinenza, fonti e qualità.
            </p>
            <Link href="/contribuisci" className="mt-5 inline-block border border-black px-5 py-3 text-sm font-semibold">Contribuisci →</Link>
          </div>
        </Container>
      </Section>
    </main>
  );
}
