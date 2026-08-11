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

const initial: FormActionState = { ok: false };

type Props = {
  profile: PersonaProfile;
};

export function ProfileEditForm({ profile }: Props) {
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
      />
      <FormField
        label="Telefono"
        name="phone"
        defaultValue={profile.phone ?? ""}
        disabled={pending}
      />
      <label className="text-ink flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="is_public"
          value="true"
          defaultChecked={Boolean(profile.is_public)}
          disabled={pending}
        />
        Profilo pubblico
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
