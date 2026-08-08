"use client";

import { useActionState } from "react";
import { FormField } from "@/components/forms/FormField";
import { Button } from "@/components/ui/Button";
import {
  createSourceAction,
  updateSourceAction,
  type FormActionState,
} from "@/lib/editorial/actions";
import type { ObservatorySource } from "@/lib/data/editorial/observatory";

const initial: FormActionState = { ok: false };
const selectClass =
  "border-line bg-surface-elevated text-ink w-full rounded-md border px-3 py-2 text-sm";

export function SourceCreateForm() {
  const [state, action, pending] = useActionState(createSourceAction, initial);

  return (
    <form action={action} className="border-line bg-surface-elevated mt-6 rounded-md border p-4 shadow-soft">
      <h2 className="text-ink text-base font-semibold">Nuova fonte</h2>
      <div className="mt-4 flex flex-col gap-3">
        <FormField label="Nome" name="name" required disabled={pending} />
        <FormField label="Produttore" name="producer_name" required disabled={pending} />
        <FormField label="Titolo pubblicazione" name="publication_title" required disabled={pending} />
        <FormField label="URL" name="url" disabled={pending} />
        {state.message ? (
          <p className={state.ok ? "text-brand-dark text-sm" : "text-accent-dark text-sm"}>{state.message}</p>
        ) : null}
        <Button type="submit" size="sm" disabled={pending}>Crea fonte</Button>
      </div>
    </form>
  );
}

export function SourceRowForm({ source }: { source: ObservatorySource }) {
  const [state, action, pending] = useActionState(updateSourceAction, initial);

  return (
    <form action={action} className="border-line flex flex-col gap-2 border-b py-4 last:border-b-0">
      <input type="hidden" name="id" value={source.id} />
      <div className="grid gap-2 sm:grid-cols-2">
        <FormField label="Nome" name="name" defaultValue={source.name} disabled={pending} />
        <FormField label="Produttore" name="producer_name" defaultValue={source.producer_name} disabled={pending} />
        <FormField label="Titolo pubblicazione" name="publication_title" defaultValue={source.publication_title} disabled={pending} />
        <FormField label="URL" name="url" defaultValue={source.url ?? ""} disabled={pending} />
        <label className="text-ink flex flex-col gap-1 text-sm sm:col-span-2">
          <span className="font-medium">Lifecycle</span>
          <select name="lifecycle_status" className={selectClass} defaultValue={source.lifecycle_status} disabled={pending}>
            <option value="active">active</option>
            <option value="deprecated">deprecated</option>
            <option value="unavailable">unavailable</option>
          </select>
        </label>
      </div>
      {state.message ? (
        <p className={state.ok ? "text-brand-dark text-xs" : "text-accent-dark text-xs"}>{state.message}</p>
      ) : null}
      <Button type="submit" size="sm" variant="secondary" disabled={pending} className="self-start">
        Aggiorna
      </Button>
    </form>
  );
}
