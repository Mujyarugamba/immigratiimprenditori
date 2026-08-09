"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import {
  closeAccountAction,
  type FormActionState,
} from "@/lib/admin/actions";

const initial: FormActionState = { ok: false };

type CloseAccountFormProps = {
  accountId: string;
  disabled?: boolean;
};

export function CloseAccountForm({
  accountId,
  disabled = false,
}: CloseAccountFormProps) {
  const [state, action, pending] = useActionState(closeAccountAction, initial);

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="account_id" value={accountId} />
      <p className="text-ink-muted text-sm">
        Chiude definitivamente l&apos;account. Se già chiuso, l&apos;operazione
        non ha effetti aggiuntivi.
      </p>
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
      <Button
        type="submit"
        variant="secondary"
        size="sm"
        disabled={pending || disabled}
        className="self-start"
      >
        {pending ? "Chiusura…" : "Chiudi account"}
      </Button>
    </form>
  );
}
