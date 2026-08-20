import type { Metadata } from "next";
import Link from "next/link";
import { getRadarDashboardSummary } from "@/lib/data/editorial/radar";
import { runRadarAction } from "./actions";

export const metadata: Metadata = { title: "Radar mondiale · Redazione" };

type PageProps = {
  searchParams: Promise<{
    mode?: string;
    fetched?: string;
    normalized?: string;
    duplicates?: string;
    fresh?: string;
    selected?: string;
    capped?: string;
    inserted?: string;
    error?: string;
  }>;
};

function numberParam(value: string | undefined): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("it-IT", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export default async function RadarPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const summary = await getRadarDashboardSummary().catch(() => ({ total: 0, newItems: 0, recent: [] }));
  const hasRun = Boolean(params.mode);

  return (
    <div>
      <p className="text-ink-muted text-xs font-semibold uppercase tracking-[0.14em]">Intelligence editoriale</p>
      <h1 className="text-ink mt-2 text-2xl font-semibold tracking-tight">Radar mondiale</h1>
      <p className="text-ink-muted mt-2 max-w-2xl text-sm leading-6">
        Il Radar cerca candidati esterni e li porta esclusivamente nella Inbox. Nessun risultato viene pubblicato automaticamente. In sviluppo puoi prima eseguire una simulazione e poi importare al massimo 50 nuovi candidati per volta.
      </p>

      {params.error === "run" ? (
        <p className="mt-5 border border-black px-4 py-3 text-sm" role="alert">Il Radar non ha completato la ricerca. Nessun candidato parziale viene considerato pubblicato.</p>
      ) : null}

      {hasRun ? (
        <section className="mt-6 border-y border-black py-5" aria-labelledby="ultimo-run">
          <h2 id="ultimo-run" className="text-base font-semibold text-black">Ultima esecuzione</h2>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            <div><p className="text-neutral-500">Recuperati</p><p className="mt-1 text-xl font-semibold">{numberParam(params.fetched)}</p></div>
            <div><p className="text-neutral-500">Nuovi</p><p className="mt-1 text-xl font-semibold">{numberParam(params.fresh)}</p></div>
            <div><p className="text-neutral-500">Duplicati</p><p className="mt-1 text-xl font-semibold">{numberParam(params.duplicates)}</p></div>
            <div><p className="text-neutral-500">Inseriti</p><p className="mt-1 text-xl font-semibold">{numberParam(params.inserted)}</p></div>
          </div>
          <p className="mt-3 text-xs text-neutral-500">
            Modalità: {params.mode === "write" ? "importazione" : "simulazione"}. Se i candidati superano il limite, {numberParam(params.capped)} restano fuori da questa esecuzione.
          </p>
        </section>
      ) : null}

      <section className="mt-8 grid gap-4 md:grid-cols-2" aria-label="Comandi Radar">
        <form action={runRadarAction} className="border border-neutral-300 p-5">
          <input type="hidden" name="mode" value="preview" />
          <h2 className="font-semibold text-black">Simula ricerca</h2>
          <p className="mt-2 text-sm leading-6 text-neutral-600">Interroga le fonti e calcola nuovi/duplicati senza scrivere nella Inbox.</p>
          <button type="submit" className="mt-4 border border-black px-4 py-2 text-sm font-semibold text-black">Analizza ora</button>
        </form>
        <form action={runRadarAction} className="border border-black p-5">
          <input type="hidden" name="mode" value="import" />
          <h2 className="font-semibold text-black">Acquisisci candidati</h2>
          <p className="mt-2 text-sm leading-6 text-neutral-600">Inserisce nella Inbox soltanto URL nuovi, con limite di 50 per esecuzione. Restano tutti da verificare.</p>
          <button type="submit" className="mt-4 bg-black px-4 py-2 text-sm font-semibold text-white">Importa nella Inbox</button>
        </form>
      </section>

      <section className="mt-8" aria-labelledby="stato-inbox-radar">
        <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-black pb-3">
          <h2 id="stato-inbox-radar" className="text-lg font-semibold text-black">Inbox Radar</h2>
          <p className="text-xs text-neutral-500">{summary.newItems} nuovi · {summary.total} totali</p>
        </div>
        {summary.recent.length === 0 ? (
          <p className="py-6 text-sm text-neutral-600">Nessun arrivo Radar presente.</p>
        ) : (
          <div className="divide-y divide-neutral-300">
            {summary.recent.map((item) => (
              <article key={item.id} className="py-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-semibold text-black"><Link href={`/app/redazione/inbox/${item.id}`} className="hover:underline hover:underline-offset-4">{item.title}</Link></h3>
                  <span className="text-xs uppercase tracking-[0.12em] text-neutral-500">{item.status}</span>
                </div>
                <p className="mt-1 text-xs text-neutral-500">{item.source_label ?? "Fonte non etichettata"} · ricevuto {formatDate(item.received_at)}</p>
                {item.original_url ? <a href={item.original_url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs font-semibold underline underline-offset-4">Fonte originale →</a> : null}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
