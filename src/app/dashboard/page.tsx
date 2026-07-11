"use client";

import { useEffect, useMemo, useRef } from "react";
import { PROBLEMS } from "@/constants/problems";
import { useProblemStore } from "@/store/problem-store";
import { useAuth } from "@/providers/auth-provider";
import { ProgressPanel } from "@/components/dashboard/progress-panel";
import { BarChart3 } from "lucide-react";
import { syncSolvedProblems } from "@/lib/services/problem-progress";
import { logger } from "@/lib/logger";

export default function DashboardPage() {
  const { user } = useAuth();
  const solvedProblemIds = useProblemStore((s) => s.solvedProblemIds);
  const setSolvedProblemIds = useProblemStore((s) => s.setSolvedProblemIds);
  const setSolvedProblemDates = useProblemStore((s) => s.setSolvedProblemDates);
  const synced = useRef(false);
  const prevUserId = useRef<string | undefined>(undefined);
  const wasEverSynced = useRef(false);

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
      const localIds = useProblemStore.getState().solvedProblemIds;
      const localDates = useProblemStore.getState().solvedProblemDates;

      if (currentUserId !== previousUserId) {
        setSolvedProblemIds([]);
        setSolvedProblemDates({});
      }

      const isGuestTransition = !wasEverSynced.current;
      syncSolvedProblems(
        user.id,
        isGuestTransition ? localIds : [],
        isGuestTransition ? localDates : {},
      )
        .then(({ ids, dates }) => {
          if (!cancelled) {
            wasEverSynced.current = true;
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

  const solvedSet = useMemo(
    () => (user ? new Set(solvedProblemIds) : new Set()),
    [solvedProblemIds, user],
  );

  const total = PROBLEMS.length;
  const solved = solvedSet.size;
  const completion = total > 0 ? (solved / total) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center gap-3 animate-fade-in-down">
        <BarChart3 className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      </div>

      {user && (
        <p className="text-sm text-muted-foreground -mt-4 animate-fade-in-up-sm" style={{ animationDelay: "100ms", animationFillMode: "backwards" }}>
          Signed in as {user.email}
        </p>
      )}

        <div className="grid gap-6 md:grid-cols-2">
          <div
            className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
            style={{
              opacity: 0,
              animation: "fade-in-up 0.5s ease-out 150ms forwards",
            }}
          >
            <ProgressPanel />
          </div>
          <div
            className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col items-center justify-center text-center space-y-2 hover:shadow-md transition-shadow duration-300 min-h-[220px]"
            style={{
              opacity: 0,
              animation: "fade-in-up 0.5s ease-out 250ms forwards",
            }}
          >
            {solved === 0 ? (
              <div className="flex flex-col items-center gap-2">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-muted/50 border border-border">
                  <BarChart3 className="h-6 w-6 text-muted-foreground/40" />
                </div>
                <p className="text-sm font-medium text-foreground">No progress yet</p>
                <p className="text-xs text-muted-foreground">Start solving problems to track your progress</p>
              </div>
            ) : (
              <>
                <span
                  className="text-5xl font-bold text-primary tabular-nums"
                  style={{
                    opacity: 0,
                    animation: "scale-in 0.5s ease-out 400ms forwards",
                  }}
                >
                  {completion.toFixed(1)}%
                </span>
                <p className="text-sm text-muted-foreground">Overall Completion</p>
                <p className="text-xs text-muted-foreground">
                  {solved} of {total} problems solved
                </p>
              </>
            )}
          </div>
        </div>
    </div>
  );
}
