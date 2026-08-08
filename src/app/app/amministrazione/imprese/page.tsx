import type { Metadata } from "next";
import Link from "next/link";
import { BootstrapGrantForm } from "@/components/app/BootstrapGrantForm";

export const metadata: Metadata = {
  title: "Imprese (bootstrap) — Amministrazione",
};

export default function AdminImpresePage() {
  return (
    <div>
      <h1 className="text-ink text-2xl font-semibold tracking-tight">
        Imprese — bootstrap grant
      </h1>
      <p className="text-ink-muted mt-2 text-sm">
        Crea il <strong>primo</strong> grant di gestione su una membership attiva
        tramite <code>access_bootstrap_business_grant</code>. Operazione Adm-only;
        non sostituisce i grant ordinari ACT.
      </p>

      <section className="border-line bg-surface-elevated mt-8 rounded-md border p-5 shadow-soft">
        <h2 className="text-ink text-base font-semibold">Bootstrap grant</h2>
        <BootstrapGrantForm />
      </section>

      <p className="border-line bg-surface-muted text-ink-muted mt-6 rounded-md border p-4 text-sm">
        Per grant e revoche <strong>successive</strong> (dopo il bootstrap), usa
        l&apos;esperienza ACT in{" "}
        <Link href="/app/imprese" className="text-brand hover:underline">
          Le mie imprese
        </Link>
        : <code>grant_business_management</code> e{" "}
        <code>revoke_business_management</code> richiedono autorizzazione di
        gestione sulla membership target.
      </p>
    </div>
  );
}
