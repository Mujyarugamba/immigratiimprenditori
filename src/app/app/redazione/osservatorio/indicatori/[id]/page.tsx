import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { IndicatorEditForm } from "@/components/app/editorial/IndicatorForms";
import { getObservatoryIndicatorById } from "@/lib/data/editorial/observatory";

export const metadata: Metadata = {
  title: "Modifica indicatore — Redazione",
};

type Props = { params: Promise<{ id: string }> };

export default async function IndicatoreRedazionePage({ params }: Props) {
  const { id } = await params;
  const indicator = await getObservatoryIndicatorById(id);
  if (!indicator) notFound();

  return (
    <div>
      <Link href="/app/redazione/osservatorio/indicatori" className="text-ink-muted hover:text-ink text-sm">
        ← Indicatori
      </Link>
      <h1 className="text-ink mt-2 text-2xl font-semibold tracking-tight">{indicator.title}</h1>
      <p className="text-ink-muted mt-1 text-sm">
        <code>{indicator.code}</code> · {indicator.publication_status}
      </p>
      <IndicatorEditForm indicator={indicator} />
    </div>
  );
}
