import { create } from "zustand";
import { persist } from "zustand/middleware";
import { PROBLEMS } from "@/constants/problems";

interface ProblemState {
  solvedProblemIds: number[];
  solvedProblemDates: Record<number, string>;
  toggleProblemSolved: (id: number) => void;
  setSolvedProblemIds: (ids: number[]) => void;
  setSolvedProblemDates: (dates: Record<number, string>) => void;
  resetProgress: () => void;
  showResetConfirm: boolean;
  setShowResetConfirm: (show: boolean) => void;
  // Derived Set for O(1) lookups
  _solvedSet: Set<number>;
}

export const useProblemStore = create<ProblemState>()(
  persist(
    (set) => ({
      solvedProblemIds: [],
      solvedProblemDates: {},
      showResetConfirm: false,
      _solvedSet: new Set<number>(),

      toggleProblemSolved: (id) =>
        set((state) => {
          const isSolved = state._solvedSet.has(id);
          const newSolved = isSolved
            ? state.solvedProblemIds.filter((pId) => pId !== id)
            : [...state.solvedProblemIds, id];
          const newDates = { ...state.solvedProblemDates };
          if (isSolved) {
            delete newDates[id];
          } else {
            newDates[id] = new Date().toISOString();
          }
          return { solvedProblemIds: newSolved, solvedProblemDates: newDates, _solvedSet: new Set(newSolved) };
        }),

      setSolvedProblemIds: (ids) => set({ solvedProblemIds: ids, _solvedSet: new Set(ids) }),

      setSolvedProblemDates: (dates) => set({ solvedProblemDates: dates }),

      resetProgress: () => set({ solvedProblemIds: [], solvedProblemDates: {}, _solvedSet: new Set() }),

      setShowResetConfirm: (show) => set({ showResetConfirm: show }),
    }),
    {
      name: "leetcode-tracker-problems",
      partialize: (state) => ({
        solvedProblemIds: state.solvedProblemIds,
        solvedProblemDates: state.solvedProblemDates,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Validate solvedProblemIds — filter to only IDs that exist in PROBLEMS
          const validIds = new Set(PROBLEMS.map((p) => p.id));
          state.solvedProblemIds = state.solvedProblemIds.filter(
            (id) => typeof id === "number" && validIds.has(id),
          );
          // Clean up orphaned dates
          const idSet = new Set(state.solvedProblemIds);
          for (const key of Object.keys(state.solvedProblemDates)) {
            if (!idSet.has(Number(key))) {
              delete state.solvedProblemDates[Number(key)];
            }
          }
          state._solvedSet = new Set(state.solvedProblemIds);
        }
      },
    },
  ),
);
