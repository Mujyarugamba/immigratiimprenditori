-- Standalone reconstruction of hosted migration
-- 20260819170614_content_interview_workflow.
--
-- This schema already exists on the hosted Centro Studi database. This file is
-- retained only so the canonical standalone cold-start can reproduce the hosted
-- state before later candidate migrations are replayed. It is NOT a Production
-- candidate and must not be applied again to the hosted project.

create table if not exists public.content_interview_workflow (
  content_id uuid primary key references public.contents(id) on delete cascade,
  workflow_status text not null default 'candidate' check (workflow_status in ('candidate','contacted','scheduled','interviewed','fact_check','approved','declined','closed')),
  source_origin text not null default 'editorial' check (source_origin in ('editorial','contribution','referral','public_source')),
  contacted_at timestamptz,
  scheduled_for timestamptz,
  interviewed_at timestamptz,
  publication_consent_status text not null default 'pending' check (publication_consent_status in ('pending','granted','declined','not_required')),
  publication_consent_at timestamptz,
  quote_approval_status text not null default 'pending' check (quote_approval_status in ('pending','granted','declined','not_required')),
  quote_approval_at timestamptz,
  image_consent_status text not null default 'pending' check (image_consent_status in ('pending','granted','declined','not_required')),
  image_consent_at timestamptz,
  video_consent_status text not null default 'not_required' check (video_consent_status in ('pending','granted','declined','not_required')),
  video_consent_at timestamptz,
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint content_interview_workflow_contacted_check check (contacted_at is not null or workflow_status = 'candidate'),
  constraint content_interview_workflow_scheduled_check check (scheduled_for is not null or workflow_status not in ('scheduled')),
  constraint content_interview_workflow_interviewed_check check (interviewed_at is not null or workflow_status not in ('interviewed','fact_check','approved','closed')),
  constraint content_interview_workflow_publication_consent_check check ((publication_consent_status='granted' and publication_consent_at is not null) or publication_consent_status<>'granted'),
  constraint content_interview_workflow_quote_approval_check check ((quote_approval_status='granted' and quote_approval_at is not null) or quote_approval_status<>'granted'),
  constraint content_interview_workflow_image_consent_check check ((image_consent_status='granted' and image_consent_at is not null) or image_consent_status<>'granted'),
  constraint content_interview_workflow_video_consent_check check ((video_consent_status='granted' and video_consent_at is not null) or video_consent_status<>'granted')
);

alter table public.content_interview_workflow enable row level security;

drop policy if exists content_interview_workflow_editor_all on public.content_interview_workflow;
create policy content_interview_workflow_editor_all
on public.content_interview_workflow
for all
to authenticated
using (public.access_is_editor() or public.access_is_application_admin())
with check (public.access_is_editor() or public.access_is_application_admin());

revoke all on table public.content_interview_workflow from public, anon, authenticated;
grant select, insert, update, delete on table public.content_interview_workflow to authenticated;

create index if not exists content_interview_workflow_status_idx on public.content_interview_workflow(workflow_status);

create trigger content_interview_workflow_set_updated_at
before update on public.content_interview_workflow
for each row execute function public.set_updated_at();
