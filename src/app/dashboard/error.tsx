"use client";

import { useEffect } from "react";
import { logger } from "@/lib/logger";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-center space-y-4">
      <h2 className="font-heading text-xl font-bold">Something went wrong</h2>
      <p className="text-sm text-muted-foreground">{error.message}</p>
      <button
        onClick={reset}
        className="cursor-pointer rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-colors border-none"
      >
        Try again
      </button>
    </div>
  );
}
