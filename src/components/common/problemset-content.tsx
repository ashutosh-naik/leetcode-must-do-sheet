"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  memo,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ExternalLink,
  ArrowUpDown,
  Search,
  X,
  ArrowUp,
  ArrowDown,
  BarChart3,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { PROBLEMS } from "@/constants/problems";
import { ProgressPanel } from "@/components/dashboard/progress-panel";
import { ProblemCard } from "@/components/layout/problem-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  TableSkeletonDesktop,
  TableSkeletonMobile,
  ProgressSkeleton,
} from "@/components/common/table-skeleton";
import { useProblemStore } from "@/store/problem-store";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import { useDebounce } from "@/hooks/use-debounce";
import { DifficultyBadge } from "@/components/common/difficulty-badge";
import { useToast } from "@/components/ui/toast";
import { logger } from "@/lib/logger";
import { IMPORTANT_IDS } from "@/constants/important-problems";
import {
  upsertProblemProgress,
  syncSolvedProblems,
  extractSlug,
} from "@/lib/services/problem-progress";
import type { Problem } from "@/constants/problems";

const DIFFICULTIES = ["Easy", "Medium", "Hard"] as const;

const PAGE_SIZE = 50;

const PATTERN_ORDER = [
  "Arrays & Hashing",
  "Two Pointers",
  "Sliding Window",
  "Prefix Sum",
  "Stack",
  "Binary Search",
  "Linked List",
  "Queue",
  "Tree DFS",
  "Tree BFS",
  "BST",
  "Heap / Priority Queue",
  "Graph DFS",
  "Graph BFS",
  "Union Find (DSU)",
  "Topological Sort",
  "Backtracking",
  "Greedy",
  "Dynamic Programming",
  "Bit Manipulation",
];

function useFilteredProblems(defaultFilter = "") {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const difficulty = searchParams.get("difficulty") ?? "";
  const pattern = searchParams.get("pattern") ?? "";
  const important = searchParams.get("important") === "1";
  const filter = searchParams.get("filter") ?? defaultFilter;
  const sort = (searchParams.get("sort") ?? "default") as
    "default" | "id" | "difficulty" | "frequency";
  const dir = (searchParams.get("dir") ?? "asc") as "asc" | "desc";

  const uniquePatterns = useMemo(() => {
    const existing = new Set<string>();
    PROBLEMS.forEach((p) =>
      p.patterns.forEach((pat) => {
        const t = pat.trim();
        if (t) existing.add(t);
      }),
    );
    return PATTERN_ORDER.filter((p) => existing.has(p));
  }, []);

  const difficultyCounts = useMemo(() => {
    const counts: Record<string, number> = { Easy: 0, Medium: 0, Hard: 0 };
    PROBLEMS.forEach((p) => {
      if (counts[p.difficulty] !== undefined) counts[p.difficulty]++;
    });
    return counts;
  }, []);

  const patternCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    PROBLEMS.forEach((p) =>
      p.patterns.forEach((pat) => {
        const t = pat.trim();
        if (t) counts[t] = (counts[t] ?? 0) + 1;
      }),
    );
    return counts;
  }, []);

  const filtered = useMemo(() => {
    let list = [...PROBLEMS];

    if (q) {
      const lq = q.toLowerCase();
      list = list.filter(
        (p) =>
          p.id.toString().includes(lq) ||
          p.name.toLowerCase().includes(lq) ||
          p.patterns.some((pat) => pat.toLowerCase().includes(lq)),
      );
    }
    if (difficulty) {
      list = list.filter((p) => p.difficulty === difficulty);
    }
    if (pattern) {
      list = list.filter((p) =>
        p.patterns.some(
          (pat) => pat.trim().toLowerCase() === pattern.toLowerCase(),
        ),
      );
    }
    if (important) {
      list = list.filter((p) => IMPORTANT_IDS.has(p.id));
    }

    if (sort !== "default") {
      list.sort((a, b) => {
        const mul = dir === "asc" ? 1 : -1;
        switch (sort) {
          case "difficulty": {
            const dm: Record<string, number> = { Easy: 0, Medium: 1, Hard: 2 };
            return mul * ((dm[a.difficulty] ?? 99) - (dm[b.difficulty] ?? 99));
          }
          case "frequency": {
            const fa = parseFloat(a.frequency ?? "0");
            const fb = parseFloat(b.frequency ?? "0");
            return mul * (fa - fb);
          }
          default:
            return mul * (a.id - b.id);
        }
      });
    }

    return { list, uniquePatterns };
  }, [q, difficulty, pattern, important, sort, dir, uniquePatterns]);

  return { ...filtered, q, difficulty, pattern, important, filter, sort, dir, difficultyCounts, patternCounts };
}

