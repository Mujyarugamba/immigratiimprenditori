import { PageFrame } from "@immigrati/ui-foundation";
import { centroStudiConfig } from "@immigrati/product-config";
import Link from "next/link";
import { listPublicEvents } from "@/lib/data/public/events";
import { listHomeIndicators } from "@/lib/data/public/observatory";
import { listPublicReports } from "@/lib/data/public/reports";
import { listPublicStories } from "@/lib/data/public/stories";
import { formatItalianDate, formatItalianDateTime } from "@/lib/public/labels";

const pillars = [
  {
    title: "Dati",
    text: "Indicatori, serie statistiche, territori e confronti per misurare l'imprenditoria migrante.",
    href: "/osservatorio",
  },
  {
    title: "Analisi",
    text: "Rapporti, ricerche, politiche e fonti per interpretare i fenomeni economici.",
    href: "/rapporti",
  },
  {
    title: "Voci",
    text: "Storie, interviste e testimonianze di chi fa impresa fuori dal proprio Paese d'origine.",
    href: "/storie",
  },
] as const;

export default async function HomePage() {
  const [indicatorResult, storyResult, reportResult, eventResult] = await Promise.allSettled([
    listHomeIndicators(1),
    listPublicStories(1),
    listPublicReports(1),
    listPublicEvents({}),
  ]);

  const indicator = indicatorResult.status === "fulfilled" ? indicatorResult.value[0] : undefined;
  const story = storyResult.status === "fulfilled" ? storyResult.value[0] : undefined;
  const report = reportResult.status === "fulfilled" ? reportResult.value[0] : undefined;
  const event = eventResult.status === "fulfilled" ? eventResult.value.items[0] : undefined;

  return (
    <PageFrame>
      <main id="contenuto" className="mx-auto max-w-5xl py-10 sm:py-14">
        <header className="grid gap-8 border-b-2 border-black pb-10 lg:grid-cols-[1.45fr_0.55fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">
              Osservatorio e Centro Studi AIPEL
            </p>
            <h1 className="mt-3 max-w-4xl text-5xl font-semibold tracking-[-0.035em] text-black sm:text-6xl">
              {centroStudiConfig.name}
            </h1>
            <p className="mt-5 max-w-3xl text-xl leading-8 text-black">
              Osservatorio sull&apos;imprenditoria migrante.
            </p>
            <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-700">
              Studiamo, misuriamo e raccontiamo le persone che fanno impresa fuori dal proprio
              Paese d&apos;origine e il contributo economico, sociale e culturale che producono nei
              territori in cui vivono e lavorano, in qualunque direzione geografica.
            </p>
          </div>
          <aside className="border-t border-black pt-5 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
              Partecipa
            </p>
            <h2 className="mt-2 text-xl font-semibold leading-snug text-black">
              Una storia, una ricerca o un evento possono entrare nell&apos;Osservatorio.
            </h2>
            <p className="mt-3 text-sm leading-6 text-neutral-700">
              Non serve registrarsi. La redazione verifica ogni proposta prima di qualsiasi pubblicazione.
            </p>
            <Link href="/contribuisci" className="mt-5 inline-block border border-black bg-black px-4 py-2.5 text-sm font-semibold text-white">
              Contribuisci
            </Link>
          </aside>
        </header>

        <section className="grid border-b border-black md:grid-cols-3" aria-labelledby="pilastri-heading">
          <h2 id="pilastri-heading" className="sr-only">Dati, Analisi e Voci</h2>
          {pillars.map((pillar, index) => (
            <article
              key={pillar.title}
              className={`py-8 md:px-6 ${index > 0 ? "border-t border-black md:border-l md:border-t-0" : ""} ${index === 0 ? "md:pl-0" : ""}`}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">0{index + 1}</p>
              <h3 className="mt-2 text-2xl font-semibold text-black">{pillar.title}</h3>
              <p className="mt-3 text-sm leading-6 text-neutral-700">{pillar.text}</p>
              <Link href={pillar.href} className="mt-5 inline-block text-sm font-semibold text-black underline underline-offset-4">
                Esplora
              </Link>
            </article>
          ))}
        </section>

        <section className="grid gap-8 border-b border-black py-10 lg:grid-cols-[0.7fr_1.3fr]" aria-labelledby="dato-heading">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">Dati</p>
            <h2 id="dato-heading" className="mt-2 text-2xl font-semibold tracking-tight text-black">Un indicatore, con la sua fonte.</h2>
          </div>
          {indicator ? (
            <article>
              <h3 className="text-3xl font-semibold leading-tight tracking-tight text-black">
                <Link href={`/osservatorio/${indicator.slug}`} className="hover:underline hover:underline-offset-4">{indicator.title}</Link>
              </h3>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-700">{indicator.description}</p>
              <Link href={`/osservatorio/${indicator.slug}`} className="mt-4 inline-block text-sm font-semibold text-black underline underline-offset-4">Consulta l&apos;indicatore</Link>
            </article>
          ) : (
            <p className="max-w-2xl text-sm leading-6 text-neutral-600">Il nucleo degli indicatori dell&apos;Osservatorio è in aggiornamento.</p>
          )}
        </section>

        <section className="grid gap-8 border-b border-black py-10 lg:grid-cols-[0.7fr_1.3fr]" aria-labelledby="voci-heading">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">Voci</p>
            <h2 id="voci-heading" className="mt-2 text-2xl font-semibold tracking-tight text-black">Le voci dell&apos;imprenditoria migrante.</h2>
          </div>
          {story ? (
            <article>
              <h3 className="text-3xl font-semibold leading-tight tracking-tight text-black">
                <Link href={`/contenuti/${story.slug}`} className="hover:underline hover:underline-offset-4">{story.title}</Link>
              </h3>
              {story.abstract ? <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-700">{story.abstract}</p> : null}
              <p className="mt-4 text-xs uppercase tracking-[0.12em] text-neutral-500">
                {story.published_at ? formatItalianDate(story.published_at) : "Storia / intervista"}
              </p>
            </article>
          ) : (
            <div>
              <p className="max-w-2xl text-sm leading-6 text-neutral-700">
                La redazione sta preparando le prime storie e interviste. Cerchiamo esperienze documentabili da ogni rotta migratoria imprenditoriale.
              </p>
              <Link href="/contribuisci" className="mt-4 inline-block text-sm font-semibold text-black underline underline-offset-4">Racconta una storia</Link>
            </div>
          )}
        </section>

        <section className="grid gap-8 border-b border-black py-10 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">Analisi</p>
            <h2 className="mt-2 text-2xl font-semibold text-black">Rapporti e ricerche</h2>
            {report ? (
              <article className="mt-5">
                <h3 className="text-xl font-semibold leading-snug text-black"><Link href={`/contenuti/${report.slug}`} className="hover:underline">{report.title}</Link></h3>
                {report.abstract ? <p className="mt-2 text-sm leading-6 text-neutral-700">{report.abstract}</p> : null}
              </article>
            ) : (
              <p className="mt-4 text-sm leading-6 text-neutral-600">La biblioteca di rapporti e ricerche è in costruzione.</p>
            )}
            <Link href="/rapporti" className="mt-5 inline-block text-sm font-semibold text-black underline underline-offset-4">Vai ai rapporti</Link>
          </div>

          <div className="border-t border-black pt-8 md:border-l md:border-t-0 md:pl-8 md:pt-0">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">Agenda</p>
            <h2 className="mt-2 text-2xl font-semibold text-black">Eventi</h2>
            {event ? (
              <article className="mt-5">
                <h3 className="text-xl font-semibold leading-snug text-black"><Link href={`/eventi/${event.id}`} className="hover:underline">{event.title}</Link></h3>
                {event.next_edition ? <p className="mt-2 text-sm text-neutral-600">{formatItalianDateTime(event.next_edition.starts_at)}</p> : null}
                {event.summary ? <p className="mt-2 text-sm leading-6 text-neutral-700">{event.summary}</p> : null}
              </article>
            ) : (
              <p className="mt-4 text-sm leading-6 text-neutral-600">Gli eventi qualificati saranno pubblicati dalla redazione quando pertinenti all&apos;imprenditoria migrante.</p>
            )}
            <Link href="/eventi" className="mt-5 inline-block text-sm font-semibold text-black underline underline-offset-4">Vai agli eventi</Link>
          </div>
        </section>

        <section className="grid gap-8 py-10 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">Metodo</p>
            <h2 className="mt-2 text-2xl font-semibold text-black">Fonti verificabili, limiti dichiarati.</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-700">
              Dati, analisi e testimonianze hanno nature diverse. L&apos;Osservatorio rende esplicita la provenienza dei materiali e distingue fonte primaria, interpretazione e contributo diretto.
            </p>
          </div>
          <Link href="/fonti" className="text-sm font-semibold text-black underline underline-offset-4">Fonti e metodologia</Link>
        </section>
      </main>
    </PageFrame>
  );
}
