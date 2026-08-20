import type { Metadata } from "next";
import Link from "next/link";
import { getNumberZeroSlots, type NumberZeroStage } from "@/lib/data/editorial/number-zero";

export const metadata: Metadata = { title: "Numero zero · Redazione" };

const stageLabels: Record<NumberZeroStage, string> = {
  missing: "Manca",
  candidate: "Candidato",
  draft: "Bozza",
  ready: "Pronto",
  published: "Pubblicato",
};

export default async function NumeroZeroPage() {
  const slots = await getNumberZeroSlots().catch(() => []);
  const counts = {
    total: slots.length,
    published: slots.filter((slot) => slot.stage === "published").length,
    ready: slots.filter((slot) => slot.stage === "ready").length,
    draft: slots.filter((slot) => slot.stage === "draft").length,
    candidate: slots.filter((slot) => slot.stage === "candidate").length,
    missing: slots.filter((slot) => slot.stage === "missing").length,
  };

  return (
    <div>
      <p className="text-ink-muted text-xs font-semibold uppercase tracking-[0.14em]">Lancio editoriale</p>
      <h1 className="text-ink mt-2 text-2xl font-semibold tracking-tight">Numero zero</h1>
      <p className="text-ink-muted mt-2 max-w-3xl text-sm leading-6">
        Dieci contenuti principali distribuiti tra Lombardia, Italia, italiani all’estero, Europa e resto del mondo. Le Voci diventano contenuti soltanto dopo un’intervista originale: una pagina o un articolo di terzi non sostituisce mai l’intervista.
      </p>

      <section className="mt-7 grid grid-cols-2 gap-px border border-black bg-black sm:grid-cols-5" aria-label="Stato Numero zero">
        {[
          ["Pubblicati", counts.published],
          ["Pronti", counts.ready],
          ["Bozze", counts.draft],
          ["Voci candidate", counts.candidate],
          ["Mancanti", counts.missing],
        ].map(([label, value]) => (
          <div key={String(label)} className="bg-white p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-neutral-500">{label}</p>
            <p className="mt-1 text-2xl font-semibold text-black">{value}</p>
          </div>
        ))}
      </section>

      <section className="mt-8" aria-labelledby="piano-numero-zero">
        <div className="flex items-baseline justify-between gap-4 border-b border-black pb-3">
          <h2 id="piano-numero-zero" className="text-lg font-semibold text-black">Piano 10 × 5 fasce</h2>
          <span className="text-xs text-neutral-500">{counts.total}/10 slot tracciati</span>
        </div>
        <div className="divide-y divide-neutral-300">
          {slots.map((slot) => (
            <article key={slot.code} className="grid gap-3 py-5 md:grid-cols-[80px_170px_1fr_auto] md:items-start">
              <div className="text-lg font-semibold text-black">{slot.code}</div>
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">{slot.band}</div>
              <div>
                <h3 className="font-semibold text-black">{slot.title}</h3>
                <p className="mt-1 text-sm leading-6 text-neutral-600">{slot.detail}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="border border-neutral-400 px-2 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-black">{stageLabels[slot.stage]}</span>
                {slot.href ? <Link href={slot.href} className="text-sm font-semibold text-black underline underline-offset-4">Apri</Link> : null}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10 border-y border-black py-6">
        <h2 className="text-base font-semibold text-black">Criterio di uscita</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-700">
          Il Numero zero non è pronto perché esistono dieci righe in una tabella: è pronto quando dati e analisi hanno superato la revisione, le tre Voci sono interviste reali con consensi chiari e la home può mostrare Dati · Analisi · Voci senza placeholder.
        </p>
      </section>
    </div>
  );
}
