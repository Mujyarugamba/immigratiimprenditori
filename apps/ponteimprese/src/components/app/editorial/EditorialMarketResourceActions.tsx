"use client";

import { useActionState } from "react";
import {
  markQuestionableEditorialMarketResourceAction,
  publishEditorialMarketResourceAction,
  rejectEditorialMarketResourceAction,
  withdrawEditorialMarketResourceAction,
  type FormActionState,
} from "@/lib/editorial/actions";
import type { EditorialMarketResourceDetail } from "@/lib/data/editorial/markets";
import { Button } from "@/components/ui/Button";

const initial: FormActionState = { ok: false };

export function EditorialMarketResourceActions({
  resource,
}: {
  resource: EditorialMarketResourceDetail;
}) {
  const [publishState, publishAction, publishPending] = useActionState(
    publishEditorialMarketResourceAction,
    initial,
  );
  const [questionableState, questionableAction, questionablePending] =
    useActionState(markQuestionableEditorialMarketResourceAction, initial);
  const [rejectState, rejectAction, rejectPending] = useActionState(
    rejectEditorialMarketResourceAction,
    initial,
  );
  const [withdrawState, withdrawAction, withdrawPending] = useActionState(
    withdrawEditorialMarketResourceAction,
    initial,
  );

  const isPublished =
    resource.visibility_status === "public" &&
    resource.verification_status === "confirmed";
  const isRejected = resource.verification_status === "rejected";

  return (
    <div className="border-line mt-8 space-y-4 border-t pt-6">
      <h2 className="text-ink text-lg font-semibold">Decisione editoriale</h2>
      <p className="text-ink-muted text-sm">
        Mapping lifecycle: READY → pubblica; QUESTIONABLE → resta in revisione
        (non pubblica); REJECT → esclusa (non pubblica). Nessuna cancellazione.
        Il refresh World Bank non sovrascrive questi assi.
      </p>

      <div className="flex flex-wrap gap-3">
        {!isPublished && !isRejected ? (
          <form action={publishAction}>
            <input type="hidden" name="id" value={resource.id} />
            <Button
              type="submit"
              size="sm"
              disabled={publishPending}
              variant="secondary"
            >
              {publishPending ? "Pubblicazione…" : "Pubblica (READY)"}
            </Button>
          </form>
        ) : null}

        {!isPublished ? (
          <form action={questionableAction}>
            <input type="hidden" name="id" value={resource.id} />
            <Button
              type="submit"
              size="sm"
              disabled={questionablePending}
              variant="ghost"
            >
              {questionablePending
                ? "Salvataggio…"
                : "Mantieni in revisione (QUESTIONABLE)"}
            </Button>
          </form>
        ) : null}

        {!isPublished && !isRejected ? (
          <form action={rejectAction}>
            <input type="hidden" name="id" value={resource.id} />
            <Button
              type="submit"
              size="sm"
              disabled={rejectPending}
              variant="ghost"
            >
              {rejectPending ? "Esclusione…" : "Escludi (REJECT)"}
            </Button>
          </form>
        ) : null}

        {isPublished ? (
          <form action={withdrawAction}>
            <input type="hidden" name="id" value={resource.id} />
            <Button
              type="submit"
              size="sm"
              disabled={withdrawPending}
              variant="ghost"
            >
              {withdrawPending ? "Ritiro…" : "Ritira dalla pubblicazione"}
            </Button>
          </form>
        ) : null}
      </div>

      {[publishState, questionableState, rejectState, withdrawState].map(
        (state, i) =>
          state.message ? (
            <p
              key={i}
              className={
                state.ok ? "text-sm text-green-700" : "text-sm text-red-700"
              }
            >
              {state.message}
            </p>
          ) : null,
      )}
    </div>
  );
}
