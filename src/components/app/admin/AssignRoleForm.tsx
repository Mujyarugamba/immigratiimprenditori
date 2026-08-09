"use client";

import { useActionState } from "react";
import { FormField } from "@/components/forms/FormField";
import { Button } from "@/components/ui/Button";
import {
  WHITELISTED_APPLICATION_ROLES,
  APPLICATION_ROLE_LABELS,
} from "@/lib/admin/labels";
import {
  assignRoleAction,
  type FormActionState,
} from "@/lib/admin/actions";

const initial: FormActionState = { ok: false };

type AssignRoleFormProps = {
  defaultAccountId?: string;
  /** Hide assign UI when target is the signed-in admin (self-elevate). */
  allowAssign?: boolean;
};

export function AssignRoleForm({
  defaultAccountId = "",
  allowAssign = true,
}: AssignRoleFormProps) {
  const [state, action, pending] = useActionState(assignRoleAction, initial);

  if (!allowAssign) {
    return (
      <p className="text-ink-muted text-sm">
        Non puoi assegnare ruoli elevati al tuo account (auto-promozione
        bloccata).
      </p>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <FormField
        label="Identificativo account"
        name="account_id"
        required
        disabled={pending}
        defaultValue={defaultAccountId}
        readOnly={Boolean(defaultAccountId)}
        hint="Identificativo tecnico dell'account (UUID)"
      />
      <FormField label="Ruolo" name="role_code" required disabled={pending}>
        <select
          id="role_code"
          name="role_code"
          required
          disabled={pending}
          className="border-line bg-surface-elevated text-ink focus:border-brand focus:ring-brand/30 rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 disabled:opacity-60"
          defaultValue=""
        >
          <option value="" disabled>
            Seleziona…
          </option>
          {WHITELISTED_APPLICATION_ROLES.map((code) => (
            <option key={code} value={code}>
              {APPLICATION_ROLE_LABELS[code]}
            </option>
          ))}
        </select>
      </FormField>
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
      <Button type="submit" disabled={pending} size="sm">
        {pending ? "Assegnazione…" : "Assegna ruolo"}
      </Button>
    </form>
  );
}
