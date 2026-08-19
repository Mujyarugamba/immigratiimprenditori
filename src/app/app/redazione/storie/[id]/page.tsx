import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getEditorialStoryById } from "@/lib/data/editorial/stories";
import { saveInterviewWorkflowAction } from "./actions";

export const metadata: Metadata = { title: "Workflow intervista · Redazione" };

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string; error?: string }>;
};

const workflowLabels: Record<string, string> = {
  candidate: "Candidato",
  contacted: "Contattato",
  scheduled: "Intervista programmata",
  interviewed: "Intervistato",
  fact_check: "Fact-check / revisione",
  approved: "Approvato",
  declined: "Declinato",
  closed: "Chiuso",
};

const consentLabels: Record<string, string> = {
  pending: "Da acquisire",
  granted: "Concesso",
  declined: "Negato",
  not_required: "Non richiesto",
};

function inputUtc(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 16);
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("it-IT", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(date) + " UTC";
}

export default async function StoryWorkflowPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const query = await searchParams;
  const story = await getEditorialStoryById(id);
  if (!story) notFound();

  const workflow = story.workflow;
  const statusMessage = query.status === "saved" ? "Workflow salvato." : null;
  const errorMessage = query.error === "schedule"
    ? "Inserisci data e ora UTC per un’intervista programmata."
    : query.error
      ? "Non è stato possibile salvare il workflow. Controlla i valori."
      : null;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-black pb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">Voci · workflow privato</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-black">{story.title}</h1>
          <p className="mt-2 text-sm text-neutral-600">{story.type_code} · /{story.slug}</p>
        </div>
        <div className="flex gap-3 text-sm font-semibold">
          <Link href="/app/redazione/storie" className="underline underline-offset-4">Torna alle Voci</Link>
          <Link href={`/app/redazione/contenuti/${story.id}`} className="underline underline-offset-4">Apri contenuto</Link>
        </div>
      </div>

      {statusMessage ? <p className="mt-5 border border-neutral-300 px-4 py-3 text-sm" role="status">{statusMessage}</p> : null}
      {errorMessage ? <p className="mt-5 border border-black px-4 py-3 text-sm" role="alert">{errorMessage}</p> : null}

      <section className="mt-7 grid gap-px border border-black bg-black sm:grid-cols-3">
        <div className="bg-white p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-neutral-500">Workflow</p>
          <p className="mt-1 font-semibold text-black">{workflow ? workflowLabels[workflow.workflow_status] ?? workflow.workflow_status : "Non avviato"}</p>
        </div>
        <div className="bg-white p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-neutral-500">Consenso pubblicazione</p>
          <p className="mt-1 font-semibold text-black">{workflow ? consentLabels[workflow.publication_consent_status] ?? workflow.publication_consent_status : "Da acquisire"}</p>
        </div>
        <div className="bg-white p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-neutral-500">Intervista</p>
          <p className="mt-1 font-semibold text-black">{formatDate(workflow?.interviewed_at)}</p>
        </div>
      </section>

      <form action={saveInterviewWorkflowAction} className="mt-8 space-y-8">
        <input type="hidden" name="content_id" value={story.id} />

        <section className="grid gap-5 border-y border-black py-6 md:grid-cols-2">
          <div>
            <label htmlFor="workflow_status" className="block text-sm font-semibold text-black">Stato intervista</label>
            <select id="workflow_status" name="workflow_status" defaultValue={workflow?.workflow_status ?? "candidate"} className="mt-2 w-full border border-neutral-400 px-3 py-2 text-sm">
              {Object.entries(workflowLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="source_origin" className="block text-sm font-semibold text-black">Origine candidatura</label>
            <select id="source_origin" name="source_origin" defaultValue={workflow?.source_origin ?? "editorial"} className="mt-2 w-full border border-neutral-400 px-3 py-2 text-sm">
              <option value="editorial">Ricerca redazionale</option>
              <option value="contribution">Contribuisci</option>
              <option value="referral">Segnalazione / referral</option>
              <option value="public_source">Fonte pubblica</option>
            </select>
          </div>
          <div>
            <label htmlFor="scheduled_for" className="block text-sm font-semibold text-black">Intervista programmata (UTC)</label>
            <input id="scheduled_for" name="scheduled_for" type="datetime-local" defaultValue={inputUtc(workflow?.scheduled_for)} className="mt-2 w-full border border-neutral-400 px-3 py-2 text-sm" />
            <p className="mt-1 text-xs text-neutral-500">Usiamo UTC per evitare ambiguità tra Paesi e fusi orari.</p>
          </div>
          <div className="text-sm text-neutral-600">
            <p>Primo contatto: <strong className="text-black">{formatDate(workflow?.contacted_at)}</strong></p>
            <p className="mt-2">Intervista svolta: <strong className="text-black">{formatDate(workflow?.interviewed_at)}</strong></p>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-black">Consensi e approvazioni</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-600">Questi dati restano privati alla redazione. “Concesso” registra automaticamente la data del consenso; non sostituisce l’eventuale liberatoria o documento conservato secondo le procedure privacy.</p>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["publication_consent_status", "Pubblicazione", workflow?.publication_consent_status ?? "pending"],
              ["quote_approval_status", "Citazioni", workflow?.quote_approval_status ?? "pending"],
              ["image_consent_status", "Immagini", workflow?.image_consent_status ?? "pending"],
              ["video_consent_status", "Video", workflow?.video_consent_status ?? "not_required"],
            ].map(([name, label, current]) => (
              <div key={name}>
                <label htmlFor={name} className="block text-sm font-semibold text-black">{label}</label>
                <select id={name} name={name} defaultValue={current} className="mt-2 w-full border border-neutral-400 px-3 py-2 text-sm">
                  {Object.entries(consentLabels).map(([value, text]) => <option key={value} value={value}>{text}</option>)}
                </select>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-black pt-6">
          <label htmlFor="internal_notes" className="block text-sm font-semibold text-black">Note interne</label>
          <textarea id="internal_notes" name="internal_notes" rows={6} defaultValue={workflow?.internal_notes ?? ""} className="mt-2 w-full border border-neutral-400 px-3 py-2 text-sm" placeholder="Contesto, punti da verificare, follow-up. Non inserire dati personali non necessari." />
        </section>

        <button type="submit" className="border border-black bg-black px-5 py-2.5 text-sm font-semibold text-white">Salva workflow intervista</button>
      </form>
    </div>
  );
}
