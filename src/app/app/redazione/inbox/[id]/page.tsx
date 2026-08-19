import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { updateInboxStatusAction } from "@/lib/editorial/inbox-actions";
import { getEditorialInboxItemById } from "@/lib/data/editorial/inbox";

export const metadata: Metadata = {
  title: "Arrivo — Inbox Redazione",
};

const STATUS_OPTIONS = [
  ["new", "Nuovo"],
  ["to_review", "Da valutare"],
  ["needs_research", "Da approfondire"],
  ["assigned", "Assegnato"],
  ["draft_created", "Bozza creata"],
  ["rejected", "Scartato"],
  ["archived", "Archiviato"],
] as const;

export default async function InboxDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getEditorialInboxItemById(id);
  if (!item) notFound();

  return (
    <div>
      <Link href="/app/redazione/inbox" className="text-ink-muted text-sm underline underline-offset-2">
        ← Torna alla Inbox
      </Link>

      <div className="mt-5 border-b border-black pb-5">
        <p className="text-ink-muted text-xs font-semibold uppercase tracking-[0.14em]">
          {item.source_kind} · {item.item_kind}
        </p>
        <h1 className="text-ink mt-2 text-3xl font-semibold tracking-tight">{item.title}</h1>
        <p className="text-ink-muted mt-2 text-sm">
          Ricevuto {new Intl.DateTimeFormat("it-IT", { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.received_at))}
        </p>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_260px]">
        <div className="space-y-7">
          {item.summary ? (
            <section>
              <h2 className="text-ink text-sm font-semibold uppercase tracking-wide">Sintesi di lavoro</h2>
              <p className="text-ink mt-2 whitespace-pre-wrap leading-7">{item.summary}</p>
            </section>
          ) : null}

          {item.original_url ? (
            <section>
              <h2 className="text-ink text-sm font-semibold uppercase tracking-wide">Fonte originale</h2>
              <a href={item.original_url} target="_blank" rel="noreferrer" className="text-ink mt-2 block break-all underline underline-offset-2">
                {item.original_url}
              </a>
            </section>
          ) : null}

          <section>
            <h2 className="text-ink text-sm font-semibold uppercase tracking-wide">Contesto geografico</h2>
            <dl className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
              <div><dt className="text-ink-muted">Origine</dt><dd className="text-ink font-medium">{item.origin_country_code ?? "—"}</dd></div>
              <div><dt className="text-ink-muted">Destinazione</dt><dd className="text-ink font-medium">{item.destination_country_code ?? "—"}</dd></div>
            </dl>
          </section>

          {item.submission ? (
            <section className="border-t border-black pt-6">
              <h2 className="text-ink text-lg font-semibold">Segnalazione ricevuta</h2>
              <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                <div><dt className="text-ink-muted">Nome</dt><dd>{item.submission.submitter_name}</dd></div>
                <div><dt className="text-ink-muted">Email</dt><dd><a className="underline" href={`mailto:${item.submission.submitter_email}`}>{item.submission.submitter_email}</a></dd></div>
                <div><dt className="text-ink-muted">Telefono</dt><dd>{item.submission.submitter_phone ?? "—"}</dd></div>
                <div><dt className="text-ink-muted">Organizzazione</dt><dd>{item.submission.organization_name ?? "—"}</dd></div>
                <div><dt className="text-ink-muted">Ricontatto autorizzato</dt><dd>{item.submission.consent_contact ? "Sì" : "No"}</dd></div>
                <div><dt className="text-ink-muted">Pubblicazione materiale autorizzata</dt><dd>{item.submission.consent_publication ? "Sì" : "No"}</dd></div>
              </dl>
              <div className="mt-5">
                <h3 className="text-ink-muted text-sm font-medium">Testo inviato</h3>
                <p className="text-ink mt-2 whitespace-pre-wrap leading-7">{item.submission.contribution_text}</p>
              </div>
            </section>
          ) : null}
        </div>

        <aside className="border-line border-t pt-4 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
          <h2 className="text-ink text-sm font-semibold uppercase tracking-wide">Valutazione</h2>
          <form action={updateInboxStatusAction} className="mt-3 space-y-3">
            <input type="hidden" name="id" value={item.id} />
            <label className="block text-sm">
              <span className="text-ink-muted block pb-1">Stato</span>
              <select name="status" defaultValue={item.status} className="border-line w-full border px-3 py-2">
                {STATUS_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <button type="submit" className="border-ink bg-ink text-surface w-full border px-4 py-2 text-sm font-medium">
              Salva stato
            </button>
          </form>

          <dl className="text-ink-muted mt-6 space-y-3 text-xs">
            <div><dt>Priorità</dt><dd className="text-ink mt-1">{item.priority}</dd></div>
            <div><dt>Fascia geografica</dt><dd className="text-ink mt-1">{item.relevance_band ?? "—"}</dd></div>
            <div><dt>Fonte</dt><dd className="text-ink mt-1">{item.source_label ?? "—"}</dd></div>
          </dl>
        </aside>
      </div>
    </div>
  );
}
