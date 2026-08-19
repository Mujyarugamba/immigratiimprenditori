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
    description: "Articoli, guide e materiali editoriali del Centro Studi.",
  },
  {
    href: "/app/redazione/eventi",
    title: "Eventi",
    description:
      "Coda di revisione per eventi acquisiti o curati dalla redazione.",
  },
  {
    href: "/app/redazione/osservatorio",
    title: "Osservatorio",
    description: "Indicatori, fonti statistiche e valori aggregati.",
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
        eventi e dati dell&apos;osservatorio del Centro Studi.
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
