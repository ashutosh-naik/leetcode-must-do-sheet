import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ProblemState {
  solvedProblemIds: number[];
  toggleProblemSolved: (id: number) => void;
  setSolvedProblemIds: (ids: number[]) => void;
  resetProgress: () => void;
  showResetConfirm: boolean;
  setShowResetConfirm: (show: boolean) => void;
}

export const useProblemStore = create<ProblemState>()(
  persist(
    (set) => ({
      solvedProblemIds: [],
      showResetConfirm: false,

      toggleProblemSolved: (id) =>
        set((state) => {
          const isSolved = state.solvedProblemIds.includes(id);
          const newSolved = isSolved
            ? state.solvedProblemIds.filter((pId) => pId !== id)
            : [...state.solvedProblemIds, id];
          return { solvedProblemIds: newSolved };
        }),

      setSolvedProblemIds: (ids) => set({ solvedProblemIds: ids }),

      resetProgress: () => set({ solvedProblemIds: [] }),

      setShowResetConfirm: (show) => set({ showResetConfirm: show }),
    }),
    {
      name: "leetcode-tracker-problems",
      partialize: (state) => ({ solvedProblemIds: state.solvedProblemIds }),
    },
  ),
);
