import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { getEditorialInboxStats } from "@/lib/data/editorial/inbox";

export const metadata: Metadata = {
  title: "Redazione",
};

const sections = [
  {
    href: "/app/redazione/inbox",
    title: "Inbox",
    description:
      "Arrivi dal pubblico, dalla redazione e dal futuro radar mondiale. Nulla viene pubblicato automaticamente.",
  },
  {
    href: "/app/redazione/contenuti",
    title: "Contenuti",
    description:
      "Articoli, analisi, storie, interviste e materiali editoriali del Centro Studi.",
  },
  {
    href: "/app/redazione/eventi",
    title: "Eventi",
    description: "Coda di revisione per eventi acquisiti o curati dalla redazione.",
  },
  {
    href: "/app/redazione/osservatorio",
    title: "Osservatorio",
    description: "Indicatori, fonti statistiche e valori aggregati.",
  },
] as const;

export default async function RedazioneDashboardPage() {
  const stats = await getEditorialInboxStats();
  const metrics = [
    { label: "Nuovi arrivi", value: stats.newItems, href: "/app/redazione/inbox?stato=new" },
    {
      label: "Da valutare / approfondire",
      value: stats.toReview,
      href: "/app/redazione/inbox?stato=to_review",
    },
    { label: "In carico", value: stats.assigned, href: "/app/redazione/inbox?stato=assigned" },
    {
      label: "Bozze create",
      value: stats.draftCreated,
      href: "/app/redazione/inbox?stato=draft_created",
    },
    {
      label: "Segnalazioni pubbliche",
      value: stats.publicSubmissions,
      href: "/app/redazione/inbox?origine=public_submission",
    },
  ] as const;

  return (
    <div>
      <p className="text-ink-muted text-xs font-semibold uppercase tracking-[0.14em]">
        Immigrati Imprenditori
      </p>
      <h1 className="text-ink mt-2 text-2xl font-semibold tracking-tight">
        Scrivania redazionale
      </h1>
      <p className="text-ink-muted mt-2 max-w-2xl text-sm leading-6">
        Area riservata alla redazione dell&apos;Osservatorio. Valuta gli arrivi,
        approfondisci le fonti e pubblica soltanto materiale verificato.
      </p>

      <section className="mt-8" aria-labelledby="coda-redazionale">
        <div className="flex items-end justify-between gap-4 border-b border-black pb-3">
          <div>
            <p className="text-ink-muted text-xs font-semibold uppercase tracking-[0.14em]">
              Stato del lavoro
            </p>
            <h2 id="coda-redazionale" className="text-ink mt-1 text-lg font-semibold">
              Coda redazionale
            </h2>
          </div>
          <Link href="/app/redazione/inbox" className="text-ink text-sm underline underline-offset-4">
            Apri Inbox
          </Link>
        </div>
        <div className="grid border-x border-b border-black sm:grid-cols-2 lg:grid-cols-5">
          {metrics.map((metric) => (
            <Link
              key={metric.label}
              href={metric.href}
              className="border-b border-black p-4 last:border-b-0 sm:border-r lg:border-b-0 lg:last:border-r-0"
            >
              <span className="text-ink block text-2xl font-semibold tabular-nums">
                {metric.value}
              </span>
              <span className="text-ink-muted mt-1 block text-xs leading-5">
                {metric.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {sections.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="border-line hover:border-ink block border p-5 transition-colors"
          >
            <h2 className="text-ink text-base font-semibold">{s.title}</h2>
            <p className="text-ink-muted mt-2 text-sm leading-6">{s.description}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button href="/app/redazione/contenuti/nuovo" size="sm">
          Nuovo contenuto
        </Button>
        <Button href="/app/redazione/inbox" size="sm" variant="secondary">
          Valuta gli arrivi
        </Button>
      </div>
    </div>
  );
}
