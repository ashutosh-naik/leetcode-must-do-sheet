"use client";

import { useEffect, useRef } from "react";
import { useProblemStore } from "@/store/problem-store";
import { useAuth } from "@/providers/auth-provider";
import { syncSolvedProblems } from "@/lib/services/problem-progress";
import { logger } from "@/lib/logger";

const RETRY_INTERVAL_MS = 30_000;

export function useSyncProgress() {
  const { user } = useAuth();
  const setSolvedProblemIds = useProblemStore((s) => s.setSolvedProblemIds);
  const setSolvedProblemDates = useProblemStore((s) => s.setSolvedProblemDates);
  const synced = useRef(false);
  const prevUserId = useRef<string | undefined>(undefined);
  const wasEverSynced = useRef(false);
  const syncing = useRef(false);

  useEffect(() => {
    const currentUserId = user?.id;
    const previousUserId = prevUserId.current;

    if (!user) {
      prevUserId.current = currentUserId;
      synced.current = false;
      return;
    }

    if (currentUserId !== previousUserId) {
      synced.current = false;
    }

    if (!synced.current && !syncing.current) {
      prevUserId.current = currentUserId;
      const localIds = useProblemStore.getState().solvedProblemIds;
      const localDates = useProblemStore.getState().solvedProblemDates;

      if (currentUserId !== previousUserId) {
        setSolvedProblemIds([]);
        setSolvedProblemDates({});
      }

      const isGuestTransition = !wasEverSynced.current;
      syncing.current = true;
      syncSolvedProblems(
        user.id,
        isGuestTransition ? localIds : [],
        isGuestTransition ? localDates : {},
      )
        .then(({ ids, dates }) => {
          wasEverSynced.current = true;
          synced.current = true;
          setSolvedProblemIds(ids);
          setSolvedProblemDates(dates);
        })
        .catch((err) => {
          logger.error("Error syncing problems:", err);
        })
        .finally(() => {
          syncing.current = false;
        });
    }

    // Periodic retry for failed guest-to-auth sync
    const interval = setInterval(() => {
      if (synced.current || syncing.current || !user) return;
      const ids = useProblemStore.getState().solvedProblemIds;
      const dates = useProblemStore.getState().solvedProblemDates;
      const guestData = !wasEverSynced.current;
      syncing.current = true;
      syncSolvedProblems(
        user.id,
        guestData ? ids : [],
        guestData ? dates : {},
      )
        .then(({ ids: rIds, dates: rDates }) => {
          wasEverSynced.current = true;
          synced.current = true;
          setSolvedProblemIds(rIds);
          setSolvedProblemDates(rDates);
        })
        .catch((err) => {
          logger.error("Error syncing problems (retry):", err);
        })
        .finally(() => {
          syncing.current = false;
        });
    }, RETRY_INTERVAL_MS);

    return () => {
      clearInterval(interval);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, setSolvedProblemIds, setSolvedProblemDates]);
}
