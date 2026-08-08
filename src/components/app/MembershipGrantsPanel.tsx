"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import {
  concludeMembershipAction,
  grantManagementAction,
  revokeManagementAction,
  type FormActionState,
} from "@/lib/business/actions";
import type { MembershipListItem } from "@/types/business";

const initial: FormActionState = { ok: false };

type Props = {
  businessId: string;
  memberships: MembershipListItem[];
  canManage: boolean;
};

function GrantButton({
  membershipId,
  businessId,
  disabled,
}: {
  membershipId: string;
  businessId: string;
  disabled?: boolean;
}) {
  const [state, action, pending] = useActionState(grantManagementAction, initial);
  return (
    <form action={action} className="inline">
      <input type="hidden" name="membership_id" value={membershipId} />
      <input type="hidden" name="business_id" value={businessId} />
      <Button
        type="submit"
        size="sm"
        variant="secondary"
        disabled={pending || disabled}
      >
        {pending ? "…" : "Concedi gestione"}
      </Button>
      {state.message ? (
        <p className="text-accent-dark mt-1 text-xs" role="alert">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

function RevokeButton({
  authorizationId,
  businessId,
  isSelf,
}: {
  authorizationId: string;
  businessId: string;
  isSelf: boolean;
}) {
  const [state, action, pending] = useActionState(
    revokeManagementAction,
    initial,
  );
  return (
    <form action={action} className="inline">
      <input type="hidden" name="authorization_id" value={authorizationId} />
      <input type="hidden" name="business_id" value={businessId} />
      <Button type="submit" size="sm" variant="ghost" disabled={pending}>
        {pending ? "…" : isSelf ? "Autorevoca" : "Revoca"}
      </Button>
      {state.message ? (
        <p className="text-ink-muted mt-1 text-xs" role="status">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

function ConcludeButton({
  membershipId,
  businessId,
}: {
  membershipId: string;
  businessId: string;
}) {
  const [state, action, pending] = useActionState(
    concludeMembershipAction,
    initial,
  );
  return (
    <form action={action} className="inline">
      <input type="hidden" name="membership_id" value={membershipId} />
      <input type="hidden" name="business_id" value={businessId} />
      <Button type="submit" size="sm" variant="ghost" disabled={pending}>
        {pending ? "…" : "Concludi membership"}
      </Button>
      {state.message ? (
        <p className="text-ink-muted mt-1 text-xs">{state.message}</p>
      ) : null}
    </form>
  );
}

export function MembershipGrantsPanel({
  businessId,
  memberships,
  canManage,
}: Props) {
  if (memberships.length === 0) {
    return (
      <p className="text-ink-muted text-sm">Nessun altro membro visibile.</p>
    );
  }

  return (
    <ul className="divide-line border-line divide-y rounded-md border">
      {memberships.map((m) => (
        <li key={m.id} className="flex flex-col gap-2 px-3 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-ink font-medium">
              {m.personDisplayName ?? m.personId.slice(0, 8)}
              {m.isSelf ? " (tu)" : ""}
            </p>
            <p className="text-ink-muted text-xs">
              Ruolo descrittivo: <code>{m.roleId}</code> · relazione:{" "}
              {m.relationStatus} · grant: {m.grantStatus}
              {m.isContested ? " · contestata" : ""}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {canManage &&
            !m.isSelf &&
            m.relationStatus === "active" &&
            m.grantStatus !== "granted" ? (
              <GrantButton membershipId={m.id} businessId={businessId} />
            ) : null}
            {canManage &&
            m.grantStatus === "granted" &&
            m.authorizationId ? (
              <RevokeButton
                authorizationId={m.authorizationId}
                businessId={businessId}
                isSelf={m.isSelf}
              />
            ) : null}
            {!canManage &&
            m.isSelf &&
            m.grantStatus === "granted" &&
            m.authorizationId ? (
              <RevokeButton
                authorizationId={m.authorizationId}
                businessId={businessId}
                isSelf
              />
            ) : null}
            {m.isSelf && m.relationStatus === "active" ? (
              <ConcludeButton membershipId={m.id} businessId={businessId} />
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
