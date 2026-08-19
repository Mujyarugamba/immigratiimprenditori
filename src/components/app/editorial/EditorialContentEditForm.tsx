"use client";

import { useActionState } from "react";
import { FormField } from "@/components/forms/FormField";
import { Button } from "@/components/ui/Button";
import { EditorialLifecycleButtons } from "@/components/app/editorial/EditorialLifecycleButtons";
import {
  publishEditorialContentAction,
  updateEditorialContentAction,
  withdrawEditorialContentAction,
  type FormActionState,
} from "@/lib/editorial/actions";
import type { EditorialContent } from "@/lib/data/editorial/contents";
import type { CatalogOption } from "@/lib/data/editorial/catalogs";
import { isStoryContentType } from "@/lib/data/public/stories";
import { EDITORIAL_STATUS_LABELS, label } from "@/lib/public/labels";

const initial: FormActionState = { ok: false };

const selectClass =
  "border-line bg-surface-elevated text-ink focus:border-brand focus:ring-brand/30 w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2";

type Props = {
  content: EditorialContent;
  contentTypes: CatalogOption[];
  categories: CatalogOption[];
  languages: { id: number; code: string; label: string }[];
};

export function EditorialContentEditForm({
  content,
  contentTypes,
  categories,
  languages,
}: Props) {
  const [state, action, pending] = useActionState(
    updateEditorialContentAction,
    initial,
  );
  const publicHref = isStoryContentType(content.type_code)
    ? `/storie/${content.slug}`
    : `/contenuti/${content.slug}`;

  return (
    <>
      <form action={action} className="mt-6 flex flex-col gap-4">
        <input type="hidden" name="id" value={content.id} />

        <label className="text-ink flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Tipo</span>
          <select
            name="type_code"
            required
            disabled={pending}
            className={selectClass}
            defaultValue={content.type_code}
          >
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
            defaultValue={content.language_id}
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
          defaultValue={content.title}
          disabled={pending}
        />
        <FormField
          label="Slug"
          name="slug"
          required
          defaultValue={content.slug}
          disabled={pending}
        />
        <FormField
          label="Sottotitolo"
          name="subtitle"
          defaultValue={content.subtitle ?? ""}
          disabled={pending}
        />
        <FormField
          label="Abstract"
          name="abstract"
          defaultValue={content.abstract ?? ""}
          disabled={pending}
        />

        <label className="text-ink flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Categoria primaria</span>
          <select
            name="primary_category_code"
            disabled={pending}
            className={selectClass}
            defaultValue={content.primary_category_code ?? ""}
          >
            <option value="">— Nessuna —</option>
            {categories.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        </label>

        <label className="text-ink flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Corpo</span>
          <textarea
            name="body"
            required
            rows={10}
            disabled={pending}
            className={selectClass}
            defaultValue={content.body}
          />
        </label>

        <label className="text-ink flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Stato editoriale</span>
          <select
            name="editorial_status"
            disabled={pending}
            className={selectClass}
            defaultValue={content.editorial_status}
          >
            <option value="draft">{label(EDITORIAL_STATUS_LABELS, "draft")}</option>
            <option value="ready">{label(EDITORIAL_STATUS_LABELS, "ready")}</option>
          </select>
        </label>

        <label className="text-ink flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="is_featured"
            value="true"
            defaultChecked={content.is_featured}
            disabled={pending}
          />
          In evidenza
        </label>

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
          {pending ? "Salvataggio…" : "Salva modifiche"}
        </Button>
      </form>

      <EditorialLifecycleButtons
        id={content.id}
        publishAction={publishEditorialContentAction}
        withdrawAction={withdrawEditorialContentAction}
        publicationStatus={content.publication_status}
        publicHref={
          content.publication_status === "published" ? publicHref : undefined
        }
      />
    </>
  );
}
