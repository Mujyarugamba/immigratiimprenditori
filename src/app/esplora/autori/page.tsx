import type { Metadata } from "next";
import Link from "next/link";
import { listPublicAuthorProfiles } from "@/lib/data/public/authors";

export const metadata: Metadata = {
  title: "Autori e contributori | Esplora",
  description:
    "Profili pubblici revisionati di autori e contributori del Centro Studi Immigrati Imprenditori.",
  alternates: { canonical: "/esplora/autori" },
};

export default async function AutoriPage() {
  const authors = await listPublicAuthorProfiles().catch(() => []);

  return (
    <main id="contenuto" className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:py-16">
      <header className="max-w-4xl border-b border-black pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">
          Esplora · Persone
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-black sm:text-5xl">
          Autori e contributori
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-700">
          Questa directory mostra soltanto identità revisionate e rese pubbliche dalla redazione.
          Ogni profilo può documentare biografia, affiliazione, ORCID, sito e contributi pubblicati.
        </p>
      </header>

      <div className="mt-8 divide-y divide-black border-y border-black">
        {authors.map((author) => (
          <article key={author.id} className="grid gap-2 py-5 sm:grid-cols-[1fr_auto] sm:items-baseline sm:gap-6">
            <div>
              <h2 className="text-lg font-semibold text-black">
                <Link href={`/autori/${author.slug}`} className="underline-offset-4 hover:underline">
                  {author.display_name}
                </Link>
              </h2>
              {author.affiliation ? (
                <p className="mt-1 text-sm text-neutral-600">{author.affiliation}</p>
              ) : null}
            </div>
            <Link href={`/autori/${author.slug}`} className="text-sm font-semibold underline underline-offset-4">
              Apri profilo →
            </Link>
          </article>
        ))}
        {authors.length === 0 ? (
          <p className="py-8 text-neutral-600">Nessun profilo autore pubblico revisionato.</p>
        ) : null}
      </div>
    </main>
  );
}
