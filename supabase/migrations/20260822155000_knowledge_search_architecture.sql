-- Search + knowledge architecture for the Centro Studi.
-- Prepared on the development branch only. Do not expose semantic/AI features
-- until documents are indexed, embeddings are generated and retrieval quality
-- has been verified against public sources.

create extension if not exists vector with schema extensions;

create table if not exists public.knowledge_nodes (
  id uuid primary key default gen_random_uuid(),
  entity_kind text not null check (entity_kind in (
    'country','territory','sector','route','content','indicator','event','author','source'
  )),
  entity_key text not null check (length(btrim(entity_key)) > 0),
  label text not null check (length(btrim(label)) > 0),
  href text null,
  is_public boolean not null default false,
  source_updated_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (entity_kind, entity_key)
);

create table if not exists public.knowledge_edges (
  id uuid primary key default gen_random_uuid(),
  subject_node_id uuid not null references public.knowledge_nodes(id) on delete cascade,
  predicate text not null check (predicate in (
    'origin_of','destination_of','observed_in','classified_in','authored_by',
    'uses_source','about_country','about_territory','about_route','about_sector',
    'related_to','documents'
  )),
  object_node_id uuid not null references public.knowledge_nodes(id) on delete cascade,
  evidence_label text null,
  evidence_href text null,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (subject_node_id <> object_node_id),
  unique (subject_node_id, predicate, object_node_id)
);

create table if not exists public.search_documents (
  id uuid primary key default gen_random_uuid(),
  entity_kind text not null check (entity_kind in (
    'country','territory','sector','route','content','indicator','event','author','source'
  )),
  entity_key text not null check (length(btrim(entity_key)) > 0),
  language_code text not null default 'it' check (language_code ~ '^[a-z]{2}(?:-[A-Z]{2})?$'),
  title text not null check (length(btrim(title)) > 0),
  body text not null default '',
  href text not null check (left(href, 1) = '/'),
  is_public boolean not null default false,
  source_updated_at timestamptz null,
  search_vector tsvector generated always as (
    to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(body, ''))
  ) stored,
  embedding extensions.vector(1536) null,
  embedding_model text null,
  embedded_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (entity_kind, entity_key, language_code)
);

create index if not exists knowledge_edges_subject_idx
  on public.knowledge_edges(subject_node_id, predicate);
create index if not exists knowledge_edges_object_idx
  on public.knowledge_edges(object_node_id, predicate);
create index if not exists search_documents_fts_idx
  on public.search_documents using gin(search_vector);
create index if not exists search_documents_embedding_hnsw_idx
  on public.search_documents using hnsw (embedding vector_cosine_ops)
  where embedding is not null;

alter table public.knowledge_nodes enable row level security;
alter table public.knowledge_edges enable row level security;
alter table public.search_documents enable row level security;

drop policy if exists knowledge_nodes_public_read on public.knowledge_nodes;
create policy knowledge_nodes_public_read
on public.knowledge_nodes for select to public
using (is_public or access_is_editor() or access_is_application_admin());

drop policy if exists knowledge_edges_public_read on public.knowledge_edges;
create policy knowledge_edges_public_read
on public.knowledge_edges for select to public
using (is_public or access_is_editor() or access_is_application_admin());

drop policy if exists search_documents_public_read on public.search_documents;
create policy search_documents_public_read
on public.search_documents for select to public
using (is_public or access_is_editor() or access_is_application_admin());

drop policy if exists knowledge_nodes_editor_all on public.knowledge_nodes;
create policy knowledge_nodes_editor_all
on public.knowledge_nodes for all to authenticated
using (access_is_editor() or access_is_application_admin())
with check (access_is_editor() or access_is_application_admin());

drop policy if exists knowledge_edges_editor_all on public.knowledge_edges;
create policy knowledge_edges_editor_all
on public.knowledge_edges for all to authenticated
using (access_is_editor() or access_is_application_admin())
with check (access_is_editor() or access_is_application_admin());

drop policy if exists search_documents_editor_all on public.search_documents;
create policy search_documents_editor_all
on public.search_documents for all to authenticated
using (access_is_editor() or access_is_application_admin())
with check (access_is_editor() or access_is_application_admin());

grant select on public.knowledge_nodes to anon, authenticated;
grant select on public.knowledge_edges to anon, authenticated;
grant select on public.search_documents to anon, authenticated;
grant insert, update, delete on public.knowledge_nodes to authenticated;
grant insert, update, delete on public.knowledge_edges to authenticated;
grant insert, update, delete on public.search_documents to authenticated;
