"use client";

import React from "react";
import { logger } from "@/lib/logger";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error(error.message, { componentStack: errorInfo.componentStack });
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div role="alert" className="flex flex-col items-center justify-center min-h-[400px] gap-4 px-4">
            <div className="rounded-full bg-destructive/10 p-4">
              <span className="text-destructive text-2xl">!</span>
            </div>
            <h2 className="font-heading text-xl font-semibold tracking-tight">
              Something went wrong
            </h2>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            <Button
              onClick={() => this.setState({ hasError: false })}
              className="cursor-pointer"
            >
              Try Again
            </Button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
