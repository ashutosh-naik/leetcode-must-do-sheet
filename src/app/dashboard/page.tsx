"use client";

import { useMemo } from "react";
import { PROBLEMS } from "@/constants/problems";
import { useProblemStore } from "@/store/problem-store";
import { useAuth } from "@/providers/auth-provider";
import { ProgressPanel } from "@/components/dashboard/progress-panel";
import { BarChart3, TrendingUp } from "lucide-react";

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

  const byDifficulty = useMemo(() => {
    const counts = { Easy: { total: 0, solved: 0 }, Medium: { total: 0, solved: 0 }, Hard: { total: 0, solved: 0 } };
    PROBLEMS.forEach((p) => {
      if (counts[p.difficulty]) {
        counts[p.difficulty].total++;
        if (solvedSet.has(p.id)) counts[p.difficulty].solved++;
      }
    });
    return counts;
  }, [solvedSet]);

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
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">Progress by Difficulty</h2>
          </div>
          <div className="space-y-3">
            {(["Easy", "Medium", "Hard"] as const).map((d) => {
              const c = byDifficulty[d];
              const pct = c.total > 0 ? Math.round((c.solved / c.total) * 100) : 0;
              return (
                <div key={d}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">{d}</span>
                    <span className="font-medium">{c.solved}/{c.total} ({pct}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        d === "Easy" ? "bg-green-500" : d === "Medium" ? "bg-yellow-500" : "bg-red-500"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="pt-2 border-t border-border">
            <div className="text-center">
              <span className="text-3xl font-bold text-primary">{completion}%</span>
              <p className="text-xs text-muted-foreground mt-1">Overall Completion</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
