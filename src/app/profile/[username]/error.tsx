"use client";

import { Button } from "@/components/ui/button";

export default function ProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 text-center space-y-4">
      <h2 className="font-heading text-xl font-bold">Something went wrong</h2>
      <p className="text-sm text-muted-foreground">{error.message}</p>
      <Button
        onClick={reset}
        className="cursor-pointer"
      >
        Try again
      </Button>
    </div>
  );
}
