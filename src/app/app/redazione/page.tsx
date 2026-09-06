import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { getEditorialDashboardOverview } from "@/lib/data/editorial/dashboard";

export const metadata: Metadata = {
  title: "Redazione",
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

const PRIORITY_LABELS: Record<string, string> = {
  urgent: "Urgente",
  high: "Alta",
  medium: "Media",
  normal: "Normale",
  low: "Bassa",
};

function humanize(value: string) {
  return value.replaceAll("_", " ");
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("it-IT", {
    timeZone: "Europe/Rome",
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function RedazioneDashboardPage() {
  const dashboard = await getEditorialDashboardOverview();
  const today = new Intl.DateTimeFormat("it-IT", {
    timeZone: "Europe/Rome",
    dateStyle: "full",
  }).format(new Date());

  const metrics = [
    {
      label: "Nuovi arrivi",
      value: dashboard.newInbox,
      detail: "Inbox ancora da aprire",
      href: "/app/redazione/inbox?stato=new",
    },
    {
      label: "Da valutare",
      value: dashboard.toReview,
      detail: "Arrivi in revisione",
      href: "/app/redazione/inbox?stato=to_review",
    },
    {
      label: "Da approfondire",
      value: dashboard.needsResearch,
      detail: "Richiedono ricerca o verifica",
      href: "/app/redazione/inbox?stato=needs_research",
    },
    {
      label: "Bozze",
      value: dashboard.drafts,
      detail: "Contenuti editoriali non pubblicati",
      href: "/app/redazione/contenuti?stato=unpublished",
    },
    {
      label: "AI da revisionare",
      value: dashboard.aiAvailable ? dashboard.aiToReview : null,
      detail: dashboard.aiAvailable
        ? "Output generati in attesa di controllo umano"
        : "Modulo AI non attivo nel database collegato",
      href: "/app/redazione/ai",
    },
    {
      label: "Radar oggi",
      value: dashboard.radarToday,
      detail: "Segnali acquisiti oggi, ora italiana",
      href: "/app/redazione/radar",
    },
  ] as const;

  return (
    <main className="pb-12">
      <header className="border-line border-b pb-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-ink-muted text-xs font-semibold uppercase tracking-[0.14em]">
              Centro di comando redazionale
            </p>
            <h1 className="text-ink mt-2 text-3xl font-semibold tracking-tight">
              Scrivania redazionale
            </h1>
            <p className="text-ink-muted mt-2 max-w-3xl text-sm leading-6">
              Cosa richiede attenzione adesso: arrivi, verifiche, bozze e segnali del Radar.
              Nessun elemento viene pubblicato automaticamente.
            </p>
          </div>
          <div className="text-right">
            <p className="text-ink-muted text-xs capitalize">{today}</p>
            <p className="text-ink mt-1 text-sm font-semibold">
              {dashboard.publishedContents} contenuti pubblicati
            </p>
          </div>
        </div>
      </header>

      <section className="mt-6" aria-labelledby="quadro-operativo">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="quadro-operativo" className="text-ink text-lg font-semibold">
            Quadro operativo
          </h2>
          <Button href="/app/redazione/contenuti/nuovo" size="sm">
            Nuovo contenuto
          </Button>
        </div>

        <div className="mt-4 grid gap-px border border-ink bg-ink sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {metrics.map((metric) => (
            <Link key={metric.label} href={metric.href} className="bg-surface p-4 hover:bg-surface-muted">
              <p className="text-ink-muted text-xs font-semibold uppercase tracking-[0.1em]">
                {metric.label}
              </p>
              <strong className="text-ink mt-2 block text-3xl leading-none">
                {metric.value === null ? "—" : metric.value}
              </strong>
              <p className="text-ink-muted mt-3 text-xs leading-5">{metric.detail}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10 grid gap-8 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.7fr)]">
        <div>
          <div className="border-line flex flex-wrap items-end justify-between gap-3 border-b pb-3">
            <div>
              <p className="text-ink-muted text-xs font-semibold uppercase tracking-[0.12em]">
                Coda di lavoro
              </p>
              <h2 className="text-ink mt-1 text-xl font-semibold">Priorità operative</h2>
            </div>
            <Link className="text-ink text-sm font-semibold underline underline-offset-4" href="/app/redazione/inbox">
              Apri Inbox completa →
            </Link>
          </div>

          <div className="divide-line divide-y">
            {dashboard.attention.map((item) => (
              <article key={item.id} className="grid gap-3 py-4 md:grid-cols-[1fr_auto] md:items-start">
                <div>
                  <p className="text-ink-muted text-xs uppercase tracking-[0.08em]">
                    {SOURCE_LABELS[item.source_kind] ?? humanize(item.source_kind)}
                    {item.source_label ? ` · ${item.source_label}` : ""}
                  </p>
                  <h3 className="text-ink mt-1 font-semibold">
                    <Link href={`/app/redazione/inbox/${item.id}`} className="underline-offset-3 hover:underline">
                      {item.title}
                    </Link>
                  </h3>
                  <p className="text-ink-muted mt-1 text-xs">
                    {humanize(item.item_kind)} · {formatDateTime(item.received_at)}
                  </p>
                </div>
                <div className="text-right text-xs">
                  <p className="text-ink font-semibold">
                    {STATUS_LABELS[item.status] ?? humanize(item.status)}
                  </p>
                  <p className="text-ink-muted mt-1">
                    Priorità {PRIORITY_LABELS[item.priority] ?? humanize(item.priority)}
                  </p>
                </div>
              </article>
            ))}
            {dashboard.attention.length === 0 ? (
              <p className="text-ink-muted py-8 text-sm">Nessun arrivo richiede attenzione immediata.</p>
            ) : null}
          </div>
        </div>

        <aside>
          <div className="border-line border-b pb-3">
            <p className="text-ink-muted text-xs font-semibold uppercase tracking-[0.12em]">
              Produzione editoriale
            </p>
            <h2 className="text-ink mt-1 text-xl font-semibold">Bozze recenti</h2>
          </div>
          <div className="divide-line divide-y">
            {dashboard.recentDrafts.map((draft) => (
              <article key={draft.id} className="py-4">
                <p className="text-ink-muted text-xs uppercase tracking-[0.08em]">
                  {humanize(draft.type_code)}
                </p>
                <h3 className="text-ink mt-1 text-sm font-semibold leading-5">
                  <Link href={`/app/redazione/contenuti/${draft.id}`} className="underline-offset-3 hover:underline">
                    {draft.title}
                  </Link>
                </h3>
                <p className="text-ink-muted mt-1 text-xs">Aggiornata {formatDateTime(draft.updated_at)}</p>
              </article>
            ))}
            {dashboard.recentDrafts.length === 0 ? (
              <p className="text-ink-muted py-6 text-sm">Nessuna bozza editoriale aperta.</p>
            ) : null}
          </div>
          <Link
            href="/app/redazione/contenuti?stato=unpublished"
            className="text-ink mt-3 inline-block text-sm font-semibold underline underline-offset-4"
          >
            Tutti i contenuti non pubblicati →
          </Link>
        </aside>
      </section>

      <section className="mt-10" aria-labelledby="radar-oggi">
        <div className="border-line flex flex-wrap items-end justify-between gap-3 border-b pb-3">
          <div>
            <p className="text-ink-muted text-xs font-semibold uppercase tracking-[0.12em]">
              Intelligence editoriale
            </p>
            <h2 id="radar-oggi" className="text-ink mt-1 text-xl font-semibold">
              Radar oggi
            </h2>
          </div>
          <Link className="text-ink text-sm font-semibold underline underline-offset-4" href="/app/redazione/radar">
            Apri Radar →
          </Link>
        </div>

        <div className="divide-line divide-y">
          {dashboard.recentRadarToday.map((item) => (
            <article key={item.id} className="grid gap-2 py-3 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <Link href={`/app/redazione/inbox/${item.id}`} className="text-ink text-sm font-semibold hover:underline">
                  {item.title}
                </Link>
                <p className="text-ink-muted mt-1 text-xs">
                  {item.source_label ?? "Fonte non indicata"} · {formatDateTime(item.received_at)}
                </p>
              </div>
              <span className="text-ink-muted text-xs">
                {STATUS_LABELS[item.status] ?? humanize(item.status)}
              </span>
            </article>
          ))}
          {dashboard.recentRadarToday.length === 0 ? (
            <p className="text-ink-muted py-6 text-sm">Nessun nuovo segnale Radar acquisito oggi.</p>
          ) : null}
        </div>
      </section>

      <section className="mt-10 border-t border-ink pt-6" aria-labelledby="azioni-rapide">
        <h2 id="azioni-rapide" className="text-ink text-lg font-semibold">Azioni rapide</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Valuta Inbox", "/app/redazione/inbox"],
            ["Controlla AI", "/app/redazione/ai"],
            ["Aggiorna Osservatorio", "/app/redazione/osservatorio"],
            ["Gestisci Eventi", "/app/redazione/eventi"],
            ["Gestisci Autori", "/app/redazione/autori"],
            ["Voci candidate", "/app/redazione/voci-candidate"],
            ["Sicurezza account", "/app/redazione/sicurezza"],
            ["Nuovo contenuto", "/app/redazione/contenuti/nuovo"],
          ].map(([label, href]) => (
            <Link key={href} href={href} className="border-line hover:border-ink border p-4 text-sm font-semibold transition-colors">
              {label} →
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
