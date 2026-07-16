import { Trophy, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function DailyChallengePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center gap-3">
        <Trophy className="h-6 w-6 text-primary" />
        <h1 className="font-heading text-2xl font-bold tracking-tight">Daily Challenge</h1>
      </div>
      <div className="rounded-2xl border border-border bg-card p-8 shadow-sm text-center space-y-4">
        <div className="inline-flex items-center justify-center size-16 rounded-full bg-primary/10 mx-auto">
          <Trophy className="h-8 w-8 text-primary" />
        </div>
        <h2 className="font-heading text-xl font-semibold tracking-tight">Coming Soon</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          The Daily Challenge feature is being built. Soon you&apos;ll get a
          fresh curated problem every day, with streak tracking and
          personalized recommendations.
        </p>
        <p className="text-sm text-muted-foreground">
          In the meantime, try the <strong>Pick One</strong> button on the
          Problem Set page for a daily problem.
        </p>
        <div className="pt-4">
          <Link
            href="/problemset"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-hover transition-colors"
          >
            Problem Set
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
