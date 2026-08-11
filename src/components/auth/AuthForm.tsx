"use client";

import Link from "next/link";
import { useActionState } from "react";
import { FormField } from "@/components/forms/FormField";
import { Button } from "@/components/ui/Button";
import type { AuthActionState } from "@/lib/auth/actions";
import { LEGAL_ROUTES } from "@/lib/legal/versions";

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
  const termsError = state.fieldErrors?.accept_terms;

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

      {mode === "signup" ? (
        <div className="flex flex-col gap-2">
          <div className="flex items-start gap-3">
            <input
              id="accept_terms"
              name="accept_terms"
              type="checkbox"
              value="on"
              disabled={pending}
              aria-invalid={Boolean(termsError)}
              aria-describedby={
                termsError
                  ? "accept_terms-error"
                  : "accept_terms-privacy-note"
              }
              className="border-line text-brand focus:ring-brand/40 mt-1 size-4 shrink-0 rounded border focus:ring-2 focus:outline-none"
            />
            <label htmlFor="accept_terms" className="text-ink text-sm leading-snug">
              Accetto i{" "}
              <Link
                href={LEGAL_ROUTES.termini}
                className="text-brand font-medium underline-offset-2 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Termini d’Uso
              </Link>
            </label>
          </div>
          <p
            id="accept_terms-privacy-note"
            className="text-ink-subtle pl-7 text-xs leading-snug"
          >
            Informativa sulla{" "}
            <Link
              href={LEGAL_ROUTES.privacy}
              className="text-brand font-medium underline-offset-2 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Privacy Policy
            </Link>{" "}
            (solo informativa, non è un consenso).
          </p>
          {termsError ? (
            <p
              id="accept_terms-error"
              className="text-accent-dark pl-7 text-xs"
              role="alert"
            >
              {termsError}
            </p>
          ) : null}
        </div>
      ) : null}

      {state.message && !termsError ? (
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
