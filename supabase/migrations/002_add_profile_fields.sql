-- Run this in Supabase SQL Editor to add profile fields
-- Dashboard → SQL Editor → Paste → Run

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS display_name TEXT,
ADD COLUMN IF NOT EXISTS username TEXT,
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS birthday DATE,
ADD COLUMN IF NOT EXISTS github_url TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT;

-- Unique index on username (optional, uncomment if you want enforced uniqueness)
-- CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_idx ON profiles (username) WHERE username IS NOT NULL;
