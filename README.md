# LeetCode Must-Do Sheet

A curated LeetCode progress tracker with filtering, dark/light mode, solved-state persistence, URL-synced state, Supabase Auth with progress sync.

## Features

- **Curated Problem Set** — 634 must-do LeetCode problems with difficulty ratings, frequency scores, and DSA topic tags
- **Progress Tracking** — Track solved problems with persistent storage (Supabase for authenticated users)
- **Authentication** — Email/password, Google, and GitHub auth via Supabase
- **Dark/Light Mode** — Theme toggle with system preference detection
- **Filtering & Search** — Filter by difficulty, topic, or search by problem name with debounced input
- **Sticky Table Header** — Always-visible column headers while scrolling through large problem sets
- **URL-Synced State** — Filter and search state persisted in URL query parameters

## Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 + shadcn/v4
- **State Management:** Zustand + URL search params
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth with `@supabase/ssr`

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Create `.env.local` with the following:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

A template is available in `.env.example`.

## Build

```bash
npm run build
```

## Project Structure

```
src/
├── app/                    # App Router pages
│   ├── page.tsx           # Landing page
│   ├── problemset/        # Main problem list (moved from /)
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   ├── forgot-password/   # Password reset flow
│   ├── dashboard/         # Progress dashboard
│   ├── streaks/           # Streaks tracker (placeholder)
│   ├── daily-challenge/   # Daily challenge (placeholder)
│   ├── auth/              # Auth callback & password update
│   ├── profile/           # User profile (placeholder)
│   └── settings/          # User settings
├── components/            # Shared components
│   ├── common/            # Logo, DifficultyBadge, ErrorBoundary
│   ├── layout/            # Navbar
│   ├── problems/          # ProblemRow, ProblemTable, FilterBar
│   ├── ui/                # shadcn UI primitives (Button, Input, etc.)
│   └── dashboard/         # ProgressPanel
├── constants/             # Problem data definitions
├── hooks/                 # Custom hooks (use-debounce, etc.)
├── lib/                   # Utility libraries (supabase client, logger)
├── providers/             # Auth provider, Theme provider
└── store/                 # Zustand stores (problem-store)
```

## Database Schema

The `problem_progress` table uses `(user_id, problem_slug)` as a composite unique key. Columns: `user_id`, `problem_slug`, `solved` (boolean), `created_at`, `updated_at`.

## Deployment

Deployed on Vercel. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel environment variables. Configure OAuth redirect URLs in Supabase Dashboard under Authentication > URL Configuration.
