"use client";

import { useActionState } from "react";
import { FormField } from "@/components/forms/FormField";
import { Button } from "@/components/ui/Button";
import { EditorialLifecycleButtons } from "@/components/app/editorial/EditorialLifecycleButtons";
import {
  addOrganizationOfficialAction,
  createOrganizationAction,
  publishOrganizationAction,
  updateOrganizationAction,
  withdrawOrganizationAction,
  type FormActionState,
} from "@/lib/editorial/actions";
import type { EditorialOrganization, OrganizationOfficial } from "@/lib/data/editorial/organizations";
import type { CatalogOption } from "@/lib/data/editorial/catalogs";
import {
  EDITORIAL_STATUS_LABELS,
  label,
  OFFICIAL_ROLES,
} from "@/lib/public/labels";

const ORGANIZATION_OPERATIONAL_LABELS: Record<string, string> = {
  active: "Attiva",
  inactive: "Inattiva",
  suspended: "Sospesa",
  dissolved: "Sciolta",
};

const initial: FormActionState = { ok: false };
const selectClass =
  "border-line bg-surface-elevated text-ink w-full rounded-md border px-3 py-2 text-sm";

type CatalogProps = {
  orgTypes: CatalogOption[];
  scopes: CatalogOption[];
};

export function OrganizationCreateForm({ orgTypes, scopes }: CatalogProps) {
  const [state, action, pending] = useActionState(createOrganizationAction, initial);

  return (
    <form action={action} className="mt-6 flex flex-col gap-4">
      <label className="text-ink flex flex-col gap-1 text-sm">
        <span className="font-medium">Tipo</span>
        <select name="type_code" className={selectClass} required disabled={pending} defaultValue="">
          <option value="" disabled>Seleziona…</option>
          {orgTypes.map((t) => (
            <option key={t.code} value={t.code}>{t.label}</option>
          ))}
        </select>
      </label>
      <FormField label="Nome" name="name" required disabled={pending} />
      <FormField label="Slug" name="slug" hint="Lascia vuoto per autogenerare" disabled={pending} />
      <FormField label="Descrizione" name="description" required disabled={pending} />
      <FormField label="Sommario" name="summary" disabled={pending} />
      <label className="text-ink flex flex-col gap-1 text-sm">
        <span className="font-medium">Ambito primario</span>
        <select name="primary_scope_code" className={selectClass} disabled={pending} defaultValue="">
          <option value="">— Nessuno —</option>
          {scopes.map((s) => (
            <option key={s.code} value={s.code}>{s.label}</option>
          ))}
        </select>
      </label>
      {state.message && !state.ok ? (
        <p className="text-accent-dark text-sm">{state.message}</p>
      ) : null}
      <Button type="submit" disabled={pending}>Crea organizzazione</Button>
    </form>
  );
}

