"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { FormField } from "@/components/forms/FormField";
import { Button } from "@/components/ui/Button";
import {
  SELF_DELETE_CONFIRM_PHRASE,
  SELF_DELETE_USER_COPY,
} from "@/lib/access/self-delete";
import {
  selfDeleteAccountAction,
  type SelfDeleteActionState,
} from "@/lib/access/self-delete-actions";

const initial: SelfDeleteActionState = { ok: false };

type Props = {
  blockedMessage?: string | null;
  willOpenReassignment?: boolean;
};

export function DeleteAccountForm({
  blockedMessage,
  willOpenReassignment,
}: Props) {
  const [state, action, pending] = useActionState(
    selfDeleteAccountAction,
    initial,
  );
  const [password, setPassword] = useState("");
  const [phrase, setPhrase] = useState("");

  const ready = useMemo(
    () =>
      password.length > 0 &&
      phrase.trim() === SELF_DELETE_CONFIRM_PHRASE &&
      !blockedMessage,
    [password, phrase, blockedMessage],
  );

  if (blockedMessage) {
    return (
      <section
        className="border-line bg-surface-elevated mt-10 rounded-md border p-5 shadow-soft"
        aria-labelledby="delete-account-title"
      >
        <h2
          id="delete-account-title"
          className="text-ink text-base font-semibold"
        >
          {SELF_DELETE_USER_COPY.title}
        </h2>
        <p className="text-accent-dark mt-3 text-sm" role="alert">
          {blockedMessage}
        </p>
      </section>
    );
  }

  return (
    <section
      className="border-line bg-surface-elevated mt-10 rounded-md border p-5 shadow-soft"
      aria-labelledby="delete-account-title"
    >
      <h2 id="delete-account-title" className="text-ink text-base font-semibold">
        {SELF_DELETE_USER_COPY.title}
      </h2>
      <p className="text-ink mt-3 text-sm">
        Questa operazione chiude definitivamente il tuo account personale e
        rimuove il tuo profilo dalla rete.
      </p>
      <p className="text-ink-muted mt-2 text-sm">{SELF_DELETE_USER_COPY.summary}</p>
      {willOpenReassignment ? (
        <p className="text-ink-muted mt-2 text-sm">
          {SELF_DELETE_USER_COPY.orphanInfo}
        </p>
      ) : null}
      <p className="text-ink-muted mt-2 text-sm">
        Per i dettagli sul trattamento dei dati personali consulta la{" "}
        <Link
          href={SELF_DELETE_USER_COPY.privacyHref}
          className="text-brand font-medium hover:underline"
        >
          Privacy Policy
        </Link>
        .
      </p>
      <p className="text-ink mt-4 text-sm font-medium">
        Per continuare, inserisci la password e scrivi {SELF_DELETE_CONFIRM_PHRASE}.
      </p>

      <form action={action} className="mt-4 flex flex-col gap-4">
        <FormField
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          disabled={pending}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={state.fieldErrors?.password}
        />
        <FormField
          label={`Scrivi ${SELF_DELETE_CONFIRM_PHRASE}`}
          name="confirm_phrase"
          required
          disabled={pending}
          value={phrase}
          onChange={(e) => setPhrase(e.target.value)}
          error={state.fieldErrors?.confirm_phrase}
          hint={`Deve corrispondere esattamente a ${SELF_DELETE_CONFIRM_PHRASE}`}
        />
        {state.message && !state.fieldErrors?.password && !state.fieldErrors?.confirm_phrase ? (
          <p className="text-accent-dark text-sm" role="alert">
            {state.message}
          </p>
        ) : null}
        <Button
          type="submit"
          variant="destructive"
          disabled={!ready || pending}
        >
          {pending ? "Cancellazione in corso…" : "Cancella definitivamente l’account"}
        </Button>
      </form>
    </section>
  );
}
