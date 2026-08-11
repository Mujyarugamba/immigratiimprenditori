-- L1.1b — Person professional contact channels (network-visible under opt-in)
-- Separates Auth email from contact email; phone/contact_email not readable by anon.
-- Existing profiles.phone is migrated with share_* = false (privacy by default), then cleared.
-- RLS on base table: owner + application admin only.
-- Registered network reads via SECURITY DEFINER RPC that masks unshared fields.

-- ---------------------------------------------------------------------------
-- 1) Table
-- ---------------------------------------------------------------------------
create table public.person_contact_channels (
  person_id uuid primary key
    references public.profiles (id) on delete cascade,
  phone text null,
  contact_email text null,
  share_phone_with_network boolean not null default false,
  share_contact_email_with_network boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint person_contact_channels_phone_nonblank_chk
    check (phone is null or length(btrim(phone)) > 0),
  constraint person_contact_channels_contact_email_nonblank_chk
    check (contact_email is null or length(btrim(contact_email)) > 0)
);

comment on table public.person_contact_channels is
  'L1.1b professional contact channels for a Persona. Distinct from auth.users email. Anon has no SELECT. Network peers read only via person_contact_network_get (masked by share flags). Defaults: share flags false (privacy by default).';

comment on column public.person_contact_channels.person_id is
  'Persona id (= profiles.id). PK 1:1.';
comment on column public.person_contact_channels.phone is
  'Optional professional phone. Not Auth credential. Visible to network only when share_phone_with_network.';
comment on column public.person_contact_channels.contact_email is
  'Optional professional contact email. Never Auth login email by implication. Visible to network only when share_contact_email_with_network.';
comment on column public.person_contact_channels.share_phone_with_network is
  'When true and profile is public, active registered accounts may read phone via RPC.';
comment on column public.person_contact_channels.share_contact_email_with_network is
  'When true and profile is public, active registered accounts may read contact_email via RPC.';

create function public.person_contact_channels_set_updated_at ()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger person_contact_channels_set_updated_at
  before update on public.person_contact_channels
  for each row
  execute function public.person_contact_channels_set_updated_at ();

-- ---------------------------------------------------------------------------
-- 2) Migrate existing phone values (do not assume share consent)
-- ---------------------------------------------------------------------------
insert into public.person_contact_channels (
  person_id,
  phone,
  contact_email,
  share_phone_with_network,
  share_contact_email_with_network
)
select
  p.id,
  nullif(btrim(p.phone), ''),
  null,
  false,
  false
from public.profiles as p
where nullif(btrim(p.phone), '') is not null
on conflict (person_id) do nothing;

-- Clear legacy column so anon/authenticated SELECT on profiles cannot leak phone.
update public.profiles
set phone = null
where phone is not null;

-- Harden legacy column: anon/authenticated cannot SELECT phone on profiles.
revoke select (phone) on table public.profiles from anon, authenticated;

-- Remove phone from self UPDATE whitelist grants (contact channels owns phone now).
revoke update on table public.profiles from authenticated;
grant update (
  display_name,
  slug,
  bio,
  organization_name,
  organization_type,
  role_description,
  city,
  province,
  region,
  country,
  website,
  avatar_url,
  is_public
) on table public.profiles to authenticated;

-- ---------------------------------------------------------------------------
-- 3) RLS — owner + application admin
-- ---------------------------------------------------------------------------
alter table public.person_contact_channels enable row level security;

revoke all on table public.person_contact_channels from public, anon, authenticated;
grant select, insert, update, delete on table public.person_contact_channels to authenticated;

create policy person_contact_channels_select_self
  on public.person_contact_channels
  for select
  to authenticated
  using (
    person_id = public.access_current_person_id()
    or public.access_is_application_admin ()
  );

create policy person_contact_channels_insert_self
  on public.person_contact_channels
  for insert
  to authenticated
  with check (
    public.access_is_active_account ()
    and person_id = public.access_current_person_id ()
  );

create policy person_contact_channels_update_self
  on public.person_contact_channels
  for update
  to authenticated
  using (
    public.access_is_active_account ()
    and person_id = public.access_current_person_id ()
  )
  with check (
    public.access_is_active_account ()
    and person_id = public.access_current_person_id ()
  );

create policy person_contact_channels_delete_self
  on public.person_contact_channels
  for delete
  to authenticated
  using (
    public.access_is_active_account ()
    and person_id = public.access_current_person_id ()
  );

-- ---------------------------------------------------------------------------
-- 4) Network RPC — masked contact for active registered accounts
-- ---------------------------------------------------------------------------
create function public.person_contact_network_get (p_person_id uuid)
returns table (
  phone text,
  contact_email text
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if p_person_id is null then
    return;
  end if;

  if not public.access_is_active_account () then
    return;
  end if;

  return query
  select
    case
      when c.share_phone_with_network then nullif(btrim(c.phone), '')
      else null
    end,
    case
      when c.share_contact_email_with_network then nullif(btrim(c.contact_email), '')
      else null
    end
  from public.person_contact_channels as c
  inner join public.profiles as p
    on p.id = c.person_id
  where c.person_id = p_person_id
    and p.is_public = true
    and p.is_active = true
    and p.deleted_at is null
    and (
      c.share_phone_with_network = true
      or c.share_contact_email_with_network = true
    );
end;
$$;

comment on function public.person_contact_network_get (uuid) is
  'L1.1b: returns professional phone/contact_email for a public Persona only when the corresponding share_* flag is true. Caller must be an active Account. SECURITY DEFINER; does not expose Auth email. Empty result for anon, inactive, private profiles, or unshared contacts.';

revoke all on function public.person_contact_network_get (uuid)
  from public, anon, authenticated, service_role;
grant execute on function public.person_contact_network_get (uuid) to authenticated;

-- Presence flag for CTA (no values leaked to anon)
create function public.person_has_shared_network_contact (p_person_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.person_contact_channels as c
    inner join public.profiles as p
      on p.id = c.person_id
    where c.person_id = p_person_id
      and p.is_public = true
      and p.is_active = true
      and p.deleted_at is null
      and (
        (c.share_phone_with_network = true and nullif(btrim(c.phone), '') is not null)
        or (
          c.share_contact_email_with_network = true
          and nullif(btrim(c.contact_email), '') is not null
        )
      )
  );
$$;

comment on function public.person_has_shared_network_contact (uuid) is
  'L1.1b: true when a public Persona has at least one non-empty professional contact shared with the network. Does not return contact values. Safe for anon (CTA only).';

revoke all on function public.person_has_shared_network_contact (uuid)
  from public, anon, authenticated, service_role;
grant execute on function public.person_has_shared_network_contact (uuid)
  to anon, authenticated;
