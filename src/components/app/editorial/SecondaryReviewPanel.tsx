"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import type {
  EditorialReviewEntityKind,
  EditorialReviewScope,
  EditorialReviewState,
} from "@/lib/data/editorial/reviews";
import {
  approveSecondaryReviewAction,
  requestSecondaryReviewAction,
  revokeSecondaryReviewAction,
  type ReviewActionState,
} from "@/lib/editorial/review-actions";

const initial: ReviewActionState = { ok: false };

type Props = {
  entityKind: EditorialReviewEntityKind;
  entityId: string;
  reviewScope: EditorialReviewScope;
  state: EditorialReviewState;
  currentAccountId: string | null;
  required: boolean;
  automaticRequired?: boolean;
};

function formatDate(value: string | null) {
  if (!value) return null;
  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function SecondaryReviewPanel({
  entityKind,
  entityId,
  reviewScope,
  state,
  currentAccountId,
  required,
  automaticRequired = false,
}: Props) {
  const [requestState, requestAction, requestPending] = useActionState(
    requestSecondaryReviewAction,
    initial,
  );
  const [approveState, approveAction, approvePending] = useActionState(
    approveSecondaryReviewAction,
    initial,
  );
  const [revokeState, revokeAction, revokePending] = useActionState(
    revokeSecondaryReviewAction,
    initial,
  );

  if (!state.available) {
    return (
      <section className="border-line bg-surface-elevated mt-6 rounded-md border p-4 shadow-soft">
        <h2 className="text-ink text-base font-semibold">Seconda revisione</h2>
        <p className="text-ink-muted mt-2 text-sm">
          Governance 4-eyes preparata ma non ancora attiva su questo ambiente.
          L&apos;attivazione dipende dalla migration Production autorizzata.
        </p>
      </section>
    );
  }

  const latest = state.latest;
  const pending = latest?.status === "pending";
  const approved = latest?.status === "approved";
  const requestedByMe = Boolean(
    latest && currentAccountId && latest.requested_by_account_id === currentAccountId,
  );

  const message =
    requestState.message || approveState.message || revokeState.message;
  const ok = requestState.ok || approveState.ok || revokeState.ok;
  const busy = requestPending || approvePending || revokePending;

  const effectiveRequired = required || state.forceSecondaryReview;
  const forceContentReview = entityKind === "content" && !effectiveRequired;
  const reasonCode = automaticRequired
    ? "automatic_sensitive_content"
    : entityKind === "observatory_indicator"
      ? "observatory_indicator"
      : forceContentReview
        ? "manual_escalation"
        : "editorial_secondary_review";

  return (
    <section className="border-line bg-surface-elevated mt-6 rounded-md border p-4 shadow-soft">
      <h2 className="text-ink text-base font-semibold">Seconda revisione</h2>
      <p className="text-ink-muted mt-1 text-sm">
        {effectiveRequired ? (
          <>
            <strong className="text-ink">Obbligatoria.</strong> La pubblicazione
            richiede l&apos;approvazione di un secondo account redazionale.
          </>
        ) : (
          <>
            <strong className="text-ink">Same-editor consentito.</strong> Puoi
            comunque elevare volontariamente questo contenuto al controllo 4-eyes.
          </>
        )}
      </p>

      {automaticRequired ? (
        <p className="text-ink-muted mt-2 text-xs">
          Obbligo determinato automaticamente dal tipo/categoria sensibile.
        </p>
      ) : state.forceSecondaryReview ? (
        <p className="text-ink-muted mt-2 text-xs">
          Escalation manuale 4-eyes attiva per questo contenuto.
        </p>
      ) : null}

      {latest ? (
        <div className="border-line mt-4 border-t pt-4 text-sm">
          <p className="text-ink">
            Ultima review: <strong>{latest.status}</strong>
          </p>
          <p className="text-ink-muted mt-1 text-xs">
            Richiesta {formatDate(latest.requested_at) ?? "—"}
            {latest.approved_at
              ? ` · approvata ${formatDate(latest.approved_at)}`
              : ""}
          </p>
          {approved ? (
            <p className="text-ink-muted mt-2 text-xs">
              L&apos;approvazione resta valida solo per il fingerprint revisionato:
              il database ricontrolla automaticamente che il contenuto non sia
              cambiato prima della pubblicazione.
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        {!pending ? (
          <form action={requestAction}>
            <input type="hidden" name="entity_kind" value={entityKind} />
            <input type="hidden" name="entity_id" value={entityId} />
            <input type="hidden" name="review_scope" value={reviewScope} />
            <input type="hidden" name="reason_code" value={reasonCode} />
            <input
              type="hidden"
              name="force_content_review"
              value={forceContentReview ? "true" : "false"}
            />
            <Button type="submit" size="sm" disabled={busy}>
              {requestPending
                ? "Richiesta…"
                : forceContentReview
                  ? "Eleva a 4-eyes e richiedi"
                  : approved
                    ? "Richiedi nuova revisione"
                    : "Richiedi seconda revisione"}
            </Button>
          </form>
        ) : null}

        {pending && latest && !requestedByMe ? (
          <form action={approveAction}>
            <input type="hidden" name="review_id" value={latest.id} />
            <input type="hidden" name="entity_kind" value={entityKind} />
            <input type="hidden" name="entity_id" value={entityId} />
            <Button type="submit" size="sm" disabled={busy}>
              {approvePending ? "Approvazione…" : "Approva come secondo redattore"}
            </Button>
          </form>
        ) : null}

        {pending && requestedByMe ? (
          <p className="text-ink-muted self-center text-xs">
            Hai richiesto tu questa review: deve approvare un altro redattore.
          </p>
        ) : null}

        {latest && (pending || approved) ? (
          <form action={revokeAction}>
            <input type="hidden" name="review_id" value={latest.id} />
            <input type="hidden" name="entity_kind" value={entityKind} />
            <input type="hidden" name="entity_id" value={entityId} />
            <Button type="submit" variant="secondary" size="sm" disabled={busy}>
              {revokePending ? "Revoca…" : "Revoca review"}
            </Button>
          </form>
        ) : null}
      </div>

      {message ? (
        <p
          className={`mt-3 text-sm ${ok ? "text-brand-dark" : "text-accent-dark"}`}
          role={ok ? "status" : "alert"}
        >
          {message}
        </p>
      ) : null}
    </section>
  );
}
