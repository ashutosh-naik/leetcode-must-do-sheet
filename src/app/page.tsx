"use client";

import { Suspense, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ExternalLink, ArrowUpDown, Search, X, Shuffle, ArrowUp, ArrowDown } from "lucide-react";
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

function useFilteredProblems() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const difficulty = searchParams.get("difficulty") ?? "";
  const pattern = searchParams.get("pattern") ?? "";
  const sort = (searchParams.get("sort") ?? "id") as "id" | "difficulty" | "frequency";
  const dir = (searchParams.get("dir") ?? "asc") as "asc" | "desc";

  const uniquePatterns = useMemo(() => {
    const set = new Set<string>();
    PROBLEMS.forEach((p) => {
      p.patterns.forEach((pat) => {
        const t = pat.trim();
        if (t) set.add(t);
      });
    });
    return Array.from(set).sort();
  }, []);

  const filtered = useMemo(() => {
    let list = [...PROBLEMS];

    if (q) {
      const lq = q.toLowerCase();
      list = list.filter(
        (p) =>
          p.id.toString().includes(lq) ||
          p.name.toLowerCase().includes(lq) ||
          p.patterns.some((pat) => pat.toLowerCase().includes(lq))
      );
    }
    if (difficulty) {
      list = list.filter((p) => p.difficulty === difficulty);
    }
    if (pattern) {
      list = list.filter((p) =>
        p.patterns.some((pat) => pat.trim().toLowerCase() === pattern.toLowerCase())
      );
    }

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
  const solvedSet = useMemo(() => new Set(solvedProblemIds), [solvedProblemIds]);

  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(window.location.search);
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      // Reset to page 1 when filters change
      params.delete("page");
      // Reset sort dir when sort key changes
      if (key === "sort") {
        params.delete("dir");
      }
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router]
  );

  const toggleSortDir = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    const current = params.get("dir") ?? "asc";
    params.set("dir", current === "asc" ? "desc" : "asc");
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [router]);

  const pickOne = useCallback(() => {
    // deterministic "pick one" using today's date as seed
    const today = new Date();
    const seed =
      today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();

    // optional: filter unsolved only
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
    [router]
  );

  const totalPages = Math.ceil(list.length / PAGE_SIZE);
  const paged = list.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const sortIcon = dir === "asc" ? (
    <ArrowUp className="h-3 w-3" />
  ) : (
    <ArrowDown className="h-3 w-3" />
  );

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start justify-center mx-auto w-full max-w-7xl px-4 py-4 lg:px-6 lg:py-6">
      {/* Left Column — Progress */}
      <aside className="w-full lg:w-[340px] xl:w-[360px] shrink-0">
        <div className="rounded-xl bg-muted/50 dark:bg-[#262626] p-4 lg:p-5 space-y-3">
          <div className="border-l-2 border-primary pl-3">
            <h2 className="text-lg font-bold tracking-tight">Must Do DSA</h2>
            <p className="text-sm text-muted-foreground">
              626 hand-picked LeetCode problems
            </p>
          </div>
          <ProgressPanel />
        </div>
      </aside>

      {/* Right Column — Toolbar + Table */}
      <div className="flex-1 min-w-0 space-y-3">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search problems..."
              value={q}
              onChange={(e) => setParam("q", e.target.value)}
              className="h-9 w-full rounded-lg border border-border bg-background pl-8 pr-8 text-sm outline-none focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary transition-colors placeholder:text-muted-foreground/60"
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

          {/* Difficulty filter */}
          <Select
            value={difficulty}
            onValueChange={(v) => setParam("difficulty", v === "all" ? "" : v)}
          >
            <SelectTrigger className="w-[120px] h-9 cursor-pointer">
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
            <SelectTrigger className="w-[140px] h-9 cursor-pointer">
              <SelectValue placeholder="Patterns" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {uniquePatterns.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort controls */}
          <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-0.5">
            {([["id", "ID"], ["difficulty", "Diff"], ["frequency", "Freq"]] as const).map(([key, label]) => (
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
                  "flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer border-none bg-transparent",
                  sort === key
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {label}
                {sort === key ? sortIcon : <ArrowUpDown className="h-3 w-3 opacity-50" />}
              </button>
            ))}
          </div>

          {/* Pick One */}
          <Button
            variant="outline"
            size="sm"
            onClick={pickOne}
            className="gap-1.5 cursor-pointer"
          >
            <Shuffle className="h-3.5 w-3.5" />
            Pick One
          </Button>

          {/* Result count */}
          <span className="text-xs text-muted-foreground whitespace-nowrap ml-auto">
            {list.length} problem{list.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block rounded-xl border border-border overflow-hidden bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="w-10 text-center">#</TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="w-24">Difficulty</TableHead>
                <TableHead className="w-16 text-right hidden sm:table-cell">Freq</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
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
          <div className="flex items-center justify-center gap-2 py-2">
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
      <TableCell className="text-center">
        <Checkbox
          checked={solved}
          onCheckedChange={onToggle}
          className="cursor-pointer"
        />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground tabular-nums">
            {problem.id}.
          </span>
          <Link
            href={problem.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            {problem.name}
          </Link>
          <ExternalLink className="h-3 w-3 text-muted-foreground/50 shrink-0" />
        </div>
        <div className="flex flex-wrap gap-1 mt-1">
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
      <TableCell>
        <DifficultyBadge difficulty={problem.difficulty} />
      </TableCell>
      <TableCell className="text-right hidden sm:table-cell">
        <span className="text-xs font-medium tabular-nums text-muted-foreground">
          {problem.frequency != null ? `${problem.frequency}%` : "—"}
        </span>
      </TableCell>
    </TableRow>
  );
}

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    Easy: { bg: "bg-green-500/10 dark:bg-green-500/15", text: "text-green-600 dark:text-green-400", label: "Easy" },
    Medium: { bg: "bg-amber-500/10 dark:bg-amber-500/15", text: "text-amber-600 dark:text-amber-400", label: "Medium" },
    Hard: { bg: "bg-red-500/10 dark:bg-red-500/15", text: "text-red-600 dark:text-red-400", label: "Hard" },
  };
  const c = config[difficulty] ?? config.Easy;
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold", c.bg, c.text)}>
      {c.label}
    </span>
  );
}
