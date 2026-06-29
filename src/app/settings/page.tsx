"use client";

import { Settings, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProblemStore } from "@/store/problem-store";

export default function SettingsPage() {
  const setShowResetConfirm = useProblemStore((s) => s.setShowResetConfirm);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
      </div>

      <div className="rounded-2xl border border-red-500/20 bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <h2 className="font-semibold text-red-500">Danger Zone</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Reset all your progress. This action cannot be undone.
        </p>
        <Button
          variant="destructive"
          onClick={() => setShowResetConfirm(true)}
          className="cursor-pointer"
        >
          <AlertTriangle className="h-4 w-4" />
          Reset Progress
        </Button>
      </div>
    </div>
  );
}
