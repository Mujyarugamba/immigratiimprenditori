import { createAdminClient } from "@/lib/supabase/admin";

export type ContributorAdminRow = {
  assignmentId: string;
  accountId: string;
  authUserId: string;
  email: string | null;
  displayName: string | null;
  accountStatus: string;
  assignmentStatus: string;
  assignedAt: string;
  revokedAt: string | null;
  invitedAt: string | null;
  emailConfirmedAt: string | null;
};

type AssignmentRow = {
  id: string;
  account_id: string;
  assignment_status: string;
  assigned_at: string;
  revoked_at: string | null;
};

type AccountRow = {
  id: string;
  auth_user_id: string;
  account_status: string;
  person_id: string | null;
};

type ProfileRow = {
  id: string;
  display_name: string | null;
};

export async function findAuthUserByEmail(email: string) {
  const admin = createAdminClient();
  const normalized = email.trim().toLowerCase();
  const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) throw new Error("Unable to inspect Auth users");
  return data.users.find((user) => user.email?.trim().toLowerCase() === normalized) ?? null;
}

export async function listContributorAccountsAdmin(): Promise<ContributorAdminRow[]> {
  const admin = createAdminClient();
  const { data: assignmentsData, error: assignmentsError } = await admin
    .from("account_role_assignments")
    .select("id, account_id, assignment_status, assigned_at, revoked_at")
    .eq("role_code", "contributore")
    .order("assigned_at", { ascending: false });
  if (assignmentsError) throw new Error("Unable to load contributor assignments");

  const assignments = (assignmentsData ?? []) as AssignmentRow[];
  if (assignments.length === 0) return [];

  const accountIds = [...new Set(assignments.map((row) => row.account_id))];
  const { data: accountsData, error: accountsError } = await admin
    .from("accounts")
    .select("id, auth_user_id, account_status, person_id")
    .in("id", accountIds);
  if (accountsError) throw new Error("Unable to load contributor accounts");
  const accounts = (accountsData ?? []) as AccountRow[];

  const personIds = accounts
    .map((row) => row.person_id)
    .filter((value): value is string => Boolean(value));
  const profiles = new Map<string, ProfileRow>();
  if (personIds.length > 0) {
    const { data: profilesData, error: profilesError } = await admin
      .from("profiles")
      .select("id, display_name")
      .in("id", personIds);
    if (profilesError) throw new Error("Unable to load contributor profiles");
    for (const row of (profilesData ?? []) as ProfileRow[]) profiles.set(row.id, row);
  }

  const { data: usersData, error: usersError } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (usersError) throw new Error("Unable to load contributor Auth users");
  const users = new Map(usersData.users.map((user) => [user.id, user]));
  const accountsById = new Map(accounts.map((row) => [row.id, row]));

  return assignments.flatMap((assignment) => {
    const account = accountsById.get(assignment.account_id);
    if (!account) return [];
    const authUser = users.get(account.auth_user_id);
    const profile = account.person_id ? profiles.get(account.person_id) : null;
    return [{
      assignmentId: assignment.id,
      accountId: account.id,
      authUserId: account.auth_user_id,
      email: authUser?.email ?? null,
      displayName: profile?.display_name ?? null,
      accountStatus: account.account_status,
      assignmentStatus: assignment.assignment_status,
      assignedAt: assignment.assigned_at,
      revokedAt: assignment.revoked_at,
      invitedAt: authUser?.invited_at ?? null,
      emailConfirmedAt: authUser?.email_confirmed_at ?? null,
    }];
  });
}
