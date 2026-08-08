import { mapPostgresError, type AppError } from "@/lib/errors/app-error";
import { paginated, type PaginatedResult } from "@/lib/data/public/paging";
import { createClient } from "@/lib/supabase/server";
import {
  isAccountStatus,
  type AccountStatus,
  type PersonAssociationStatus,
} from "@/types/access";

const LIST_PAGE_SIZE = 20;

const ACCOUNT_SELECT = `
  id,
  auth_user_id,
  person_id,
  person_association_status,
  person_linked_at,
  account_status,
  activated_at,
  suspended_at,
  disabled_at,
  closed_at,
  status_reason,
  created_at,
  updated_at,
  profiles:person_id ( id, display_name, slug )
`;

export type AdminAccountPerson = {
  id: string;
  display_name: string | null;
  slug: string | null;
} | null;

export type AdminAccountListItem = {
  id: string;
  auth_user_id: string;
  person_id: string | null;
  person_association_status: PersonAssociationStatus | null;
  account_status: AccountStatus;
  person_linked_at: string | null;
  created_at: string;
  updated_at: string;
  person: AdminAccountPerson;
};

export type AdminAccountDetail = AdminAccountListItem & {
  activated_at: string | null;
  suspended_at: string | null;
  disabled_at: string | null;
  closed_at: string | null;
  status_reason: string | null;
};

type AccountRow = {
  id: string;
  auth_user_id: string;
  person_id: string | null;
  person_association_status: string | null;
  person_linked_at: string | null;
  account_status: string;
  activated_at?: string | null;
  suspended_at?: string | null;
  disabled_at?: string | null;
  closed_at?: string | null;
  status_reason?: string | null;
  created_at: string;
  updated_at: string;
  profiles:
    | { id: string; display_name: string | null; slug: string | null }
    | { id: string; display_name: string | null; slug: string | null }[]
    | null;
};

function asOne<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function mapPerson(
  profiles: AccountRow["profiles"],
): AdminAccountPerson {
  const row = asOne(profiles);
  if (!row) return null;
  return {
    id: row.id,
    display_name: row.display_name,
    slug: row.slug,
  };
}

function mapListItem(row: AccountRow): AdminAccountListItem | null {
  if (!isAccountStatus(row.account_status)) return null;
  return {
    id: row.id,
    auth_user_id: row.auth_user_id,
    person_id: row.person_id,
    person_association_status:
      row.person_association_status as PersonAssociationStatus | null,
    person_linked_at: row.person_linked_at,
    account_status: row.account_status,
    created_at: row.created_at,
    updated_at: row.updated_at,
    person: mapPerson(row.profiles),
  };
}

function mapDetail(row: AccountRow): AdminAccountDetail | null {
  const base = mapListItem(row);
  if (!base) return null;
  return {
    ...base,
    activated_at: row.activated_at ?? null,
    suspended_at: row.suspended_at ?? null,
    disabled_at: row.disabled_at ?? null,
    closed_at: row.closed_at ?? null,
    status_reason: row.status_reason ?? null,
  };
}

export type ListAccountsParams = {
  status?: AccountStatus | "";
  q?: string;
  page?: number;
};

export async function listAccounts(
  params: ListAccountsParams = {},
): Promise<PaginatedResult<AdminAccountListItem>> {
  const page = Math.max(1, params.page ?? 1);
  const q = (params.q ?? "").trim().toLowerCase();
  const from = (page - 1) * LIST_PAGE_SIZE;
  const to = from + LIST_PAGE_SIZE - 1;

  const supabase = await createClient();
  let query = supabase
    .from("accounts")
    .select(ACCOUNT_SELECT, { count: "exact" })
    .order("created_at", { ascending: false });

  if (params.status) {
    query = query.eq("account_status", params.status);
  }

  if (q) {
    const uuidLike = /^[0-9a-f-]{8,}$/i.test(q);
    if (uuidLike) {
      query = query.or(
        `id.ilike.${q}%,auth_user_id.ilike.${q}%,person_id.ilike.${q}%`,
      );
    } else {
      query = query.ilike("status_reason", `%${q}%`);
    }
  }

  const { data, error, count } = await query.range(from, to);
  if (error) {
    return paginated([], 0, page, LIST_PAGE_SIZE);
  }

  const items = ((data ?? []) as AccountRow[])
    .map(mapListItem)
    .filter((row): row is AdminAccountListItem => row != null);

  return paginated(items, count ?? items.length, page, LIST_PAGE_SIZE);
}

export async function getAccountById(
  id: string,
): Promise<AdminAccountDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("accounts")
    .select(ACCOUNT_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapDetail(data as AccountRow);
}

export type AccountStatusCounts = Record<AccountStatus, number>;

export async function countAccountsByStatus(): Promise<AccountStatusCounts> {
  const supabase = await createClient();
  const statuses: AccountStatus[] = [
    "registered",
    "active",
    "limited",
    "suspended",
    "disabled",
    "closed",
  ];

  const results = await Promise.all(
    statuses.map(async (status) => {
      const { count } = await supabase
        .from("accounts")
        .select("id", { count: "exact", head: true })
        .eq("account_status", status);
      return [status, count ?? 0] as const;
    }),
  );

  return Object.fromEntries(results) as AccountStatusCounts;
}

export async function closeAccount(
  accountId: string,
): Promise<{ ok: true; accountId: string } | { ok: false; error: AppError }> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("access_close_account", {
    p_account_id: accountId,
  });

  if (error) {
    return { ok: false, error: mapPostgresError(error) };
  }

  if (!data || typeof data !== "string") {
    return {
      ok: false,
      error: { code: "unexpected", message: "Chiusura Account non riuscita." },
    };
  }

  return { ok: true, accountId: data };
}
