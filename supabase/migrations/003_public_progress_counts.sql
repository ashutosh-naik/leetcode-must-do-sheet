-- 003: Public progress slugs function
-- Returns solved problem slugs for any user (for public profile progress display).
-- The client joins with PROBLEMS array to compute difficulty breakdown.
-- Run this via Supabase Dashboard → SQL Editor.

create or replace function get_user_solved_slugs(target_user_id uuid)
returns table(problem_slug text)
language sql
security definer
set search_path = public
as $$
  select pp.problem_slug
  from problem_progress pp
  where pp.user_id = target_user_id;
$$;

grant execute on function get_user_solved_slugs(uuid) to authenticated;
grant execute on function get_user_solved_slugs(uuid) to anon;
