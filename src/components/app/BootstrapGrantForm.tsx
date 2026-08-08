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
        Solo Adm: crea il <strong>primo</strong> grant di gestione su una
        membership attiva. Non è un grant ordinario e non è disponibile agli
        utenti CTX.
      </p>
      <FormField
        label="Membership id"
        name="membership_id"
        required
        disabled={pending}
        hint="UUID di business_memberships"
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
        {pending ? "Esecuzione…" : "Bootstrap grant"}
      </Button>
    </form>
  );
}
