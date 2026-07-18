-- 002: Allow public read access to profiles
-- This enables /profile/[username] pages for all visitors.
-- Run this via Supabase Dashboard → SQL Editor.

-- Drop the old restrictive SELECT policy
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

-- Public read: anyone can view any profile (for /profile/[username] pages)
CREATE POLICY "Public can view profiles"
  ON profiles FOR SELECT
  USING (true);

-- The existing INSERT/UPDATE/DELETE policies remain owner-only (auth.uid() = id)
