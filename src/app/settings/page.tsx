"use client";

import { Settings, Trash2, AlertTriangle } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { useProblemStore } from "@/store/problem-store";
import { useState } from "react";

export default function SettingsPage() {
  const { user } = useAuth();
  const resetProgress = useProblemStore((s) => s.resetProgress);
  const [showReset, setShowReset] = useState(false);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
        <h2 className="font-semibold">Account</h2>
        <p className="text-sm text-muted-foreground">
          Signed in as <strong>{user?.email}</strong>
        </p>
      </div>

      <div className="rounded-2xl border border-red-500/20 bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <h2 className="font-semibold text-red-500">Danger Zone</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Reset all your progress. This action cannot be undone.
        </p>
        {showReset ? (
          <div className="flex items-center gap-3">
            <p className="text-sm font-medium text-red-500">Are you sure?</p>
            <button
              onClick={() => {
                resetProgress();
                setShowReset(false);
              }}
              className="cursor-pointer rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 transition-colors border-none"
            >
              Yes, Reset
            </button>
            <button
              onClick={() => setShowReset(false)}
              className="cursor-pointer rounded-lg bg-muted px-4 py-2 text-sm font-semibold hover:bg-muted/80 transition-colors border-none"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowReset(true)}
            className="cursor-pointer rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 transition-colors border-none flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Reset Progress
          </button>
        )}
      </div>
    </div>
  );
}
