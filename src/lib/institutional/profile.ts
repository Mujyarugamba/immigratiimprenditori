export type InstitutionalProfile = {
  projectName: string;
  promoterShortName: string;
  promoterLegalName: string | null;
  president: string;
  editorialDirector: string;
  registeredOffice: string | null;
  administrativeDisclosure: string | null;
  contactEmail: string;
};

/**
 * Public institutional facts must come from verified project records.
 * Unknown administrative fields remain null: never infer them from personal
 * memory, historical drafts or payment-provider data.
 */
export const INSTITUTIONAL_PROFILE: InstitutionalProfile = {
  projectName: "Immigrati Imprenditori",
  promoterShortName: "AIPEL",
  promoterLegalName:
    "Associazione degli Imprenditori e Liberi Professionisti Extracomunitari in Lombardia",
  president: "Ing. Augustin Mujyarugamba",
  editorialDirector: "Ing. Augustin Mujyarugamba",
  registeredOffice: "Viale Molise n. 54, 20137 Milano (MI)",
  administrativeDisclosure:
    "Codice fiscale 97342380157 · Partita IVA 04222160964",
  contactEmail: "info@immigratiimprenditori.it",
};

export function hasCompleteInstitutionalDisclosure(
  profile = INSTITUTIONAL_PROFILE,
) {
  return Boolean(
    profile.promoterLegalName?.trim() &&
      profile.registeredOffice?.trim() &&
      profile.administrativeDisclosure?.trim(),
  );
}
