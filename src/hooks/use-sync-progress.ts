"use client";

import { useEffect, useRef } from "react";
import { useProblemStore } from "@/store/problem-store";
import { useAuth } from "@/providers/auth-provider";
import { syncSolvedProblems } from "@/lib/services/problem-progress";
import { logger } from "@/lib/logger";

export function useSyncProgress() {
  const { user } = useAuth();
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
          }
        });
      return () => { cancelled = true; };
    }
  }, [user, setSolvedProblemIds, setSolvedProblemDates]);
}
