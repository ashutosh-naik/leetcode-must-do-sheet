"use client";

import { useCallback, useMemo, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { AppLayout } from "@/components/layout/app-layout";
import { DUMMY_PROBLEMS } from "@/constants/problems";
import { PROBLEM_META } from "@/constants/problem-meta";
import { useProblemStore } from "@/store/problem-store";
import { ProblemCard } from "@/components/layout/problem-card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProgressPanel } from "@/components/dashboard/progress-panel";
import { ArrowDown, ArrowUp, ArrowUpDown, ExternalLink, Search, Shuffle } from "lucide-react";
import { cn } from "@/lib/utils";

type SortKey = "id" | "difficulty" | "frequency" | "companies";
type SortDir = "asc" | "desc";

const DIFFICULTY_ORDER: Record<string, number> = { Easy: 1, Medium: 2, Hard: 3 };

function dailyPickIndex(total: number): number {
  const date = new Intl.DateTimeFormat("en-CA").format(new Date());
  let hash = 0;
  for (let i = 0; i < date.length; i++) {
    hash = ((hash << 5) - hash + date.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % total;
}

function parseFreq(f: string | undefined): number {
  if (!f) return 0;
  return parseInt(f, 10);
}

function Home() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { solvedProblemIds, toggleProblemSolved } = useProblemStore();

  // Read all state from URL
  const searchQuery = searchParams.get("q") ?? "";
  const selectedDifficulty = searchParams.get("difficulty") ?? "All";
  const selectedPattern = searchParams.get("pattern") ?? "All";
  const sortKey = (searchParams.get("sort") as SortKey) ?? "id";
  const sortDir = (searchParams.get("dir") as SortDir) ?? "asc";

  const setParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (!value || value === "All") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      const qs = params.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [searchParams, pathname, router]
  );

  const uniquePatterns = useMemo(
    () => [...new Set(DUMMY_PROBLEMS.flatMap((p) => p.patterns))],
    []
  );

  // Merge with metadata, filter, then sort
  const filteredProblems = useMemo(() => {
    let list = DUMMY_PROBLEMS.filter((problem) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        problem.name.toLowerCase().includes(q) ||
        problem.patterns.some((pat) => pat.toLowerCase().includes(q)) ||
        String(problem.id).includes(q);
      const matchesDifficulty =
        selectedDifficulty === "All" || problem.difficulty === selectedDifficulty;
      const matchesPattern =
        selectedPattern === "All" || problem.patterns.includes(selectedPattern);
      return matchesSearch && matchesDifficulty && matchesPattern;
    }).map((p) => ({ ...p, ...PROBLEM_META[p.id] }));

    list.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "id":
          cmp = a.id - b.id;
          break;
        case "difficulty":
          cmp = (DIFFICULTY_ORDER[a.difficulty] ?? 0) - (DIFFICULTY_ORDER[b.difficulty] ?? 0);
          break;
        case "frequency":
          cmp = parseFreq(a.f) - parseFreq(b.f);
          break;
        case "companies":
          cmp = (a.c ?? 0) - (b.c ?? 0);
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return list;
  }, [searchQuery, selectedDifficulty, selectedPattern, sortKey, sortDir]);

  // Daily random pick from the full (unfiltered) problem list
  const dailyPick = useMemo(() => {
    const all = DUMMY_PROBLEMS.map((p) => ({ ...p, ...PROBLEM_META[p.id] }));
    const idx = dailyPickIndex(all.length);
    return all[idx];
  }, []);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setParams({ dir: sortDir === "asc" ? "desc" : "asc" });
    } else {
      setParams({ sort: key, dir: "asc" });
    }
  };

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return <ArrowUpDown className="h-3 w-3 opacity-40" />;
    return sortDir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />;
  };

  const difficultyColors = {
    Easy: "text-easy hover:text-easy",
    Medium: "text-medium hover:text-medium",
    Hard: "text-hard hover:text-hard",
  };

  return (
    <AppLayout>
      <div className="mx-auto px-3 lg:px-5 py-4">
        {/* Progress + Problem List */}
        <div className="flex flex-col lg:flex-row gap-4 items-stretch">
          {/* Left: Header + Progress */}
          <div className="w-full lg:min-w-[400px] lg:w-[400px] shrink-0">
            <div className="rounded-xl bg-muted/50 dark:bg-[#262626] p-4 pb-12 space-y-4">
              <div className="border-l-2 border-primary pl-3">
                <h1 className="text-base font-bold tracking-tight text-foreground">
                  LeetCode Must-Do Progress Tracker
                </h1>
                <p className="text-muted-foreground text-xs mt-0.5">
                  Track, organize, and practice the essential LeetCode coding interview patterns.
                </p>
              </div>
              <ProgressPanel />
            </div>
          </div>

          {/* Right: Problem Area */}
          <div className="flex-1 min-w-0 space-y-3">
            {/* Unified Toolbar */}
            <div className="flex flex-wrap items-center gap-2 bg-card p-3 rounded-xl border border-border">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name, ID, or pattern..."
              className="pl-9 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary/50"
              value={searchQuery}
              onChange={(e) => setParams({ q: e.target.value })}
            />
          </div>

          {/* Filter: Difficulty */}
          <Select value={selectedDifficulty} onValueChange={(v) => setParams({ difficulty: v })}>
            <SelectTrigger className="w-[130px] bg-muted/30 border-border focus:ring-1 focus:ring-primary/50 cursor-pointer">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">Difficulty</SelectItem>
              <SelectItem value="Easy">Easy</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Hard">Hard</SelectItem>
            </SelectContent>
          </Select>

          {/* Filter: Pattern */}
          <Select value={selectedPattern} onValueChange={(v) => setParams({ pattern: v })}>
            <SelectTrigger className="w-[160px] bg-muted/30 border-border focus:ring-1 focus:ring-primary/50 cursor-pointer">
              <SelectValue placeholder="Pattern" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">Patterns</SelectItem>
              {uniquePatterns.map((pattern) => (
                <SelectItem key={pattern} value={pattern}>
                  {pattern}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort controls */}
          <div className="flex items-center gap-1 bg-muted/30 rounded-lg p-1">
            <button
              onClick={() => toggleSort("id")}
              className={cn(
                "flex items-center gap-1 px-2 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer border-none",
                sortKey === "id"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <SortIcon column="id" /> ID
            </button>
            <button
              onClick={() => toggleSort("difficulty")}
              className={cn(
                "flex items-center gap-1 px-2 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer border-none",
                sortKey === "difficulty"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <SortIcon column="difficulty" /> Diff
            </button>
            <button
              onClick={() => toggleSort("frequency")}
              className={cn(
                "flex items-center gap-1 px-2 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer border-none",
                sortKey === "frequency"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <SortIcon column="frequency" /> Freq
            </button>
            <button
              onClick={() => toggleSort("companies")}
              className={cn(
                "flex items-center gap-1 px-2 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer border-none",
                sortKey === "companies"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <SortIcon column="companies" /> Comp
            </button>
          </div>

          {/* Pick One */}
          <a
            href={dailyPick.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer no-underline"
          >
            <Shuffle className="h-3.5 w-3.5" />
            Pick One
          </a>
        </div>

        {/* Problems List */}
        {filteredProblems.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center bg-card rounded-xl border border-dashed border-border min-h-[300px]">
            <div className="h-10 w-10 text-muted-foreground/60 mb-3">
              <Search className="h-full w-full" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">No problems found</h3>
            <p className="text-muted-foreground text-sm mt-1 max-w-xs">
              Try adjusting your search criteria or active filters.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block rounded-xl border border-border bg-card overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="w-[80px] text-center">Status</TableHead>
                    <TableHead className="w-[80px]">ID</TableHead>
                    <TableHead>Problem Name</TableHead>
                    <TableHead className="w-[120px]">Difficulty</TableHead>
                    <TableHead className="w-[80px] text-center">Freq</TableHead>
                    <TableHead className="w-[80px] text-center">Comp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProblems.map((problem) => {
                    const isSolved = solvedProblemIds.includes(problem.id);
                    return (
                      <TableRow
                        key={problem.id}
                        className={cn(
                          "transition-colors hover:bg-muted/10",
                          isSolved ? "bg-muted/20 text-muted-foreground animate-fade-in" : ""
                        )}
                      >
                        <TableCell className="text-center">
                          <Checkbox
                            id={`problem-check-${problem.id}`}
                            checked={isSolved}
                            onCheckedChange={() => toggleProblemSolved(problem.id)}
                            className="h-4 w-4 data-[state=checked]:bg-primary data-[state=checked]:border-primary cursor-pointer"
                          />
                        </TableCell>
                        <TableCell className="font-semibold text-muted-foreground">
                          {problem.id}
                        </TableCell>
                        <TableCell className="font-bold">
                          <div className="flex flex-col gap-1">
                            <a
                              href={problem.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={cn(
                                "inline-flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer",
                                isSolved ? "line-through text-muted-foreground" : "text-foreground"
                              )}
                            >
                              {problem.name}
                              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                            </a>
                            <div className="flex flex-wrap gap-1">
                              {problem.patterns.map((pattern) => (
                                <Badge
                                  key={pattern}
                                  variant="secondary"
                                  className="text-[10px] py-0.5 px-2 font-normal"
                                >
                                  {pattern}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={cn("text-xs font-bold", difficultyColors[problem.difficulty])}>
                            {problem.difficulty}
                          </span>
                        </TableCell>
                        <TableCell className="text-center text-xs font-mono text-muted-foreground">
                          {problem.f ?? "-"}
                        </TableCell>
                        <TableCell className="text-center text-xs font-mono text-muted-foreground">
                          {problem.c ?? "-"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card Grid View */}
            <div className="grid grid-cols-1 gap-3 md:hidden">
              {filteredProblems.map((problem) => (
                <ProblemCard key={problem.id} problem={problem} />
              ))}
            </div>
          </>
        )}
          </div>{/* end problem area */}
        </div>{/* end progress + problem list flex */}
      </div>
    </AppLayout>
  );
}

export default function Page() {
  return (
    <Suspense fallback={
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px] text-muted-foreground">
          Loading...
        </div>
      </AppLayout>
    }>
      <Home />
    </Suspense>
  );
}
