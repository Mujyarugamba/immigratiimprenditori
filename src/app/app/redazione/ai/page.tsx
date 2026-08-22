import type { Metadata } from "next";
import { getEditorialAiOverview } from "@/lib/data/editorial/ai";
import { reviewEditorialAiRunAction } from "@/lib/editorial/ai-actions";

export const metadata: Metadata = {
  title: "AI redazionale — Redazione",
};

const TASK_LABELS: Record<string, string> = {
  summarize: "Sintesi",
  classify: "Classificazione",
  extract: "Estrazione",
  translate: "Traduzione",
  transcribe: "Trascrizione",
  draft: "Bozza",
};

const STATUS_LABELS: Record<string, string> = {
  generated: "Generato · da revisionare",
  reviewed: "Revisionato",
  accepted: "Accettato",
  rejected: "Respinto",
  failed: "Fallito",
};

export default async function EditorialAiPage() {
  const ai = await getEditorialAiOverview();

  return (
    <div>
      <header>
        <p className="text-ink-muted text-xs font-semibold uppercase tracking-[0.14em]">
          Supporto alla redazione
        </p>
        <h1 className="text-ink mt-2 text-2xl font-semibold tracking-tight">
          AI redazionale
        </h1>
        <p className="text-ink-muted mt-2 max-w-2xl text-sm leading-6">
          Registro e revisione delle elaborazioni assistite. Un output AI resta materiale interno finché un redattore non lo valuta: questa area non pubblica automaticamente nulla sul sito.
        </p>
      </header>

      {!ai.available ? (
        <section className="border-line mt-6 border p-5">
          <h2 className="text-ink font-semibold">Architettura preparata, ambiente non attivato</h2>
          <p className="text-ink-muted mt-2 text-sm leading-6">
            Il branch contiene il modello dati e il workbench di revisione, ma il database collegato non espone ancora <code>editorial_ai_runs</code>. È coerente con il vincolo di non applicare migration al database di produzione durante questo ciclo.
          </p>
        </section>
      ) : (
        <>
          <section className="mt-6 grid gap-px border border-ink bg-ink sm:grid-cols-2 lg:grid-cols-5">
            {[
              ["Da revisionare", ai.generated],
              ["Revisionati", ai.reviewed],
              ["Accettati", ai.accepted],
              ["Respinti", ai.rejected],
              ["Falliti", ai.failed],
            ].map(([label, value]) => (
              <div key={String(label)} className="bg-surface p-4">
                <p className="text-ink-muted text-xs uppercase tracking-[0.1em]">{label}</p>
                <strong className="text-ink mt-2 block text-2xl">{value}</strong>
              </div>
            ))}
          </section>

          <section className="mt-9">
            <div className="border-line border-b pb-3">
              <h2 className="text-ink text-lg font-semibold">Run recenti</h2>
              <p className="text-ink-muted mt-1 text-sm">
                Provider, modello e versione del prompt restano registrati per audit editoriale.
              </p>
            </div>

            <div className="divide-line divide-y">
              {ai.runs.map((run) => {
                const payloadKeys = Object.keys(run.output_payload ?? {});
                const actionable = run.status === "generated" || run.status === "reviewed";
                return (
                  <article key={run.id} className="py-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-ink-muted text-xs uppercase tracking-[0.1em]">
                          {TASK_LABELS[run.task_kind] ?? run.task_kind}
                          {run.entity_kind ? ` · ${run.entity_kind}` : ""}
                        </p>
                        <h3 className="text-ink mt-1 font-semibold">
                          {run.provider} / {run.model}
                        </h3>
                        <p className="text-ink-muted mt-1 text-xs">
                          Prompt {run.prompt_version} · {new Intl.DateTimeFormat("it-IT", { dateStyle: "short", timeStyle: "short" }).format(new Date(run.created_at))}
                        </p>
                      </div>
                      <span className="text-ink-muted text-xs font-medium">
                        {STATUS_LABELS[run.status] ?? run.status}
                      </span>
                    </div>

                    <p className="text-ink-muted mt-3 text-sm">
                      Output strutturato: {payloadKeys.length ? payloadKeys.join(", ") : "nessun campo registrato"}.
                    </p>

                    {actionable ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {run.status === "generated" ? (
                          <form action={reviewEditorialAiRunAction}>
                            <input type="hidden" name="id" value={run.id} />
                            <input type="hidden" name="status" value="reviewed" />
                            <button type="submit" className="border-ink border px-3 py-2 text-xs font-semibold">
                              Segna revisionato
                            </button>
                          </form>
                        ) : null}
                        <form action={reviewEditorialAiRunAction}>
                          <input type="hidden" name="id" value={run.id} />
                          <input type="hidden" name="status" value="accepted" />
                          <button type="submit" className="border-ink bg-ink text-surface border px-3 py-2 text-xs font-semibold">
                            Accetta
                          </button>
                        </form>
                        <form action={reviewEditorialAiRunAction}>
                          <input type="hidden" name="id" value={run.id} />
                          <input type="hidden" name="status" value="rejected" />
                          <button type="submit" className="border-ink border px-3 py-2 text-xs font-semibold">
                            Respingi
                          </button>
                        </form>
                      </div>
                    ) : null}
                  </article>
                );
              })}
              {ai.runs.length === 0 ? (
                <p className="text-ink-muted py-8 text-sm">Nessun run AI registrato.</p>
              ) : null}
            </div>
          </section>
        </>
      )}

      <section className="border-line mt-10 border-t pt-5">
        <h2 className="text-ink text-sm font-semibold">Gate permanente</h2>
        <p className="text-ink-muted mt-2 max-w-2xl text-sm leading-6">
          Generazione, classificazione, traduzione e trascrizione sono assistenza interna. La pubblicazione resta sempre un atto editoriale umano separato.
        </p>
      </section>
    </div>
  );
}
