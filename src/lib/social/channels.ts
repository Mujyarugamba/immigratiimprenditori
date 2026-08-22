export type InstitutionalSocialChannel = {
  id: "linkedin" | "x" | "youtube";
  label: string;
  displayName: "Immigrati Imprenditori";
  handle: string;
  plannedUrl: string;
  editorialUse: string;
  enabled: boolean;
};

/**
 * Official v1 social perimeter.
 *
 * Keep `enabled: false` until the account is actually created and the final URL
 * is verified. Public pages and structured data must never expose planned URLs
 * as if they were live profiles.
 */
export const INSTITUTIONAL_SOCIAL_CHANNELS = [
  {
    id: "linkedin",
    label: "LinkedIn",
    displayName: "Immigrati Imprenditori",
    handle: "immigrati-imprenditori",
    plannedUrl: "https://www.linkedin.com/company/immigrati-imprenditori",
    editorialUse: "Ricerca, rapporti, partnership e contenuti istituzionali.",
    enabled: false,
  },
  {
    id: "x",
    label: "X",
    displayName: "Immigrati Imprenditori",
    handle: "@ImmImprenditori",
    plannedUrl: "https://x.com/ImmImprenditori",
    editorialUse: "Notizie, dati, segnalazioni e aggiornamenti.",
    enabled: false,
  },
  {
    id: "youtube",
    label: "YouTube",
    displayName: "Immigrati Imprenditori",
    handle: "@immigratiimprenditori",
    plannedUrl: "https://www.youtube.com/@immigratiimprenditori",
    editorialUse: "Interviste, testimonianze, convegni e presentazioni.",
    enabled: false,
  },
] as const satisfies readonly InstitutionalSocialChannel[];

export function enabledInstitutionalSocialChannels() {
  return INSTITUTIONAL_SOCIAL_CHANNELS.filter((channel) => channel.enabled);
}
