import { ACCOUNT_STATUSES } from "@/types/access";

export const ACCOUNT_STATUS_LABELS: Record<
  (typeof ACCOUNT_STATUSES)[number],
  string
> = {
  registered: "Registrato",
  active: "Attivo",
  limited: "Limitato",
  suspended: "Sospeso",
  disabled: "Disabilitato",
  closed: "Chiuso",
};

export const PERSON_ASSOCIATION_LABELS: Record<string, string> = {
  declared: "Dichiarata",
  verified: "Verificata",
  contested: "Contestata",
};

export const APPLICATION_ROLE_LABELS: Record<string, string> = {
  redattore: "Redattore",
  amministratore_applicativo: "Amministratore",
};

export const ASSIGNMENT_STATUS_LABELS: Record<string, string> = {
  active: "Attivo",
  revoked: "Revocato",
};

export const WHITELISTED_APPLICATION_ROLES = [
  "redattore",
  "amministratore_applicativo",
] as const;

export type WhitelistedApplicationRole =
  (typeof WHITELISTED_APPLICATION_ROLES)[number];
