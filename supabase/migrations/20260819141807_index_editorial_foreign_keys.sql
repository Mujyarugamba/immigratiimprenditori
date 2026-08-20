begin;

create index if not exists content_geographies_territory_idx
  on public.content_geographies(territory_id)
  where territory_id is not null;

create index if not exists event_geographies_territory_idx
  on public.event_geographies(territory_id)
  where territory_id is not null;

create index if not exists editorial_inbox_duplicate_idx
  on public.editorial_inbox_items(duplicate_of_id)
  where duplicate_of_id is not null;

create index if not exists editorial_inbox_linked_content_idx
  on public.editorial_inbox_items(linked_content_id)
  where linked_content_id is not null;

create index if not exists editorial_inbox_linked_event_idx
  on public.editorial_inbox_items(linked_event_id)
  where linked_event_id is not null;

create index if not exists editorial_inbox_territory_idx
  on public.editorial_inbox_items(territory_id)
  where territory_id is not null;

commit;
