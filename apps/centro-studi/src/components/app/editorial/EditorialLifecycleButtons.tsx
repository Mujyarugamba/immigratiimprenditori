"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { label, PUBLICATION_STATUS_LABELS } from "@/lib/public/labels";
import type { FormActionState } from "@/lib/editorial/actions";

const EDITORIAL_PUBLICATION_LABELS: Record<string, string> = {
  ...PUBLICATION_STATUS_LABELS,
  published: "Pubblicato",
};

const initial: FormActionState = { ok: false };

type Props = {
  id: string;
  publishAction: (
    prev: FormActionState,
    formData: FormData,
  ) => Promise<FormActionState>;
  withdrawAction: (
    prev: FormActionState,
    formData: FormData,
  ) => Promise<FormActionState>;
  publicationStatus: string;
  publicHref?: string;
};

export function EditorialLifecycleButtons({
  id,
  publishAction,
  withdrawAction,
  publicationStatus,
  publicHref,
}: Props) {
  const [pubState, pubFormAction, pubPending] = useActionState(
    publishAction,
    initial,
  );
  const [wdState, wdFormAction, wdPending] = useActionState(
    withdrawAction,
    initial,
  );

  const message = pubState.message || wdState.message;
  const ok = pubState.ok || wdState.ok;

  return (
    <div className="border-line bg-surface-elevated mt-6 rounded-md border p-4 shadow-soft">
      <h2 className="text-ink text-base font-semibold">Pubblicazione</h2>
      <p className="text-ink-muted mt-1 text-sm">
        Stato attuale:{" "}
        <span className="text-ink font-medium">
          {label(EDITORIAL_PUBLICATION_LABELS, publicationStatus)}
        </span>
      </p>

      {publicHref && publicationStatus === "published" ? (
        <p className="mt-3">
          <Button href={publicHref} variant="ghost" size="sm">
            Vedi pagina pubblica →
          </Button>
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        {publicationStatus !== "published" ? (
          <form action={pubFormAction}>
            <input type="hidden" name="id" value={id} />
            <Button type="submit" size="sm" disabled={pubPending || wdPending}>
              {pubPending ? "Pubblicazione…" : "Pubblica"}
            </Button>
          </form>
        ) : null}
        {publicationStatus === "published" ? (
          <form action={wdFormAction}>
            <input type="hidden" name="id" value={id} />
            <Button
              type="submit"
              variant="secondary"
              size="sm"
              disabled={pubPending || wdPending}
            >
              {wdPending ? "Ritiro…" : "Ritira"}
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
    </div>
  );
}
