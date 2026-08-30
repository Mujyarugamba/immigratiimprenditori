import type { Metadata } from "next";
import Link from "next/link";
import { listPublicTimelineEntries, type TimelineEntry } from "@/lib/data/public/timeline";
import { pageSocialMetadata } from "@/lib/seo/social-metadata";

const TITLE = "Timeline";
const DESCRIPTION =
  "Cronologia integrata di dati, ricerche, storie ed eventi pubblici del Centro Studi Immigrati Imprenditori.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/timeline" },
  ...pageSocialMetadata({
    title: TITLE,
    description: DESCRIPTION,
    pathname: "/timeline",
  }),
};

const KIND_LABELS: Record<TimelineEntry["kind"], string> = {
  data: "Dato",
  research: "Ricerca",
  story: "Storia",
  event: "Evento",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("it-IT", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    timeZone: "UTC",
  }).format(new Date(value));
}

export default async function TimelinePage() {
  const entries = await listPublicTimelineEntries();

  return (
    <main id="contenuto" className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:py-16">
      <header className="max-w-4xl border-b border-black pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">
          Centro Studi · Cronologia
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-black sm:text-5xl">Timeline</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-700">
          Una cronologia unica che mette in relazione gli ultimi periodi osservati dagli indicatori,
          le pubblicazioni editoriali, le storie e gli eventi effettivamente pubblici.
        </p>
      </header>

      <div className="mt-8 flex flex-wrap gap-4 text-sm font-semibold">
        <Link href="/osservatorio" className="underline underline-offset-4">Osservatorio →</Link>
        <Link href="/ricerca" className="underline underline-offset-4">Ricerca →</Link>
        <Link href="/storie" className="underline underline-offset-4">Storie →</Link>
        <Link href="/eventi" className="underline underline-offset-4">Eventi →</Link>
      </div>

      <section className="mt-10 border-y border-black">
        {entries.map((entry) => (
          <article key={entry.id} className="grid gap-3 border-b border-neutral-300 py-6 last:border-b-0 sm:grid-cols-[9rem_minmax(0,1fr)]">
            <div>
              <time className="text-sm font-semibold text-black" dateTime={entry.date}>{formatDate(entry.date)}</time>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
                {KIND_LABELS[entry.kind]}
              </p>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-black">
                <Link href={entry.href} className="underline-offset-4 hover:underline">{entry.title}</Link>
              </h2>
              {entry.context ? <p className="mt-2 text-xs font-medium uppercase tracking-[0.1em] text-neutral-500">{entry.context}</p> : null}
              {entry.description ? <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-700">{entry.description}</p> : null}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
