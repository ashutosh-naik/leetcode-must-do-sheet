"use client";

import { useEffect } from "react";
import { logger } from "@/lib/logger";
import { Button } from "@/components/ui/button";

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
      <p className="text-sm text-muted-foreground">An unexpected error occurred. Please try again.</p>
      <Button
        onClick={reset}
        className="cursor-pointer"
      >
        Try again
      </Button>
    </div>
  );
}
