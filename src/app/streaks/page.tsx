"use client";

import { Flame } from "lucide-react";

export default function StreaksPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Flame className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">Streaks</h1>
      </div>
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">
          Streak tracking coming soon. Check back later!
        </p>
      </div>
    </div>
  );
}
