"use client";

import { useActionState } from "react";
import { FormField } from "@/components/forms/FormField";
import { Button } from "@/components/ui/Button";
import {
  bootstrapGrantAction,
  type FormActionState,
} from "@/lib/business/actions";

const initial: FormActionState = { ok: false };

export function BootstrapGrantForm() {
  const [state, action, pending] = useActionState(bootstrapGrantAction, initial);

  return (
    <form action={action} className="mt-4 flex flex-col gap-4">
      <p className="text-ink-muted text-sm">
        Solo amministratori: abilita il <strong>primo</strong> permesso di
        gestione su un collegamento impresa già attivo.
      </p>
      <FormField
        label="ID collegamento"
        name="membership_id"
        required
        disabled={pending}
        hint="Visibile nel dettaglio impresa"
      />
      {state.message ? (
        <p
          className={
            state.ok ? "text-brand-dark text-sm" : "text-accent-dark text-sm"
          }
          role={state.ok ? "status" : "alert"}
        >
          {state.message}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Abilitazione…" : "Abilita prima gestione"}
      </Button>
    </form>
  );
}
