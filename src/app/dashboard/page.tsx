"use client";

import { useMemo } from "react";
import { PROBLEMS } from "@/constants/problems";
import { useProblemStore } from "@/store/problem-store";
import { useAuth } from "@/providers/auth-provider";
import { ProgressPanel } from "@/components/dashboard/progress-panel";
import { BarChart3 } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const solvedProblemIds = useProblemStore((s) => s.solvedProblemIds);
  const solvedSet = useMemo(
    () => new Set(solvedProblemIds),
    [solvedProblemIds],
  );

  const total = PROBLEMS.length;
  const solved = solvedSet.size;
  const completion = total > 0 ? Math.round((solved / total) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center gap-3">
        <BarChart3 className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      </div>

      {user && (
        <p className="text-sm text-muted-foreground -mt-4">
          Signed in as {user.email}
        </p>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <ProgressPanel />
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col items-center justify-center text-center space-y-2">
          <span className="text-5xl font-bold text-primary tabular-nums">
            {completion}%
          </span>
          <p className="text-sm text-muted-foreground">Overall Completion</p>
          <p className="text-xs text-muted-foreground">
            {solved} of {total} problems solved
          </p>
        </div>
      </div>
    </div>
  );
}
