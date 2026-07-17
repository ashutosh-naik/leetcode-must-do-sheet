import Link from "next/link";
import {
  ListChecks,
  BarChart3,
  Shuffle,
  Flame,
  Search,
  Filter,
  HeartHandshake,
} from "lucide-react";
import { PROBLEMS } from "@/constants/problems";

const PROBLEM_COUNT = PROBLEMS.length;

const features = [
  {
    icon: ListChecks,
    title: `${PROBLEM_COUNT} Curated Problems`,
    description:
      "Hand-picked must-do LeetCode problems covering all essential DSA patterns — Arrays, DP, Graphs, Trees, and more.",
  },
  {
    icon: Filter,
    title: "Smart Filtering & Search",
    description:
      "Filter by difficulty, pattern, or frequency. Search by name, ID, or topic. Sort by ID, difficulty, or frequency.",
  },
  {
    icon: BarChart3,
    title: "Progress Tracking",
    description:
      "Visual progress gauge with difficulty breakdown. Track solved vs unsolved per category with detailed stats.",
  },
  {
    icon: Shuffle,
    title: "Daily Pick One",
    description:
      "Deterministic daily problem based on date seed. Pick from unsolved problems to maintain your streak.",
  },
  {
    icon: Flame,
    title: "Streaks & Dashboard",
    description:
      "Maintain your problem-solving streak. Full dashboard with comprehensive performance analytics.",
  },
  {
    icon: HeartHandshake,
    title: "Supabase Sync",
    description:
      "Sign in with Google or GitHub to sync your progress across devices. Your data, always available.",
  },
];

const stats = [
  { label: "Problems", value: String(PROBLEM_COUNT) },
  { label: "Patterns", value: "20" },
  { label: "Difficulty Levels", value: "3" },
  { label: "Companies Referenced", value: "200+" },
];

export default function Home() {
  return (
    <main>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 lg:pt-32 pb-16 sm:pb-20 lg:pb-24">
          <div className="text-center animate-fade-in-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground mb-8">
              <span className="size-2 rounded-full bg-primary animate-pulse" />
              Master DSA Patterns — One Problem at a Time
            </div>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              LeetCode{" "}
              <span className="text-primary">Must-Do</span>{" "}
              <br className="sm:hidden" />
              Progress Tracker
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground leading-relaxed">
              Your personal companion for mastering the essential LeetCode
              problems. Track solved problems, filter by DSA patterns, maintain
              streaks, and sync your progress across devices — all in one
              sleek dashboard.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Link
                href="/problemset"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-hover hover:scale-105 transition-all active:scale-95"
              >
                <ListChecks className="h-4 w-4" />
                Start Solving
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground shadow-sm hover:bg-muted/50 hover:scale-105 transition-all active:scale-95"
              >
                <HeartHandshake className="h-4 w-4" />
                Sign Up Free
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-border bg-muted/30">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-12 text-center">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className="animate-scale-in"
                style={{ animationDelay: `${i * 100}ms`, animationFillMode: "backwards" }}
              >
                <div className="font-heading text-3xl sm:text-4xl font-extrabold text-primary tabular-nums">
                  {stat.value}
                </div>
                <div className="mt-1.5 text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center mb-12 sm:mb-16 animate-fade-in-up">
          <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
            Everything You Need to{" "}
            <span className="text-primary">Crack DSA</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Built with the proven Must-Do problem list, augmented with smart
            tools to accelerate your preparation.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-border bg-card p-6 sm:p-8 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              style={{
                opacity: 0,
                animation: `fade-in-up 0.5s ease-out ${i * 100}ms forwards`,
              }}
            >
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-5 group-hover:bg-primary/15 group-hover:scale-110 transition-all duration-300">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="font-heading text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="border-y border-border bg-muted/30">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center mb-12 sm:mb-16 animate-fade-in-up">
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
              How It <span className="text-primary">Works</span>
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to supercharge your LeetCode preparation.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8 sm:gap-12">
            {[
              {
                step: "01",
                title: "Browse the Problem Set",
                description:
                  `Explore ${PROBLEM_COUNT} curated problems organized by DSA patterns. Filter by difficulty, search by name, or sort by frequency.`,
              },
              {
                step: "02",
                title: "Track Your Progress",
                description:
                  "Check off solved problems. Your progress syncs to the cloud when you sign in with Google or GitHub.",
              },
              {
                step: "03",
                title: "Stay Consistent",
                description:
                  "Use the daily Pick One feature, maintain streaks, and monitor your growth on the dashboard.",
              },
            ].map((item, i) => (
              <div
                key={item.step}
                className="text-center animate-fade-in-up"
                style={{ animationDelay: `${i * 150}ms`, animationFillMode: "backwards" }}
              >
                <div className="font-heading inline-flex items-center justify-center size-14 rounded-full bg-primary/10 text-primary text-xl font-bold mb-5 transition-transform duration-300 hover:scale-110">
                  {item.step}
                </div>
                <h3 className="font-heading text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
        <div className="animate-fade-in-up" style={{ animationDelay: "100ms", animationFillMode: "backwards" }}>
          <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
            Ready to Master LeetCode?
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Join thousands of developers using the Must-Do sheet to crack their
            dream interviews. Start solving today.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/problemset"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-hover hover:scale-105 transition-all active:scale-95"
            >
              <ListChecks className="h-4 w-4" />
              Browse Problems
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground shadow-sm hover:bg-muted/50 hover:scale-105 transition-all active:scale-95"
            >
              <Search className="h-4 w-4" />
              Sign In
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
