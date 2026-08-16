-- A4.6 — Access/RLS v1 foundation catalogs
-- Plan §7.8 / §10.1 KEEP SELECT is_active; write Svc-only v1.
-- Out of scope: training_*; Adm catalog write; residual catalogs (A6.4).

-- languages
drop policy if exists "Public can view active languages" on public.languages;
revoke all on table public.languages from anon, authenticated;
grant select on table public.languages to anon, authenticated;

create policy languages_select_public
  on public.languages
  for select
  to anon, authenticated
  using (is_active = true);

-- competencies
drop policy if exists "Public can view active competencies" on public.competencies;
revoke all on table public.competencies from anon, authenticated;
grant select on table public.competencies to anon, authenticated;

create policy competencies_select_public
  on public.competencies
  for select
  to anon, authenticated
  using (is_active = true);

-- business_sectors
drop policy if exists "Public can view active business sectors" on public.business_sectors;
revoke all on table public.business_sectors from anon, authenticated;
grant select on table public.business_sectors to anon, authenticated;

create policy business_sectors_select_public
  on public.business_sectors
  for select
  to anon, authenticated
  using (is_active = true);

-- business_membership_roles
revoke all on table public.business_membership_roles from anon, authenticated;
grant select on table public.business_membership_roles to anon, authenticated;

create policy business_membership_roles_select_public
  on public.business_membership_roles
  for select
  to anon, authenticated
  using (is_active = true);

-- language_service_types
drop policy if exists "Public can view active service types" on public.language_service_types;
revoke all on table public.language_service_types from anon, authenticated;
grant select on table public.language_service_types to anon, authenticated;

create policy language_service_types_select_public
  on public.language_service_types
  for select
  to anon, authenticated
  using (is_active = true);

-- language_service_specializations
drop policy if exists "Public can view active service specializations" on public.language_service_specializations;
revoke all on table public.language_service_specializations from anon, authenticated;
grant select on table public.language_service_specializations to anon, authenticated;

create policy language_service_specializations_select_public
  on public.language_service_specializations
  for select
  to anon, authenticated
  using (is_active = true);

-- ---------------------------------------------------------------------------
-- Ownership immutability guards (A2 §7 / §19)
-- Permissive multi-policy UPDATE cannot alone bind OLD owner to NEW across
-- XOR branches; reject owner-column mutation at BEFORE UPDATE.
-- ---------------------------------------------------------------------------
create or replace function public.access_reject_owner_cols_mutation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op <> 'UPDATE' then
    return new;
  end if;

  if tg_table_name in (
    'service_offers', 'service_requests', 'events',
    'organizations', 'collaborations', 'contents'
  ) then
    if new.owner_person_id is distinct from old.owner_person_id
       or new.owner_business_id is distinct from old.owner_business_id then
      raise exception 'ownership is immutable'
        using errcode = '42501';
    end if;
  end if;

  if tg_table_name in ('organizations', 'collaborations', 'contents') then
    if new.owned_by_editorial is distinct from old.owned_by_editorial then
      raise exception 'ownership is immutable'
        using errcode = '42501';
    end if;
  end if;

  if tg_table_name in (
    'international_market_presences',
    'international_market_interests',
    'international_commercial_relations',
    'internationalization_needs'
  ) then
    if new.person_id is distinct from old.person_id
       or new.business_id is distinct from old.business_id
       or new.subject_kind is distinct from old.subject_kind then
      raise exception 'ownership is immutable'
        using errcode = '42501';
    end if;
  end if;

  if tg_table_name = 'professional_profiles' then
    if new.person_id is distinct from old.person_id then
      raise exception 'ownership is immutable'
        using errcode = '42501';
    end if;
  end if;

  return new;
end;
$$;

revoke all on function public.access_reject_owner_cols_mutation() from public;
grant execute on function public.access_reject_owner_cols_mutation() to authenticated;

drop trigger if exists access_reject_owner_mutation on public.service_offers;
create trigger access_reject_owner_mutation
  before update on public.service_offers
  for each row execute function public.access_reject_owner_cols_mutation();

drop trigger if exists access_reject_owner_mutation on public.service_requests;
create trigger access_reject_owner_mutation
  before update on public.service_requests
  for each row execute function public.access_reject_owner_cols_mutation();

drop trigger if exists access_reject_owner_mutation on public.events;
create trigger access_reject_owner_mutation
  before update on public.events
  for each row execute function public.access_reject_owner_cols_mutation();

drop trigger if exists access_reject_owner_mutation on public.organizations;
create trigger access_reject_owner_mutation
  before update on public.organizations
  for each row execute function public.access_reject_owner_cols_mutation();

drop trigger if exists access_reject_owner_mutation on public.collaborations;
create trigger access_reject_owner_mutation
  before update on public.collaborations
  for each row execute function public.access_reject_owner_cols_mutation();

drop trigger if exists access_reject_owner_mutation on public.contents;
create trigger access_reject_owner_mutation
  before update on public.contents
  for each row execute function public.access_reject_owner_cols_mutation();

drop trigger if exists access_reject_owner_mutation on public.international_market_presences;
create trigger access_reject_owner_mutation
  before update on public.international_market_presences
  for each row execute function public.access_reject_owner_cols_mutation();

drop trigger if exists access_reject_owner_mutation on public.international_market_interests;
create trigger access_reject_owner_mutation
  before update on public.international_market_interests
  for each row execute function public.access_reject_owner_cols_mutation();

drop trigger if exists access_reject_owner_mutation on public.international_commercial_relations;
create trigger access_reject_owner_mutation
  before update on public.international_commercial_relations
  for each row execute function public.access_reject_owner_cols_mutation();

drop trigger if exists access_reject_owner_mutation on public.internationalization_needs;
create trigger access_reject_owner_mutation
  before update on public.internationalization_needs
  for each row execute function public.access_reject_owner_cols_mutation();

drop trigger if exists access_reject_owner_mutation on public.professional_profiles;
create trigger access_reject_owner_mutation
  before update on public.professional_profiles
  for each row execute function public.access_reject_owner_cols_mutation();
