"use client";

import React from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import {
  Sun,
  Moon,
  LogIn,
  UserPlus,
  ListChecks,
  LayoutDashboard,
  Flame,
  Trophy,
  Menu,
  X,
} from "lucide-react";
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
  const [mounted, setMounted] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-lg px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
      <div className="flex items-center gap-2 sm:gap-8">
        <Logo />
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item.name}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer border-none bg-transparent relative",
                item.active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
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

      <div className="flex items-center gap-1 sm:gap-3">
        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
            className="hover:bg-accent focus-visible:ring-0 cursor-pointer size-8"
          >
            {resolvedTheme === "dark" ? (
              <Sun className="h-4 w-4 text-primary" />
            ) : (
              <Moon className="h-4 w-4 text-foreground" />
            )}
          </Button>
        )}

        <Link href="/login">
          <Button
            variant="outline"
            size="sm"
            className="hidden sm:inline-flex gap-1.5 font-medium shadow-sm transition-colors cursor-pointer border-none"
          >
            <LogIn className="h-3.5 w-3.5" />
            <span>Sign In</span>
          </Button>
        </Link>

        <Link href="/register">
          <Button
            size="sm"
            className="hidden sm:inline-flex gap-1.5 bg-primary hover:bg-brand-hover text-white font-medium shadow-sm transition-colors cursor-pointer border-none"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Register</span>
          </Button>
        </Link>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden size-8 cursor-pointer"
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Mobile nav dropdown */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 top-14 sm:top-16 z-40 bg-black/20 backdrop-blur-sm md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute top-14 sm:top-16 left-0 right-0 z-50 bg-background border-b border-border shadow-lg md:hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col p-3 gap-1">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer border-none bg-transparent w-full text-left",
                    item.active
                      ? "text-primary bg-primary/5"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span>{item.name}</span>
                  {item.active && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                </button>
              ))}
              <hr className="my-2 border-border" />
              <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer border-none bg-transparent w-full text-left sm:hidden">
                <LogIn className="h-4 w-4 shrink-0" />
                <span>Sign In</span>
              </button>
              <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer border-none bg-transparent w-full text-left sm:hidden">
                <UserPlus className="h-4 w-4 shrink-0" />
                <span>Register</span>
              </button>
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
export default Navbar;
