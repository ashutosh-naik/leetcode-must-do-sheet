-- ===================================================
-- Supabase Row-Level Security (RLS) Policies
-- Apply these in the Supabase Dashboard > SQL Editor
-- ===================================================

-- Enable RLS on both tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE problem_progress ENABLE ROW LEVEL SECURITY;

-- ===================================================
-- PROFILES table
-- ===================================================

-- Policy: Anyone can view any profile (public profiles for /profile/[username] pages)
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
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ===================================================
-- PROBLEM_PROGRESS table
-- ===================================================

-- Policy: Users can read their own progress
CREATE POLICY "Users can read own progress"
  ON problem_progress FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert/upsert their own progress
CREATE POLICY "Users can insert own progress"
  ON problem_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own progress
CREATE POLICY "Users can update own progress"
  ON problem_progress FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own progress
CREATE POLICY "Users can delete own progress"
  ON problem_progress FOR DELETE
  USING (auth.uid() = user_id);
