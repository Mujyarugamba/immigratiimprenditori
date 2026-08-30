import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { assignInboxToMeAction, updateInboxStatusAction } from "@/lib/editorial/inbox-actions";
import { getEditorialInboxItemById } from "@/lib/data/editorial/inbox";
import { buildInboxEditorialBrief } from "@/lib/editorial/inbox-brief";
import { canCreateContentDraftFromInbox } from "@/lib/editorial/inbox-draft";

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

const STATUS_LABEL = Object.fromEntries(STATUS_OPTIONS) as Record<string, string>;

function transition(changes: Record<string, unknown>, key: string) {
  const value = changes[key];
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  return {
    from: typeof record.from === "string" ? record.from : null,
    to: typeof record.to === "string" ? record.to : null,
  };
}

function activityLabel(changes: Record<string, unknown>) {
  const parts: string[] = [];
  const status = transition(changes, "status");
  if (status) {
    const from = status.from ? STATUS_LABEL[status.from] ?? status.from : "—";
    const to = status.to ? STATUS_LABEL[status.to] ?? status.to : "—";
    parts.push(`Stato: ${from} → ${to}`);
  }

  const priority = transition(changes, "priority");
  if (priority) {
    parts.push(`Priorità: ${priority.from ?? "—"} → ${priority.to ?? "—"}`);
  }

  if (transition(changes, "assigned_account_id")) {
    parts.push("Assegnazione redazionale aggiornata");
  }

  if (parts.length > 0) return parts.join(" · ");

  if (changes.kind === "status_change") {
    const from = typeof changes.from === "string" ? STATUS_LABEL[changes.from] ?? changes.from : "—";
    const to = typeof changes.to === "string" ? STATUS_LABEL[changes.to] ?? changes.to : "—";
    return `Stato: ${from} → ${to}`;
  }
  if (changes.kind === "assignment") return "Assegnazione redazionale aggiornata";
  return "Attività redazionale";
}

function migrationRelevanceLabel(value: string) {
  if (value === "direct") return "Diretta";
  if (value === "contextual_not_direct") return "Contestuale, non diretta";
  return value;
}

