"use client";

import { Suspense, useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ExternalLink,
  ArrowUpDown,
  Search,
  X,
  Shuffle,
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
import { useProblemStore } from "@/store/problem-store";
import { cn } from "@/lib/utils";
import type { Problem } from "@/constants/problems";

const DIFFICULTIES = ["Easy", "Medium", "Hard"] as const;

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

function useFilteredProblems() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const difficulty = searchParams.get("difficulty") ?? "";
  const pattern = searchParams.get("pattern") ?? "";
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
  }, [q, difficulty, pattern, sort, dir, uniquePatterns]);

  return { ...filtered, q, difficulty, pattern, sort, dir };
}

export default function Home() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { list, uniquePatterns, q, difficulty, pattern, sort, dir } =
    useFilteredProblems();
  const solvedProblemIds = useProblemStore((s) => s.solvedProblemIds);
  const toggleSolved = useProblemStore((s) => s.toggleProblemSolved);
  const solvedSet = useMemo(
    () => new Set(solvedProblemIds),
    [solvedProblemIds],
  );
  const [showProgress, setShowProgress] = useState(false);

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

  const toggleSortDir = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    const current = params.get("dir") ?? "asc";
    params.set("dir", current === "asc" ? "desc" : "asc");
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [router]);

  const pickOne = useCallback(() => {
    const today = new Date();
    const seed =
      today.getFullYear() * 10000 +
      (today.getMonth() + 1) * 100 +
      today.getDate();
    const unsolved = PROBLEMS.filter((p) => !solvedSet.has(p.id));
    const pool = unsolved.length > 0 ? unsolved : PROBLEMS;
    const idx = seed % pool.length;
    const picked = pool[idx];
    if (picked) {
      window.open(picked.link, "_blank", "noopener noreferrer");
    }
  }, [solvedSet]);

  const PAGE_SIZE = 50;
  const page = parseInt(searchParams.get("page") ?? "0", 10);
  const setPage = useCallback(
    (nextPage: number) => {
      const params = new URLSearchParams(window.location.search);
      if (nextPage > 0) {
        params.set("page", String(nextPage));
      } else {
        params.delete("page");
      }
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router],
  );

  const totalPages = Math.ceil(list.length / PAGE_SIZE);
  const paged = list.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const sortIcon =
    dir === "asc" ? (
      <ArrowUp className="h-3 w-3" />
    ) : (
      <ArrowDown className="h-3 w-3" />
    );

  return (
    <div className="flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-start justify-center mx-auto w-full max-w-7xl px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      {/* Left Column — Progress */}
      <aside className="w-full lg:w-[340px] xl:w-[360px] shrink-0">
        {/* Mobile toggle */}
        <button
          onClick={() => setShowProgress(!showProgress)}
          className="flex lg:hidden items-center gap-2 w-full rounded-xl bg-muted/50 dark:bg-[#202020] px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer border-none"
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
              Pattern Order · Easy → Hard
              <br />
              High Frequency First
            </p>
          </div>
          <ProgressPanel />
        </div>
      </aside>

      {/* Right Column — Toolbar + Table */}
      <div className="flex-1 min-w-0 space-y-3 sm:space-y-4">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Search — full width on mobile */}
          <div className="relative w-full sm:flex-1 sm:min-w-[200px] sm:max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search problems..."
              value={q}
              onChange={(e) => setParam("q", e.target.value)}
              className="h-9 sm:h-10 w-full rounded-xl border border-border bg-background pl-9 pr-9 text-sm outline-none focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary transition-colors placeholder:text-muted-foreground/60"
            />
            {q && (
              <button
                onClick={() => setParam("q", "")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer bg-transparent border-none p-0"
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
              onValueChange={(v) => setParam("difficulty", v === "all" ? "" : v)}
            >
              <SelectTrigger className="h-9 sm:h-10 w-[120px] sm:w-[130px] cursor-pointer">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {DIFFICULTIES.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Pattern filter */}
            <Select
              value={pattern}
              onValueChange={(v) => setParam("pattern", v === "all" ? "" : v)}
            >
              <SelectTrigger className="h-9 sm:h-10 w-[140px] sm:w-[150px] cursor-pointer">
                <SelectValue placeholder="Patterns" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                <SelectItem value="all">All</SelectItem>
                {uniquePatterns.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Pick One — hide label on mobile */}
            <Button
              variant="outline"
              size="sm"
              onClick={pickOne}
              className="h-9 sm:h-10 gap-1.5 cursor-pointer shrink-0"
            >
              <Shuffle className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Pick One</span>
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
                  className={cn(
                    "flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-medium transition-colors cursor-pointer border-none bg-transparent whitespace-nowrap",
                    sort === key
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
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
              {list.length}
              <span className="hidden sm:inline"> problem{list.length !== 1 ? "s" : ""}</span>
            </span>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block rounded-2xl border border-border overflow-x-auto bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="w-10 text-center">#</TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="w-24">Difficulty</TableHead>
                <TableHead className="w-20 text-right hidden sm:table-cell">
                  Freq
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-12 text-muted-foreground"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Search className="h-6 w-6 opacity-40" />
                      <span>No problems match your filters</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paged.map((problem) => (
                  <ProblemRow
                    key={problem.id}
                    problem={problem}
                    solved={solvedSet.has(problem.id)}
                    onToggle={() => toggleSolved(problem.id)}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-2">
          {paged.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
              <Search className="h-6 w-6 opacity-40" />
              <span className="text-sm">No problems match your filters</span>
            </div>
          ) : (
            paged.map((problem) => (
              <ProblemCard
                key={problem.id}
                problem={problem}
                solved={solvedSet.has(problem.id)}
                onToggle={() => toggleSolved(problem.id)}
              />
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 py-4">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage(Math.max(0, page - 1))}
              className="cursor-pointer"
            >
              Previous
            </Button>
            <span className="text-xs text-muted-foreground tabular-nums">
              Page {page + 1} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              className="cursor-pointer"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function ProblemRow({
  problem,
  solved,
  onToggle,
}: {
  problem: Problem;
  solved: boolean;
  onToggle: () => void;
}) {
  return (
    <TableRow className={cn(solved && "opacity-60")}>
      <TableCell className="text-center py-3">
        <Checkbox
          checked={solved}
          onCheckedChange={onToggle}
          className="cursor-pointer"
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
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0 h-4 font-normal"
            >
              +{problem.patterns.length - 2}
            </Badge>
          )}
        </div>
      </TableCell>
      <TableCell className="py-3">
        <DifficultyBadge difficulty={problem.difficulty} />
      </TableCell>
      <TableCell className="text-right hidden sm:table-cell py-3">
        <span className="text-xs font-semibold tabular-nums text-muted-foreground">
          {problem.frequency ?? "—"}
        </span>
      </TableCell>
    </TableRow>
  );
}

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    Easy: {
      bg: "bg-green-500/10 dark:bg-green-500/15",
      text: "text-green-600 dark:text-green-400",
      label: "Easy",
    },
    Medium: {
      bg: "bg-amber-500/10 dark:bg-amber-500/15",
      text: "text-amber-600 dark:text-amber-400",
      label: "Medium",
    },
    Hard: {
      bg: "bg-red-500/10 dark:bg-red-500/15",
      text: "text-red-600 dark:text-red-400",
      label: "Hard",
    },
  };
  const c = config[difficulty] ?? config.Easy;
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold",
        c.bg,
        c.text,
      )}
    >
      {c.label}
    </span>
  );
}
