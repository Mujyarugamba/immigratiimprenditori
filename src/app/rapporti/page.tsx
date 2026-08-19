import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import type { PublicContentListItem } from "@/lib/data/public/contents";
import { listPublicReports } from "@/lib/data/public/reports";
import { CONTENT_TYPES, formatItalianDate, label } from "@/lib/public/labels";

export const metadata: Metadata = {
  title: "Rapporti e ricerche",
  description:
    "Rapporti, ricerche, note dati e analisi sulle dinamiche dell'imprenditoria migrante.",
};

export default async function RapportiPage() {
  let reports: PublicContentListItem[] = [];
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
                <article key={report.id} className="grid gap-4 py-6 md:grid-cols-[180px_1fr]">
                  <div className="text-xs leading-5 text-neutral-500">
                    <p>{label(CONTENT_TYPES, report.type_code)}</p>
                    {report.published_at ? <p>{formatItalianDate(report.published_at)}</p> : null}
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
