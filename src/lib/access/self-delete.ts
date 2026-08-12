/**
 * M3 self-service account deletion — shared contract + copy.
 * Server orchestration lives in self-delete-actions.ts.
 * Never accept account_id from the browser.
 */

export type SelfDeleteBlocker =
  | "last_application_admin"
  | "last_business_manager"
  | "sole_organization_owner";

export type SelfDeletePreflight = {
  account_id: string;
  account_status: string;
  can_proceed: boolean;
  blockers: SelfDeleteBlocker[];
  orphan_business_ids: string[];
  orphan_organization_ids: string[];
  last_business_ids: string[];
  sole_organization_ids: string[];
  m4_required: boolean;
  m4_cases_will_open: boolean;
};

export type SelfDeleteResult = {
  ok: boolean;
  idempotent: boolean;
  account_id: string;
  account_status: string;
  person_minimized?: boolean;
  auth_action_required?: boolean;
};

export const SELF_DELETE_CONFIRM_PHRASE = "CANCELLA";

export const SELF_DELETE_USER_COPY = {
  title: "Cancella account",
  summary:
    "La cancellazione rimuove il tuo profilo personale dalla piattaforma e termina l’accesso. Imprese, organizzazioni e contenuti autonomi non vengono cancellati automaticamente. Alcuni dati strettamente necessari possono essere conservati solo se previsto dalla Privacy Policy.",
  privacyHref: "/privacy",
  blockedLastAdmin:
    "Non puoi cancellare l’account: sei l’unico amministratore applicativo rimasto. Nomina un altro amministratore prima di procedere.",
  orphanInfo:
    "Se sei l’unico gestore di un’impresa o titolare di un’organizzazione, la piattaforma registrerà internamente la necessità di riassegnare la gestione. Non ti viene chiesto di trovare un sostituto per cancellare l’account.",
} as const;

export function parseSelfDeletePreflight(raw: unknown): SelfDeletePreflight | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.account_id !== "string") return null;
  if (typeof o.can_proceed !== "boolean") return null;
  const blockers = Array.isArray(o.blockers)
    ? (o.blockers.filter((b) => typeof b === "string") as SelfDeleteBlocker[])
    : [];
  return {
    account_id: o.account_id,
    account_status: String(o.account_status ?? ""),
    can_proceed: o.can_proceed,
    blockers,
    orphan_business_ids: Array.isArray(o.orphan_business_ids)
      ? o.orphan_business_ids.filter((x): x is string => typeof x === "string")
      : [],
    orphan_organization_ids: Array.isArray(o.orphan_organization_ids)
      ? o.orphan_organization_ids.filter((x): x is string => typeof x === "string")
      : [],
    last_business_ids: Array.isArray(o.last_business_ids)
      ? o.last_business_ids.filter((x): x is string => typeof x === "string")
      : [],
    sole_organization_ids: Array.isArray(o.sole_organization_ids)
      ? o.sole_organization_ids.filter((x): x is string => typeof x === "string")
      : [],
    m4_required: Boolean(o.m4_required),
    m4_cases_will_open: Boolean(o.m4_cases_will_open),
  };
}

/** Human-facing blocker message; orphan cases are not blockers after M4. */
export function selfDeleteBlockerMessage(
  preflight: SelfDeletePreflight,
): string | null {
  if (preflight.can_proceed) return null;
  if (preflight.blockers.includes("last_application_admin")) {
    return SELF_DELETE_USER_COPY.blockedLastAdmin;
  }
  return null;
}
