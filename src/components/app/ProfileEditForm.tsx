"use client";

import { useActionState, useState } from "react";
import { FormField } from "@/components/forms/FormField";
import { Button } from "@/components/ui/Button";
import {
  updateProfileAction,
  type FormActionState,
} from "@/lib/profile/actions";
import {
  PERSON_PUBLIC_PATH_PREFIX,
  suggestProfileSlugFromDisplayName,
} from "@/lib/profile/slug";
import type { PersonaProfile } from "@/lib/data/authenticated/persona";
import type { PersonContactChannels } from "@/lib/data/authenticated/person-contact";

const initial: FormActionState = { ok: false };

type Props = {
  profile: PersonaProfile;
  contact: PersonContactChannels | null;
};

export function ProfileEditForm({ profile, contact }: Props) {
  const [state, action, pending] = useActionState(updateProfileAction, initial);
  const existingSlug = profile.slug?.trim() ?? "";
  const [slug, setSlug] = useState(existingSlug);
  const [slugEditedManually, setSlugEditedManually] = useState(
    Boolean(existingSlug),
  );

  function onDisplayNameChange(value: string) {
    if (existingSlug || slugEditedManually) return;
    const suggested = suggestProfileSlugFromDisplayName(value, null);
    if (suggested) setSlug(suggested);
  }

  return (
    <form action={action} className="mt-6 flex flex-col gap-4">
      <FormField
        label="Nome"
        name="display_name"
        required
        defaultValue={profile.display_name ?? ""}
        disabled={pending}
        error={state.fieldErrors?.display_name}
        onChange={(event) => onDisplayNameChange(event.currentTarget.value)}
        hint="Visibile nel profilo pubblico."
      />
      <FormField
        label="Indirizzo del profilo"
        name="slug"
        required
        error={state.fieldErrors?.slug}
        hint="È l'indirizzo della tua pagina pubblica nella rete. Usa lettere, numeri e trattini."
      >
        <div className="border-line bg-surface-elevated focus-within:border-brand focus-within:ring-brand/30 flex overflow-hidden rounded-md border focus-within:ring-2">
          <span className="border-line bg-surface-muted text-ink-subtle flex shrink-0 items-center border-r px-3 text-sm select-none">
            {PERSON_PUBLIC_PATH_PREFIX.replace(/\/$/, "")}/
          </span>
          <input
            id="slug"
            name="slug"
            type="text"
            required
            value={slug}
            disabled={pending}
            aria-invalid={Boolean(state.fieldErrors?.slug)}
            aria-describedby={
              state.fieldErrors?.slug ? "slug-error" : "slug-hint"
            }
            autoComplete="off"
            spellCheck={false}
            className="text-ink min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none disabled:opacity-60"
            onChange={(event) => {
              setSlugEditedManually(true);
              setSlug(event.currentTarget.value);
            }}
          />
        </div>
      </FormField>
      <FormField
        label="Bio"
        name="bio"
        defaultValue={profile.bio ?? ""}
        disabled={pending}
        hint="Visibile nel profilo pubblico."
      />
      <FormField
        label="Città"
        name="city"
        defaultValue={profile.city ?? ""}
        disabled={pending}
      />
      <FormField
        label="Provincia"
        name="province"
        defaultValue={profile.province ?? ""}
        disabled={pending}
      />
      <FormField
        label="Regione"
        name="region"
        defaultValue={profile.region ?? ""}
        disabled={pending}
      />
      <FormField
        label="Paese"
        name="country"
        defaultValue={profile.country ?? "Italia"}
        disabled={pending}
      />
      <FormField
        label="Sito web"
        name="website"
        defaultValue={profile.website ?? ""}
        disabled={pending}
        hint="Visibile a tutti quando il profilo è pubblico."
      />

      <fieldset className="border-line space-y-4 rounded-md border p-4">
        <legend className="text-ink px-1 text-sm font-medium">
          Recapiti professionali
        </legend>
        <p className="text-ink-muted text-sm">
          Usa recapiti professionali. L&apos;email con cui accedi resta privata.
        </p>
        <FormField
          label="Telefono di contatto"
          name="phone"
          type="tel"
          defaultValue={contact?.phone ?? ""}
          disabled={pending}
          hint="Opzionale."
        />
        <label className="text-ink flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            name="share_phone_with_network"
            value="true"
            defaultChecked={Boolean(contact?.share_phone_with_network)}
            disabled={pending}
            className="mt-1"
          />
          <span>Mostra questo telefono agli utenti registrati della rete.</span>
        </label>
        <FormField
          label="Email professionale"
          name="contact_email"
          type="email"
          defaultValue={contact?.contact_email ?? ""}
          disabled={pending}
          error={state.fieldErrors?.contact_email}
          hint="Diversa dall&apos;email di accesso. Opzionale."
        />
        <label className="text-ink flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            name="share_contact_email_with_network"
            value="true"
            defaultChecked={Boolean(contact?.share_contact_email_with_network)}
            disabled={pending}
            className="mt-1"
          />
          <span>
            Mostra questa email professionale agli utenti registrati della rete.
          </span>
        </label>
      </fieldset>

      <label className="text-ink flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          name="is_public"
          value="true"
          defaultChecked={Boolean(profile.is_public)}
          disabled={pending}
          className="mt-1"
        />
        <span>
          Profilo pubblico — chiunque può trovare la tua presentazione nella
          rete. I recapiti restano visibili solo se li condividi sopra.
        </span>
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
        {pending ? "Salvataggio…" : "Salva profilo"}
      </Button>
    </form>
  );
}
