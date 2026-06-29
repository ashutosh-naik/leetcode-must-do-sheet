"use client";

import React from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import {
  Sun,
  Moon,
  LogIn,
  UserPlus,
  LogOut,
  User,
  Menu,
  X,
} from "lucide-react";
import { Logo } from "@/components/common/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import { signOut } from "@/lib/auth";

export function Navbar() {
  const { resolvedTheme, setTheme } = useTheme();
  const { user, loading } = useAuth();
  const [mounted, setMounted] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  async function handleSignOut() {
    await signOut();
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-lg px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
      <div className="flex items-center gap-2 sm:gap-8">
        <Logo />
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

        {!loading &&
          (user ? (
            <>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                <User className="h-3.5 w-3.5" />
                <span className="max-w-[120px] truncate">
                  {user.user_metadata?.username || user.email}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="gap-1.5 text-muted-foreground hover:text-foreground cursor-pointer border-none"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </>
          ) : (
            <>
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
            </>
          ))}

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
              <hr className="my-2 border-border" />
              {user ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-muted-foreground">
                    <User className="h-4 w-4 shrink-0" />
                    <span className="truncate">
                      {user.user_metadata?.username || user.email}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      handleSignOut();
                    }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer border-none bg-transparent w-full text-left"
                  >
                    <LogOut className="h-4 w-4 shrink-0" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer border-none bg-transparent w-full text-left"
                  >
                    <LogIn className="h-4 w-4 shrink-0" />
                    <span>Sign In</span>
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer border-none bg-transparent w-full text-left"
                  >
                    <UserPlus className="h-4 w-4 shrink-0" />
                    <span>Register</span>
                  </Link>
                </>
              )}
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
export default Navbar;
