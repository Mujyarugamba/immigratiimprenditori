import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Redazione",
};

const sections = [
  {
    href: "/app/redazione/contenuti",
    title: "Contenuti",
    description: "Articoli, guide e materiali editoriali di piattaforma.",
  },
  {
    href: "/app/redazione/opportunita",
    title: "Opportunità",
    description:
      "Coda di revisione per bandi e misure da fonti ufficiali e dalla rete.",
  },
  {
    href: "/app/redazione/mercati-internazionali",
    title: "Mercati internazionali",
    description:
      "Revisione e pubblicazione selettiva di indicatori World Bank (M1).",
  },
  {
    href: "/app/redazione/osservatorio",
    title: "Osservatorio",
    description: "Indicatori, fonti statistiche e valori aggregati.",
  },
  {
    href: "/app/redazione/organizzazioni",
    title: "Organizzazioni",
    description: "Schede istituzionali curate dalla redazione.",
  },
] as const;

export default function RedazioneDashboardPage() {
  return (
    <div>
      <h1 className="text-ink text-2xl font-semibold tracking-tight">
        Dashboard Redazione
      </h1>
      <p className="text-ink-muted mt-2 text-sm">
        Area riservata al ruolo <strong>redattore</strong>. Gestisci contenuti,
        dati dell&apos;osservatorio e organizzazioni editoriali.
      </p>

      <p className="border-line bg-surface-elevated text-ink mt-4 rounded-md border p-4 text-sm shadow-soft">
        L&apos;amministrazione è un&apos;area separata e non sostituisce la
        redazione.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="border-line bg-surface-elevated hover:border-line-strong block rounded-md border p-5 shadow-soft transition-colors"
          >
            <h2 className="text-ink text-base font-semibold">{s.title}</h2>
            <p className="text-ink-muted mt-2 text-sm">{s.description}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <Button href="/app/redazione/contenuti/nuovo" size="sm">
          Nuovo contenuto
        </Button>
      </div>
    </div>
  );
}
