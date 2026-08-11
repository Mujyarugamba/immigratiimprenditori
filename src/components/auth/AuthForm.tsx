"use client";

import { useActionState } from "react";
import { FormField } from "@/components/forms/FormField";
import { Button } from "@/components/ui/Button";
import type { AuthActionState } from "@/lib/auth/actions";

const initial: AuthActionState = { ok: false };

type AuthFormProps = {
  mode: "login" | "signup";
  action: (
    prev: AuthActionState,
    formData: FormData,
  ) => Promise<AuthActionState>;
  next?: string;
};

export function AuthForm({ mode, action, next }: AuthFormProps) {
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {next ? <input type="hidden" name="next" value={next} /> : null}

      {mode === "signup" ? (
        <FormField
          label="Come vuoi apparire"
          name="full_name"
          autoComplete="name"
          disabled={pending}
        />
      ) : null}

      <FormField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
        disabled={pending}
        error={state.fieldErrors?.email}
      />

      <FormField
        label="Password"
        name="password"
        type="password"
        autoComplete={mode === "login" ? "current-password" : "new-password"}
        required
        disabled={pending}
        error={state.fieldErrors?.password}
        hint={mode === "signup" ? "Minimo 8 caratteri" : undefined}
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

      <Button type="submit" disabled={pending} className="w-full">
        {pending
          ? "Attendere…"
          : mode === "login"
            ? "Accedi"
            : "Crea account"}
      </Button>
    </form>
  );
}
