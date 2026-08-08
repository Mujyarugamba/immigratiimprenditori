"use client";

import { useActionState } from "react";
import { FormField } from "@/components/forms/FormField";
import { Button } from "@/components/ui/Button";
import { EditorialLifecycleButtons } from "@/components/app/editorial/EditorialLifecycleButtons";
import {
  createIndicatorAction,
  publishIndicatorAction,
  updateIndicatorAction,
  withdrawIndicatorAction,
  type FormActionState,
} from "@/lib/editorial/actions";
import type { ObservatoryIndicator } from "@/lib/data/editorial/observatory";

const initial: FormActionState = { ok: false };
const selectClass =
  "border-line bg-surface-elevated text-ink w-full rounded-md border px-3 py-2 text-sm";

const NATURE_OPTIONS = [
  { value: "count", units: ["units"] },
  { value: "percentage", units: ["percent"] },
  { value: "currency", units: ["eur", "eur_thousands"] },
  { value: "ratio", units: ["ratio"] },
  { value: "index", units: ["index_points"] },
];

export function IndicatorCreateForm() {
  const [state, action, pending] = useActionState(createIndicatorAction, initial);

  return (
    <form action={action} className="mt-6 flex flex-col gap-4">
      <FormField label="Codice" name="code" hint="Lascia vuoto per autogenerare" disabled={pending} />
      <FormField label="Slug" name="slug" disabled={pending} />
      <FormField label="Titolo" name="title" required disabled={pending} />
      <FormField label="Descrizione" name="description" required disabled={pending} />
      <FormField label="Scopo" name="purpose_text" required disabled={pending} />
      <FormField label="Metodologia" name="methodology_summary" required disabled={pending} />
      <label className="text-ink flex flex-col gap-1 text-sm">
        <span className="font-medium">Natura valore</span>
        <select name="value_nature" className={selectClass} defaultValue="count" disabled={pending}>
          {NATURE_OPTIONS.map((n) => (
            <option key={n.value} value={n.value}>{n.value}</option>
          ))}
        </select>
      </label>
      <label className="text-ink flex flex-col gap-1 text-sm">
        <span className="font-medium">Unità</span>
        <select name="unit_code" className={selectClass} defaultValue="units" disabled={pending}>
          <option value="units">units</option>
          <option value="percent">percent</option>
          <option value="eur">eur</option>
          <option value="eur_thousands">eur_thousands</option>
          <option value="ratio">ratio</option>
          <option value="index_points">index_points</option>
        </select>
      </label>
      <label className="text-ink flex flex-col gap-1 text-sm">
        <span className="font-medium">Periodicità</span>
        <select name="periodicity" className={selectClass} defaultValue="annual" disabled={pending}>
          <option value="annual">annual</option>
          <option value="quarterly">quarterly</option>
          <option value="monthly">monthly</option>
          <option value="point_in_time">point_in_time</option>
        </select>
      </label>
      {state.message && !state.ok ? (
        <p className="text-accent-dark text-sm">{state.message}</p>
      ) : null}
      <Button type="submit" disabled={pending}>Crea indicatore</Button>
    </form>
  );
}

export function IndicatorEditForm({ indicator }: { indicator: ObservatoryIndicator }) {
  const [state, action, pending] = useActionState(updateIndicatorAction, initial);

  return (
    <>
      <form action={action} className="mt-6 flex flex-col gap-4">
        <input type="hidden" name="id" value={indicator.id} />
        <FormField label="Codice" name="code" defaultValue={indicator.code} required disabled={pending} />
        <FormField label="Slug" name="slug" defaultValue={indicator.slug} required disabled={pending} />
        <FormField label="Titolo" name="title" defaultValue={indicator.title} required disabled={pending} />
        <FormField label="Descrizione" name="description" defaultValue={indicator.description} required disabled={pending} />
        <FormField label="Scopo" name="purpose_text" defaultValue={indicator.purpose_text} required disabled={pending} />
        <FormField label="Metodologia" name="methodology_summary" defaultValue={indicator.methodology_summary} required disabled={pending} />
        <label className="text-ink flex flex-col gap-1 text-sm">
          <span className="font-medium">Natura / Unità / Periodicità</span>
          <div className="grid gap-2 sm:grid-cols-3">
            <select name="value_nature" className={selectClass} defaultValue={indicator.value_nature} disabled={pending}>
              {NATURE_OPTIONS.map((n) => (
                <option key={n.value} value={n.value}>{n.value}</option>
              ))}
            </select>
            <select name="unit_code" className={selectClass} defaultValue={indicator.unit_code} disabled={pending}>
              <option value="units">units</option>
              <option value="percent">percent</option>
              <option value="eur">eur</option>
              <option value="eur_thousands">eur_thousands</option>
              <option value="ratio">ratio</option>
              <option value="index_points">index_points</option>
            </select>
            <select name="periodicity" className={selectClass} defaultValue={indicator.periodicity} disabled={pending}>
              <option value="annual">annual</option>
              <option value="quarterly">quarterly</option>
              <option value="monthly">monthly</option>
              <option value="point_in_time">point_in_time</option>
            </select>
          </div>
        </label>
        <label className="text-ink flex flex-col gap-1 text-sm">
          <span className="font-medium">Stato operativo</span>
          <select name="operational_status" className={selectClass} defaultValue={indicator.operational_status} disabled={pending}>
            <option value="draft">draft</option>
            <option value="active">active</option>
            <option value="deprecated">deprecated</option>
            <option value="retired">retired</option>
          </select>
        </label>
        {state.message ? (
          <p className={state.ok ? "text-brand-dark text-sm" : "text-accent-dark text-sm"}>{state.message}</p>
        ) : null}
        <Button type="submit" disabled={pending}>Salva</Button>
      </form>
      <EditorialLifecycleButtons
        id={indicator.id}
        publishAction={publishIndicatorAction}
        withdrawAction={withdrawIndicatorAction}
        publicationStatus={indicator.publication_status}
        publicHref={
          indicator.publication_status === "published"
            ? `/osservatorio/${indicator.slug}`
            : undefined
        }
      />
    </>
  );
}
