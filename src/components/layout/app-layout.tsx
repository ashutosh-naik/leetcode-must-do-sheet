"use client";

import React, { useRef, useEffect } from "react";
import { Navbar } from "./navbar";
import { AuthProvider, useAuth } from "@/providers/auth-provider";
import { useProblemStore } from "@/store/problem-store";
import { deleteAllProblemProgress } from "@/lib/services/problem-progress";
import { ToastProvider, useToast } from "@/components/ui/toast";
import { AlertCircle } from "lucide-react";

const CURRENT_YEAR = new Date().getFullYear();

interface AppLayoutProps {
  children: React.ReactNode;
}

function ResetHandler() {
  const { user } = useAuth();
  const { showResetConfirm, setShowResetConfirm, resetProgress } =
    useProblemStore();
  const { toast } = useToast();
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

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

  useEffect(() => {
    if (showResetConfirm) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      // Focus the Cancel button after mount
      const timer = setTimeout(() => {
        const cancelBtn = dialogRef.current?.querySelector("button");
        cancelBtn?.focus();
      }, 50);
      return () => clearTimeout(timer);
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [showResetConfirm]);

  // Focus trap
  useEffect(() => {
    if (!showResetConfirm) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setShowResetConfirm(false);
        return;
      }
      if (e.key !== "Tab") return;

      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showResetConfirm, setShowResetConfirm]);

  if (!showResetConfirm) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleCancelReset}
      role="dialog"
      aria-modal="true"
      aria-label="Reset progress confirmation"
    >
      <div
        ref={dialogRef}
        className="mx-4 w-full max-w-[420px] rounded-2xl border border-border/80 bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
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
          <main className="flex-1 overflow-y-auto bg-muted/40 dark:bg-[#151515] animate-in fade-in duration-200">
            {children}
          </main>

          <footer className="border-t border-border bg-background/80 backdrop-blur-sm">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] sm:text-sm text-muted-foreground">
              <p suppressHydrationWarning>&copy; {CURRENT_YEAR} LeetCode Must-Do Tracker</p>
              <p>Built with ❤️ for Developers</p>
            </div>
          </footer>

          <ResetHandler />
        </div>
      </ToastProvider>
    </AuthProvider>
  );
}
export default AppLayout;
