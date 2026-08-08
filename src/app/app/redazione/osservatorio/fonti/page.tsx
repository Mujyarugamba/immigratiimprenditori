import type { Metadata } from "next";
import Link from "next/link";
import { SourceCreateForm, SourceRowForm } from "@/components/app/editorial/SourceForms";
import { listObservatorySources } from "@/lib/data/editorial/observatory";

export const metadata: Metadata = {
  title: "Fonti — Redazione",
};

export default async function FontiRedazionePage() {
  const sources = await listObservatorySources();

  return (
    <div>
      <Link href="/app/redazione/osservatorio" className="text-ink-muted hover:text-ink text-sm">
        ← Osservatorio
      </Link>
      <h1 className="text-ink mt-2 text-2xl font-semibold tracking-tight">
        Fonti statistiche
      </h1>
      <p className="text-ink-muted mt-1 text-sm">
        Solo <code>lifecycle_status</code> (active / deprecated / unavailable).
      </p>

      <SourceCreateForm />

      <section className="mt-8">
        <h2 className="text-ink text-base font-semibold">Elenco fonti</h2>
        {sources.length === 0 ? (
          <p className="text-ink-muted mt-4 text-sm">Nessuna fonte.</p>
        ) : (
          sources.map((s) => <SourceRowForm key={s.id} source={s} />)
        )}
      </section>
    </div>
  );
}
