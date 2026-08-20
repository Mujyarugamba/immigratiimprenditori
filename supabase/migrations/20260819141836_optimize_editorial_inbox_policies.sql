begin;

-- Replace broad ALL policies plus contributor SELECT policies with one SELECT
-- policy and explicit editor-only write policies.
drop policy if exists editorial_inbox_editor_all on public.editorial_inbox_items;
drop policy if exists editorial_inbox_contributor_read_own on public.editorial_inbox_items;

create policy editorial_inbox_read_authorized
on public.editorial_inbox_items
for select
to authenticated
using (
  public.access_is_editor()
  or public.access_is_application_admin()
  or (
    public.access_is_contributor()
    and submitted_by_account_id = public.access_current_account_id()
  )
);

create policy editorial_inbox_editor_insert
on public.editorial_inbox_items
for insert
to authenticated
with check (public.access_is_editor() or public.access_is_application_admin());

create policy editorial_inbox_editor_update
on public.editorial_inbox_items
for update
to authenticated
using (public.access_is_editor() or public.access_is_application_admin())
with check (public.access_is_editor() or public.access_is_application_admin());

create policy editorial_inbox_editor_delete
on public.editorial_inbox_items
for delete
to authenticated
using (public.access_is_editor() or public.access_is_application_admin());

drop policy if exists editorial_submissions_editor_all on public.editorial_submissions;
drop policy if exists editorial_submissions_contributor_read_own on public.editorial_submissions;

create policy editorial_submissions_read_authorized
on public.editorial_submissions
for select
to authenticated
using (
  public.access_is_editor()
  or public.access_is_application_admin()
  or (
    public.access_is_contributor()
    and exists (
      select 1
      from public.editorial_inbox_items i
      where i.id = editorial_submissions.inbox_item_id
        and i.submitted_by_account_id = public.access_current_account_id()
    )
  )
);

create policy editorial_submissions_editor_insert
on public.editorial_submissions
for insert
to authenticated
with check (public.access_is_editor() or public.access_is_application_admin());

create policy editorial_submissions_editor_update
on public.editorial_submissions
for update
to authenticated
using (public.access_is_editor() or public.access_is_application_admin())
with check (public.access_is_editor() or public.access_is_application_admin());

create policy editorial_submissions_editor_delete
on public.editorial_submissions
for delete
to authenticated
using (public.access_is_editor() or public.access_is_application_admin());

commit;
