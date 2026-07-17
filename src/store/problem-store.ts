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
}

export const useProblemStore = create<ProblemState>()(
  persist(
    (set) => ({
      solvedProblemIds: [],
      solvedProblemDates: {},
      showResetConfirm: false,

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
          return { solvedProblemIds: newSolved, solvedProblemDates: newDates };
        }),

      setSolvedProblemIds: (ids) => set({ solvedProblemIds: ids }),

      setSolvedProblemDates: (dates) => set({ solvedProblemDates: dates }),

      resetProgress: () => set({ solvedProblemIds: [], solvedProblemDates: {} }),

      setShowResetConfirm: (show) => set({ showResetConfirm: show }),
    }),
    {
      name: "leetcode-tracker-problems",
      partialize: (state) => ({
        solvedProblemIds: state.solvedProblemIds,
        solvedProblemDates: state.solvedProblemDates,
      }),
    },
  ),
);
