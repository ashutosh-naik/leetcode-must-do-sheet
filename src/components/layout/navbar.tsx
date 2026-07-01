"use client";

import React, { useCallback, useEffect, useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Sun,
  Moon,
  LogIn,
  UserPlus,
  LogOut,
  User,
  Menu,
  X,
  ListChecks,
  LayoutDashboard,
  Flame,
  Trophy,
  CheckCircle,
} from "lucide-react";
import { Logo } from "@/components/common/logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";

const navLinks = [
  { href: "/problemset", label: "Problem Set", icon: ListChecks },
  { href: "/solved", label: "Solved", icon: CheckCircle },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/streaks", label: "Streaks", icon: Flame },
  { href: "/daily-challenge", label: "Daily Challenge", icon: Trophy },
];

export function Navbar() {
  const pathname = usePathname();
  const searchString = useSyncExternalStore(
    (cb) => {
      window.addEventListener("popstate", cb);
      window.addEventListener("pushstate", cb);
      window.addEventListener("replacestate", cb);
      return () => {
        window.removeEventListener("popstate", cb);
        window.removeEventListener("pushstate", cb);
        window.removeEventListener("replacestate", cb);
      };
    },
    () => window.location.search,
    () => "",
  );
  const { resolvedTheme, setTheme } = useTheme();
  const { user, loading, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  useEffect(() => {
    const originalPushState = history.pushState.bind(history);
    const originalReplaceState = history.replaceState.bind(history);
    history.pushState = function (data, unused, url) {
      originalPushState(data, unused, url);
      window.dispatchEvent(new Event("pushstate"));
    };
    history.replaceState = function (data, unused, url) {
      originalReplaceState(data, unused, url);
      window.dispatchEvent(new Event("replacestate"));
    };
    return () => {
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, []);

  const isActive = useCallback((href: string) => {
    const [basePath, queryString] = href.split("?");
    if (pathname !== basePath) return false;
    if (!queryString) return true;
    const linkParams = new URLSearchParams(queryString);
    const currentParams = new URLSearchParams(searchString);
    for (const [key, value] of linkParams) {
      if (currentParams.get(key) !== value) return false;
    }
    return true;
  }, [pathname, searchString]);

  async function handleSignOut() {
    await logout();
  }

  const avatarUrl = user?.user_metadata?.avatar_url;
  const displayName =
    user?.user_metadata?.name ??
    user?.user_metadata?.username ??
    user?.email?.split("@")[0] ??
    "User";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-lg px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4 animate-in fade-in duration-300">
      <div className="flex items-center gap-2 sm:gap-8">
        <Logo />
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <link.icon className="h-4 w-4" />
                <span>{link.label}</span>
                <span
                  className={`absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-primary transition-all duration-200 ${
                    active ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </Link>
            );
          })}
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

        {!loading &&
          (user ? (
            <>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt=""
                    width={20}
                    height={20}
                    className="size-5 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-3.5 w-3.5" />
                )}
                <span className="max-w-[100px] sm:max-w-[160px] truncate">{displayName}</span>
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
          <div className="absolute top-14 sm:top-16 left-0 right-0 z-50 bg-background border-b border-border shadow-lg md:hidden animate-in fade-in slide-in-from-top-2 duration-200 max-h-[80vh] overflow-y-auto">
            <nav className="flex flex-col p-3 gap-1">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      active
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <link.icon className="h-4 w-4 shrink-0" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
              <hr className="my-2 border-border" />
              {user ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-muted-foreground">
                    {avatarUrl ? (
                      <Image
                        src={avatarUrl}
                        alt=""
                        width={20}
                        height={20}
                        className="size-5 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <User className="h-4 w-4 shrink-0" />
                    )}
                    <span className="truncate">{displayName}</span>
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
