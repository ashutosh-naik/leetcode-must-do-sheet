"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
import { Problem } from "@/constants/problems";
import { PROBLEM_META } from "@/constants/problem-meta";
import { useProblemStore } from "@/store/problem-store";
import { cn } from "@/lib/utils";

interface ProblemCardProps {
  problem: Problem;
}

export function ProblemCard({ problem }: ProblemCardProps) {
  const { solvedProblemIds, toggleProblemSolved } = useProblemStore();
  const isSolved = solvedProblemIds.includes(problem.id);
  const meta = PROBLEM_META[problem.id];

  const difficultyColors = {
    Easy: "bg-easy/10 text-easy border-easy/20",
    Medium: "bg-medium/10 text-medium border-medium/20",
    Hard: "bg-hard/10 text-hard border-hard/20",
  };

  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-200 hover:border-primary/30",
      isSolved ? "bg-muted/30 border-muted-foreground/10" : "bg-card"
    )}>
      <CardContent className="p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Checkbox
            id={`problem-card-check-${problem.id}`}
            checked={isSolved}
            onCheckedChange={() => toggleProblemSolved(problem.id)}
            className="h-5 w-5 data-[state=checked]:bg-primary data-[state=checked]:border-primary cursor-pointer"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-muted-foreground">
                #{problem.id}
              </span>
              <a
                href={problem.link}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "text-sm font-semibold hover:text-primary transition-colors inline-flex items-center gap-1",
                  isSolved ? "text-muted-foreground line-through" : "text-foreground"
                )}
              >
                {problem.name}
                <ExternalLink className="h-3 w-3 shrink-0" />
              </a>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge variant="outline" className={cn("text-[10px] px-2 py-0.5", difficultyColors[problem.difficulty])}>
                {problem.difficulty}
              </Badge>
              {problem.patterns.map((pattern) => (
                <Badge key={pattern} variant="secondary" className="text-[10px] px-2 py-0.5 bg-muted text-muted-foreground font-normal">
                  {pattern}
                </Badge>
              ))}
              {meta && (
                <span className="text-[10px] font-mono text-muted-foreground/60 ml-1">
                  {meta.f} · {meta.c}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
export default ProblemCard;
