"use client";

import { useActionState } from "react";
import { FormField } from "@/components/forms/FormField";
import { Button } from "@/components/ui/Button";
import {
  linkPersonAction,
  type FormActionState,
} from "@/lib/admin/actions";

const initial: FormActionState = { ok: false };

type LinkPersonFormProps = {
  accountId: string;
  disabled?: boolean;
};

export function LinkPersonForm({ accountId, disabled = false }: LinkPersonFormProps) {
  const [state, action, pending] = useActionState(linkPersonAction, initial);

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="account_id" value={accountId} />
      <p className="text-ink-muted text-sm">
        Collega un profilo esistente con associazione verificata. Non sostituisce
        un profilo già associato a questo account.
      </p>
      <FormField
        label="ID profilo"
        name="person_id"
        required
        disabled={pending || disabled}
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
      <Button type="submit" disabled={pending || disabled} size="sm">
        {pending ? "Collegamento…" : "Collega profilo"}
      </Button>
    </form>
  );
}
