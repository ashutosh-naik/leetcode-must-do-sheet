import { cn } from "@/lib/utils";

const config: Record<string, { bg: string; text: string; label: string }> = {
  Easy: {
    bg: "bg-green-500/10 dark:bg-green-500/15",
    text: "text-green-600 dark:text-green-400",
    label: "Easy",
  },
  Medium: {
    bg: "bg-amber-500/10 dark:bg-amber-500/15",
    text: "text-amber-600 dark:text-amber-400",
    label: "Medium",
  },
  Hard: {
    bg: "bg-red-500/10 dark:bg-red-500/15",
    text: "text-red-600 dark:text-red-400",
    label: "Hard",
  },
};

export function DifficultyBadge({ difficulty }: { difficulty: "Easy" | "Medium" | "Hard" }) {
  const c = config[difficulty] ?? config.Easy;
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-heading font-semibold transition-all duration-200 hover:scale-105 active:scale-95",
        c.bg,
        c.text,
      )}
    >
      {c.label}
    </span>
  );
}