export function OrganizationEditForm({
  org,
  orgTypes,
  scopes,
  officials,
}: CatalogProps & {
  org: EditorialOrganization;
  officials: OrganizationOfficial[];
}) {
  const [state, action, pending] = useActionState(updateOrganizationAction, initial);
  const [offState, offAction, offPending] = useActionState(addOrganizationOfficialAction, initial);

  return (
    <>
      <form action={action} className="mt-6 flex flex-col gap-4">
        <input type="hidden" name="id" value={org.id} />
        <label className="text-ink flex flex-col gap-1 text-sm">
          <span className="font-medium">Tipo</span>
          <select name="type_code" className={selectClass} defaultValue={org.type_code} disabled={pending}>
            {orgTypes.map((t) => (
              <option key={t.code} value={t.code}>{t.label}</option>
            ))}
          </select>
        </label>
        <FormField label="Nome" name="name" defaultValue={org.name} required disabled={pending} />
        <FormField label="Slug" name="slug" defaultValue={org.slug} required disabled={pending} />
        <FormField label="Descrizione" name="description" defaultValue={org.description} required disabled={pending} />
        <FormField label="Sommario" name="summary" defaultValue={org.summary ?? ""} disabled={pending} />
        <label className="text-ink flex flex-col gap-1 text-sm">
          <span className="font-medium">Ambito primario</span>
          <select name="primary_scope_code" className={selectClass} defaultValue={org.primary_scope_code ?? ""} disabled={pending}>
            <option value="">— Nessuno —</option>
            {scopes.map((s) => (
              <option key={s.code} value={s.code}>{s.label}</option>
            ))}
          </select>
        </label>
        <label className="text-ink flex flex-col gap-1 text-sm">
          <span className="font-medium">Stato editoriale</span>
          <select name="editorial_status" className={selectClass} defaultValue={org.editorial_status} disabled={pending}>
            <option value="draft">{label(EDITORIAL_STATUS_LABELS, "draft")}</option>
            <option value="ready">{label(EDITORIAL_STATUS_LABELS, "ready")}</option>
          </select>
        </label>
        <label className="text-ink flex flex-col gap-1 text-sm">
          <span className="font-medium">Stato operativo</span>
          <select name="operational_status" className={selectClass} defaultValue={org.operational_status} disabled={pending}>
            <option value="active">
              {label(ORGANIZATION_OPERATIONAL_LABELS, "active")}
            </option>
            <option value="inactive">
              {label(ORGANIZATION_OPERATIONAL_LABELS, "inactive")}
            </option>
            <option value="suspended">
              {label(ORGANIZATION_OPERATIONAL_LABELS, "suspended")}
            </option>
            <option value="dissolved">
              {label(ORGANIZATION_OPERATIONAL_LABELS, "dissolved")}
            </option>
          </select>
        </label>
        {state.message ? (
          <p className={state.ok ? "text-brand-dark text-sm" : "text-accent-dark text-sm"}>{state.message}</p>
        ) : null}
        <Button type="submit" disabled={pending}>Salva</Button>
      </form>

      <EditorialLifecycleButtons
        id={org.id}
        publishAction={publishOrganizationAction}
        withdrawAction={withdrawOrganizationAction}
        publicationStatus={org.publication_status}
        publicHref={
          org.publication_status === "published"
            ? `/organizzazioni/${org.slug}`
            : undefined
        }
      />

      <section className="border-line bg-surface-elevated mt-8 rounded-md border p-4 shadow-soft">
        <h2 className="text-ink text-base font-semibold">Referenti</h2>
        {officials.length === 0 ? (
          <p className="text-ink-muted mt-2 text-sm">Nessun referente.</p>
        ) : (
          <ul className="text-ink-muted mt-2 space-y-1 text-sm">
            {officials.map((o) => (
              <li key={o.id}>
                {label(OFFICIAL_ROLES, o.role_kind)} — {o.display_label ?? o.person_id ?? "—"}
              </li>
            ))}
          </ul>
        )}

        <form action={offAction} className="mt-4 flex flex-col gap-3 border-t pt-4">
          <input type="hidden" name="organization_id" value={org.id} />
          <label className="text-ink flex flex-col gap-1 text-sm">
            <span className="font-medium">Ruolo</span>
            <select name="role_kind" className={selectClass} defaultValue="public_contact" disabled={offPending}>
              <option value="legal_representative">
                {label(OFFICIAL_ROLES, "legal_representative")}
              </option>
              <option value="president">{label(OFFICIAL_ROLES, "president")}</option>
              <option value="director">{label(OFFICIAL_ROLES, "director")}</option>
              <option value="public_contact">
                {label(OFFICIAL_ROLES, "public_contact")}
              </option>
              <option value="operational_contact">
                {label(OFFICIAL_ROLES, "operational_contact")}
              </option>
              <option value="other">{label(OFFICIAL_ROLES, "other")}</option>
            </select>
          </label>
          <FormField
            label="ID profilo (opzionale)"
            name="person_id"
            disabled={offPending}
            hint="Oppure usa un'etichetta esterna"
          />
          <FormField label="Nome esterno" name="display_label" disabled={offPending} />
          <FormField label="Email" name="email" disabled={offPending} />
          {offState.message ? (
            <p className={offState.ok ? "text-brand-dark text-sm" : "text-accent-dark text-sm"}>{offState.message}</p>
          ) : null}
          <Button type="submit" size="sm" variant="secondary" disabled={offPending}>Aggiungi referente</Button>
        </form>
      </section>
    </>
  );
}
