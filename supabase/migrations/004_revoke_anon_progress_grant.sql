-- 004: Revoke anon access to get_user_solved_slugs
-- Only authenticated users should be able to query another user's solved problems.
-- Run this via Supabase Dashboard → SQL Editor.

revoke execute on function get_user_solved_slugs(uuid) from anon;
