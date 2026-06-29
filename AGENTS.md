<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Goal
- Build a polished LeetCode Must-Do progress tracker with filtering, dark/light mode, solved-state persistence, URL-synced state, Supabase Auth with progress sync, and deployment readiness.

## Constraints & Preferences
- Do not change design, fonts, colors, or existing UI styling.
- Use Supabase Auth (not next-auth) with `@supabase/ssr` for SSR cookie-based sessions.
- Keep the same form fields and layout on login/register pages.
- Guests always see 0 solved problems (Option 2 — no localStorage for guests).
- Use `problem_slug` as the unique identifier in Supabase (no `problem_id` column).

## Progress
### Done
- Supabase auth with Google, GitHub, email/password — all working.
- Three Supabase clients (browser, server, middleware) using `@supabase/ssr`.
- Auth provider with `useAuth()` hook exposing `user`, `loading`, `login()`, `register()`, `googleLogin()`, `githubLogin()`, `logout()`.
- Auto-creates `profiles` row on first auth event.
- Problem-progress sync: `upsertProblemProgress()`, `getSolvedProblemSlugs()`, `syncSolvedProblems()` — all use `problem_slug` only.
- Guest mode: `solvedSet` returns empty when `user` is null; toggle is a no-op for guests.
- Cross-user sync fix: `prevUserId` ref clears store on user change, then fetches remote data as source of truth.
- Sticky table header (`sticky top-0 z-10` on `<TableHeader>`).
- Toggle revert on Supabase error (calls `toggleProblemSolved` again to undo optimistic update).
- Navbar links: Problem Set, Dashboard, Streaks, Daily Challenge with active-state indicators (desktop + mobile).
- Placeholder pages created: `/dashboard`, `/profile`, `/settings`, `/streaks`, `/daily-challenge`.
- Unused Zustand fields removed from `problem-store.ts` (kept only what's actually consumed).
- Stale `sidebar.tsx` deleted; empty barrel files (`theme-store.ts`, `user-store.ts`, `use-auth.ts`) deleted; `src/lib/auth.ts` deleted.
- `alert()` calls replaced with inline error state in forgot-password and update-password pages.
- Open redirect fixed in `/auth/callback` — validates `next` param with `isSafePath()`.
- Sign-out inconsistency fixed — navbar now uses `logout()` from `useAuth()`.
- Hydration-safe theme toggle & logo using `useSyncExternalStore` (React 19-compatible, no lint warnings).
- Unused npm deps removed (23 packages); `shadcn` moved to devDependencies.
- Removed `@import "shadcn/tailwind.css"` from `globals.css` — shadcn v4 CLI doesn't ship this file; CSS variables are defined locally.
- ESLint config ignores `scripts/` directory (CommonJS require errors in `.cjs` file).
- Build passes with 0 errors (TypeScript, lint, and `next build`).

### In Progress
- (none)

### Blocked
- (none)

## Key Decisions
- Use `useSyncExternalStore` (React 19 pattern) instead of `useEffect` + `setState` for SSR hydration guards — avoids lint warnings and hydration mismatches.
- Guest progress is never uploaded on login — store is cleared before remote fetch.
- Problem progress table uses `(user_id, problem_slug)` composite unique key, no `problem_id` column.
- All protected routes (`/dashboard`, `/profile`, `/settings`, `/streaks`, `/daily-challenge`) have placeholder pages to prevent 404 redirect loops.
- `shadcn` v4 doesn't ship `tailwind.css` — all CSS variables defined in `globals.css`; no package CSS import needed.

## Next Steps
1. Deploy to Vercel — set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel Dashboard.

## Critical Context
- `.env.local` has Supabase credentials (ignored by git via `.gitignore`).
- Build passes with 0 errors on clean install; dev server starts without CSS errors.
- `next.config.ts` has `images.remotePatterns` for `lh3.googleusercontent.com` and `avatars.githubusercontent.com`.
- `shadcn` is a devDependency (CLI only, not needed at runtime).

## Relevant Files
- `src/app/globals.css`: Tailwind v4 + tw-animate-css imports, custom CSS variables, `@theme inline` with shadcn tokens.
- `src/app/page.tsx`: Main problem list with filters, sticky table header, guest-mode guards, Supabase sync.
- `src/components/layout/navbar.tsx`: Nav links, theme toggle, avatar, sign-out using `useAuth().logout`.
- `src/lib/services/problem-progress.ts`: All functions use `problem_slug` only, no `problem_id`.
- `middleware.ts`: Protects `/dashboard`, `/profile`, `/settings`.
- `src/app/auth/callback/route.ts`: Open redirect fixed with `isSafePath()` validation.
- `src/store/problem-store.ts`: Zustand persist with hydration flag (solved IDs only, no unused fields).

## Commands
- `npm run dev` — development server
- `npm run build` — production build (must pass before committing)
- `npm run lint` — ESLint (pre-existing warnings only)
- `npx tsc --noEmit` — TypeScript check
