<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Goal
- Build a polished LeetCode Must-Do progress tracker with filtering, dark/light mode, solved-state persistence, and URL-synced state.

## Constraints & Preferences
- Next.js 16, React 19, Tailwind v4, shadcn/ui (Radix), Zustand, next-themes
- 626 curated LeetCode problems (IDs 1–2707 with gaps) — each has id, name, link, difficulty, patterns, frequency (%), companies count
- Desktop table + mobile card layouts; side-by-side layout: progress panel (left) + toolbar/table (right)
- URL-based state for search, difficulty, pattern, sort key/direction; Zustand persist only for solved IDs
- Daily deterministic "Pick One" from full 626 list using date seed
- Background `#262626` (dark) / `bg-muted/50` (light) behind progress panel

## Progress
### Done
- Reviewed full project: architecture, UI, state, code quality (score 7.5/10)
- Added 626 problems in `src/constants/problems.ts` with updated `Problem` interface
- Created `src/constants/problem-meta.ts` — compact `Record<number, { f: string; c: number }>`
- Derived `uniquePatterns` dynamically from data
- Merged metadata into problem objects via `.map((p) => ({ ...p, ...PROBLEM_META[p.id] }))`
- Added frequency & companies columns to table; moved ExternalLink inline next to problem name
- Replaced old filter UI with unified toolbar: search, difficulty filter, pattern filter, sort buttons (ID/Diff/Freq/Comp), Pick One button
- Switched filter/sort state from Zustand to URL search params (`?q=`, `?difficulty=`, `?pattern=`, `?sort=`, `?dir=`, `?page=`)
- Removed sidebar; moved navbar into full top bar with nav links (Problem Set, Dashboard, Streaks, Daily Challenge)
- Moved ProgressPanel to main page in left column; title/description above it
- Added `bg-[#262626]/bg-muted/50` card wrapping left column
- Unified progress panel styling: larger gauge (150px SVG, 160px container), bigger fonts, streak & target stats, difficulty cards with progress bars
- Added search clear button, sticky table header, refined sort button active states, empty state polish
- Removed `#` prefix from mobile card ID for consistency
- Renamed "All Difficulties" → "Difficulty", "All Patterns" → "Patterns"
- Reduced overall padding/margins for tighter professional layout; added `border-l-2 border-primary` accent on title
- Navbar polish: h-14 height, backdrop-blur, nav icons, active indicator dot, theme toggle icon button
- Table polish: striped header, compact rows, difficulty badges with semantic colors
- Pagination in URL params (resets on filter change automatically)
- Fixed store API usage (`solvedProblemIds` array → derived Set for O(1) lookup)
- Wrapped `useSearchParams` in `<Suspense>` boundary for Next.js build compatibility
- TypeScript compiles cleanly (`tsc --noEmit` — no errors)
- Production build succeeds (`npm run build` — no errors or warnings)

### In Progress
- (none)

### Blocked
- (none)

## Key Decisions
- Frequency & companies stored in separate `problem-meta.ts` (compact `Record`) rather than inlining into every problem entry — avoids rewriting the massive `problems.ts` file
- URL search params for all filter/sort state (Zustand only for solved IDs) — enables shareable URLs, cleaner state management
- Side-by-side layout (desktop): progress panel left (340–360px), toolbar + table right — efficient space use
- Background `bg-muted/50` (light) / `dark:bg-[#262626]` (dark) behind left column for visual separation
- Page encoded in URL too — resets to 0 when filters change (no stale pagination)

## Critical Context
- Pre-existing lint warnings in `logo.tsx:13` and `navbar.tsx:21` (`setMounted(true)` inside `useEffect` — React 19 strict mode) are pre-existing and unrelated
- Zustand store still retains unused fields (`searchQuery`, `selectedDifficulty`, `selectedPattern`, `setSearchQuery`, `setSelectedDifficulty`, `setSelectedPattern`, `resetFilters`) — harmless
- ProgressPanel has its own reset confirm modal; AppLayout also has a global one — redundant but both work independently
- `src/constants/problems.ts` exports `DUMMY_PROBLEMS` (raw, no meta) and `PROBLEMS` (merged with meta via `.map`)

## Relevant Files
- `src/app/page.tsx`: main page with URL-synced filters, toolbar, table, left column with progress
- `src/components/layout/navbar.tsx`: top nav bar with nav links + theme toggle + sign in
- `src/components/layout/app-layout.tsx`: layout wrapper (no sidebar)
- `src/components/layout/problem-card.tsx`: mobile card view
- `src/components/dashboard/progress-panel.tsx`: circular SVG gauge + difficulty breakdown
- `src/components/common/logo.tsx`: LeetCode logo with theme-aware images
- `src/constants/problems.ts`: 626 problem entries + merged PROBLEMS export
- `src/constants/problem-meta.ts`: compact frequency & companies lookup
- `src/store/problem-store.ts`: Zustand persist with hydration flag (solved IDs only)

## Commands
- `npm run dev` — development server
- `npm run build` — production build (must pass before committing)
- `npm run lint` — ESLint (pre-existing warnings only)
- `npx tsc --noEmit` — TypeScript check

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
