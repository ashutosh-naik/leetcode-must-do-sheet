-- Run this in Supabase SQL Editor (after 001)

-- Unique index on username so no two users share one
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_unique
  ON profiles (username) WHERE username IS NOT NULL;
