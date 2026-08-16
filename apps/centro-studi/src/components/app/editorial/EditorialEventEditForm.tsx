"use client";

import { useActionState } from "react";
import {
  publishEditorialEventAction,
  updateEditorialEventAction,
  updateEditorialEventEditionAction,
  withdrawEditorialEventAction,
  type FormActionState,
} from "@/lib/editorial/actions";
import type { EditorialEvent } from "@/lib/data/editorial/events";
import type { CatalogOption } from "@/lib/data/editorial/catalogs";
import { Button } from "@/components/ui/Button";
import { EditorialLifecycleButtons } from "@/components/app/editorial/EditorialLifecycleButtons";
import {
  EVENT_AUDIENCE,
  EVENT_DELIVERY_MODES,
  EVENT_ECONOMIC,
  EDITION_STATUSES,
  label,
} from "@/lib/public/labels";

const initial: FormActionState = { ok: false };

export function EditorialEventEditForm({
  event,
  eventTypes,
}: {
  event: EditorialEvent;
  eventTypes: CatalogOption[];
}) {
  const [saveState, saveAction, savePending] = useActionState(
    updateEditorialEventAction,
    initial,
  );
  const [editionState, editionAction, editionPending] = useActionState(
    updateEditorialEventEditionAction,
    initial,
  );

  return (
    <div className="mt-6 space-y-8">
      <form action={saveAction} className="space-y-4">
        <input type="hidden" name="id" value={event.id} />
        <p className="text-ink-muted text-sm">
          Modifica i campi editoriali ammessi. Identità esterna e fingerprint
          restano in sola lettura. Nessuna pubblicazione automatica.
        </p>

        <label className="block text-sm">
          <span className="text-ink font-medium">Titolo</span>
          <input
            name="title"
            required
            defaultValue={event.title}
            className="border-line mt-1 w-full rounded-md border px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="text-ink font-medium">Sintesi</span>
          <textarea
            name="summary"
            rows={3}
            defaultValue={event.summary ?? ""}
            className="border-line mt-1 w-full rounded-md border px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="text-ink font-medium">Descrizione / sintesi editoriale</span>
          <textarea
            name="description"
            rows={6}
            required
            defaultValue={event.description}
            className="border-line mt-1 w-full rounded-md border px-3 py-2"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="text-ink font-medium">Tipologia</span>
            <select
              name="type_code"
              defaultValue={event.type_code}
              className="border-line mt-1 w-full rounded-md border px-3 py-2"
            >
              {eventTypes.map((t) => (
                <option key={t.code} value={t.code}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="text-ink font-medium">Modalità</span>
            <select
              name="delivery_mode"
              defaultValue={event.delivery_mode}
              className="border-line mt-1 w-full rounded-md border px-3 py-2"
            >
              {Object.entries(EVENT_DELIVERY_MODES).map(([code, lbl]) => (
                <option key={code} value={code}>
                  {lbl}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="text-ink font-medium">Destinatari</span>
            <select
              name="audience_kind"
              defaultValue={event.audience_kind}
              className="border-line mt-1 w-full rounded-md border px-3 py-2"
            >
              {Object.entries(EVENT_AUDIENCE).map(([code, lbl]) => (
                <option key={code} value={code}>
                  {lbl}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="text-ink font-medium">Accesso economico</span>
            <select
              name="economic_kind"
              defaultValue={event.economic_kind}
              className="border-line mt-1 w-full rounded-md border px-3 py-2"
            >
              {Object.entries(EVENT_ECONOMIC).map(([code, lbl]) => (
                <option key={code} value={code}>
                  {lbl}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block text-sm">
          <span className="text-ink font-medium">Organizzatore dichiarato</span>
          <input
            name="external_organization_label"
            defaultValue={event.external_organization_label ?? ""}
            className="border-line mt-1 w-full rounded-md border px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="text-ink font-medium">Link ufficiale</span>
          <input
            name="source_url"
            type="url"
            defaultValue={event.source_url ?? ""}
            className="border-line mt-1 w-full rounded-md border px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="text-ink font-medium">Attribuzione / etichetta fonte</span>
          <input
            name="source_label"
            defaultValue={event.source_label ?? ""}
            className="border-line mt-1 w-full rounded-md border px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="text-ink font-medium">Decisione redazionale</span>
          <select
            name="editorial_status"
            defaultValue={event.editorial_status}
            className="border-line mt-1 w-full rounded-md border px-3 py-2"
          >
            <option value="draft">In revisione (draft)</option>
            <option value="ready">READY</option>
          </select>
        </label>
        <label className="block text-sm">
          <span className="text-ink font-medium">Note interne (non pubbliche)</span>
          <textarea
            name="editorial_internal_notes"
            rows={3}
            defaultValue={event.editorial_internal_notes ?? ""}
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

      <section className="border-line space-y-3 border-t pt-6">
        <h2 className="text-ink text-lg font-semibold">Provenienza (sola lettura)</h2>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-ink-muted">Fonte</dt>
            <dd className="text-ink">{event.external_source_code ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-ink-muted">External id</dt>
            <dd className="text-ink break-all">{event.external_id ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-ink-muted">URL canonico</dt>
            <dd className="text-ink break-all">{event.canonical_url ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-ink-muted">Natural key</dt>
            <dd className="text-ink break-all">
              {event.external_natural_key ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-ink-muted">Fingerprint</dt>
            <dd className="text-ink break-all">
              {event.acquisition_fingerprint ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-ink-muted">Acquisito</dt>
            <dd className="text-ink">{event.acquired_at ?? "—"}</dd>
          </div>
        </dl>
      </section>

      <section className="border-line space-y-4 border-t pt-6">
        <h2 className="text-ink text-lg font-semibold">Edizioni</h2>
        {event.editions.length === 0 ? (
          <p className="text-ink-muted text-sm">
            Nessuna edizione. Per pubblicare serve almeno un&apos;edizione con
            data di inizio (inserita dall&apos;importer futuro o da operazioni
            tecniche autorizzate).
          </p>
        ) : (
          event.editions.map((edition) => (
            <form
              key={edition.id}
              action={editionAction}
              className="border-line space-y-3 rounded-md border p-4"
            >
              <input type="hidden" name="event_id" value={event.id} />
              <input type="hidden" name="edition_id" value={edition.id} />
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm">
                  <span className="text-ink font-medium">Inizio</span>
                  <input
                    name="starts_at"
                    type="datetime-local"
                    defaultValue={toLocalInput(edition.starts_at)}
                    className="border-line mt-1 w-full rounded-md border px-3 py-2"
                  />
                </label>
                <label className="block text-sm">
                  <span className="text-ink font-medium">Fine</span>
                  <input
                    name="ends_at"
                    type="datetime-local"
                    defaultValue={
                      edition.ends_at ? toLocalInput(edition.ends_at) : ""
                    }
                    className="border-line mt-1 w-full rounded-md border px-3 py-2"
                  />
                </label>
                <label className="block text-sm">
                  <span className="text-ink font-medium">Fuso</span>
                  <input
                    name="timezone"
                    defaultValue={edition.timezone}
                    className="border-line mt-1 w-full rounded-md border px-3 py-2"
                  />
                </label>
                <label className="block text-sm">
                  <span className="text-ink font-medium">Modalità edizione</span>
                  <select
                    name="delivery_mode"
                    defaultValue={edition.delivery_mode}
                    className="border-line mt-1 w-full rounded-md border px-3 py-2"
                  >
                    {Object.entries(EVENT_DELIVERY_MODES).map(([code, lbl]) => (
                      <option key={code} value={code}>
                        {lbl}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm">
                  <span className="text-ink font-medium">Sede</span>
                  <input
                    name="venue_label"
                    defaultValue={edition.venue_label ?? ""}
                    className="border-line mt-1 w-full rounded-md border px-3 py-2"
                  />
                </label>
                <label className="block text-sm">
                  <span className="text-ink font-medium">Città</span>
                  <input
                    name="city_text"
                    defaultValue={edition.city_text ?? ""}
                    className="border-line mt-1 w-full rounded-md border px-3 py-2"
                  />
                </label>
                <label className="block text-sm">
                  <span className="text-ink font-medium">Territorio / paese</span>
                  <input
                    name="country_ref"
                    defaultValue={edition.country_ref ?? ""}
                    className="border-line mt-1 w-full rounded-md border px-3 py-2"
                  />
                </label>
                <label className="block text-sm">
                  <span className="text-ink font-medium">Link online</span>
                  <input
                    name="online_reference"
                    defaultValue={edition.online_reference ?? ""}
                    className="border-line mt-1 w-full rounded-md border px-3 py-2"
                  />
                </label>
                <label className="block text-sm">
                  <span className="text-ink font-medium">Stato svolgimento</span>
                  <select
                    name="occurrence_status"
                    defaultValue={edition.occurrence_status}
                    className="border-line mt-1 w-full rounded-md border px-3 py-2"
                  >
                    {Object.entries(EDITION_STATUSES).map(([code, lbl]) => (
                      <option key={code} value={code}>
                        {lbl}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm sm:col-span-2">
                  <span className="text-ink font-medium">Indirizzo</span>
                  <input
                    name="address_text"
                    defaultValue={edition.address_text ?? ""}
                    className="border-line mt-1 w-full rounded-md border px-3 py-2"
                  />
                </label>
              </div>
              <Button type="submit" size="sm" disabled={editionPending}>
                {editionPending ? "Salvataggio…" : "Salva edizione"}
              </Button>
              {editionState.message ? (
                <p
                  className={
                    editionState.ok
                      ? "text-sm text-green-700"
                      : "text-sm text-red-700"
                  }
                >
                  {editionState.message}
                </p>
              ) : null}
              <p className="text-ink-muted text-xs">
                Stato attuale:{" "}
                {label(EDITION_STATUSES, edition.occurrence_status)}
              </p>
            </form>
          ))
        )}
      </section>

      <EditorialLifecycleButtons
        id={event.id}
        publishAction={publishEditorialEventAction}
        withdrawAction={withdrawEditorialEventAction}
        publicationStatus={event.publication_status}
        publicHref={`/eventi/${event.id}`}
      />
    </div>
  );
}

function toLocalInput(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
