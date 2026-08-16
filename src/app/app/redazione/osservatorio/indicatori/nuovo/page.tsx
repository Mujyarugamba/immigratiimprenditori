import type { Metadata } from "next";
import Link from "next/link";
import { IndicatorCreateForm } from "@/components/app/editorial/IndicatorForms";

export const metadata: Metadata = {
  title: "Nuovo indicatore — Redazione",
};

export default function NuovoIndicatorePage() {
  return (
    <div>
      <Link href="/app/redazione/osservatorio/indicatori" className="text-ink-muted hover:text-ink text-sm">
        ← Indicatori
      </Link>
      <h1 className="text-ink mt-2 text-2xl font-semibold tracking-tight">Nuovo indicatore</h1>
      <IndicatorCreateForm />
    </div>
  );
}
