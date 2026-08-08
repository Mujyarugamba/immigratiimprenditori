import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Osservatorio — Redazione",
};

const links = [
  {
    href: "/app/redazione/osservatorio/indicatori",
    title: "Indicatori",
    description: "Definizioni metodologiche e ciclo di pubblicazione.",
  },
  {
    href: "/app/redazione/osservatorio/fonti",
    title: "Fonti statistiche",
    description: "Provenienza dati (lifecycle_status).",
  },
  {
    href: "/app/redazione/osservatorio/valori",
    title: "Valori",
    description: "Valori aggregati per indicatore; revisione con supersedes.",
  },
] as const;

export default function OsservatorioHubPage() {
  return (
    <div>
      <h1 className="text-ink text-2xl font-semibold tracking-tight">
        Osservatorio
      </h1>
      <p className="text-ink-muted mt-2 text-sm">
        Dominio a ownership redazionale implicita: nessuna colonna{" "}
        <code>owned_by_editorial</code> sulle tabelle OSS.
      </p>
      <p className="border-line bg-surface-elevated text-ink-muted mt-4 rounded-md border p-3 text-xs">
        Limite editoriale (privacy): pubblicare solo aggregati; per conteggi
        derivati da soggetti usare soglia minima 5 salvo fonte ufficiale. Non
        caricare microdati.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="border-line bg-surface-elevated hover:border-line-strong block rounded-md border p-5 shadow-soft transition-colors"
          >
            <h2 className="text-ink text-base font-semibold">{l.title}</h2>
            <p className="text-ink-muted mt-2 text-sm">{l.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
