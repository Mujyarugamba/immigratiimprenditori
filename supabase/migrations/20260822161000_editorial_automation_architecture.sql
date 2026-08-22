-- Private editorial automation architecture.
-- Prepared only: no public AI output, automated publication or machine translation
-- becomes visible until an editor has reviewed and explicitly published it.

create table if not exists public.editorial_source_watch_state (
  source_id uuid primary key references public.observatory_statistical_sources(id) on delete cascade,
  last_checked_at timestamptz null,
  last_success_at timestamptz null,
  last_http_status integer null,
  last_content_fingerprint text null,
  consecutive_failures integer not null default 0 check (consecutive_failures >= 0),
  last_error text null,
  changed_since_last_success boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.editorial_alert_rules (
  id uuid primary key default gen_random_uuid(),
  owner_account_id uuid not null references public.accounts(id) on delete cascade,
  alert_kind text not null check (alert_kind in ('source_changed','new_dataset','new_radar_item','workflow_stale')),
  label text not null check (length(btrim(label)) > 0),
  filters jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.editorial_ai_runs (
  id uuid primary key default gen_random_uuid(),
  requested_by_account_id uuid not null references public.accounts(id) on delete restrict,
  task_kind text not null check (task_kind in ('summarize','classify','extract','translate','transcribe','draft')),
  entity_kind text null,
  entity_id uuid null,
  provider text not null check (length(btrim(provider)) > 0),
  model text not null check (length(btrim(model)) > 0),
  prompt_version text not null check (length(btrim(prompt_version)) > 0),
  input_fingerprint text not null check (length(btrim(input_fingerprint)) > 0),
  output_payload jsonb not null default '{}'::jsonb,
  status text not null default 'generated' check (status in ('generated','reviewed','accepted','rejected','failed')),
  reviewed_by_account_id uuid null references public.accounts(id) on delete restrict,
  reviewed_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.content_translation_jobs (
  id uuid primary key default gen_random_uuid(),
  source_content_id uuid not null references public.contents(id) on delete cascade,
  target_language_id bigint not null references public.languages(id) on delete restrict,
  requested_by_account_id uuid not null references public.accounts(id) on delete restrict,
  ai_run_id uuid null references public.editorial_ai_runs(id) on delete set null,
  status text not null default 'queued' check (status in ('queued','machine_draft','human_review','approved','rejected','failed')),
  reviewed_by_account_id uuid null references public.accounts(id) on delete restrict,
  reviewed_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_content_id, target_language_id)
);

create table if not exists public.content_transcription_assets (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references public.contents(id) on delete cascade,
  language_id bigint not null references public.languages(id) on delete restrict,
  transcript_text text not null default '',
  subtitle_format text null check (subtitle_format is null or subtitle_format in ('vtt','srt')),
  subtitle_url text null,
  ai_run_id uuid null references public.editorial_ai_runs(id) on delete set null,
  review_status text not null default 'machine_draft' check (review_status in ('machine_draft','human_review','approved','rejected')),
  reviewed_by_account_id uuid null references public.accounts(id) on delete restrict,
  reviewed_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (content_id, language_id)
);

create index if not exists editorial_alert_rules_owner_idx
  on public.editorial_alert_rules(owner_account_id, is_active);
create index if not exists editorial_ai_runs_entity_idx
  on public.editorial_ai_runs(entity_kind, entity_id, created_at desc);
create index if not exists translation_jobs_status_idx
  on public.content_translation_jobs(status, created_at);
create index if not exists transcription_assets_content_idx
  on public.content_transcription_assets(content_id, review_status);

alter table public.editorial_source_watch_state enable row level security;
alter table public.editorial_alert_rules enable row level security;
alter table public.editorial_ai_runs enable row level security;
alter table public.content_translation_jobs enable row level security;
alter table public.content_transcription_assets enable row level security;

-- All automation tables remain private to editors/application administrators.
create policy editorial_source_watch_state_editor_all on public.editorial_source_watch_state
for all to authenticated
using (access_is_editor() or access_is_application_admin())
with check (access_is_editor() or access_is_application_admin());

create policy editorial_alert_rules_editor_all on public.editorial_alert_rules
for all to authenticated
using (access_is_editor() or access_is_application_admin())
with check (access_is_editor() or access_is_application_admin());

create policy editorial_ai_runs_editor_all on public.editorial_ai_runs
for all to authenticated
using (access_is_editor() or access_is_application_admin())
with check (access_is_editor() or access_is_application_admin());

create policy content_translation_jobs_editor_all on public.content_translation_jobs
for all to authenticated
using (access_is_editor() or access_is_application_admin())
with check (access_is_editor() or access_is_application_admin());

create policy content_transcription_assets_editor_all on public.content_transcription_assets
for all to authenticated
using (access_is_editor() or access_is_application_admin())
with check (access_is_editor() or access_is_application_admin());

grant select, insert, update, delete on public.editorial_source_watch_state to authenticated;
grant select, insert, update, delete on public.editorial_alert_rules to authenticated;
grant select, insert, update, delete on public.editorial_ai_runs to authenticated;
grant select, insert, update, delete on public.content_translation_jobs to authenticated;
grant select, insert, update, delete on public.content_transcription_assets to authenticated;
