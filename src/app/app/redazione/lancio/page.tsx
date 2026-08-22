import Link from "next/link";
import {
  getNumberZeroDashboard,
  INTERVIEW_WORKFLOW_STATUSES,
} from "@/lib/data/editorial/launch";

export const dynamic = "force-dynamic";

const INTERVIEW_STATUS_LABELS: Record<(typeof INTERVIEW_WORKFLOW_STATUSES)[number], string> = {
  candidate: "Candidato",
  contacted: "Contattato",
  scheduled: "Programmato",
  interviewed: "Intervistato",
  fact_check: "Fact-check",
  approved: "Approvato",
  declined: "Rifiutato",
  closed: "Chiuso",
};

export default async function EditorialLaunchPage() {
  const dashboard = await getNumberZeroDashboard();
  const { readiness, snapshot } = dashboard;
  const activeWorkflowCount = INTERVIEW_WORKFLOW_STATUSES.reduce(
    (total, status) => total + dashboard.interviewWorkflowByStatus[status],
    0,
  );

  return (
    <main id="contenuto" className="space-y-8 pb-12">
      <header className="border-b border-black pb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">
          Roadmap · Fase 20
        </p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-5">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-black sm:text-4xl">
              Numero zero · gate di lancio
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-neutral-700">
              Il lancio non viene dichiarato LIVE finché il sito non dispone di un nucleo dati
              Lombardia/Italia, un confronto internazionale, rapporti selezionati, eventi e almeno
              due storie o interviste pubblicate. La qualità editoriale finale resta una decisione umana.
            </p>
          </div>
          <div className="border border-black px-4 py-3 text-right">
            <p className="text-xs uppercase tracking-[0.12em] text-neutral-500">Gate automatico</p>
            <p className="mt-1 text-lg font-semibold text-black">
              {dashboard.available && readiness.automaticPass ? "EVIDENZE COMPLETE" : "NON PRONTO"}
            </p>
          </div>
        </div>
      </header>

      {!dashboard.available ? (
        <section className="border border-black p-5" role="status">
          <h2 className="font-semibold text-black">Lettura incompleta</h2>
          <p className="mt-2 text-sm leading-6 text-neutral-700">
            Alcune query di readiness non sono disponibili. Il gate degrada in modo conservativo e non può diventare LIVE.
          </p>
          {dashboard.errors.length > 0 ? (
            <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-neutral-600">
              {dashboard.errors.map((error) => <li key={error}>{error}</li>)}
            </ul>
          ) : null}
        </section>
      ) : null}

      <section aria-labelledby="criteri-numero-zero">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-black pb-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">Evidenze misurabili</p>
            <h2 id="criteri-numero-zero" className="mt-1 text-2xl font-semibold text-black">
              Requisiti del numero zero
            </h2>
          </div>
          <p className="text-xs text-neutral-600">
            {readiness.criteria.filter((criterion) => criterion.pass).length}/{readiness.criteria.length} requisiti tecnici soddisfatti
          </p>
        </div>

        <div className="mt-5 grid gap-px border border-black bg-black md:grid-cols-2">
          {readiness.criteria.map((criterion) => (
            <article key={criterion.key} className="bg-white p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
                    {criterion.pass ? "PASS" : "MANCANTE"}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-black">{criterion.label}</h3>
                </div>
                <strong className="text-3xl text-black">{criterion.actual}</strong>
              </div>
              <p className="mt-3 text-xs font-medium text-neutral-600">Richiesto: {criterion.required}</p>
              <p className="mt-3 text-sm leading-6 text-neutral-700">{criterion.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-px border border-black bg-black md:grid-cols-3" aria-label="Materiali numero zero">
        <article className="bg-white p-5">
          <p className="text-xs uppercase tracking-[0.12em] text-neutral-500">Rapporti pubblicati</p>
          <strong className="mt-2 block text-3xl text-black">{snapshot.selectedReports}</strong>
          <ul className="mt-4 space-y-2 text-sm leading-5 text-neutral-700">
            {dashboard.reportTitles.map((title) => <li key={title}>{title}</li>)}
          </ul>
          <Link href="/pubblicazioni" className="mt-4 inline-block text-sm font-semibold underline underline-offset-4">
            Apri rapporti →
          </Link>
        </article>

        <article className="bg-white p-5">
          <p className="text-xs uppercase tracking-[0.12em] text-neutral-500">Storie / voci pubblicate</p>
          <strong className="mt-2 block text-3xl text-black">{snapshot.publishedStoriesVoices}</strong>
          {dashboard.storyVoiceTitles.length > 0 ? (
            <ul className="mt-4 space-y-2 text-sm leading-5 text-neutral-700">
              {dashboard.storyVoiceTitles.map((title) => <li key={title}>{title}</li>)}
            </ul>
          ) : (
            <p className="mt-4 text-sm leading-6 text-neutral-700">
              Nessuna storia/intervista è ancora pubblicata. Questo è il principale blocco editoriale del numero zero.
            </p>
          )}
          <p className="mt-4 text-xs text-neutral-600">
            Inbox: {snapshot.interviewCandidatesInResearch} proposte di intervista in ricerca.
          </p>
          <Link href="/app/redazione/inbox" className="mt-4 inline-block text-sm font-semibold underline underline-offset-4">
            Apri Inbox →
          </Link>
        </article>

        <article className="bg-white p-5">
          <p className="text-xs uppercase tracking-[0.12em] text-neutral-500">Eventi pubblici</p>
          <strong className="mt-2 block text-3xl text-black">{snapshot.publishedEvents}</strong>
          <ul className="mt-4 space-y-2 text-sm leading-5 text-neutral-700">
            {dashboard.eventTitles.map((title) => <li key={title}>{title}</li>)}
          </ul>
          <Link href="/eventi" className="mt-4 inline-block text-sm font-semibold underline underline-offset-4">
            Apri eventi →
          </Link>
        </article>
      </section>

      <section aria-labelledby="candidati-interviste" className="border-t border-black pt-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">Inbox · needs_research</p>
            <h2 id="candidati-interviste" className="mt-1 text-xl font-semibold text-black">
              Candidati intervista
            </h2>
          </div>
          <p className="text-xs text-neutral-600">{dashboard.interviewCandidates.length} proposte visibili alla redazione</p>
        </div>
        <div className="mt-4 grid gap-px border border-black bg-black md:grid-cols-2">
          {dashboard.interviewCandidates.map((candidate) => {
            const route = [candidate.originCountryCode, candidate.destinationCountryCode]
              .filter(Boolean)
              .join(" → ");
            return (
              <article key={candidate.id} className="bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
                    {candidate.relevanceBand ?? "fascia non assegnata"}
                  </p>
                  <span className="text-xs text-neutral-600">priorità {candidate.priority}</span>
                </div>
                <h3 className="mt-2 text-lg font-semibold leading-6 text-black">
                  <Link href={`/app/redazione/inbox/${candidate.id}`} className="underline underline-offset-4">
                    {candidate.title}
                  </Link>
                </h3>
                <dl className="mt-4 grid gap-2 text-xs text-neutral-600 sm:grid-cols-2">
                  <div><dt>Rotta</dt><dd className="mt-1 text-black">{route || "—"}</dd></div>
                  <div><dt>Fonte di partenza</dt><dd className="mt-1 text-black">{candidate.sourceLabel ?? "—"}</dd></div>
                </dl>
              </article>
            );
          })}
          {dashboard.interviewCandidates.length === 0 ? (
            <p className="bg-white p-5 text-sm text-neutral-600 md:col-span-2">
              Nessuna proposta di intervista è attualmente in stato needs_research.
            </p>
          ) : null}
        </div>
      </section>

      <section aria-labelledby="pipeline-interviste" className="border-t border-black pt-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">Produzione editoriale</p>
            <h2 id="pipeline-interviste" className="mt-1 text-xl font-semibold text-black">
              Pipeline delle interviste
            </h2>
          </div>
          <p className="text-xs text-neutral-600">{activeWorkflowCount} workflow attivi/registrati</p>
        </div>
        <div className="mt-4 grid gap-px border border-black bg-black sm:grid-cols-2 lg:grid-cols-4">
          {INTERVIEW_WORKFLOW_STATUSES.map((status) => (
            <div key={status} className="bg-white p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-neutral-500">
                {INTERVIEW_STATUS_LABELS[status]}
              </p>
              <strong className="mt-2 block text-2xl text-black">
                {dashboard.interviewWorkflowByStatus[status]}
              </strong>
            </div>
          ))}
        </div>
        <p className="mt-4 max-w-3xl text-xs leading-5 text-neutral-600">
          Le proposte presenti nella Inbox non entrano automaticamente in questa pipeline: il workflow nasce solo quando la redazione apre una vera bozza/intervista. Nessuno stato della pipeline equivale da solo a pubblicazione.
        </p>
      </section>

      <section className="border-t border-black pt-6">
        <h2 className="text-xl font-semibold text-black">Controllo umano obbligatorio</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-700">
          Anche quando tutti i numeri diventano verdi, il gate automatico non equivale a pubblicazione.
          Prima del lancio la redazione deve approvare qualità delle storie, equilibrio della home,
          correttezza delle fonti, resa visuale desktop/mobile e commit esatto candidato al rilascio.
        </p>
      </section>
    </main>
  );
}
