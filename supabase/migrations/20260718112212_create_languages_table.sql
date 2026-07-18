-- Create public.languages, a reference list of business-facing languages
-- (ISO 639-1 code when available): languages spoken by professionals,
-- languages a business can assist clients in, translation/interpreting
-- services, etc. This table does NOT represent the site's interface
-- languages, which will be handled separately by the application's i18n
-- system. Includes RLS, a public read policy, an updated_at trigger and an
-- initial seed of 30 languages.

create table public.languages (
  id bigint generated always as identity primary key,
  code text not null unique,
  english_name text not null,
  native_name text not null,
  text_direction text not null default 'ltr',
  is_active boolean not null default true,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint languages_text_direction_check check (text_direction in ('ltr', 'rtl'))
);

comment on table public.languages is
  'Business-facing languages (spoken by professionals, used to assist clients, translation/interpreting, etc.), keyed by ISO 639-1 code when available. Not the site''s interface languages, which are handled by the application''s i18n system.';

-- B-tree lookup indexes (code already has one via its unique constraint).
create index languages_english_name_idx on public.languages using btree (english_name);

create index languages_native_name_idx on public.languages using btree (native_name);

create index languages_is_active_idx on public.languages using btree (is_active);

create index languages_sort_order_idx on public.languages using btree (sort_order);

alter table public.languages enable row level security;

-- Anyone (anonymous or authenticated) can read active languages only.
create policy "Public can view active languages"
  on public.languages
  for select
  to public
  using (is_active = true);

grant select on public.languages to anon, authenticated;

-- Keeps updated_at current on every row update.
create or replace function public.set_languages_updated_at ()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger languages_set_updated_at
before update on public.languages
for each row
execute function public.set_languages_updated_at ();

insert into public.languages (
  code,
  english_name,
  native_name,
  text_direction,
  is_active,
  sort_order
)
values
  ('it', 'Italian', 'Italiano', 'ltr', true, 1),
  ('en', 'English', 'English', 'ltr', true, 2),
  ('fr', 'French', 'Français', 'ltr', true, 3),
  ('es', 'Spanish', 'Español', 'ltr', true, 4),
  ('pt', 'Portuguese', 'Português', 'ltr', true, 100),
  ('de', 'German', 'Deutsch', 'ltr', true, 100),
  ('ar', 'Arabic', 'العربية', 'rtl', true, 100),
  ('zh', 'Chinese', '中文', 'ltr', true, 100),
  ('sw', 'Swahili', 'Kiswahili', 'ltr', true, 100),
  ('ro', 'Romanian', 'Română', 'ltr', true, 100),
  ('sq', 'Albanian', 'Shqip', 'ltr', true, 100),
  ('uk', 'Ukrainian', 'Українська', 'ltr', true, 100),
  ('ru', 'Russian', 'Русский', 'ltr', true, 100),
  ('tr', 'Turkish', 'Türkçe', 'ltr', true, 100),
  ('bn', 'Bengali', 'বাংলা', 'ltr', true, 100),
  ('ur', 'Urdu', 'اردو', 'rtl', true, 100),
  ('hi', 'Hindi', 'हिन्दी', 'ltr', true, 100),
  ('pa', 'Punjabi', 'ਪੰਜਾਬੀ', 'ltr', true, 100),
  ('fa', 'Persian', 'فارسی', 'rtl', true, 100),
  ('ti', 'Tigrinya', 'ትግርኛ', 'ltr', true, 100),
  ('am', 'Amharic', 'አማርኛ', 'ltr', true, 100),
  ('wo', 'Wolof', 'Wolof', 'ltr', true, 100),
  ('zu', 'Zulu', 'isiZulu', 'ltr', true, 100),
  ('so', 'Somali', 'Soomaali', 'ltr', true, 100),
  ('ha', 'Hausa', 'Hausa', 'ltr', true, 100),
  ('yo', 'Yoruba', 'Yorùbá', 'ltr', true, 100),
  ('ig', 'Igbo', 'Igbo', 'ltr', true, 100),
  ('nl', 'Dutch', 'Nederlands', 'ltr', true, 100),
  ('pl', 'Polish', 'Polski', 'ltr', true, 100),
  ('el', 'Greek', 'Ελληνικά', 'ltr', true, 100);
