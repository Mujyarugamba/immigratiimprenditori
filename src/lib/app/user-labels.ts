import type { AccountStatus, PersonAssociationStatus } from "@/types/access";

/** Italian labels for Account lifecycle — UX only; DB codes remain authoritative. */
export function labelAccountStatus(
  status: AccountStatus | string | null | undefined,
): string {
  switch (status) {
    case "registered":
      return "Registrato";
    case "limited":
      return "Limitato";
    case "active":
      return "Attivo";
    case "suspended":
      return "Sospeso";
    case "disabled":
      return "Disabilitato";
    case "closed":
      return "Chiuso";
    default:
      return "Non disponibile";
  }
}

export function labelPersonAssociation(
  status: PersonAssociationStatus | string | null | undefined,
  hasPerson: boolean,
): string {
  if (status === "contested") return "Da verificare";
  if (status === "verified") return "Verificata";
  if (status === "declared") return "Collegata";
  if (hasPerson) return "Collegata";
  return "Da completare";
}

export function labelProfileReady(isActiveAccount: boolean): string {
  return isActiveAccount ? "Completo" : "Da completare";
}
