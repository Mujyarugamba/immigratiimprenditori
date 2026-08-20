with cleaned as (
  select
    id,
    regexp_replace(
      split_part(
        substring(body from position(E'\n\n## ' in body) + 2),
        E'\n\n## Check prima della pubblicazione',
        1
      ),
      'numero zero',
      'Centro Studi',
      'gi'
    ) as cleaned_body
  from public.contents
  where editorial_status = 'ready'
    and publication_status = 'unpublished'
    and position(E'\n\n## ' in body) > 0
)
update public.contents c
set body = cleaned.cleaned_body,
    updated_at = now()
from cleaned
where c.id = cleaned.id;
