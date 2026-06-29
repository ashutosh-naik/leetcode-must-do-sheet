"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
import type { Problem } from "@/constants/problems";
import { cn } from "@/lib/utils";
import { DifficultyBadge } from "@/components/common/difficulty-badge";

interface ProblemCardProps {
  problem: Problem;
  solved: boolean;
  onToggle: () => void;
}

export function ProblemCard({ problem, solved, onToggle }: ProblemCardProps) {
  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-200 hover:border-primary/30",
      solved ? "bg-muted/30 border-muted-foreground/10" : "bg-card"
    )}>
      <CardContent className="p-3 sm:p-5 flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
          <Checkbox
            id={`problem-card-check-${problem.id}`}
            checked={solved}
            onCheckedChange={onToggle}
            className="size-4 sm:size-5 shrink-0 data-[state=checked]:bg-primary data-[state=checked]:border-primary cursor-pointer"
          />
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-semibold text-muted-foreground tabular-nums">
                {problem.id}
              </span>
              <a
                href={problem.link}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "text-xs sm:text-sm font-semibold hover:text-primary transition-colors inline-flex items-center gap-1 truncate max-w-[180px] xs:max-w-[260px] sm:max-w-none",
                  solved ? "text-muted-foreground line-through" : "text-foreground"
                )}
              >
                {problem.name}
                <ExternalLink className="h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0" />
              </a>
            </div>
            <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
              <DifficultyBadge difficulty={problem.difficulty} />
              {problem.patterns.slice(0, 2).map((pattern) => (
                <Badge key={pattern} variant="secondary" className="text-[10px] px-1.5 sm:px-2 py-0.5 bg-muted text-muted-foreground font-normal">
                  {pattern}
                </Badge>
              ))}
              {problem.patterns.length > 2 && (
                <span className="text-[10px] text-muted-foreground/50 font-medium">+{problem.patterns.length - 2}</span>
              )}
              {problem.frequency && (
                <span className="text-[10px] font-mono text-muted-foreground/60 ml-auto sm:ml-1">
                  {problem.frequency}
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
