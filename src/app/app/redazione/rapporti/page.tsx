import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { listEditorialReports } from "@/lib/data/editorial/reports";

export const metadata: Metadata = {
  title: "Rapporti e ricerche — Redazione",
};

const TYPE_LABELS: Record<string, string> = {
  research_report: "Rapporto / ricerca",
  data_note: "Nota dati",
  policy_brief: "Politiche e normative",
};

const PUBLICATION_LABELS: Record<string, string> = {
  unpublished: "Non pubblicato",
  published: "Pubblicato",
  withdrawn: "Ritirato",
};

export default async function RapportiRedazionePage() {
  const reports = await listEditorialReports();

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-black pb-4">
        <div>
          <p className="text-ink-muted text-xs font-semibold uppercase tracking-[0.14em]">
            Analisi
          </p>
          <h1 className="text-ink mt-2 text-2xl font-semibold tracking-tight">
            Rapporti e ricerche
          </h1>
          <p className="text-ink-muted mt-2 max-w-2xl text-sm leading-6">
            Rapporti AIPEL, dossier, ricerche selezionate, note dati e policy brief.
          </p>
        </div>
        <Button href="/app/redazione/contenuti/nuovo" size="sm">
          Nuovo rapporto o nota
        </Button>
      </div>

      {reports.length === 0 ? (
        <section className="py-10">
          <p className="text-ink-muted max-w-xl text-sm leading-6">
            Nessun rapporto o contenuto di ricerca è ancora classificato in questa sezione.
          </p>
          <Link href="/app/redazione/inbox" className="mt-4 inline-block text-sm font-medium underline underline-offset-4">
            Cerca proposte nella Inbox
          </Link>
        </section>
      ) : (
        <div className="mt-6 divide-y divide-neutral-300 border-y border-black">
          {reports.map((report) => (
            <article key={report.id} className="grid gap-3 py-5 md:grid-cols-[180px_1fr_120px] md:items-start">
              <div className="text-xs leading-5 text-neutral-500">
                <p>{TYPE_LABELS[report.type_code] ?? report.type_code}</p>
                <p>{PUBLICATION_LABELS[report.publication_status] ?? report.publication_status}</p>
                {report.is_featured ? <p className="font-semibold text-black">In evidenza</p> : null}
              </div>
              <div>
                <h2 className="text-lg font-semibold leading-snug text-black">{report.title}</h2>
                <p className="mt-1 text-xs text-neutral-500">/{report.slug}</p>
              </div>
              <div className="md:text-right">
                <Link href={`/app/redazione/contenuti/${report.id}`} className="text-sm font-medium underline underline-offset-4">
                  Modifica
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
