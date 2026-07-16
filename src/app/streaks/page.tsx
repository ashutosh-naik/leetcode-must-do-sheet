import { Flame, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function StreaksPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center gap-3">
        <Flame className="h-6 w-6 text-primary" />
        <h1 className="font-heading text-2xl font-bold tracking-tight">Streaks</h1>
      </div>
      <div className="rounded-2xl border border-border bg-card p-8 shadow-sm text-center space-y-4">
        <div className="inline-flex items-center justify-center size-16 rounded-full bg-primary/10 mx-auto">
          <Flame className="h-8 w-8 text-primary" />
        </div>
        <h2 className="font-heading text-xl font-semibold tracking-tight">Coming Soon</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Streak tracking is on its way. You&apos;ll be able to track your daily
          problem-solving streaks, view your longest streaks, and get
          motivational reminders to keep going.
        </p>
        <div className="pt-4">
          <Link
            href="/problemset"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-hover transition-colors"
          >
            Solve Problems
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
