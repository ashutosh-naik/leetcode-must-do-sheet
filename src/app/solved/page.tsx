"use client";

import { Suspense } from "react";
import { ProblemsetContent } from "@/components/common/problemset-content";

export default function SolvedPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[50vh] items-center justify-center"><div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>}>
      <ProblemsetContent defaultFilter="solved" />
    </Suspense>
  );
}
