-- Fix hybrid editorial review classifier for ordinary content without a category.
-- SQL boolean OR with `NULL IN (...)` yields NULL; the publication trigger must
-- classify a null primary category as non-sensitive unless another rule requires
-- secondary review.
--
-- Candidate only. Does not authorize Production apply.

begin;

create or replace function public.content_requires_secondary_review(p_content public.contents)
returns boolean
language plpgsql
immutable
set search_path = ''
as $$
begin
  return
    coalesce(p_content.force_secondary_review, false)
    or p_content.type_code in (
      'research_report',
      'data_note',
      'interview',
      'testimony',
      'policy_brief',
      'institutional_page'
    )
    or coalesce(p_content.primary_category_code, '') in (
      'regulation_compliance',
      'stories'
    );
end;
$$;

revoke all on function public.content_requires_secondary_review(public.contents)
  from public, anon, authenticated;

comment on function public.content_requires_secondary_review(public.contents) is
  'Hybrid governance classifier. Null/absent category is ordinary unless type or manual escalation requires 4-eyes; sensitive types/categories still require secondary review.';

commit;
