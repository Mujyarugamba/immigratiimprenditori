"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/Button";
import type { EditorialInterviewWorkflow } from "@/lib/data/editorial/interviews";
import {
  canApproveInterview,
  canEditInterviewConsents,
  type InterviewConsentKind,
  type InterviewConsentStatus,
} from "@/lib/editorial/interview-workflow";
import {
  updateInterviewWorkflowAction,
  type InterviewWorkflowActionState,
} from "@/lib/editorial/interview-workflow-actions";

const initial: InterviewWorkflowActionState = { ok: false };

const selectClass =
  "border-line bg-surface-elevated text-ink focus:border-brand focus:ring-brand/30 w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2";

const CONSENTS: {
  kind: InterviewConsentKind;
  label: string;
  field: keyof Pick<
    EditorialInterviewWorkflow,
    | "publication_consent_status"
    | "quote_approval_status"
    | "image_consent_status"
    | "video_consent_status"
  >;
  allowNotRequired: boolean;
}[] = [
  {
    kind: "publication",
    label: "Pubblicazione",
    field: "publication_consent_status",
    allowNotRequired: false,
  },
  {
    kind: "quote",
    label: "Citazioni",
    field: "quote_approval_status",
    allowNotRequired: false,
  },
  {
    kind: "image",
    label: "Immagini",
    field: "image_consent_status",
    allowNotRequired: true,
  },
  {
    kind: "video",
    label: "Video",
    field: "video_consent_status",
    allowNotRequired: true,
  },
];

const CONSENT_OPTIONS: { value: InterviewConsentStatus; label: string }[] = [
  { value: "pending", label: "Da acquisire" },
  { value: "granted", label: "Concesso" },
  { value: "declined", label: "Negato" },
  { value: "not_required", label: "Non richiesto" },
];

function WorkflowForm({
  contentId,
  operation,
  action,
  children,
}: {
  contentId: string;
  operation: string;
  action: (payload: FormData) => void;
  children: React.ReactNode;
}) {
  return (
    <form action={action}>
      <input type="hidden" name="content_id" value={contentId} />
      <input type="hidden" name="operation" value={operation} />
      {children}
    </form>
  );
}

