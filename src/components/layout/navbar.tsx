"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, LogIn, ListChecks, LayoutDashboard, Flame, Trophy } from "lucide-react";
import { Logo } from "@/components/common/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Problem Set", icon: ListChecks, active: true },
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "Streaks", icon: Flame },
  { name: "Daily Challenge", icon: Trophy },
];

export function Navbar() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-lg px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
      <div className="flex items-center gap-8">
        <Logo />
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item.name}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer border-none bg-transparent relative",
                item.active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.name}</span>
              {item.active && (
                <span className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="hover:bg-accent focus-visible:ring-0 cursor-pointer size-8"
          >
            {resolvedTheme === "dark" ? (
              <Sun className="h-4 w-4 text-primary" />
            ) : (
              <Moon className="h-4 w-4 text-foreground" />
            )}
          </Button>
        )}

        <Button size="sm" className="gap-1.5 bg-primary hover:bg-brand-hover text-white font-medium shadow-sm transition-colors cursor-pointer border-none">
          <LogIn className="h-3.5 w-3.5" />
          <span>Sign In</span>
        </Button>
      </div>
    </header>
  );
}
export default Navbar;
