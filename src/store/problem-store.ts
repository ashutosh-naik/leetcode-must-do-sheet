import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ProblemState {
  solvedProblemIds: number[];
  searchQuery: string;
  selectedDifficulty: string;
  selectedPattern: string;
  isHydrated: boolean;
  toggleProblemSolved: (id: number) => void;
  isProblemSolved: (id: number) => boolean;
  setSearchQuery: (query: string) => void;
  setSelectedDifficulty: (difficulty: string) => void;
  setSelectedPattern: (pattern: string) => void;
  setHydrated: (hydrated: boolean) => void;
  resetProgress: () => void;
  resetFilters: () => void;
  showResetConfirm: boolean;
  setShowResetConfirm: (show: boolean) => void;
}

export const useProblemStore = create<ProblemState>()(
  persist(
    (set, get) => ({
      solvedProblemIds: [],
      searchQuery: "",
      selectedDifficulty: "All",
      selectedPattern: "All",
      isHydrated: false,

      toggleProblemSolved: (id) =>
        set((state) => {
          const isSolved = state.solvedProblemIds.includes(id);
          const newSolved = isSolved
            ? state.solvedProblemIds.filter((pId) => pId !== id)
            : [...state.solvedProblemIds, id];
          return { solvedProblemIds: newSolved };
        }),

      isProblemSolved: (id) => get().solvedProblemIds.includes(id),

      setSearchQuery: (query) => set({ searchQuery: query }),
      setSelectedDifficulty: (difficulty) => set({ selectedDifficulty: difficulty }),
      setSelectedPattern: (pattern) => set({ selectedPattern: pattern }),
      setHydrated: (hydrated) => set({ isHydrated: hydrated }),

      resetProgress: () => set({ solvedProblemIds: [] }),
      resetFilters: () => set({ searchQuery: "", selectedDifficulty: "All", selectedPattern: "All" }),
      showResetConfirm: false,
      setShowResetConfirm: (show) => set({ showResetConfirm: show }),
    }),
    {
      name: "leetcode-tracker-problems",
      // Only persist the completed problem IDs, not search/filters/hydration status
      partialize: (state) => ({ solvedProblemIds: state.solvedProblemIds }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated(true);
        }
      },
    }
  )
);
