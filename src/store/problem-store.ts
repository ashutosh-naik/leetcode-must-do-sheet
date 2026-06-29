import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ProblemState {
  solvedProblemIds: number[];
  toggleProblemSolved: (id: number) => void;
  isProblemSolved: (id: number) => boolean;
  setSolvedProblemIds: (ids: number[]) => void;
  resetProgress: () => void;
  showResetConfirm: boolean;
  setShowResetConfirm: (show: boolean) => void;
}

export const useProblemStore = create<ProblemState>()(
  persist(
    (set, get) => ({
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

      isProblemSolved: (id) => get().solvedProblemIds.includes(id),

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