export function ProblemsetContent({ defaultFilter = "" }: { defaultFilter?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { list, uniquePatterns, q, difficulty, pattern, important, filter, sort, dir, difficultyCounts, patternCounts } =
    useFilteredProblems(defaultFilter);
  const searchRef = useRef<HTMLInputElement>(null);
  const solvedProblemIds = useProblemStore((s) => s.solvedProblemIds);
  const toggleProblemSolved = useProblemStore((s) => s.toggleProblemSolved);
  const setSolvedProblemIds = useProblemStore((s) => s.setSolvedProblemIds);
  const setSolvedProblemDates = useProblemStore((s) => s.setSolvedProblemDates);
  const { user, loading: authLoading } = useAuth();
  const synced = useRef(false);
  const prevUserId = useRef<string | undefined>(undefined);
  const solvedSet = useMemo(
    () => new Set(solvedProblemIds),
    [solvedProblemIds],
  );
  const [searchInput, setSearchInput] = useState(q);
  const debouncedSearch = useDebounce(searchInput, 300);
  const [showProgress, setShowProgress] = useState(false);
  const prevQ = useRef(q);

  useEffect(() => {
    if (prevQ.current !== q) {
      prevQ.current = q;
      setSearchInput(q);
    } else {
      prevQ.current = q;
    }
  }, [q]);
  const pendingToggle = useRef(new Set<number>());
  const { toast } = useToast();
  const userRef = useRef(user);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    const currentUserId = user?.id;
    const previousUserId = prevUserId.current;
    prevUserId.current = currentUserId;

    if (!user) {
      synced.current = false;
      return;
    }

    if (currentUserId !== previousUserId) {
      synced.current = false;
    }

    if (!synced.current) {
      let cancelled = false;
      // Read local state BEFORE clearing (Zustand updates are synchronous)
      const localIds = useProblemStore.getState().solvedProblemIds;
      const localDates = useProblemStore.getState().solvedProblemDates;
      // Clear store for new user
      if (currentUserId !== previousUserId) {
        setSolvedProblemIds([]);
        setSolvedProblemDates({});
      }
      syncSolvedProblems(user.id, localIds, localDates)
        .then(({ ids, dates }) => {
          if (!cancelled) {
            synced.current = true;
            setSolvedProblemIds(ids);
            setSolvedProblemDates(dates);
          }
        })
        .catch((err) => {
          if (!cancelled) {
            logger.error("Error syncing problems:", err);
            synced.current = true;
          }
        });
      return () => { cancelled = true; };
    }
  }, [user, setSolvedProblemIds, setSolvedProblemDates]);

  const toggleSolved = useCallback(
    async (id: number) => {
      if (pendingToggle.current.has(id)) return;
      pendingToggle.current.add(id);
      try {
        toggleProblemSolved(id);
        const currentUser = userRef.current;
        if (currentUser) {
          const problem = PROBLEMS.find((p) => p.id === id);
          if (problem) {
            const store = useProblemStore.getState();
            const isSolved = store.solvedProblemIds.includes(id);
            const slug = extractSlug(problem.link);
            await upsertProblemProgress(currentUser.id, slug, isSolved);
          }
        }
      } catch (err) {
        toggleProblemSolved(id);
        toast("Failed to sync progress", "error");
        const e = err as { message?: string; code?: string; details?: string; hint?: string };
        logger.error("Error updating problem progress:", JSON.stringify(err));
        logger.error({ message: e?.message, code: e?.code, details: e?.details, hint: e?.hint });
      } finally {
        pendingToggle.current.delete(id);
      }
    },
    [toggleProblemSolved, toast],
  );

  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(window.location.search);
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      if (key === "sort") {
        params.delete("dir");
      }
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router],
  );

  const skipInitialSearch = useRef(true);
  useEffect(() => {
    if (skipInitialSearch.current) {
      skipInitialSearch.current = false;
      return;
    }
    setParam("q", debouncedSearch);
  }, [debouncedSearch, setParam]);

  // Problemset page keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      const isInput = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
      const isMod = e.metaKey || e.ctrlKey;

      if (e.key === "/" && !isInput) {
        e.preventDefault();
        searchRef.current?.focus();
        return;
      }

      if (isMod && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
        return;
      }

      if (isInput) return;

      if (e.key === "i") {
        e.preventDefault();
        setParam("important", important ? "" : "1");
        return;
      }

      if (e.key === "d") {
        e.preventDefault();
        const cycle = ["", "Easy", "Medium", "Hard"];
        const idx = cycle.indexOf(difficulty);
        const next = cycle[(idx + 1) % cycle.length];
        setParam("difficulty", next);
        return;
      }

      if (e.key === "r") {
        e.preventDefault();
        router.replace(window.location.pathname, { scroll: false });
        setSearchInput("");
        return;
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [difficulty, important, router, setParam, setSearchInput]);

  const toggleSortDir = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    const current = params.get("dir") ?? "asc";
    params.set("dir", current === "asc" ? "desc" : "asc");
    params.delete("page");
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [router]);

  const filteredList = useMemo(
    () => (filter === "solved" ? list.filter((p) => solvedSet.has(p.id)) : list),
    [filter, list, solvedSet],
  );

  const rawPage = parseInt(searchParams.get("page") ?? "1", 10);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage - 1 : 0;
  const setPage = useCallback(
    (nextPage: number) => {
      const params = new URLSearchParams(window.location.search);
      if (nextPage >= 0) {
        params.set("page", String(nextPage + 1));
      } else {
        params.delete("page");
      }
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router],
  );

  const totalPages = Math.ceil(filteredList.length / PAGE_SIZE);
  const paged = filteredList.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const sortIcon = useMemo(
    () =>
      dir === "asc" ? (
        <ArrowUp className="h-3 w-3" />
      ) : (
        <ArrowDown className="h-3 w-3" />
      ),
    [dir],
  );

  return (
    <div className="flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-start justify-center mx-auto w-full max-w-7xl px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      {/* Left Column — Progress */}
      <aside className="w-full lg:w-[300px] xl:w-[340px] 2xl:w-[360px] shrink-0">
        {/* Mobile toggle */}
        <button
          onClick={() => setShowProgress(!showProgress)}
          aria-expanded={showProgress}
          className="flex lg:hidden items-center gap-2 w-full rounded-xl bg-muted/50 dark:bg-[#202020] px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-200 active:scale-[0.98] cursor-pointer border-none"
        >
          <BarChart3 className="h-4 w-4 text-primary" />
          <span>Progress</span>
          <span className="ml-auto text-xs text-muted-foreground/60">
            {solvedSet.size}/{PROBLEMS.length} solved
          </span>
          {showProgress ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>

        <div
          className={cn(
            "rounded-xl bg-muted/50 dark:bg-[#202020] p-4 sm:p-6 space-y-4",
            "lg:block",
            showProgress ? "block mt-3" : "hidden",
          )}
        >
          <div className="border-l-2 border-primary pl-4">
            <h2 className="text-base sm:text-lg font-bold tracking-tight">
              Learning Order by DSA Pattern
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Pattern Order · Easy → Medium → Hard
              <br />
              High Frequency First
            </p>
          </div>
          {authLoading ? <ProgressSkeleton /> : <ProgressPanel />}
        </div>
      </aside>

      {/* Right Column — Toolbar + Table */}
      <div className="flex-1 min-w-0 space-y-3 sm:space-y-4">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Search — full width on mobile */}
          <div className="relative w-full sm:flex-1 sm:min-w-[200px] sm:max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              ref={searchRef}
              type="text"
              placeholder="Search problems..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="h-9 sm:h-10 rounded-2xl border-border bg-background pl-9 pr-9 focus-visible:border-primary focus-visible:ring-primary placeholder:text-muted-foreground/60"
            />
            {searchInput && (
              <button
                onClick={() => {
                  setSearchInput("");
                  setParam("q", "");
                }}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground hover:scale-110 active:scale-90 transition-all duration-200 cursor-pointer bg-transparent border-none p-0"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filters row — scrollable on mobile */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {/* Difficulty filter */}
            <Select
              value={difficulty}
              onValueChange={(v) =>
                setParam("difficulty", v === "all" ? "" : v)
              }
            >
              <SelectTrigger className="h-9 sm:h-10 w-auto min-w-[100px] sm:min-w-[130px] cursor-pointer">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {DIFFICULTIES.map((d) => (
                  <SelectItem key={d} value={d}>
                    <span className="flex items-center justify-between w-full gap-2">
                      <span className={
                        d === "Easy" ? "text-green-600 dark:text-green-400 font-semibold" :
                        d === "Medium" ? "text-amber-600 dark:text-amber-400 font-semibold" :
                        "text-red-600 dark:text-red-400 font-semibold"
                      }>{d}</span>
                      <span className="text-muted-foreground/60 text-xs tabular-nums">{difficultyCounts[d]}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Pattern filter */}
            <Select
              value={pattern}
              onValueChange={(v) => setParam("pattern", v === "all" ? "" : v)}
            >
              <SelectTrigger className="h-9 sm:h-10 w-auto min-w-[110px] sm:min-w-[150px] cursor-pointer">
                <SelectValue placeholder="Patterns" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                <SelectItem value="all">All</SelectItem>
                {uniquePatterns.map((p) => (
                  <SelectItem key={p} value={p}>
                    <span className="flex items-center justify-between w-full gap-2">
                      <span>{p}</span>
                      <span className="text-muted-foreground/60 text-xs tabular-nums">{patternCounts[p]}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Important filter */}
            <Button
              variant={important ? "default" : "outline"}
              size="sm"
              onClick={() => setParam("important", important ? "" : "1")}
              aria-label={important ? "Show all problems" : "Filter important problems"}
              className={cn(
                "h-9 sm:h-10 gap-1.5 cursor-pointer shrink-0",
                important && "bg-amber-500 hover:bg-amber-600 text-white border-amber-500",
              )}
            >
              <span className="text-xs font-bold">IMP</span>
            </Button>
          </div>

          {/* Sort + count row */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Sort controls */}
            <div className="flex items-center gap-1 bg-muted/50 rounded-xl p-1 overflow-x-auto">
              {(
                [
                  ["default", "Default"],
                  ["id", "ID"],
                  ["difficulty", "Diff"],
                  ["frequency", "Freq"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => {
                    if (sort === key) {
                      toggleSortDir();
                    } else {
                      setParam("sort", key);
                    }
                  }}
                  aria-label={`Sort by ${label}${sort === key ? ` ${dir === "asc" ? "ascending" : "descending"}` : ""}`}
                  className={cn(
                    "flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-medium transition-all duration-200 cursor-pointer border-none bg-transparent whitespace-nowrap active:scale-95",
                    sort === key
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40",
                  )}
                >
                  {label}
                  {sort === key ? (
                    sortIcon
                  ) : (
                    <ArrowUpDown className="h-3 w-3 opacity-50" />
                  )}
                </button>
              ))}
            </div>

            {/* Result count */}
            <span className="text-xs text-muted-foreground whitespace-nowrap ml-auto sm:ml-2 tabular-nums">
              {filteredList.length}
              <span className="hidden sm:inline">
                {" "}
                problem{filteredList.length !== 1 ? "s" : ""}
              </span>
            </span>
          </div>
        </div>

        {/* Desktop Table */}
        {authLoading ? (
          <TableSkeletonDesktop />
        ) : (
        <div className="hidden md:block rounded-2xl border border-border overflow-x-auto bg-card shadow-sm animate-in fade-in duration-300">
          <Table aria-label="Problem set">
            <TableHeader className="sticky top-0 z-10">
              <TableRow className="bg-muted/30">
                <TableHead className="w-10 text-center">#</TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="w-24">Difficulty</TableHead>
                <TableHead className="hidden sm:table-cell">Solved</TableHead>
                <TableHead className="w-20 text-right hidden sm:table-cell">
                  Freq
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-16 text-muted-foreground"
                  >
                    <div className="flex flex-col items-center gap-3 animate-in fade-in scale-in duration-300">
                      <div className="flex size-14 items-center justify-center rounded-2xl bg-muted/50 border border-border">
                        <Search className="h-6 w-6 opacity-40" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">No results found</p>
                        <p className="text-xs mt-0.5">Try adjusting your search or filters</p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paged.map((problem, i) => (
                  <ProblemRow
                    key={problem.id}
                    problem={problem}
                    solved={solvedSet.has(problem.id)}
                    onToggle={toggleSolved}
                    index={i}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>
        )}
        {/* Mobile Cards */}
        {authLoading ? (
          <TableSkeletonMobile />
        ) : (
        <div className="md:hidden space-y-2">
          {paged.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-muted/50 border border-border">
                <Search className="h-6 w-6 opacity-40" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">No results found</p>
                <p className="text-xs mt-0.5">Try adjusting your search or filters</p>
              </div>
            </div>
          ) : (
            paged.map((problem, i) => (
              <ProblemCard
                key={problem.id}
                problem={problem}
                solved={solvedSet.has(problem.id)}
                onToggle={toggleSolved}
                index={i}
              />
            ))
          )}
        </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 sm:gap-3 py-4">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage(Math.max(0, page - 1))}
              aria-label="Go to previous page"
              className="cursor-pointer text-xs sm:text-sm px-2 sm:px-4"
            >
              ← Prev
            </Button>
            <span className="text-[10px] sm:text-xs text-muted-foreground tabular-nums whitespace-nowrap">
              {page + 1} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              aria-label="Go to next page"
              className="cursor-pointer text-xs sm:text-sm px-2 sm:px-4"
            >
              Next →
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

const ProblemRow = memo(function ProblemRow({
  problem,
  solved,
  onToggle,
  index = 0,
}: {
  problem: Problem;
  solved: boolean;
  onToggle: (id: number) => void;
  index?: number;
}) {
  const handleToggle = useCallback(() => onToggle(problem.id), [onToggle, problem.id]);
  const date = useProblemStore((s) => s.solvedProblemDates[problem.id]);
  const isImportant = IMPORTANT_IDS.has(problem.id);
  return (
    <TableRow
      className={cn(
        "transition-all duration-300",
        solved
          ? "opacity-60 hover:opacity-80"
          : "hover:bg-muted/50"
      )}
      style={{
        animation: `slide-in-right 0.3s ease-out ${Math.min(index * 30, 500)}ms backwards`,
      }}
    >
      <TableCell className="text-center py-3">
        <Checkbox
          checked={solved}
          onCheckedChange={handleToggle}
          aria-label={`Mark problem ${problem.id}: ${problem.name} as ${solved ? "unsolved" : "solved"}`}
          className="cursor-pointer transition-all duration-200 hover:scale-110 active:scale-90"
        />
      </TableCell>
      <TableCell className="py-3">
        <div className="flex items-center gap-2.5">
          <span className="text-xs text-muted-foreground tabular-nums">
            {problem.id}.
          </span>
          <Link
            href={problem.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium hover:text-primary transition-colors inline-flex items-center gap-1"
          >
            {problem.name}
            <ExternalLink className="h-3 w-3 text-muted-foreground/40 shrink-0" />
          </Link>
          {isImportant && (
            <Badge className="text-[9px] px-1.5 py-0 h-4 font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 shrink-0">
              IMP
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          {problem.patterns.slice(0, 2).map((pat) => (
            <Badge
              key={pat}
              variant="secondary"
              className="text-[10px] px-1.5 py-0 h-4 font-normal"
            >
              {pat}
            </Badge>
          ))}
          {problem.patterns.length > 2 && (
            <span className="text-[10px] text-muted-foreground/50 font-medium hover:text-muted-foreground/80 transition-colors cursor-default">
              +{problem.patterns.length - 2}
            </span>
          )}
        </div>
      </TableCell>
      <TableCell className="py-3">
        <DifficultyBadge difficulty={problem.difficulty} />
      </TableCell>
      <TableCell className="py-3 hidden sm:table-cell">
        {date && (
          <span className="text-[10px] text-green-600 dark:text-green-400 tabular-nums whitespace-nowrap">
            ✓ {date}
          </span>
        )}
      </TableCell>
      <TableCell className="text-right hidden sm:table-cell py-3">
        <span className="text-xs font-semibold tabular-nums text-muted-foreground">
          {problem.frequency ?? "—"}
        </span>
      </TableCell>
    </TableRow>
  );
});
