"use client";

import { useActionState } from "react";
import { FormField } from "@/components/forms/FormField";
import { Button } from "@/components/ui/Button";
import {
  updateProfileAction,
  type FormActionState,
} from "@/lib/profile/actions";
import type { PersonaProfile } from "@/lib/data/authenticated/persona";

const initial: FormActionState = { ok: false };

type Props = {
  profile: PersonaProfile;
};

export function ProfileEditForm({ profile }: Props) {
  const [state, action, pending] = useActionState(updateProfileAction, initial);

  return (
    <form action={action} className="mt-6 flex flex-col gap-4">
      <FormField
        label="Nome visualizzato"
        name="display_name"
        required
        defaultValue={profile.display_name ?? ""}
        disabled={pending}
        error={state.fieldErrors?.display_name}
      />
      <FormField
        label="Slug"
        name="slug"
        required
        defaultValue={profile.slug ?? ""}
        disabled={pending}
        error={state.fieldErrors?.slug}
        hint="Identificativo pubblico univoco"
      />
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
