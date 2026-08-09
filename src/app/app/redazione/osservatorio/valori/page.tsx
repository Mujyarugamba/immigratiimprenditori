import type { Metadata } from "next";
import Link from "next/link";
import { ValueCreateForm, ValueReviseForm } from "@/components/app/editorial/ValueForms";
import {
  listObservatoryIndicatorValues,
  listObservatoryIndicators,
  listObservatorySources,
} from "@/lib/data/editorial/observatory";
import { label } from "@/lib/public/labels";

const VALUE_STATUS_LABELS: Record<string, string> = {
  provisional: "Provvisorio",
  final: "Definitivo",
  revised: "Revisionato",
  withdrawn: "Ritirato",
};

export const metadata: Metadata = {
  title: "Valori — Redazione",
};

type Props = {
  searchParams: Promise<{ indicator_id?: string }>;
};

export default async function ValoriRedazionePage({ searchParams }: Props) {
  const params = await searchParams;
  const indicatorId = params.indicator_id?.trim();

  const [indicators, sources, values] = await Promise.all([
    listObservatoryIndicators(),
    listObservatorySources(),
    listObservatoryIndicatorValues(indicatorId || undefined),
  ]);

  return (
    <div>
      <Link href="/app/redazione/osservatorio" className="text-ink-muted hover:text-ink text-sm">
        ← Osservatorio
      </Link>
      <h1 className="text-ink mt-2 text-2xl font-semibold tracking-tight">Valori indicatore</h1>

      <form
        method="get"
        className="border-line bg-surface-elevated mt-4 flex flex-wrap items-end gap-3 rounded-md border p-4 shadow-soft"
      >
        <label className="text-ink flex flex-col gap-1 text-sm">
          <span className="font-medium">Filtra per indicatore</span>
          <select
            name="indicator_id"
            defaultValue={indicatorId ?? ""}
            className="border-line min-w-[240px] rounded-md border px-3 py-2 text-sm"
          >
            <option value="">Tutti</option>
            {indicators.map((i) => (
              <option key={i.id} value={i.id}>
                {i.code}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="bg-brand text-white rounded-sm px-4 py-2 text-sm font-medium">
          Filtra
        </button>
      </form>

      <ValueCreateForm
        indicators={indicators}
        sources={sources}
        selectedIndicatorId={indicatorId}
      />

      <section className="mt-8">
        <h2 className="text-ink text-base font-semibold">Valori ({values.length})</h2>
        {values.length === 0 ? (
          <p className="text-ink-muted mt-4 text-sm">Nessun valore.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {values.map((v) => {
              const ind = indicators.find((i) => i.id === v.indicator_id);
              return (
                <li key={v.id} className="border-line rounded-md border p-4 text-sm">
                  <div className="flex flex-wrap justify-between gap-2">
                    <span className="text-ink font-medium">
                      {ind?.code ?? v.indicator_id}: {v.numeric_value}
                    </span>
                    <span className="text-ink-muted">
                      {v.period_start} → {v.period_end} ·{" "}
                      {label(VALUE_STATUS_LABELS, v.status)}
                    </span>
                  </div>
                  <ValueReviseForm value={v} indicators={indicators} sources={sources} />
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
