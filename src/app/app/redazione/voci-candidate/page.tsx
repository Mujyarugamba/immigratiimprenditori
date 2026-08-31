import type { Metadata } from "next";
import Link from "next/link";
import { listInterviewShortlistCandidates } from "@/lib/data/editorial/interview-shortlist";

export const metadata: Metadata = {
  title: "Voci candidate — Redazione",
};

export const dynamic = "force-dynamic";

const BAND_LABELS: Record<string, string> = {
  lombardy: "Lombardia",
  italians_abroad: "Italiani all’estero",
  rest_of_world: "Voce dal mondo",
};

const FORMATS = [
  {
    title: "Video autonomo su nostre domande",
    label: "Formato consigliato",
    text: "La redazione invia una scaletta di domande. La persona registra le risposte con telefono o webcam, in uno o più video, e ci invia i file. Nessuno deve spostarsi.",
  },
  {
    title: "Intervista video da remoto",
    label: "Alternativa",
    text: "Collegamento online con un redattore. Registrazione e uso del materiale solo dopo le autorizzazioni previste.",
  },
  {
    title: "Risposte scritte",
    label: "Alternativa",
    text: "Le domande vengono inviate per iscritto e le risposte sono restituite via email o documento, poi verificate e curate editorialmente.",
  },
] as const;

function candidateName(title: string) {
  return title.replace(/^Intervista originale\s*[—-]\s*/i, "");
}

export default async function CandidateVoicesPage() {
  const candidates = await listInterviewShortlistCandidates();

  return (
    <main id="contenuto" className="space-y-8 pb-12">
      <header className="border-b border-black pb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">
          Redazione · Short list
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-black sm:text-4xl">
          Voci candidate
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-neutral-700">
          Persone e imprese che potremmo invitare per storie, testimonianze o interviste del Centro Studi.
          La presenza in questa pagina non implica selezione, contatto o pubblicazione.
        </p>
      </header>

      <section className="border border-black p-5" role="status">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">Stato operativo</p>
        <h2 className="mt-2 text-xl font-semibold text-black">Primo ciclo post-go-live</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-700">
          Il sito è online e lo smoke live è chiuso. La short list serve ora a scegliere le prime interviste originali. Preparare una bozza non equivale a contattare il candidato: lo stato cambia solo quando la redazione avvia davvero il contatto.
        </p>
      </section>

      <section aria-labelledby="formati-intervista">
        <div className="border-b border-black pb-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">Produzione senza trasferte</p>
          <h2 id="formati-intervista" className="mt-1 text-2xl font-semibold text-black">Formati possibili</h2>
        </div>
        <div className="mt-5 grid gap-px border border-black bg-black md:grid-cols-3">
          {FORMATS.map((format) => (
            <article key={format.title} className="bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">{format.label}</p>
              <h3 className="mt-2 text-lg font-semibold text-black">{format.title}</h3>
              <p className="mt-3 text-sm leading-6 text-neutral-700">{format.text}</p>
            </article>
          ))}
        </div>
        <p className="mt-4 max-w-3xl text-xs leading-5 text-neutral-600">
          In ogni formato la redazione mantiene fact-check, selezione editoriale e gestione separata dei consensi per pubblicazione, citazioni, immagini e video. Ricevere un video non equivale a pubblicarlo.
        </p>
      </section>

      <section aria-labelledby="candidati">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-black pb-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">Short list corrente</p>
            <h2 id="candidati" className="mt-1 text-2xl font-semibold text-black">Candidati da valutare</h2>
          </div>
          <p className="text-xs text-neutral-600">{candidates.length} candidati</p>
        </div>

        <div className="mt-5 divide-y divide-black border-y border-black">
          {candidates.map((candidate, index) => {
            const route = [candidate.originCountryCode, candidate.destinationCountryCode].filter(Boolean).join(" → ") || "Rotta da verificare";
            const band = candidate.relevanceBand ? BAND_LABELS[candidate.relevanceBand] ?? candidate.relevanceBand : "Da classificare";
            return (
              <article key={candidate.id} className="grid gap-5 py-6 md:grid-cols-[64px_1fr_220px]">
                <div className="text-3xl font-semibold text-black">{String(index + 1).padStart(2, "0")}</div>
                <div>
                  <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.12em] text-neutral-500">
                    <span>{band}</span><span>·</span><span>{route}</span>
                  </div>
                  <h3 className="mt-2 text-xl font-semibold text-black">{candidateName(candidate.title)}</h3>
                  {candidate.summary ? <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-700">{candidate.summary}</p> : null}
                  <p className="mt-3 text-xs text-neutral-600">
                    Fonte di partenza: {candidate.sourceLabel ?? "da verificare"}. La fonte serve alla preparazione; il contenuto finale deve essere originale.
                  </p>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="border border-black p-3">
                    <p className="text-xs uppercase tracking-[0.12em] text-neutral-500">Decisione</p>
                    <p className="mt-1 font-semibold text-black">Non contattato</p>
                  </div>
                  <Link
                    href={`/app/redazione/contenuti/nuovo?inbox=${candidate.id}`}
                    className="block font-semibold underline underline-offset-4"
                  >
                    Prepara intervista →
                  </Link>
                  <Link href={`/app/redazione/inbox/${candidate.id}`} className="block font-semibold underline underline-offset-4">
                    Apri dossier Inbox →
                  </Link>
                  {candidate.sourceUrl ? (
                    <a href={candidate.sourceUrl} target="_blank" rel="noreferrer" className="block text-neutral-700 underline underline-offset-4">
                      Fonte di ricerca ↗
                    </a>
                  ) : null}
                </div>
              </article>
            );
          })}
          {candidates.length === 0 ? (
            <p className="py-6 text-sm text-neutral-600">Nessun candidato disponibile nella short list.</p>
          ) : null}
        </div>
      </section>

      <section className="border-t border-black pt-6">
        <h2 className="text-xl font-semibold text-black">Quando decideremo di invitare qualcuno</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-6 text-neutral-700">
          <li>scelta umana del candidato dalla short list;</li>
          <li>preparazione della bozza intervista e della scaletta;</li>
          <li>scelta del formato, con preferenza possibile per il video autonomo;</li>
          <li>invio delle domande e delle istruzioni tecniche;</li>
          <li>ricezione del materiale e fact-check;</li>
          <li>raccolta delle autorizzazioni necessarie;</li>
          <li>decisione editoriale finale sulla pubblicazione.</li>
        </ol>
      </section>
    </main>
  );
}
