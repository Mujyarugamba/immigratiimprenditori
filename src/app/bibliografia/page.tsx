import type { Metadata } from "next";
import Link from "next/link";
import { listPublications, publicationKindLabel } from "@/lib/data/public/publications";
import {
  bibliographyCitation,
  bibliographyStructuredData,
} from "@/lib/seo/bibliography-structured-data";
import { pageSocialMetadata } from "@/lib/seo/social-metadata";

const TITLE = "Bibliografia scientifica";
const DESCRIPTION =
  "Riferimenti bibliografici delle pubblicazioni utilizzate o pubblicate dal Centro Studi Immigrati Imprenditori.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/bibliografia" },
  ...pageSocialMetadata({
    title: TITLE,
    description: DESCRIPTION,
    pathname: "/bibliografia",
  }),
};

export default async function BibliografiaPage() {
  const publications = await listPublications();
  const structuredData = bibliographyStructuredData(publications);

  return (
    <main id="contenuto" className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <header className="max-w-4xl border-b border-black pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">
          Centro Studi · Biblioteca
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-black sm:text-5xl">
          Bibliografia scientifica
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-700">
          Riferimenti delle pubblicazioni già presenti nell&apos;archivio pubblico del Centro Studi.
          La bibliografia non anticipa titoli o collane non ancora pubblicati.
        </p>
      </header>

      {publications.length > 0 ? (
        <ol className="mt-8 divide-y divide-neutral-300 border-y border-black">
          {publications.map((item) => (
            <li key={item.id} className="py-6">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
                {publicationKindLabel(item.report_kind, item.type_code)}
              </p>
              <p className="mt-2 text-base leading-7 text-neutral-800">
                {bibliographyCitation(item)}
              </p>
              <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold">
                <Link href={`/contenuti/${item.slug}`} className="underline underline-offset-4">
                  Scheda →
                </Link>
                <a href={`/contenuti/${item.slug}/citation.bib`} className="underline underline-offset-4">
                  BibTeX →
                </a>
                <a href={`/contenuti/${item.slug}/citation.ris`} className="underline underline-offset-4">
                  RIS →
                </a>
                {item.document_url ? (
                  <a href={item.document_url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
                    Fonte originale ↗
                  </a>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-8 text-base leading-7 text-neutral-700">
          Non risultano riferimenti bibliografici pubblici che soddisfino i criteri editoriali.
        </p>
      )}

      <div className="mt-8 flex flex-wrap gap-5 text-sm font-semibold">
        <Link href="/pubblicazioni" className="underline underline-offset-4">Pubblicazioni →</Link>
        <Link href="/fonti" className="underline underline-offset-4">Fonti statistiche →</Link>
      </div>
    </main>
  );
}
