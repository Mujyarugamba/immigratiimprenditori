"use client";

import { useActionState } from "react";
import {
  publishEditorialOpportunityAction,
  rejectEditorialOpportunityAction,
  updateEditorialOpportunityAction,
  withdrawEditorialOpportunityAction,
  type FormActionState,
} from "@/lib/editorial/actions";
import type { EditorialOpportunityDetail } from "@/lib/data/editorial/opportunities";
import { Button } from "@/components/ui/Button";

const initial: FormActionState = { ok: false };

export function EditorialOpportunityEditForm({
  opportunity,
}: {
  opportunity: EditorialOpportunityDetail;
}) {
  const [saveState, saveAction, savePending] = useActionState(
    updateEditorialOpportunityAction,
    initial,
  );
  const [publishState, publishAction, publishPending] = useActionState(
    publishEditorialOpportunityAction,
    initial,
  );
  const [withdrawState, withdrawAction, withdrawPending] = useActionState(
    withdrawEditorialOpportunityAction,
    initial,
  );
  const [rejectState, rejectAction, rejectPending] = useActionState(
    rejectEditorialOpportunityAction,
    initial,
  );

  const canPublish =
    opportunity.publication_status === "unpublished" &&
    opportunity.editorial_status !== "rejected";
  const canWithdraw = opportunity.publication_status === "published";
  const canReject =
    opportunity.publication_status !== "published" &&
    opportunity.editorial_status !== "rejected";

  return (
    <div className="mt-6 space-y-8">
      <form action={saveAction} className="space-y-4">
        <input type="hidden" name="id" value={opportunity.id} />
        <p className="text-ink-muted text-sm">
          Campi modificabili dalla redazione: sintesi, descrizione, finalità.
          Titolo, date, URL ufficiale e provenienza restano controllati dalla
          fonte esterna (o da aggiornamenti importer).
        </p>
        <label className="block text-sm">
          <span className="text-ink font-medium">Sintesi editoriale</span>
          <textarea
            name="summary"
            rows={3}
            defaultValue={opportunity.summary ?? ""}
            className="border-line mt-1 w-full rounded-md border px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="text-ink font-medium">Descrizione</span>
          <textarea
            name="description"
            rows={6}
            defaultValue={opportunity.description ?? ""}
            className="border-line mt-1 w-full rounded-md border px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="text-ink font-medium">Finalità</span>
          <textarea
            name="purpose"
            rows={3}
            defaultValue={opportunity.purpose ?? ""}
            className="border-line mt-1 w-full rounded-md border px-3 py-2"
          />
        </label>
        <Button type="submit" size="sm" disabled={savePending}>
          {savePending ? "Salvataggio…" : "Salva modifiche editoriali"}
        </Button>
        {saveState.message ? (
          <p
            className={
              saveState.ok ? "text-sm text-green-700" : "text-sm text-red-700"
            }
          >
            {saveState.message}
          </p>
        ) : null}
      </form>

      <div className="border-line space-y-3 border-t pt-6">
        <h2 className="text-ink text-lg font-semibold">Pubblicazione</h2>
        <p className="text-ink-muted text-sm">
          Pubblica solo record READY dopo verifica fonte, scadenze e sintesi.
          Le schede QUESTIONABLE restano da revisionare; le REJECT vanno
          escluse senza cancellazione.
        </p>
        {canPublish ? (
          <form action={publishAction}>
            <input type="hidden" name="id" value={opportunity.id} />
            <Button
              type="submit"
              size="sm"
              disabled={publishPending}
              variant="secondary"
            >
              {publishPending ? "Pubblicazione…" : "Pubblica"}
            </Button>
          </form>
        ) : null}
        {canWithdraw ? (
          <form action={withdrawAction}>
            <input type="hidden" name="id" value={opportunity.id} />
            <Button
              type="submit"
              size="sm"
              disabled={withdrawPending}
              variant="secondary"
            >
              {withdrawPending ? "Ritiro…" : "Ritira"}
            </Button>
          </form>
        ) : null}
        {canReject ? (
          <form action={rejectAction}>
            <input type="hidden" name="id" value={opportunity.id} />
            <Button
              type="submit"
              size="sm"
              disabled={rejectPending}
              variant="secondary"
            >
              {rejectPending ? "Esclusione…" : "Escludi dalla coda"}
            </Button>
          </form>
        ) : null}
        {publishState.message ? (
          <p
            className={
              publishState.ok ? "text-sm text-green-700" : "text-sm text-red-700"
            }
          >
            {publishState.message}
          </p>
        ) : null}
        {withdrawState.message ? (
          <p
            className={
              withdrawState.ok
                ? "text-sm text-green-700"
                : "text-sm text-red-700"
            }
          >
            {withdrawState.message}
          </p>
        ) : null}
        {rejectState.message ? (
          <p
            className={
              rejectState.ok ? "text-sm text-green-700" : "text-sm text-red-700"
            }
          >
            {rejectState.message}
          </p>
        ) : null}
      </div>
    </div>
  );
}
