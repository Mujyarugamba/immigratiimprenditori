import type { Metadata } from "next";
import Link from "next/link";
import { listEditorialInbox } from "@/lib/data/editorial/inbox";

export const metadata: Metadata = {
  title: "Inbox — Redazione",
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

const SOURCE_LABELS: Record<string, string> = {
  radar: "Radar",
  public_submission: "Segnalazione pubblica",
  contributor: "Contributore",
  editorial_manual: "Redazione",
};

const KIND_LABELS: Record<string, string> = {
  news: "Notizia",
  report: "Rapporto",
  academic_paper: "Ricerca",
  dataset: "Dataset",
  statistical_release: "Dati statistici",
  event: "Evento",
  policy: "Politica pubblica",
  law_regulation: "Normativa",
  story_tip: "Segnalazione storia",
  interview_proposal: "Proposta intervista",
  user_testimony: "Testimonianza",
  publication_submission: "Pubblicazione",
  other: "Altro",
};

const TOPIC_LABELS: Record<string, string> = {
  culture: "Cultura",
};

type Props = {
  searchParams: Promise<{
    q?: string;
    stato?: string;
    origine?: string;
    tipo?: string;
    tema?: string;
    page?: string;
  }>;
};

function geographicLabel(item: {
  origin_country_label: string | null;
  destination_country_label: string | null;
  origin_country_code: string | null;
  destination_country_code: string | null;
}) {
  const origin = item.origin_country_label ?? item.origin_country_code;
  const destination =
    item.destination_country_label ?? item.destination_country_code;
  return [origin, destination].filter(Boolean).join(" → ");
}

export default async function InboxPage({ searchParams }: Props) {
  const params = await searchParams;
  const result = await listEditorialInbox(params);
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  if (params.stato) qs.set("stato", params.stato);
  if (params.origine) qs.set("origine", params.origine);
  if (params.tipo) qs.set("tipo", params.tipo);
  if (params.tema === "culture") qs.set("tema", params.tema);
  const baseQs = qs.toString();

  return (
    <div>
      <div>
        <p className="text-ink-muted text-xs font-semibold uppercase tracking-[0.14em]">
          Scrivania redazionale
        </p>
        <h1 className="text-ink mt-2 text-2xl font-semibold tracking-tight">
          Inbox
        </h1>
        <p className="text-ink-muted mt-2 max-w-2xl text-sm leading-6">
          Qui confluiscono segnalazioni pubbliche, contributori, materiale inserito
          dalla redazione e, nella fase successiva, il radar automatico mondiale.
          Nessun arrivo viene pubblicato automaticamente.
        </p>
      </div>

      <form method="get" className="border-line mt-6 grid gap-3 border-y py-4 md:grid-cols-5">
        <label className="text-ink flex flex-col gap-1 text-sm">
          <span className="font-medium">Cerca</span>
          <input name="q" defaultValue={params.q ?? ""} className="border-line border px-3 py-2" placeholder="Titolo" />
        </label>
        <label className="text-ink flex flex-col gap-1 text-sm">
          <span className="font-medium">Stato</span>
          <select name="stato" defaultValue={params.stato ?? ""} className="border-line border px-3 py-2">
            <option value="">Tutti</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label className="text-ink flex flex-col gap-1 text-sm">
          <span className="font-medium">Origine</span>
          <select name="origine" defaultValue={params.origine ?? ""} className="border-line border px-3 py-2">
            <option value="">Tutte</option>
            {Object.entries(SOURCE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label className="text-ink flex flex-col gap-1 text-sm">
          <span className="font-medium">Tipo</span>
          <select name="tipo" defaultValue={params.tipo ?? ""} className="border-line border px-3 py-2">
            <option value="">Tutti</option>
            {Object.entries(KIND_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label className="text-ink flex flex-col gap-1 text-sm">
          <span className="font-medium">Tema</span>
          <select name="tema" defaultValue={params.tema === "culture" ? params.tema : ""} className="border-line border px-3 py-2">
            <option value="">Tutti</option>
            {Object.entries(TOPIC_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <div className="md:col-span-5">
          <button type="submit" className="border-ink bg-ink text-surface border px-4 py-2 text-sm font-medium">
            Filtra
          </button>
        </div>
      </form>

      <div className="table-scroll mt-6">
        <table className="border-line w-full min-w-[760px] border-collapse border text-left text-sm">
          <thead>
            <tr className="border-line border-b">
              <th className="px-3 py-2 font-medium">Arrivo</th>
              <th className="px-3 py-2 font-medium">Tipo</th>
              <th className="px-3 py-2 font-medium">Provenienza</th>
              <th className="px-3 py-2 font-medium">Stato</th>
              <th className="px-3 py-2 font-medium">Ricevuto</th>
              <th className="px-3 py-2 font-medium" />
            </tr>
          </thead>
          <tbody>
            {result.items.length === 0 ? (
              <tr><td colSpan={6} className="text-ink-muted border-line border-t px-3 py-10 text-center">Nessun arrivo.</td></tr>
            ) : result.items.map((item) => {
              const geography = geographicLabel(item);
              return (
                <tr key={item.id} className="border-line border-t align-top">
                  <td className="px-3 py-3">
                    <span className="text-ink font-medium">{item.title}</span>
                    {item.source_label ? <span className="text-ink-muted mt-1 block text-xs">{item.source_label}</span> : null}
                    {geography ? <span className="text-ink-muted mt-1 block text-xs">{geography}</span> : null}
                  </td>
                  <td className="px-3 py-3">{KIND_LABELS[item.item_kind] ?? item.item_kind}</td>
                  <td className="px-3 py-3">{SOURCE_LABELS[item.source_kind] ?? item.source_kind}</td>
                  <td className="px-3 py-3">{STATUS_LABELS[item.status] ?? item.status}</td>
                  <td className="text-ink-muted px-3 py-3">{new Intl.DateTimeFormat("it-IT", { dateStyle: "short", timeStyle: "short" }).format(new Date(item.received_at))}</td>
                  <td className="px-3 py-3"><Link className="text-ink underline underline-offset-2" href={`/app/redazione/inbox/${item.id}`}>Apri</Link></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {result.pageCount > 1 ? (
        <nav className="text-ink-muted mt-4 flex items-center justify-between text-sm" aria-label="Paginazione Inbox">
          <span>Pagina {result.page} di {result.pageCount} ({result.total} arrivi)</span>
          <div className="flex gap-4">
            {result.page > 1 ? <Link className="underline" href={`/app/redazione/inbox?${baseQs}${baseQs ? "&" : ""}page=${result.page - 1}`}>Precedente</Link> : null}
            {result.page < result.pageCount ? <Link className="underline" href={`/app/redazione/inbox?${baseQs}${baseQs ? "&" : ""}page=${result.page + 1}`}>Successiva</Link> : null}
          </div>
        </nav>
      ) : null}
    </div>
  );
}
