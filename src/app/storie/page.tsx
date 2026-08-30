import type { Metadata } from "next";
import Link from "next/link";
import { listPublishedContentsByTypes, VOICE_CONTENT_TYPES } from "@/lib/data/public/collections";
import { pageSocialMetadata } from "@/lib/seo/social-metadata";

const TITLE = "Storie e voci | Immigrati Imprenditori";
const DESCRIPTION = "Storie d'impresa, interviste, testimonianze e contenuti audiovisivi pubblicati dal Centro Studi.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/storie" },
  ...pageSocialMetadata({
    title: TITLE,
    description: DESCRIPTION,
    pathname: "/storie",
  }),
};

function formatDate(value: string | null) {
  if (!value) return "";
  return new Intl.DateTimeFormat("it-IT", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

export default async function StoriePage() {
  const items = await listPublishedContentsByTypes(VOICE_CONTENT_TYPES);

  return (
    <main id="contenuto" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
      <header className="max-w-4xl border-b border-black pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">Centro Studi · Persone</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-black sm:text-5xl">Storie e voci</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-700">
          Storie d&apos;impresa, interviste e testimonianze affiancano i dati per documentare percorsi, ostacoli,
          innovazione, fallimenti, crescita, relazioni tra Paesi e trasformazioni dei territori.
        </p>
      </header>

      <div className="mt-8 grid gap-px border border-black bg-black md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <article key={item.id} className="flex min-h-72 flex-col bg-white p-6">
            <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">{item.type_code.replaceAll("_", " ")}</p>
            <h2 className="mt-2 text-xl font-semibold leading-7 text-black">
              <Link href={`/contenuti/${item.slug}`} className="underline-offset-4 hover:underline">{item.title}</Link>
            </h2>
            {item.abstract ? <p className="mt-4 flex-1 text-sm leading-6 text-neutral-700">{item.abstract}</p> : <div className="flex-1" />}
            <div className="mt-6 flex items-center justify-between gap-4 border-t border-neutral-300 pt-4 text-xs text-neutral-600">
              <span>{formatDate(item.published_at)}</span>
              <Link href={`/contenuti/${item.slug}`} className="font-semibold text-black">Apri →</Link>
            </div>
          </article>
        ))}
        {items.length === 0 ? <p className="bg-white p-8 text-neutral-600">Nessuna storia o intervista disponibile in questa raccolta.</p> : null}
      </div>

      <section className="mt-10 border-t border-black pt-8">
        <h2 className="text-2xl font-semibold text-black">Vuoi proporre una storia o un&apos;intervista?</h2>
        <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-700">
          Le proposte entrano nella Inbox redazionale privata e vengono valutate prima di qualsiasi pubblicazione.
        </p>
        <Link href="/contribuisci" className="mt-5 inline-block border border-black px-5 py-3 text-sm font-semibold">Partecipa →</Link>
      </section>
    </main>
  );
}
