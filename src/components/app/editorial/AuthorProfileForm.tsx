"use client";

import { useActionState } from "react";
import {
  createAuthorProfileAction,
  updateAuthorProfileAction,
  type AuthorActionState,
} from "@/lib/editorial/author-actions";
import type { EditorialAuthorProfile } from "@/lib/data/editorial/authors";

const initial: AuthorActionState = { ok: false };
const inputClass =
  "border-line bg-surface-elevated text-ink focus:border-brand focus:ring-brand/30 w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2";

type Props = {
  profile?: EditorialAuthorProfile;
};

function FieldError({ message }: { message?: string }) {
  return message ? <span className="text-accent-dark text-xs">{message}</span> : null;
}

export function AuthorProfileForm({ profile }: Props) {
  const action = profile ? updateAuthorProfileAction : createAuthorProfileAction;
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form action={formAction} className="mt-6 flex flex-col gap-4">
      {profile ? <input type="hidden" name="id" value={profile.id} /> : null}

      <label className="text-ink flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Nome pubblico</span>
        <input
          name="display_name"
          required
          disabled={pending}
          className={inputClass}
          defaultValue={profile?.display_name ?? ""}
        />
        <FieldError message={state.fieldErrors?.display_name} />
      </label>

      <label className="text-ink flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Slug</span>
        <input
          name="slug"
          required
          disabled={pending}
          className={inputClass}
          placeholder="nome-cognome"
          defaultValue={profile?.slug ?? ""}
        />
        <FieldError message={state.fieldErrors?.slug} />
      </label>

      <label className="text-ink flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Tipo profilo</span>
        <select
          name="profile_kind"
          required
          disabled={pending}
          className={inputClass}
          defaultValue={profile?.profile_kind ?? "person"}
        >
          <option value="person">Persona</option>
          <option value="organization">Organizzazione</option>
          <option value="editorial_group">Gruppo editoriale</option>
        </select>
        <FieldError message={state.fieldErrors?.profile_kind} />
      </label>

      <label className="text-ink flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Biografia / descrizione</span>
        <textarea
          name="bio"
          rows={5}
          disabled={pending}
          className={inputClass}
          defaultValue={profile?.bio ?? ""}
        />
        <FieldError message={state.fieldErrors?.bio} />
      </label>

      <label className="text-ink flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Affiliazione</span>
        <input
          name="affiliation"
          disabled={pending}
          className={inputClass}
          defaultValue={profile?.affiliation ?? ""}
        />
        <FieldError message={state.fieldErrors?.affiliation} />
      </label>

      <label className="text-ink flex flex-col gap-1.5 text-sm">
        <span className="font-medium">ORCID</span>
        <input
          name="orcid"
          disabled={pending}
          className={inputClass}
          placeholder="0000-0000-0000-0000"
          defaultValue={profile?.orcid ?? ""}
        />
        <span className="text-ink-muted text-xs">Solo per profili persona.</span>
        <FieldError message={state.fieldErrors?.orcid} />
      </label>

      <label className="text-ink flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Sito web verificabile</span>
        <input
          name="website_url"
          type="url"
          disabled={pending}
          className={inputClass}
          placeholder="https://…"
          defaultValue={profile?.website_url ?? ""}
        />
        <FieldError message={state.fieldErrors?.website_url} />
      </label>

      {profile ? (
        <div className="border-line bg-surface-muted rounded-md border p-4">
          <label className="text-ink flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              name="is_public"
              value="true"
              defaultChecked={profile.is_public}
              disabled={pending}
              className="mt-1"
            />
            <span>
              <strong>Profilo pubblico</strong>
              <span className="text-ink-muted mt-1 block">
                Il gate richiede informazioni sostanziali e almeno una pubblicazione pubblica collegata.
              </span>
            </span>
          </label>
          <FieldError message={state.fieldErrors?.is_public} />
        </div>
      ) : (
        <p className="border-line bg-surface-muted text-ink-muted rounded-md border p-4 text-sm">
          Il nuovo profilo nasce privato. Potrà essere reso pubblico soltanto dopo revisione e collegamento a un contenuto pubblico reale.
        </p>
      )}

      {state.message ? (
        <p
          role={state.ok ? "status" : "alert"}
          className={state.ok ? "text-brand text-sm" : "text-accent-dark text-sm"}
        >
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="bg-brand text-white disabled:opacity-50 self-start rounded-sm px-4 py-2 text-sm font-semibold"
      >
        {pending ? "Salvataggio…" : profile ? "Salva profilo" : "Crea profilo privato"}
      </button>
    </form>
  );
}