export function InterviewWorkflowControls({
  workflow,
}: {
  workflow: EditorialInterviewWorkflow;
}) {
  const [state, action, pending] = useActionState(updateInterviewWorkflowAction, initial);
  const [scheduledLocal, setScheduledLocal] = useState("");

  let scheduledIso = "";
  if (scheduledLocal) {
    const parsed = new Date(scheduledLocal);
    if (!Number.isNaN(parsed.getTime())) scheduledIso = parsed.toISOString();
  }

  const canEditConsents = canEditInterviewConsents(workflow.workflow_status);
  const canApprove = canApproveInterview({
    workflowStatus: workflow.workflow_status,
    publicationConsentStatus: workflow.publication_consent_status,
    quoteApprovalStatus: workflow.quote_approval_status,
  });

  return (
    <div className="border-line mt-5 border-t pt-5">
      <div>
        <h3 className="text-ink text-sm font-semibold">Azioni workflow</h3>
        <p className="text-ink-muted mt-1 max-w-3xl text-xs leading-5">
          Questi comandi registrano attività già decise o svolte dalla redazione.
          Non inviano email, messaggi o inviti e non pubblicano il contenuto.
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {workflow.workflow_status === "candidate" ? (
          <WorkflowForm contentId={workflow.content_id} operation="mark_contacted" action={action}>
            <Button type="submit" size="sm" disabled={pending}>
              {pending ? "Registrazione…" : "Registra contatto effettuato"}
            </Button>
          </WorkflowForm>
        ) : null}

        {["contacted", "scheduled"].includes(workflow.workflow_status) ? (
          <>
            <WorkflowForm contentId={workflow.content_id} operation="mark_interviewed" action={action}>
              <Button type="submit" size="sm" disabled={pending}>
                Registra intervista svolta
              </Button>
            </WorkflowForm>
            <WorkflowForm contentId={workflow.content_id} operation="decline" action={action}>
              <Button type="submit" size="sm" variant="secondary" disabled={pending}>
                Registra rinuncia / rifiuto
              </Button>
            </WorkflowForm>
          </>
        ) : null}

        {workflow.workflow_status === "interviewed" ? (
          <WorkflowForm contentId={workflow.content_id} operation="start_fact_check" action={action}>
            <Button type="submit" size="sm" disabled={pending}>
              Avvia fact-check
            </Button>
          </WorkflowForm>
        ) : null}

        {workflow.workflow_status === "fact_check" ? (
          <WorkflowForm contentId={workflow.content_id} operation="approve" action={action}>
            <Button type="submit" size="sm" disabled={pending || !canApprove}>
              Approva workflow intervista
            </Button>
          </WorkflowForm>
        ) : null}
      </div>

      {["contacted", "scheduled"].includes(workflow.workflow_status) ? (
        <WorkflowForm contentId={workflow.content_id} operation="schedule" action={action}>
          <div className="mt-4 max-w-md">
            <label className="text-ink flex flex-col gap-1.5 text-sm">
              <span className="font-medium">Data e ora concordate</span>
              <input
                type="datetime-local"
                value={scheduledLocal}
                onChange={(event) => setScheduledLocal(event.target.value)}
                disabled={pending}
                className={selectClass}
                required
              />
            </label>
            <input type="hidden" name="scheduled_for_iso" value={scheduledIso} />
            <p className="text-ink-muted mt-1 text-xs">
              L’ora viene convertita dal browser in UTC usando il fuso locale della data scelta.
            </p>
            <Button type="submit" size="sm" disabled={pending || !scheduledIso} className="mt-2">
              {workflow.workflow_status === "scheduled" ? "Ripianifica" : "Registra programmazione"}
            </Button>
          </div>
        </WorkflowForm>
      ) : null}

      {canEditConsents ? (
        <div className="border-line mt-6 border-t pt-4">
          <h3 className="text-ink text-sm font-semibold">Registra consensi</h3>
          <p className="text-ink-muted mt-1 max-w-3xl text-xs leading-5">
            Seleziona soltanto uno stato effettivamente documentato. “Concesso” registra anche la data e ora corrente.
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {CONSENTS.map((consent) => {
              const persistedStatus = workflow[consent.field];
              return (
                <WorkflowForm
                  key={consent.kind}
                  contentId={workflow.content_id}
                  operation="update_consent"
                  action={action}
                >
                  <div className="border-line border p-3">
                    <input type="hidden" name="consent_kind" value={consent.kind} />
                    <label className="text-ink flex flex-col gap-1.5 text-sm">
                      <span className="font-medium">{consent.label}</span>
                      <select
                        key={`${consent.kind}:${persistedStatus}`}
                        name="consent_status"
                        defaultValue={persistedStatus}
                        disabled={pending}
                        className={selectClass}
                      >
                        {CONSENT_OPTIONS.filter(
                          (option) => consent.allowNotRequired || option.value !== "not_required",
                        ).map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <Button type="submit" size="sm" variant="secondary" disabled={pending} className="mt-2">
                      Salva
                    </Button>
                  </div>
                </WorkflowForm>
              );
            })}
          </div>
        </div>
      ) : null}

      {workflow.workflow_status === "fact_check" && !canApprove ? (
        <p className="text-accent-dark mt-4 text-xs" role="status">
          Per approvare il workflow servono consenso alla pubblicazione e approvazione delle citazioni entrambi concessi.
        </p>
      ) : null}

      {state.message ? (
        <p
          className={`mt-4 text-sm ${state.ok ? "text-brand-dark" : "text-accent-dark"}`}
          role={state.ok ? "status" : "alert"}
        >
          {state.message}
        </p>
      ) : null}
    </div>
  );
}
