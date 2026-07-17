import { create } from "zustand";
import { persist } from "zustand/middleware";

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
          const isSolved = state.solvedProblemIds.includes(id);
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
          state._solvedSet = new Set(state.solvedProblemIds);
        }
      },
    },
  ),
);
