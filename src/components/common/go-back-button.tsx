"use client";

import { ArrowLeft } from "lucide-react";

export function GoBackButton() {
  return (
    <button
      onClick={() => window.history.back()}
      className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground shadow-sm hover:bg-muted/50 active:scale-[0.97] transition-all cursor-pointer"
    >
      <ArrowLeft className="h-4 w-4" />
      Go Back
    </button>
  );
}
