"use client";

import { useActionState } from "react";
import { FormField } from "@/components/forms/FormField";
import { Button } from "@/components/ui/Button";
import {
  createValueAction,
  reviseValueAction,
  type FormActionState,
} from "@/lib/editorial/actions";
import type {
  ObservatoryIndicator,
  ObservatoryIndicatorValue,
  ObservatorySource,
} from "@/lib/data/editorial/observatory";

const VALUE_QUALITY_LABELS: Record<string, string> = {
  official: "Ufficiale",
  estimated: "Stimato",
  derived: "Derivato",
  self_reported: "Autodichiarato",
};

const VALUE_STATUS_LABELS: Record<string, string> = {
  provisional: "Provvisorio",
  final: "Definitivo",
  revised: "Revisionato",
  withdrawn: "Ritirato",
};

const initial: FormActionState = { ok: false };
const selectClass =
  "border-line bg-surface-elevated text-ink w-full rounded-md border px-3 py-2 text-sm";

type Props = {
  indicators: ObservatoryIndicator[];
  sources: ObservatorySource[];
  selectedIndicatorId?: string;
};

export function ValueCreateForm({
  indicators,
  sources,
  selectedIndicatorId,
}: Props) {
  const [state, action, pending] = useActionState(createValueAction, initial);

  return (
    <form action={action} className="border-line bg-surface-elevated mt-6 rounded-md border p-4 shadow-soft">
      <h2 className="text-ink text-base font-semibold">Nuovo valore</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="text-ink flex flex-col gap-1 text-sm sm:col-span-2">
          <span className="font-medium">Indicatore</span>
          <select name="indicator_id" className={selectClass} required disabled={pending} defaultValue={selectedIndicatorId ?? ""}>
            <option value="" disabled>Seleziona…</option>
            {indicators.map((i) => (
              <option key={i.id} value={i.id}>{i.code} — {i.title}</option>
            ))}
          </select>
        </label>
        <label className="text-ink flex flex-col gap-1 text-sm sm:col-span-2">
          <span className="font-medium">Fonte</span>
          <select name="source_id" className={selectClass} required disabled={pending} defaultValue="">
            <option value="" disabled>Seleziona…</option>
            {sources.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </label>
        <FormField label="Valore numerico" name="numeric_value" type="number" step="any" required disabled={pending} />
        <label className="text-ink flex flex-col gap-1 text-sm">
          <span className="font-medium">Qualità</span>
          <select name="quality_code" className={selectClass} defaultValue="official" disabled={pending}>
            <option value="official">{VALUE_QUALITY_LABELS.official}</option>
            <option value="estimated">{VALUE_QUALITY_LABELS.estimated}</option>
            <option value="derived">{VALUE_QUALITY_LABELS.derived}</option>
            <option value="self_reported">{VALUE_QUALITY_LABELS.self_reported}</option>
          </select>
        </label>
        <FormField label="Periodo inizio" name="period_start" type="date" required disabled={pending} />
        <FormField label="Periodo fine" name="period_end" type="date" required disabled={pending} />
        <label className="text-ink flex flex-col gap-1 text-sm">
          <span className="font-medium">Stato</span>
          <select name="status" className={selectClass} defaultValue="provisional" disabled={pending}>
            <option value="provisional">{VALUE_STATUS_LABELS.provisional}</option>
            <option value="final">{VALUE_STATUS_LABELS.final}</option>
          </select>
        </label>
      </div>
      {state.message ? (
        <p className={`mt-3 text-sm ${state.ok ? "text-brand-dark" : "text-accent-dark"}`}>{state.message}</p>
      ) : null}
      <Button type="submit" size="sm" className="mt-4" disabled={pending}>Crea valore</Button>
    </form>
  );
}

export function ValueReviseForm({
  value,
  indicators,
  sources,
}: {
  value: ObservatoryIndicatorValue;
  indicators: ObservatoryIndicator[];
  sources: ObservatorySource[];
}) {
  const [state, action, pending] = useActionState(reviseValueAction, initial);
  const indicator = indicators.find((i) => i.id === value.indicator_id);

  if (value.status === "withdrawn") return null;

  return (
    <form action={action} className="border-line mt-2 rounded-md border border-dashed p-3">
      <input type="hidden" name="old_id" value={value.id} />
      <input type="hidden" name="indicator_id" value={value.indicator_id} />
      <input type="hidden" name="source_id" value={value.source_id} />
      <input type="hidden" name="period_start" value={value.period_start} />
      <input type="hidden" name="period_end" value={value.period_end} />
      <input type="hidden" name="quality_code" value={value.quality_code} />
      <p className="text-ink-subtle text-xs font-medium">Revisione</p>
      <div className="mt-2 flex flex-wrap items-end gap-2">
        <FormField
          label="Nuovo valore"
          name="numeric_value"
          type="number"
          step="any"
          defaultValue={String(value.numeric_value)}
          disabled={pending}
        />
        <label className="text-ink flex flex-col gap-1 text-sm">
          <span className="font-medium">Stato nuovo</span>
          <select name="status" className={selectClass} defaultValue="revised" disabled={pending}>
            <option value="revised">{VALUE_STATUS_LABELS.revised}</option>
            <option value="final">{VALUE_STATUS_LABELS.final}</option>
          </select>
        </label>
        <Button type="submit" size="sm" variant="secondary" disabled={pending}>
          Revisiona
        </Button>
      </div>
      {indicator ? (
        <p className="text-ink-subtle mt-1 text-xs">Fonte: {sources.find((s) => s.id === value.source_id)?.name ?? value.source_id}</p>
      ) : null}
      {state.message ? (
        <p className={`mt-2 text-xs ${state.ok ? "text-brand-dark" : "text-accent-dark"}`}>{state.message}</p>
      ) : null}
    </form>
  );
}
