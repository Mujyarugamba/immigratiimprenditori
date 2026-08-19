-- Immigrati Imprenditori — Editorial Inbox activity audit
-- Additive migration. Records redactional triage changes; no public access.

begin;

create table if not exists public.editorial_inbox_activity (
  id uuid primary key default gen_random_uuid(),
  inbox_item_id uuid not null references public.editorial_inbox_items(id) on delete cascade,
  actor_account_id uuid null references public.accounts(id) on delete set null,
  changes jsonb not null check (jsonb_typeof(changes) = 'object' and changes <> '{}'::jsonb),
  created_at timestamptz not null default now()
);

create index if not exists editorial_inbox_activity_item_idx
  on public.editorial_inbox_activity(inbox_item_id, created_at desc);
create index if not exists editorial_inbox_activity_actor_idx
  on public.editorial_inbox_activity(actor_account_id)
  where actor_account_id is not null;

alter table public.editorial_inbox_activity enable row level security;

create policy editorial_inbox_activity_editor_read
on public.editorial_inbox_activity
for select
to authenticated
using (public.access_is_editor() or public.access_is_application_admin());

grant select on public.editorial_inbox_activity to authenticated;
revoke all on public.editorial_inbox_activity from anon;

create or replace function public.log_editorial_inbox_activity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_changes jsonb := '{}'::jsonb;
  v_actor uuid;
begin
  if new.status is distinct from old.status then
    v_changes := v_changes || jsonb_build_object(
      'status', jsonb_build_object('from', old.status, 'to', new.status)
    );
  end if;

  if new.priority is distinct from old.priority then
    v_changes := v_changes || jsonb_build_object(
      'priority', jsonb_build_object('from', old.priority, 'to', new.priority)
    );
  end if;

  if new.assigned_account_id is distinct from old.assigned_account_id then
    v_changes := v_changes || jsonb_build_object(
      'assigned_account_id', jsonb_build_object(
        'from', old.assigned_account_id,
        'to', new.assigned_account_id
      )
    );
  end if;

  if v_changes <> '{}'::jsonb then
    v_actor := public.access_current_account_id();
    insert into public.editorial_inbox_activity (
      inbox_item_id,
      actor_account_id,
      changes
    ) values (
      new.id,
      v_actor,
      v_changes
    );
  end if;

  return new;
end;
$$;

revoke all on function public.log_editorial_inbox_activity() from public, anon, authenticated;

create trigger editorial_inbox_activity_log
  after update of status, priority, assigned_account_id
  on public.editorial_inbox_items
  for each row
  when (
    old.status is distinct from new.status
    or old.priority is distinct from new.priority
    or old.assigned_account_id is distinct from new.assigned_account_id
  )
  execute function public.log_editorial_inbox_activity();

commit;
