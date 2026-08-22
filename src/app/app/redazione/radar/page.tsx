import type { Metadata } from "next";
import Link from "next/link";
import { getRadarOverview } from "@/lib/data/editorial/radar";

export const metadata: Metadata = {
  title: "Radar — Redazione",
};

const BAND_LABELS: Record<string, string> = {
  lombardy: "Lombardia",
  italy: "Italia",
  italians_abroad: "Italiani all'estero",
  europe_migrant_entrepreneurship: "Europa",
  rest_of_world: "Resto del mondo",
  "Non classificato": "Non classificato",
};

const STATUS_LABELS: Record<string, string> = {
  new: "Nuovo",
  to_review: "Da valutare",
  needs_research: "Da approfondire",
  assigned: "Assegnato",
  draft_created: "Bozza creata",
  rejected: "Scartato",
  archived: "Archiviato",
};

export default async function RadarPage() {
  const radar = await getRadarOverview();

  return (
    <div>
      <header>
        <p className="text-ink-muted text-xs font-semibold uppercase tracking-[0.14em]">
          Intelligence editoriale
        </p>
        <h1 className="text-ink mt-2 text-2xl font-semibold tracking-tight">
          Radar
        </h1>
        <p className="text-ink-muted mt-2 max-w-2xl text-sm leading-6">
          Segnali raccolti automaticamente dalle fonti monitorate. Il Radar alimenta
          soltanto la Inbox: non crea né pubblica contenuti in autonomia.
        </p>
      </header>

      <section className="mt-6 grid gap-px border border-ink bg-ink sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Totale Radar", radar.total],
          ["Nuovi", radar.newCount],
          ["Da valutare", radar.reviewCount],
          ["Da approfondire", radar.researchCount],
        ].map(([label, value]) => (
          <div key={String(label)} className="bg-surface p-5">
            <p className="text-ink-muted text-xs uppercase tracking-[0.12em]">{label}</p>
            <strong className="text-ink mt-2 block text-3xl">{value}</strong>
          </div>
        ))}
      </section>

      <section className="mt-8 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="text-ink border-line border-b pb-3 text-lg font-semibold">
            Fonti negli ultimi arrivi
          </h2>
          <div className="divide-line divide-y">
            {radar.sourceCounts.map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-4 py-3 text-sm">
                <span className="text-ink">{item.label}</span>
                <strong className="text-ink">{item.count}</strong>
              </div>
            ))}
            {radar.sourceCounts.length === 0 ? (
              <p className="text-ink-muted py-5 text-sm">Nessun arrivo Radar disponibile.</p>
            ) : null}
          </div>
        </div>

        <div>
          <h2 className="text-ink border-line border-b pb-3 text-lg font-semibold">
            Copertura geografica
          </h2>
          <div className="divide-line divide-y">
            {radar.bandCounts.map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-4 py-3 text-sm">
                <span className="text-ink">{BAND_LABELS[item.label] ?? item.label}</span>
                <strong className="text-ink">{item.count}</strong>
              </div>
            ))}
            {radar.bandCounts.length === 0 ? (
              <p className="text-ink-muted py-5 text-sm">Nessuna classificazione disponibile.</p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mt-10">
        <div className="border-line flex flex-wrap items-end justify-between gap-3 border-b pb-3">
          <div>
            <h2 className="text-ink text-lg font-semibold">Ultimi segnali</h2>
            <p className="text-ink-muted mt-1 text-sm">
              Fino a 60 arrivi recenti, ordinati per acquisizione.
            </p>
          </div>
          <Link className="text-ink text-sm font-semibold underline underline-offset-2" href="/app/redazione/inbox?origine=radar">
            Apri tutti nella Inbox →
          </Link>
        </div>

        <div className="divide-line divide-y">
          {radar.recent.map((item) => (
            <article key={item.id} className="grid gap-2 py-4 md:grid-cols-[1fr_auto] md:items-start">
              <div>
                <p className="text-ink-muted text-xs uppercase tracking-[0.1em]">
                  {item.source_label ?? "Fonte non indicata"}
                  {item.relevance_band ? ` · ${BAND_LABELS[item.relevance_band] ?? item.relevance_band}` : ""}
                </p>
                <h3 className="text-ink mt-1 font-semibold">
                  <Link className="underline-offset-2 hover:underline" href={`/app/redazione/inbox/${item.id}`}>
                    {item.title}
                  </Link>
                </h3>
                <p className="text-ink-muted mt-1 text-xs">
                  {new Intl.DateTimeFormat("it-IT", { dateStyle: "short", timeStyle: "short" }).format(new Date(item.received_at))}
                  {` · priorità ${item.priority}`}
                </p>
              </div>
              <span className="text-ink-muted text-xs font-medium">
                {STATUS_LABELS[item.status] ?? item.status}
              </span>
            </article>
          ))}
          {radar.recent.length === 0 ? (
            <p className="text-ink-muted py-8 text-sm">Il Radar non ha ancora prodotto arrivi.</p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
