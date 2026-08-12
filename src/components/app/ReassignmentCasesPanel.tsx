"use client";

import { useActionState } from "react";
import { FormField } from "@/components/forms/FormField";
import { Button } from "@/components/ui/Button";
import {
  resolveBusinessReassignmentAction,
  resolveOrganizationReassignmentAction,
  type FormActionState,
} from "@/lib/admin/reassignment-actions";
import type { ReassignmentCaseRow } from "@/lib/data/admin/reassignment";

const initial: FormActionState = { ok: false };

function BusinessResolveForm({ caseId }: { caseId: string }) {
  const [state, action, pending] = useActionState(
    resolveBusinessReassignmentAction,
    initial,
  );
  return (
    <form action={action} className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
      <input type="hidden" name="case_id" value={caseId} />
      <FormField
        label="ID collegamento"
        name="membership_id"
        required
        disabled={pending}
        hint="Collegamento attivo persona–impresa a cui assegnare la gestione"
      />
      <Button type="submit" disabled={pending} size="sm">
        {pending ? "…" : "Assegna gestione"}
      </Button>
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
    </form>
  );
}

function OrganizationResolveForm({ caseId }: { caseId: string }) {
  const [state, action, pending] = useActionState(
    resolveOrganizationReassignmentAction,
    initial,
  );
  return (
    <form action={action} className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
      <input type="hidden" name="case_id" value={caseId} />
      <FormField
        label="ID profilo"
        name="new_owner_person_id"
        required
        disabled={pending}
        hint="Profilo con account attivo da impostare come titolare scheda"
      />
      <Button type="submit" disabled={pending} size="sm">
        {pending ? "…" : "Assegna titolare"}
      </Button>
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
    </form>
  );
}

export function ReassignmentCasesPanel({
  cases,
}: {
  cases: ReassignmentCaseRow[];
}) {
  if (cases.length === 0) {
    return (
      <p className="text-ink-muted mt-6 text-sm">
        Nessuna gestione in attesa di riassegnazione.
      </p>
    );
  }

  return (
    <ul className="mt-6 space-y-4">
      {cases.map((c) => (
        <li
          key={c.id}
          className="border-line bg-surface-elevated rounded-md border p-5 shadow-soft"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-ink text-base font-semibold">{c.entity_label}</h2>
            <span className="text-ink-subtle text-xs">
              {c.entity_kind === "business" ? "Impresa" : "Organizzazione"} ·{" "}
              {new Date(c.opened_at).toLocaleString("it-IT")}
            </span>
          </div>
          <p className="text-ink-muted mt-1 text-xs">
            Stato: in attesa · caso {c.id}
          </p>
          {c.entity_kind === "business" ? (
            <BusinessResolveForm caseId={c.id} />
          ) : (
            <OrganizationResolveForm caseId={c.id} />
          )}
        </li>
      ))}
    </ul>
  );
}
