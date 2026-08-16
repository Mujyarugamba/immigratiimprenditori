"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import {
  revokeRoleAction,
  type FormActionState,
} from "@/lib/admin/actions";

const initial: FormActionState = { ok: false };

type RevokeRoleButtonProps = {
  assignmentId: string;
  accountId?: string;
  roleLabel: string;
};

export function RevokeRoleButton({
  assignmentId,
  accountId,
  roleLabel,
}: RevokeRoleButtonProps) {
  const [state, action, pending] = useActionState(revokeRoleAction, initial);

  return (
    <form action={action} className="inline">
      <input type="hidden" name="assignment_id" value={assignmentId} />
      {accountId ? (
        <input type="hidden" name="account_id" value={accountId} />
      ) : null}
      <Button
        type="submit"
        variant="secondary"
        size="sm"
        disabled={pending}
        className="text-xs"
      >
        {pending ? "Revoca…" : `Revoca ${roleLabel}`}
      </Button>
      {state.message && !state.ok ? (
        <p className="text-accent-dark mt-1 text-xs" role="alert">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
