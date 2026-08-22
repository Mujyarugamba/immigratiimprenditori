-- Allow authenticated editors/application administrators to append immutable
-- activity records from the editorial UI. Prepared on the development branch;
-- production application remains a separate verified step.

drop policy if exists editorial_inbox_activity_editor_insert on public.editorial_inbox_activity;
create policy editorial_inbox_activity_editor_insert
on public.editorial_inbox_activity for insert to authenticated
with check (access_is_editor() or access_is_application_admin());

grant insert on public.editorial_inbox_activity to authenticated;
