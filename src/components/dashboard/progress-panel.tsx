"use client";

import { useProblemStore } from "@/store/problem-store";
import { DUMMY_PROBLEMS } from "@/constants/problems";
import { RotateCcw } from "lucide-react";
import { useState } from "react";

export function ProgressPanel() {
  const { solvedProblemIds, resetProgress, isHydrated } = useProblemStore();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleResetClick = () => {
    setShowConfirm(true);
  };

  const handleConfirmReset = () => {
    resetProgress();
    setShowConfirm(false);
  };

  const handleCancelReset = () => {
    setShowConfirm(false);
  };

  const totalEasy = DUMMY_PROBLEMS.filter((p) => p.difficulty === "Easy").length;
  const totalMedium = DUMMY_PROBLEMS.filter((p) => p.difficulty === "Medium").length;
  const totalHard = DUMMY_PROBLEMS.filter((p) => p.difficulty === "Hard").length;

  const solvedEasy = isHydrated
    ? DUMMY_PROBLEMS.filter((p) => p.difficulty === "Easy" && solvedProblemIds.includes(p.id)).length
    : 0;
  const solvedMedium = isHydrated
    ? DUMMY_PROBLEMS.filter((p) => p.difficulty === "Medium" && solvedProblemIds.includes(p.id)).length
    : 0;
  const solvedHard = isHydrated
    ? DUMMY_PROBLEMS.filter((p) => p.difficulty === "Hard" && solvedProblemIds.includes(p.id)).length
    : 0;

  const totalProblems = DUMMY_PROBLEMS.length;
  const solvedProblems = solvedEasy + solvedMedium + solvedHard;

  // Calculate percentage of circular arc (approx 3/4 circle = 188.5 length)
  const percentage = totalProblems > 0 ? (solvedProblems / totalProblems) * 100 : 0;
  const radius = 40;
  const circumference = 2 * Math.PI * radius; // 251.3
  const arcLength = circumference * 0.75; // 188.5
  const strokeDashoffset = arcLength - (arcLength * percentage) / 100;

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">Progress</span>
        <button
          onClick={handleResetClick}
          title="Reset Progress"
          className="cursor-pointer rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200 border-none bg-transparent"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Main Side-by-Side Card (Gauge on Left, Stacked Difficulty Cards on Right) */}
      <div className="rounded-2xl border border-border bg-card p-3 shadow-sm flex items-center justify-between gap-3 w-full">
        {/* Left Side: Circular Gauge */}
        <div className="flex flex-col items-center justify-center rounded-xl bg-muted/20 dark:bg-muted/10 border border-border/10 p-2 relative flex-1 min-w-[110px] min-h-[110px]">
          <div className="relative flex items-center justify-center scale-105">
            <svg viewBox="0 0 100 100" className="w-[100px] h-[100px]">
              {/* Background Track */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="transparent"
                stroke="currentColor"
                strokeWidth="7"
                strokeDasharray={`${arcLength} ${circumference}`}
                strokeLinecap="round"
                transform="rotate(135 50 50)"
                className="text-muted/40"
              />
              {/* Active Progress */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="transparent"
                stroke="var(--primary)"
                strokeWidth="9"
                strokeDasharray={`${arcLength} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform="rotate(135 50 50)"
                className="transition-all duration-500 ease-out"
              />
            </svg>

            {/* Centered Stats */}
            <div className="absolute inset-0 flex flex-col items-center justify-center mt-[-3px]">
              <div className="flex items-baseline">
                <span className="text-base font-extrabold text-foreground">{solvedProblems}</span>
                <span className="text-[10px] text-muted-foreground font-bold">/{totalProblems}</span>
              </div>
              <span className="text-[8px] text-muted-foreground font-bold uppercase tracking-wider mt-0.5">Solved</span>
            </div>
          </div>
        </div>

        {/* Right Side: Stacked Difficulty Cards (Vertical stack) */}
        <div className="flex flex-col gap-1.5 w-[85px] justify-between">
          {/* Easy Card */}
          <div className="flex flex-col items-center justify-center rounded-lg bg-easy/[0.08] border border-easy/20 py-1.5 px-1 text-center">
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-easy">Easy</span>
            <span className="text-[10px] font-extrabold text-foreground mt-0.5">
              {solvedEasy}<span className="text-muted-foreground/80 text-[8px] font-semibold">/{totalEasy}</span>
            </span>
          </div>

          {/* Medium Card */}
          <div className="flex flex-col items-center justify-center rounded-lg bg-medium/[0.08] border border-medium/20 py-1.5 px-1 text-center">
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-medium">Med.</span>
            <span className="text-[10px] font-extrabold text-foreground mt-0.5">
              {solvedMedium}<span className="text-muted-foreground/80 text-[8px] font-semibold">/{totalMedium}</span>
            </span>
          </div>

          {/* Hard Card */}
          <div className="flex flex-col items-center justify-center rounded-lg bg-hard/[0.08] border border-hard/20 py-1.5 px-1 text-center">
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-hard">Hard</span>
            <span className="text-[10px] font-extrabold text-foreground mt-0.5">
              {solvedHard}<span className="text-muted-foreground/80 text-[8px] font-semibold">/{totalHard}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="mb-1 flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-hard" />
              <h2 className="text-base font-bold text-foreground">Reset Progress</h2>
            </div>
            <p className="mb-6 mt-2 text-sm text-muted-foreground">
              Are you sure you want to reset all your progress? This action{" "}
              <span className="font-semibold text-hard">cannot be undone</span>.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={handleCancelReset}
                className="cursor-pointer rounded-lg border border-border px-4 py-1.5 text-sm font-medium text-muted-foreground transition hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReset}
                className="cursor-pointer rounded-lg bg-hard px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-hard/90"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default ProgressPanel;
