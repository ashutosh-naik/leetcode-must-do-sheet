"use client";

import { useProblemStore } from "@/store/problem-store";
import { PROBLEMS } from "@/constants/problems";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Trophy, CheckCircle } from "lucide-react";

function CircularGauge({ value, total }: { value: number; total: number }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  // circumference for r=68 = 2*pi*68 ≈ 427.257
  const r = 68;
  const circ = 2 * Math.PI * r;
  const dashOffset = circ - (pct / 100) * circ;

  return (
    <div className="relative flex items-center justify-center size-[160px] shrink-0">
      <svg className="size-[150px] -rotate-90" viewBox="0 0 150 150">
        <circle
          cx="75"
          cy="75"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-muted-foreground/15"
        />
        <circle
          cx="75"
          cy="75"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={dashOffset}
          className="text-primary transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold tracking-tight text-foreground">
          {value}
        </span>
        <span className="text-xs font-medium text-muted-foreground">
          / {total}
        </span>
        <span className="text-xs font-semibold text-primary mt-0.5">
          {pct}%
        </span>
      </div>
    </div>
  );
}

const difficultyConfig = {
  Easy: { color: "bg-green-500", text: "text-green-600 dark:text-green-400", bg: "bg-green-500/10 dark:bg-green-500/15" },
  Medium: { color: "bg-amber-500", text: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10 dark:bg-amber-500/15" },
  Hard: { color: "bg-red-500", text: "text-red-600 dark:text-red-400", bg: "bg-red-500/10 dark:bg-red-500/15" },
} as const;

function DifficultyCard({ difficulty, solved, total }: { difficulty: keyof typeof difficultyConfig; solved: number; total: number }) {
  const cfg = difficultyConfig[difficulty];
  const pct = total > 0 ? Math.round((solved / total) * 100) : 0;

  return (
    <div className={cn("flex items-center gap-3 rounded-xl p-4", cfg.bg)}>
      <div className={cn("size-11 rounded-full flex items-center justify-center shrink-0", cfg.bg)}>
        <CheckCircle className={cn("h-5 w-5", cfg.text)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className={cn("text-sm font-semibold", cfg.text)}>{difficulty}</span>
          <span className="text-sm font-medium tabular-nums text-muted-foreground">
            {solved}/{total}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-muted-foreground/15 overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all duration-500", cfg.color)}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export function ProgressPanel() {
  const solvedProblemIds = useProblemStore((s) => s.solvedProblemIds);
  const solvedSet = new Set(solvedProblemIds);

  const total = PROBLEMS.length;
  const totalSolved = solvedSet.size;

  const byDifficulty = PROBLEMS.reduce(
    (acc, p) => {
      const solved = solvedSet.has(p.id) ? 1 : 0;
      acc[p.difficulty].total++;
      acc[p.difficulty].solved += solved;
      return acc;
    },
    { Easy: { total: 0, solved: 0 }, Medium: { total: 0, solved: 0 }, Hard: { total: 0, solved: 0 } } as Record<string, { total: number; solved: number }>
  );

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Trophy className="h-4 w-4 text-primary" />
          Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6 pt-2">
        <CircularGauge value={totalSolved} total={total} />
        <div className="w-full space-y-3">
          <DifficultyCard difficulty="Easy" solved={byDifficulty.Easy.solved} total={byDifficulty.Easy.total} />
          <DifficultyCard difficulty="Medium" solved={byDifficulty.Medium.solved} total={byDifficulty.Medium.total} />
          <DifficultyCard difficulty="Hard" solved={byDifficulty.Hard.solved} total={byDifficulty.Hard.total} />
        </div>
      </CardContent>
    </Card>
  );
}
export default ProgressPanel;
