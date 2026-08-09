"use client";

import { useActionState } from "react";
import { FormField } from "@/components/forms/FormField";
import { Button } from "@/components/ui/Button";
import {
  createBusinessAction,
  type FormActionState,
} from "@/lib/business/actions";

const initial: FormActionState = { ok: false };

export function CreateBusinessForm() {
  const [state, action, pending] = useActionState(createBusinessAction, initial);

  return (
    <form action={action} className="flex flex-col gap-4">
      <FormField
        label="Nome legale"
        name="legal_name"
        required
        disabled={pending}
      />
      <FormField
        label="Nome pubblico"
        name="public_name"
        required
        disabled={pending}
      />
      <FormField label="Sommario" name="summary" disabled={pending} />
      <label className="text-ink flex flex-col gap-1 text-sm">
        <span className="font-medium">Ruolo membership (descrittivo)</span>
        <select
          name="role_id"
          defaultValue="founder"
          disabled={pending}
          className="border-line rounded-md border px-3 py-2"
        >
          <option value="founder">Fondatore</option>
          <option value="owner">Titolare</option>
          <option value="partner">Socio</option>
          <option value="administrator">Amministratore</option>
          <option value="collaborator">Collaboratore</option>
        </select>
        <span className="text-ink-subtle text-xs">
          Il ruolo descrive la relazione: i permessi di gestione arrivano
          separatamente.
        </span>
      </label>

      {state.message ? (
        <p className="text-accent-dark text-sm" role="alert">
          {state.message}
        </p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Creazione…" : "Crea Impresa"}
      </Button>
    </form>
  );
}
