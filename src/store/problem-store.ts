import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ProblemState {
  solvedProblemIds: number[];
  solvedProblemDates: Record<number, string>;
  toggleProblemSolved: (id: number) => void;
  setSolvedProblemIds: (ids: number[]) => void;
  setSolvedProblemDate: (id: number, date: string) => void;
  setSolvedProblemDates: (dates: Record<number, string>) => void;
  removeSolvedProblemDate: (id: number) => void;
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
            newDates[id] = new Date().toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              timeZone: "UTC",
            });
          }
          return { solvedProblemIds: newSolved, solvedProblemDates: newDates };
        }),

      setSolvedProblemIds: (ids) => set({ solvedProblemIds: ids }),

      setSolvedProblemDate: (id, date) =>
        set((state) => ({
          solvedProblemDates: { ...state.solvedProblemDates, [id]: date },
        })),

      setSolvedProblemDates: (dates) =>
        set((state) => ({
          solvedProblemDates: { ...state.solvedProblemDates, ...dates },
        })),

      removeSolvedProblemDate: (id) =>
        set((state) => {
          const newDates = { ...state.solvedProblemDates };
          delete newDates[id];
          return { solvedProblemDates: newDates };
        }),

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
