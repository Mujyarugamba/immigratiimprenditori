"use client";

import { useActionState } from "react";
import { FormField } from "@/components/forms/FormField";
import { Button } from "@/components/ui/Button";
import {
  completeOnboardingAction,
  type AuthActionState,
} from "@/lib/auth/actions";

const initial: AuthActionState = { ok: false };

export function OnboardingForm({
  defaultDisplayName,
}: {
  defaultDisplayName?: string;
}) {
  const [state, formAction, pending] = useActionState(
    completeOnboardingAction,
    initial,
  );

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-4">
      <FormField
        label="Nome pubblico"
        name="display_name"
        defaultValue={defaultDisplayName}
        disabled={pending}
        hint="Come vuoi apparire nella rete. Puoi modificarlo in seguito dal profilo."
      />
      {state.message ? (
        <p className="text-accent-dark text-sm" role="alert">
          {state.message}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Salvataggio…" : "Continua"}
      </Button>
    </form>
  );
}
