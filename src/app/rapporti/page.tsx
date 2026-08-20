import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { listPublicReports, type PublicReportListItem } from "@/lib/data/public/reports";
import { CONTENT_TYPES, label } from "@/lib/public/labels";

export const metadata: Metadata = {
  title: "Rapporti e ricerche",
  description:
    "Rapporti, ricerche, note dati e analisi sulle dinamiche dell'imprenditoria migrante.",
};

export default async function RapportiPage() {
  let reports: PublicReportListItem[] = [];
  try {
    reports = await listPublicReports();
  } catch {
    reports = [];
  }

  return (
    <main id="contenuto" className="pb-16">
      <Container>
        <header className="border-b border-black py-10 sm:py-14">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">
            Analisi · Immigrati Imprenditori
          </p>
          <h1 className="mt-3 max-w-4xl text-4xl font-semibold tracking-tight text-black sm:text-5xl">
            Rapporti e ricerche
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-700">
            Studi del Centro, ricerche accademiche, rapporti istituzionali e note dati
            selezionate per comprendere l&apos;imprenditoria migrante nei territori e tra Paesi.
          </p>
        </header>

        {reports.length === 0 ? (
          <section className="border-b border-black py-12">
            <p className="max-w-2xl text-base leading-7 text-neutral-700">
              La biblioteca è in costruzione. La redazione sta selezionando i primi
              rapporti e studi da catalogare e presentare.
            </p>
            <Link href="/contribuisci" className="mt-5 inline-block text-sm font-semibold underline underline-offset-4">
              Segnala una ricerca o pubblicazione
            </Link>
          </section>
        ) : (
          <section className="py-8">
            <div className="divide-y divide-neutral-300 border-y border-black">
              {reports.map((report) => (
                <article key={report.id} className="grid gap-5 py-7 md:grid-cols-[220px_1fr]">
                  <div className="space-y-2 text-xs leading-5 text-neutral-600">
                    <p className="font-semibold uppercase tracking-[0.12em] text-black">
                      {label(CONTENT_TYPES, report.type_code)}
                    </p>
                    {report.source_publication_year ? (
                      <p><span className="font-medium text-black">Anno:</span> {report.source_publication_year}</p>
                    ) : null}
                    {report.publisher_name ? (
                      <p><span className="font-medium text-black">Ente:</span> {report.publisher_name}</p>
                    ) : null}
                    {report.geographies.length > 0 ? (
                      <p><span className="font-medium text-black">Area:</span> {report.geographies.join(", ")}</p>
                    ) : null}
                    {report.is_featured ? <p className="font-semibold text-black">In evidenza</p> : null}
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold leading-snug tracking-tight text-black">
                      <Link href={`/contenuti/${report.slug}`} className="hover:underline hover:underline-offset-4">
                        {report.title}
                      </Link>
                    </h2>
                    {report.abstract ? (
                      <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-700">{report.abstract}</p>
                    ) : null}
                    {report.authors.length > 0 ? (
                      <p className="mt-3 text-xs leading-5 text-neutral-600">
                        <span className="font-medium text-black">Autore / curatore:</span> {report.authors.join(", ")}
                      </p>
                    ) : null}
                    {report.tags.length > 0 ? (
                      <p className="mt-2 text-xs leading-5 text-neutral-600">
                        <span className="font-medium text-black">Temi:</span> {report.tags.join(" · ")}
                      </p>
                    ) : null}
                    {report.document_url ? (
                      <a
                        href={report.document_url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-4 inline-block text-sm font-semibold text-black underline underline-offset-4"
                      >
                        Fonte originale ↗
                      </a>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <section className="border-y border-black py-10">
          <h2 className="text-xl font-semibold text-black">Hai pubblicato una ricerca pertinente?</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-700">
            Università, centri studi, istituzioni e ricercatori possono segnalarla alla redazione.
            La presenza in archivio dipende dalla pertinenza e dalla verifica delle fonti.
          </p>
          <Link href="/contribuisci" className="mt-5 inline-block border border-black px-4 py-2.5 text-sm font-semibold text-black">
            Segnala una ricerca
          </Link>
        </section>
      </Container>
    </main>
  );
}
