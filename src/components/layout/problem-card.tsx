"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
import type { Problem } from "@/constants/problems";
import { cn } from "@/lib/utils";

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
      <CardContent className="p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Checkbox
            id={`problem-card-check-${problem.id}`}
            checked={solved}
            onCheckedChange={onToggle}
            className="h-5 w-5 data-[state=checked]:bg-primary data-[state=checked]:border-primary cursor-pointer"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-muted-foreground">
                {problem.id}
              </span>
              <a
                href={problem.link}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "text-sm font-semibold hover:text-primary transition-colors inline-flex items-center gap-1",
                  solved ? "text-muted-foreground line-through" : "text-foreground"
                )}
              >
                {problem.name}
                <ExternalLink className="h-3 w-3 shrink-0" />
              </a>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <DifficultyBadge difficulty={problem.difficulty} />
              {problem.patterns.map((pattern) => (
                <Badge key={pattern} variant="secondary" className="text-[10px] px-2 py-0.5 bg-muted text-muted-foreground font-normal">
                  {pattern}
                </Badge>
              ))}
              {problem.frequency != null && (
                <span className="text-[10px] font-mono text-muted-foreground/60 ml-1">
                  {problem.frequency}% · {problem.companies ?? "—"}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    Easy: { bg: "bg-green-500/10 dark:bg-green-500/15", text: "text-green-600 dark:text-green-400", label: "Easy" },
    Medium: { bg: "bg-amber-500/10 dark:bg-amber-500/15", text: "text-amber-600 dark:text-amber-400", label: "Medium" },
    Hard: { bg: "bg-red-500/10 dark:bg-red-500/15", text: "text-red-600 dark:text-red-400", label: "Hard" },
  };
  const c = config[difficulty] ?? config.Easy;
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold", c.bg, c.text)}>
      {c.label}
    </span>
  );
}

export default ProblemCard;
