import type { Metadata } from "next";
import Link from "next/link";
import { listPublications, publicationKindLabel } from "@/lib/data/public/publications";
import { absoluteUrl } from "@/lib/i18n/seo";
import { pageSocialMetadata } from "@/lib/seo/social-metadata";

const TITLE = "Pubblicazioni";
const DESCRIPTION =
  "Rapporti, studi e pubblicazioni verificati e pubblicati dal Centro Studi Immigrati Imprenditori.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/pubblicazioni" },
  ...pageSocialMetadata({
    title: TITLE,
    description: DESCRIPTION,
    pathname: "/pubblicazioni",
  }),
};

export default async function PubblicazioniPage() {
  const publications = await listPublications();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Pubblicazioni — Immigrati Imprenditori",
    url: absoluteUrl("/pubblicazioni"),
    isPartOf: {
      "@type": "WebSite",
      name: "Immigrati Imprenditori",
      url: absoluteUrl("/"),
    },
    hasPart: publications.map((item) => ({
      "@type": "Report",
      name: item.title,
      url: absoluteUrl(`/contenuti/${item.slug}`),
      datePublished: item.source_publication_date ?? item.published_at ?? undefined,
      author: item.authors.map((name) => ({ "@type": "Person", name })),
      publisher: item.publisher_name
        ? { "@type": "Organization", name: item.publisher_name }
        : undefined,
    })),
  };

  return (
    <main id="contenuto" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <header className="max-w-4xl border-b border-black pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">
          Centro Studi · Biblioteca
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-black sm:text-5xl">
          Pubblicazioni
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-700">
          Rapporti e studi già pubblicati e verificati dalla redazione. Ogni scheda conserva
          autori, fonte, data, metadati bibliografici e strumenti di citazione disponibili.
        </p>
      </header>

      <section className="mt-8 flex flex-wrap gap-4 border-b border-black pb-6 text-sm font-semibold">
        <Link href="/ricerca" className="underline underline-offset-4">Analisi e ricerche →</Link>
        <Link href="/fonti" className="underline underline-offset-4">Fonti →</Link>
        <Link href="/dati-e-fonti" className="underline underline-offset-4">Metodologia →</Link>
      </section>

      {publications.length > 0 ? (
        <section className="mt-8 grid gap-px border border-black bg-black md:grid-cols-2">
          {publications.map((item) => (
            <article key={item.id} className="bg-white p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                {publicationKindLabel(item.report_kind, item.type_code)}
                {item.source_publication_year ? ` · ${item.source_publication_year}` : ""}
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-black">
                <Link href={`/contenuti/${item.slug}`}>{item.title}</Link>
              </h2>
              {item.authors.length > 0 ? (
                <p className="mt-3 text-sm font-medium text-neutral-800">{item.authors.join(", ")}</p>
              ) : null}
              {item.publisher_name ? (
                <p className="mt-1 text-sm text-neutral-600">{item.publisher_name}</p>
              ) : null}
              {item.abstract ? (
                <p className="mt-4 text-sm leading-6 text-neutral-700">{item.abstract}</p>
              ) : null}
              <div className="mt-6 flex flex-wrap gap-4 text-sm font-semibold">
                <Link href={`/contenuti/${item.slug}`} className="underline underline-offset-4">
                  Apri la scheda →
                </Link>
                {item.document_url ? (
                  <a
                    href={item.document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-4"
                  >
                    Documento originale ↗
                  </a>
                ) : null}
              </div>
            </article>
          ))}
        </section>
      ) : (
        <p className="mt-8 text-base leading-7 text-neutral-700">
          Non risultano pubblicazioni che soddisfino attualmente i criteri editoriali pubblici.
        </p>
      )}
    </main>
  );
}
