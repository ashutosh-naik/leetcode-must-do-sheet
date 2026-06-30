"use client";

import { Suspense } from "react";
import { ProblemsetContent } from "@/components/common/problemset-content";

export default function SolvedPage() {
  return (
    <Suspense>
      <ProblemsetContent defaultFilter="solved" />
    </Suspense>
  );
}
