"use client";

import { LayoutDashboard, Flame, ListChecks, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProgressPanel } from "@/components/dashboard/progress-panel";

export function Sidebar() {
  const menuItems = [
    { name: "Problem Set", icon: ListChecks, active: true },
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Streaks", icon: Flame },
    { name: "Daily Challenge", icon: Trophy },
  ];

  return (
    <aside className="w-64 border-r border-border bg-card text-card-foreground hidden lg:flex flex-col h-[calc(100vh-4rem)] sticky top-16 p-4 justify-between select-none">
      <div className="space-y-6">
        {/* Navigation Menu */}
        <div>
          <h2 className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Navigation
          </h2>
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.name}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer border-none bg-transparent text-left",
                  item.active
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <hr className="border-border" />

        {/* Circular Progress Gauge */}
        <div className="px-1">
          <ProgressPanel />
        </div>
      </div>
    </aside>
  );
}
export default Sidebar;
