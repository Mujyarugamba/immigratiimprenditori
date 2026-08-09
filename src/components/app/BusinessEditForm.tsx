"use client";

import { useActionState } from "react";
import { FormField } from "@/components/forms/FormField";
import { Button } from "@/components/ui/Button";
import {
  updateBusinessAction,
  type FormActionState,
} from "@/lib/business/actions";
import type { BusinessRow } from "@/types/business";
import {
  BUSINESS_STATUSES,
  EDITORIAL_STATUS_LABELS,
  label,
  PUBLICATION_STATUS_LABELS,
} from "@/lib/public/labels";

const BUSINESS_EDITORIAL_LABELS: Record<string, string> = {
  ...EDITORIAL_STATUS_LABELS,
  incomplete: "Incompleta",
  complete: "Completa",
};

const initial: FormActionState = { ok: false };

type Props = {
  business: BusinessRow;
};

export function BusinessEditForm({ business }: Props) {
  const [state, action, pending] = useActionState(updateBusinessAction, initial);

  return (
    <form action={action} className="mt-4 flex flex-col gap-4">
      <input type="hidden" name="business_id" value={business.id} />
      <FormField
        label="Nome legale"
        name="legal_name"
        required
        defaultValue={business.legal_name}
        disabled={pending}
      />
      <FormField
        label="Nome pubblico"
        name="public_name"
        required
        defaultValue={business.public_name}
        disabled={pending}
      />
      <FormField
        label="Sommario"
        name="summary"
        defaultValue={business.summary ?? ""}
        disabled={pending}
      />
      <FormField
        label="Descrizione"
        name="description"
        defaultValue={business.description ?? ""}
        disabled={pending}
      />
      <FormField
        label="Anno di fondazione"
        name="founding_year"
        type="number"
        defaultValue={business.founding_year ?? undefined}
        disabled={pending}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="text-ink flex flex-col gap-1 text-sm">
          <span className="font-medium">Stato sostanziale</span>
          <select
            name="substantial_status"
            defaultValue={business.substantial_status}
            disabled={pending}
            className="border-line rounded-md border px-3 py-2"
          >
            <option value="active">{label(BUSINESS_STATUSES, "active")}</option>
            <option value="ceased">{label(BUSINESS_STATUSES, "ceased")}</option>
          </select>
        </label>
        <label className="text-ink flex flex-col gap-1 text-sm">
          <span className="font-medium">Stato editoriale</span>
          <select
            name="editorial_status"
            defaultValue={business.editorial_status}
            disabled={pending}
            className="border-line rounded-md border px-3 py-2"
          >
            <option value="draft">
              {label(BUSINESS_EDITORIAL_LABELS, "draft")}
            </option>
            <option value="incomplete">
              {label(BUSINESS_EDITORIAL_LABELS, "incomplete")}
            </option>
            <option value="complete">
              {label(BUSINESS_EDITORIAL_LABELS, "complete")}
            </option>
          </select>
        </label>
        <label className="text-ink flex flex-col gap-1 text-sm">
          <span className="font-medium">Pubblicazione</span>
          <select
            name="publication_status"
            defaultValue={business.publication_status}
            disabled={pending}
            className="border-line rounded-md border px-3 py-2"
          >
            <option value="unpublished">
              {label(PUBLICATION_STATUS_LABELS, "unpublished")}
            </option>
            <option value="public">
              {label(PUBLICATION_STATUS_LABELS, "public")}
            </option>
          </select>
        </label>
      </div>

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

      <Button type="submit" disabled={pending}>
        {pending ? "Salvataggio…" : "Salva scheda"}
      </Button>
    </form>
  );
}
