-- ===================================================
-- Supabase Row-Level Security (RLS) Policies
-- Canonical source: supabase/migrations/001_initial_schema.sql
-- This file is a reference copy — do NOT run both.
-- ===================================================

-- Enable RLS on both tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE problem_progress ENABLE ROW LEVEL SECURITY;

-- ===================================================
-- PROFILES table
-- ===================================================

-- Public read: anyone can view any profile (for /profile/[username] pages)
CREATE POLICY "Public can view profiles"
  ON profiles FOR SELECT
  USING (true);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Policy: Users can delete their own profile
CREATE POLICY "Users can delete own profile"
  ON profiles FOR DELETE
  USING (auth.uid() = id);

-- ===================================================
-- PROBLEM_PROGRESS table
-- ===================================================

-- Policy: Users can read their own progress
CREATE POLICY "Users can view own progress"
  ON problem_progress FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own progress
CREATE POLICY "Users can insert own progress"
  ON problem_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own progress
CREATE POLICY "Users can update own progress"
  ON problem_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own progress
CREATE POLICY "Users can delete own progress"
  ON problem_progress FOR DELETE
  USING (auth.uid() = user_id);
