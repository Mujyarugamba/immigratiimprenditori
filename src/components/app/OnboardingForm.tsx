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
        hint="Colleghiamo la Persona creata alla registrazione (id = auth user) tramite access_link_person."
      />
      {state.message ? (
        <p className="text-accent-dark text-sm" role="alert">
          {state.message}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Collegamento…" : "Collega Persona e continua"}
      </Button>
    </form>
  );
}
