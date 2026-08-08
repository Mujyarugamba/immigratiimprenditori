/** Access/RLS v1 — application identity types (no DB schema changes). */

export const ACCOUNT_STATUSES = [
  "registered",
  "active",
  "limited",
  "suspended",
  "disabled",
  "closed",
] as const;

export type AccountStatus = (typeof ACCOUNT_STATUSES)[number];

export const PERSON_ASSOCIATION_STATUSES = [
  "declared",
  "verified",
  "contested",
] as const;

export type PersonAssociationStatus =
  (typeof PERSON_ASSOCIATION_STATUSES)[number];

export type ApplicationSession = {
  authUserId: string;
  email: string | null;
  accountId: string | null;
  accountStatus: AccountStatus | null;
  /** Access helper person id (null when contested/absent/closed). */
  personId: string | null;
  /** Raw Account→Persona link (may differ from personId when contested). */
  accountPersonId: string | null;
  personAssociationStatus: PersonAssociationStatus | null;
  isActiveAccount: boolean;
  isEditor: boolean;
  isApplicationAdmin: boolean;
};

export function isPersonAssociationStatus(
  value: string | null | undefined,
): value is PersonAssociationStatus {
  return (
    value != null &&
    (PERSON_ASSOCIATION_STATUSES as readonly string[]).includes(value)
  );
}

export type PublicViewer = {
  kind: "anonymous";
};

export type AuthenticatedViewer = {
  kind: "authenticated";
  session: ApplicationSession;
};

export type Viewer = PublicViewer | AuthenticatedViewer;

export function isAccountStatus(value: string | null | undefined): value is AccountStatus {
  return (
    value != null &&
    (ACCOUNT_STATUSES as readonly string[]).includes(value)
  );
}
