import type { Metadata } from "next";
import Link from "next/link";
import { BootstrapGrantForm } from "@/components/app/BootstrapGrantForm";

export const metadata: Metadata = {
  title: "Autorizzazioni imprese — Amministrazione",
};

export default function AdminImpresePage() {
  return (
    <div>
      <h1 className="text-ink text-2xl font-semibold tracking-tight">
        Autorizzazioni imprese
      </h1>
      <p className="text-ink-muted mt-2 text-sm">
        Abilita il <strong>primo</strong> permesso di gestione su una membership
        attiva. Operazione riservata agli amministratori applicativi; non
        sostituisce le assegnazioni ordinarie successive.
      </p>

      <section className="border-line bg-surface-elevated mt-8 rounded-md border p-5 shadow-soft">
        <h2 className="text-ink text-base font-semibold">
          Prima abilitazione gestione
        </h2>
        <BootstrapGrantForm />
      </section>

      <p className="border-line bg-surface-muted text-ink-muted mt-6 rounded-md border p-4 text-sm">
        Per assegnazioni e revoche <strong>successive</strong>, usa{" "}
        <Link href="/app/imprese" className="text-brand hover:underline">
          Le mie imprese
        </Link>{" "}
        con un account che ha già i permessi di gestione sull&apos;impresa.
      </p>
    </div>
  );
}