export default async function InboxDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getEditorialInboxItemById(id);
  if (!item) notFound();

  const origin = item.origin_country_label ?? item.origin_country_code ?? "—";
  const destination = item.destination_country_label ?? item.destination_country_code ?? "—";
  const editorialBrief = buildInboxEditorialBrief(item.raw_metadata);
  const canCreateDraft =
    !item.linked_content_id &&
    !item.linked_event_id &&
    item.status !== "rejected" &&
    item.status !== "archived" &&
    canCreateContentDraftFromInbox(item.item_kind);

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
              <div><dt className="text-ink-muted">Paese di origine</dt><dd className="text-ink font-medium">{origin}</dd></div>
              <div><dt className="text-ink-muted">Paese di attività / destinazione</dt><dd className="text-ink font-medium">{destination}</dd></div>
            </dl>
          </section>

          {editorialBrief ? (
            <section className="border-t border-black pt-6">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">Solo redazione</p>
                  <h2 className="mt-1 text-xl font-semibold text-black">Istruttoria editoriale</h2>
                </div>
                {editorialBrief.sourceCheckedOn ? (
                  <span className="text-xs text-neutral-500">Fonte verificata: {editorialBrief.sourceCheckedOn}</span>
                ) : null}
              </div>
              <p className="mt-2 text-sm leading-6 text-neutral-600">
                Appunti interni di preparazione. Non sono testo approvato e non vengono pubblicati automaticamente.
              </p>

              {editorialBrief.migrationRelevance ? (
                <p className="mt-4 text-sm">
                  <span className="font-semibold">Rilevanza migrazione/diaspora:</span>{" "}
                  {migrationRelevanceLabel(editorialBrief.migrationRelevance)}
                </p>
              ) : null}

              {editorialBrief.verifiedClaims.length > 0 ? (
                <div className="mt-5">
                  <h3 className="text-sm font-semibold text-black">Punti verificati alla fonte</h3>
                  <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-6 text-neutral-700">
                    {editorialBrief.verifiedClaims.map((claim) => <li key={claim}>{claim}</li>)}
                  </ul>
                </div>
              ) : null}

              {editorialBrief.draftRecommendation ? (
                <div className="mt-6 border border-black p-5">
                  <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-neutral-600">
                    {editorialBrief.draftRecommendation.editorialPriority ? (
                      <span>Priorità editoriale: {editorialBrief.draftRecommendation.editorialPriority}</span>
                    ) : null}
                    {editorialBrief.draftRecommendation.recommendedType ? (
                      <span>Tipo suggerito: {editorialBrief.draftRecommendation.recommendedType}</span>
                    ) : null}
                    {editorialBrief.draftRecommendation.recommendedCategory ? (
                      <span>Categoria suggerita: {editorialBrief.draftRecommendation.recommendedCategory}</span>
                    ) : null}
                  </div>

                  {editorialBrief.draftRecommendation.workingTitle ? (
                    <div className="mt-4">
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Titolo di lavoro</h3>
                      <p className="mt-1 text-lg font-semibold text-black">{editorialBrief.draftRecommendation.workingTitle}</p>
                    </div>
                  ) : null}

                  {editorialBrief.draftRecommendation.angle ? (
                    <div className="mt-4">
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Taglio proposto</h3>
                      <p className="mt-1 text-sm leading-6 text-neutral-700">{editorialBrief.draftRecommendation.angle}</p>
                    </div>
                  ) : null}

                  {editorialBrief.draftRecommendation.outline.length > 0 ? (
                    <div className="mt-4">
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Scaletta</h3>
                      <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm leading-6 text-neutral-700">
                        {editorialBrief.draftRecommendation.outline.map((entry) => <li key={entry}>{entry}</li>)}
                      </ol>
                    </div>
                  ) : null}

                  {editorialBrief.draftRecommendation.cautions.length > 0 ? (
                    <div className="mt-5 border-t border-neutral-300 pt-4">
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Cautele</h3>
                      <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-6 text-neutral-700">
                        {editorialBrief.draftRecommendation.cautions.map((entry) => <li key={entry}>{entry}</li>)}
                      </ul>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </section>
          ) : null}

          {item.submission ? (
            <section className="border-t border-black pt-6">
              <h2 className="text-ink text-lg font-semibold">Segnalazione ricevuta</h2>
              <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                <div><dt className="text-ink-muted">Nome</dt><dd>{item.submission.submitter_name}</dd></div>
                <div><dt className="text-ink-muted">Email</dt><dd><a className="underline" href={`mailto:${item.submission.submitter_email}`}>{item.submission.submitter_email}</a></dd></div>
                <div><dt className="text-ink-muted">Telefono</dt><dd>{item.submission.submitter_phone ?? "—"}</dd></div>
                <div><dt className="text-ink-muted">Organizzazione</dt><dd>{item.submission.organization_name ?? "—"}</dd></div>
                <div><dt className="text-ink-muted">Paese di origine dichiarato</dt><dd>{item.submission.origin_country_label ?? "—"}</dd></div>
                <div><dt className="text-ink-muted">Paese di attività dichiarato</dt><dd>{item.submission.destination_country_label ?? "—"}</dd></div>
                <div><dt className="text-ink-muted">Ricontatto autorizzato</dt><dd>{item.submission.consent_contact ? "Sì" : "No"}</dd></div>
                <div><dt className="text-ink-muted">Pubblicazione materiale autorizzata</dt><dd>{item.submission.consent_publication ? "Sì" : "No"}</dd></div>
              </dl>
              <div className="mt-5">
                <h3 className="text-ink-muted text-sm font-medium">Testo inviato</h3>
                <p className="text-ink mt-2 whitespace-pre-wrap leading-7">{item.submission.contribution_text}</p>
              </div>
            </section>
          ) : null}

          <section className="border-t border-black pt-6">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-ink text-lg font-semibold">Cronologia redazionale</h2>
              <span className="text-ink-muted text-xs">{item.activity.length}</span>
            </div>
            <div className="mt-3 divide-y divide-neutral-300">
              {item.activity.map((entry) => (
                <article key={entry.id} className="py-3">
                  <p className="text-sm font-medium text-black">{activityLabel(entry.changes)}</p>
                  <p className="mt-1 text-xs text-neutral-500">
                    {new Intl.DateTimeFormat("it-IT", { dateStyle: "medium", timeStyle: "short" }).format(new Date(entry.created_at))}
                  </p>
                </article>
              ))}
              {item.activity.length === 0 ? (
                <p className="py-4 text-sm text-neutral-500">Nessuna attività registrata per questo arrivo.</p>
              ) : null}
            </div>
          </section>
        </div>

        <aside className="border-line border-t pt-4 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
          <h2 className="text-ink text-sm font-semibold uppercase tracking-wide">Valutazione</h2>

          {item.linked_content_id ? (
            <Link
              href={`/app/redazione/contenuti/${item.linked_content_id}`}
              className="mt-3 block w-full border border-black bg-black px-4 py-2 text-center text-sm font-semibold text-white"
            >
              Apri bozza collegata
            </Link>
          ) : null}

          {item.linked_event_id ? (
            <Link
              href={`/app/redazione/eventi/${item.linked_event_id}`}
              className="mt-3 block w-full border border-black bg-black px-4 py-2 text-center text-sm font-semibold text-white"
            >
              Apri evento collegato
            </Link>
          ) : null}

          {canCreateDraft ? (
            <Link
              href={`/app/redazione/contenuti/nuovo?inbox=${item.id}`}
              className="mt-3 block w-full border border-black bg-black px-4 py-2 text-center text-sm font-semibold text-white"
            >
              Crea bozza da questo arrivo
            </Link>
          ) : null}

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

          <form action={assignInboxToMeAction} className="mt-3">
            <input type="hidden" name="id" value={item.id} />
            <button type="submit" className="w-full border border-black px-4 py-2 text-sm font-semibold">
              Assegna a me
            </button>
          </form>

          <dl className="text-ink-muted mt-6 space-y-3 text-xs">
            <div><dt>Priorità</dt><dd className="text-ink mt-1">{item.priority}</dd></div>
            <div><dt>Fascia geografica</dt><dd className="text-ink mt-1">{item.relevance_band ?? "—"}</dd></div>
            <div><dt>Fonte</dt><dd className="text-ink mt-1">{item.source_label ?? "—"}</dd></div>
            <div><dt>Assegnazione</dt><dd className="text-ink mt-1">{item.assigned_account_id ? "Assegnato" : "Non assegnato"}</dd></div>
          </dl>
        </aside>
      </div>
    </div>
  );
}
