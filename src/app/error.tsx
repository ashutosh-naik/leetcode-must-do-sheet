"use client";

import { useEffect } from "react";
import { logger } from "@/lib/logger";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error(error.message, { stack: error.stack, digest: error.digest });
  }, [error]);

  return (
    <main className="flex min-h-[50vh] items-center justify-center px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="rounded-full bg-destructive/10 p-4">
          <span className="text-destructive text-2xl font-bold">!</span>
        </div>
          <h1 className="font-heading text-xl font-semibold tracking-tight">
          Something went wrong
        </h1>
        <p className="text-sm text-muted-foreground max-w-md">
          An unexpected error occurred. Please try again.
        </p>
        <Button
          onClick={reset}
          className="cursor-pointer"
        >
          Try Again
        </Button>
      </div>
    </main>
  );
}
