"use client";

import React, { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Sun,
  Moon,
  Monitor,
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
import { getProfile } from "@/lib/services/profile";

const navLinks = [
  { href: "/problemset", label: "Problem Set", icon: ListChecks },
  { href: "/solved", label: "Solved", icon: CheckCircle },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/streaks", label: "Streaks", icon: Flame },
  { href: "/daily-challenge", label: "Daily Challenge", icon: Trophy },
];

export function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { user, loading, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileNavRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [profileUsername, setProfileUsername] = useState<string | null>(null);
  const [profileDisplayName, setProfileDisplayName] = useState<string | null>(null);
  const [profileAvatarUrl, setProfileAvatarUrl] = useState<string | null>(null);
  const prevUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    const userId = user?.id ?? null;
    if (userId === prevUserIdRef.current) return;
    prevUserIdRef.current = userId;
    let cancelled = false;
    (async () => {
      if (!userId) {
        if (!cancelled) {
          setProfileUsername(null);
          setProfileDisplayName(null);
          setProfileAvatarUrl(null);
        }
        return;
      }
      const p = await getProfile(userId);
      if (!cancelled) {
        setProfileUsername(p?.username ?? null);
        setProfileDisplayName(p?.display_name ?? null);
        setProfileAvatarUrl(p?.avatar_url ?? null);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  // Re-fetch profile when it's updated elsewhere (e.g. profile page)
  useEffect(() => {
    const userId = user?.id;
    if (!userId) return;
    function handleProfileUpdated() {
      getProfile(userId!).then((p) => {
        setProfileUsername(p?.username ?? null);
        setProfileDisplayName(p?.display_name ?? null);
        setProfileAvatarUrl(p?.avatar_url ?? null);
      }).catch(() => {});
    }
    window.addEventListener("profile-updated", handleProfileUpdated);
    return () => window.removeEventListener("profile-updated", handleProfileUpdated);
  }, [user?.id]);

  // Body scroll lock + focus trap for mobile nav
  useEffect(() => {
    if (mobileOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const nav = mobileNavRef.current;
    if (!nav) return;
    const focusable = nav.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
    if (focusable.length > 0) focusable[0].focus();
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMobileOpen(false);
        menuButtonRef.current?.focus();
        return;
      }
      if (e.key !== "Tab") return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen]);

  const isActive = useCallback((href: string) => {
    const [basePath] = href.split("?");
    return pathname === basePath;
  }, [pathname]);

  async function handleSignOut() {
    await logout();
  }

  const avatarUrl = profileAvatarUrl ?? user?.user_metadata?.avatar_url;
  const displayName =
    profileDisplayName ??
    user?.user_metadata?.name ??
    user?.user_metadata?.username ??
    user?.email?.split("@")[0] ??
    "User";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-lg px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4 animate-in fade-in duration-300">
      <div className="flex items-center gap-2 sm:gap-8">
        <Logo />
        <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
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
              setTheme(theme === "light" ? "dark" : theme === "dark" ? "system" : "light")
            }
            className="hover:bg-accent focus-visible:ring-0 cursor-pointer size-9 sm:size-10 transition-colors duration-150"
            aria-label={theme === "light" ? "Switch to dark mode" : theme === "dark" ? "Switch to system theme" : "Switch to light mode"}
          >
            {theme === "light" ? (
              <Sun className="h-4 w-4 text-primary" />
            ) : theme === "dark" ? (
              <Moon className="h-4 w-4 text-foreground" />
            ) : (
              <Monitor className="h-4 w-4 text-foreground" />
            )}
          </Button>
        )}

        {!loading &&
          (user ? (
            <>
              <Link
                href={profileUsername ? `/profile/${profileUsername}` : "/profile"}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-150"
              >
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={displayName}
                    width={20}
                    height={20}
                    unoptimized
                    className="size-5 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-3.5 w-3.5" />
                )}
                <span className="max-w-[100px] sm:max-w-[160px] truncate">{displayName}</span>
              </Link>
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
          ref={menuButtonRef}
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden size-9 sm:size-10 cursor-pointer"
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
            aria-hidden="true"
            onClick={() => setMobileOpen(false)}
            onKeyDown={(e) => e.key === "Escape" && setMobileOpen(false)}
          />
          <div
            ref={mobileNavRef}
            className="absolute top-14 sm:top-16 left-0 right-0 z-50 bg-background border-b border-border shadow-lg md:hidden animate-in fade-in slide-in-from-top-2 duration-200 max-h-[80vh] overflow-y-auto"
            role="dialog"
            aria-label="Mobile navigation menu"
            onKeyDown={(e) => e.key === "Escape" && setMobileOpen(false)}
          >
            <nav className="flex flex-col p-3 gap-1" aria-label="Mobile navigation">
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
                  <Link
                    href={profileUsername ? `/profile/${profileUsername}` : "/profile"}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer border-none bg-transparent w-full text-left"
                  >
                    {avatarUrl ? (
                      <Image
                        src={avatarUrl}
                        alt={displayName}
                        width={20}
                        height={20}
                        unoptimized
                        className="size-5 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <User className="h-4 w-4 shrink-0" />
                    )}
                    <span className="truncate">{displayName}</span>
                  </Link>
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
