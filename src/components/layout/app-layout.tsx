"use client";

import React from "react";
import { Navbar } from "./navbar";
import { AuthProvider, useAuth } from "@/providers/auth-provider";
import { useProblemStore } from "@/store/problem-store";
import { deleteAllProblemProgress } from "@/lib/services/problem-progress";
import { ToastProvider, useToast } from "@/components/ui/toast";
import { AlertCircle } from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
}

function ResetHandler() {
  const { user } = useAuth();
  const { showResetConfirm, setShowResetConfirm, resetProgress } =
    useProblemStore();
  const { toast } = useToast();

  const handleCancelReset = () => {
    setShowResetConfirm(false);
  };

  const handleConfirmReset = async () => {
    resetProgress();
    setShowResetConfirm(false);
    toast("Progress reset", "success");
    if (user) {
      try {
        await deleteAllProblemProgress(user.id);
      } catch {
        toast("Failed to sync reset to cloud", "error");
      }
    }
  };

  if (!showResetConfirm) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-[420px] rounded-2xl border border-border/80 bg-card p-6 shadow-2xl transition-all duration-200">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="h-5 w-5 text-[#EF4743] shrink-0" />
          <h2 className="text-lg font-semibold text-foreground tracking-tight">
            Reset progress
          </h2>
        </div>
        <p className="mb-6 text-sm text-muted-foreground leading-relaxed">
          Resetting progress will move all questions back to incomplete.
          This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={handleCancelReset}
            className="cursor-pointer rounded-lg bg-[#F0F0F0] dark:bg-[#252525] px-5 py-2 text-sm font-semibold text-foreground hover:bg-[#E5E5E5] dark:hover:bg-[#353535] transition duration-150 border-none outline-none"
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
  );
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <AuthProvider>
      <ToastProvider>
        <div className="flex flex-col min-h-screen bg-background text-foreground relative">
          <Navbar />
          <main className="flex-1 overflow-y-auto bg-muted/40 dark:bg-[#151515]">
            {children}
          </main>

          <ResetHandler />
        </div>
      </ToastProvider>
    </AuthProvider>
  );
}
export default AppLayout;
