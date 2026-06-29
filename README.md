# LeetCode Must-Do Sheet

A curated LeetCode progress tracker that helps you systematically master DSA patterns for coding interviews. Instead of bouncing between hundreds of random problems, you get a structured learning path organized by pattern — from Arrays & Hashing to Dynamic Programming — with built-in progress tracking, cloud sync, and smart filtering.

## The Problem It Solves

LeetCode has thousands of problems but no clear roadmap. The "Must-Do Sheet" identifies the **645 most frequently asked problems** across 20 DSA patterns, ranked by frequency and ordered for progressive learning. You work through each pattern from easy to hard, checking off problems as you go.

## Key Features

- **Pattern-Based Curriculum** — 20 DSA patterns ordered as a learning path (Arrays → Two Pointers → Sliding Window → DP → Bit Manipulation). Each problem tagged with its pattern so you know what concept it's testing.
- **Progress Dashboard** — SVG circular gauge and per-difficulty progress bars (Easy/Medium/Hard) showing exactly where you stand. Solved counts persist across sessions via Zustand and sync to Supabase when authenticated.
- **Cross-Device Sync** — Sign in with Google, GitHub, or email to sync your solved state to the cloud. Your progress follows you between devices.
- **Smart Filtering** — Filter by difficulty, DSA pattern, or problem name (debounced search). Sort by ID, difficulty, or frequency. All filter state is stored in URL params so links are shareable.
- **Daily Pick One** — A deterministic daily pick from your unsolved problems. Seed is date-based, so everyone gets the same problem on the same day.
- **Dark & Light Mode** — System-aware theme toggle with hydration-safe persistence.
- **Guest Mode** — Browse and see the full problem set without signing up. Toggle is a no-op for guests (Option 2 — no localStorage progress for unauthenticated users).

## Tech Stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript (strict)
- **Styling:** Tailwind CSS v4, shadcn/v4 UI primitives
- **State:** Zustand (local persistence), URL search params (filter/sort/pagination)
- **Auth:** Supabase Auth with `@supabase/ssr` (cookie-based SSR sessions)
- **Database:** Supabase PostgreSQL (problem_progress + profiles)
- **Deployment:** Vercel

## Project Status

Build passes with 0 errors (TypeScript, ESLint, `next build`). Core functionality complete. Streaks and Daily Challenge pages are placeholders awaiting implementation. Live at `https://leetcode-must-do-sheet.vercel.app`.

## Database

### Tables

- **`problem_progress`** — Composite key `(user_id, problem_slug)`. Columns: `user_id` (UUID FK to auth.users), `problem_slug` (text), `status` (text, "Solved"), `last_solved_at` (timestamp). Stores which problems each user has solved.
- **`profiles`** — Primary key `id` (UUID FK to auth.users). Columns: `name` (text), `email` (text). Auto-created on first auth event.

### Row-Level Security

RLS must be enabled on both tables with the following policies (apply via Supabase Dashboard > SQL Editor or see `src/lib/supabase/rls-policies.sql`):

- **profiles**: Users can SELECT, INSERT, and UPDATE only their own row (`auth.uid() = id`).
- **problem_progress**: Users can SELECT, INSERT, UPDATE, and DELETE only their own rows (`auth.uid() = user_id`).

Without these policies, authenticated users can read/write any row, which is a security risk.
