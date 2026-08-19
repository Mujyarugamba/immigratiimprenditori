import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

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
    description: "Articoli, analisi, storie, interviste e materiali editoriali del Centro Studi.",
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

export default function RedazioneDashboardPage() {
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

      <div className="mt-8">
        <Button href="/app/redazione/contenuti/nuovo" size="sm">
          Nuovo contenuto
        </Button>
      </div>
    </div>
  );
}
