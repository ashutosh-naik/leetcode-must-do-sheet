"use client";

import React from "react";
import { Navbar } from "./navbar";
import { useProblemStore } from "@/store/problem-store";
import { AlertCircle } from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { showResetConfirm, setShowResetConfirm, resetProgress } = useProblemStore();

  const handleCancelReset = () => {
    setShowResetConfirm(false);
  };

  const handleConfirmReset = () => {
    resetProgress();
    setShowResetConfirm(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground relative">
      <Navbar />
      <main className="flex-1 overflow-y-auto bg-muted/20">
        {children}
      </main>

      {/* Global Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-[420px] rounded-2xl border border-border/80 bg-card p-6 shadow-2xl transition-all duration-200">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="h-5 w-5 text-[#EF4743] shrink-0" />
              <h2 className="text-lg font-semibold text-foreground tracking-tight">Reset progress</h2>
            </div>
            <p className="mb-6 text-sm text-muted-foreground leading-relaxed">
              Resetting progress will move all questions back to incomplete. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancelReset}
                className="cursor-pointer rounded-lg bg-[#F0F0F0] dark:bg-[#3C3C3C] px-5 py-2 text-sm font-semibold text-foreground hover:bg-[#E5E5E5] dark:hover:bg-[#4C4C4C] transition duration-150 border-none outline-none"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReset}
                className="cursor-pointer rounded-lg bg-[#EF4743] px-5 py-2 text-sm font-semibold text-white hover:bg-[#EF4743]/90 transition duration-150 border-none outline-none"
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
export default AppLayout;
