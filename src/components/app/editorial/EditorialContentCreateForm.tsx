"use client";

import { useActionState } from "react";
import { FormField } from "@/components/forms/FormField";
import { Button } from "@/components/ui/Button";
import {
  createEditorialContentAction,
  type FormActionState,
} from "@/lib/editorial/actions";
import { createEditorialContentFromInboxAction } from "@/lib/editorial/inbox-draft-actions";
import type { CatalogOption } from "@/lib/data/editorial/catalogs";

const initialState: FormActionState = { ok: false };

const selectClass =
  "border-line bg-surface-elevated text-ink focus:border-brand focus:ring-brand/30 w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2";

type InitialValues = {
  inboxId: string;
  title: string;
  abstract: string | null;
  typeCode: string | null;
  sourceLabel: string | null;
  sourceUrl: string | null;
};

type Props = {
  contentTypes: CatalogOption[];
  categories: CatalogOption[];
  languages: { id: number; code: string; label: string }[];
  defaultLanguageId: number | null;
  initialValues?: InitialValues | null;
};

export function EditorialContentCreateForm({
  contentTypes,
  categories,
  languages,
  defaultLanguageId,
  initialValues = null,
}: Props) {
  const submitAction = initialValues?.inboxId
    ? createEditorialContentFromInboxAction
    : createEditorialContentAction;
  const [state, action, pending] = useActionState(submitAction, initialState);

  const suggestedType =
    initialValues?.typeCode && contentTypes.some((item) => item.code === initialValues.typeCode)
      ? initialValues.typeCode
      : "";

  return (
    <form action={action} className="mt-6 flex flex-col gap-4">
      {initialValues?.inboxId ? (
        <input type="hidden" name="inbox_id" value={initialValues.inboxId} />
      ) : null}

      {initialValues ? (
        <div className="border-line bg-surface-elevated border p-4 text-sm">
          <p className="text-ink font-semibold">Bozza da Inbox redazionale</p>
          <p className="text-ink-muted mt-1">
            Titolo, abstract e fonte sono precompilati dall’arrivo. Il corpo resta da redigere prima della creazione della bozza.
          </p>
          {initialValues.sourceLabel ? (
            <p className="text-ink-muted mt-2">Fonte: {initialValues.sourceLabel}</p>
          ) : null}
          {initialValues.sourceUrl ? (
            <a
              href={initialValues.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="text-ink mt-1 block break-all underline underline-offset-2"
            >
              {initialValues.sourceUrl}
            </a>
          ) : null}
        </div>
      ) : null}

      <label className="text-ink flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Tipo</span>
        <select
          name="type_code"
          required
          disabled={pending}
          className={selectClass}
          defaultValue={suggestedType}
        >
          <option value="" disabled>
            Seleziona…
          </option>
          {contentTypes.map((t) => (
            <option key={t.code} value={t.code}>
              {t.label}
            </option>
          ))}
        </select>
      </label>

      <label className="text-ink flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Lingua</span>
        <select
          name="language_id"
          disabled={pending}
          className={selectClass}
          defaultValue={defaultLanguageId ?? languages[0]?.id ?? ""}
        >
          {languages.map((l) => (
            <option key={l.id} value={l.id}>
              {l.label} ({l.code})
            </option>
          ))}
        </select>
      </label>

      <FormField
        label="Titolo"
        name="title"
        required
        disabled={pending}
        defaultValue={initialValues?.title ?? ""}
        error={state.fieldErrors?.title}
      />
      <FormField
        label="Slug"
        name="slug"
        disabled={pending}
        hint="Lascia vuoto per generarlo dal titolo"
        error={state.fieldErrors?.slug}
      />
      <FormField label="Sottotitolo" name="subtitle" disabled={pending} />
      <FormField
        label="Abstract"
        name="abstract"
        disabled={pending}
        defaultValue={initialValues?.abstract ?? ""}
      />

      <label className="text-ink flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Categoria primaria</span>
        <select
          name="primary_category_code"
          disabled={pending}
          className={selectClass}
          defaultValue=""
        >
          <option value="">— Nessuna —</option>
          {categories.map((c) => (
            <option key={c.code} value={c.code}>
              {c.label}
            </option>
          ))}
        </select>
      </label>

      <label
        htmlFor="body"
        className="text-ink flex flex-col gap-1.5 text-sm"
      >
        <span className="font-medium">Corpo</span>
        <textarea
          id="body"
          name="body"
          required
          rows={10}
          disabled={pending}
          className={selectClass}
          aria-invalid={Boolean(state.fieldErrors?.body)}
          aria-describedby={state.fieldErrors?.body ? "body-error" : undefined}
        />
        {state.fieldErrors?.body ? (
          <p id="body-error" className="text-accent-dark text-xs">
            {state.fieldErrors.body}
          </p>
        ) : null}
      </label>

      {state.message && !state.ok ? (
        <p className="text-accent-dark text-sm" role="alert">
          {state.message}
        </p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending
          ? "Creazione…"
          : initialValues
            ? "Crea bozza da Inbox"
            : "Crea contenuto"}
      </Button>
    </form>
  );
}
